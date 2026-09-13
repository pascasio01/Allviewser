import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ACTOR_ADMIN,
  ACTOR_OBSERVADOR,
  ACTOR_RESIDENTE,
  ACTOR_REVISOR,
  ACTOR_TECNICO,
  DEMO_PIPE_ID,
  SAMPLE_CHECKLIST_EXTENSION,
  acquireObjectLock,
  askAssistant,
  assignIncident,
  attachEvidence,
  confirmDraft,
  createDraft,
  createIncident,
  getObject,
  getSpaceSnapshot,
  installExtension,
  listIncidents,
  recordDemoReset,
  releaseObjectLock,
  resetSpaceDemo,
  runMaintenanceDemoFlow,
  transitionIncident,
  uninstallExtension,
  updateDraftObject,
} from "@/lib/space";

describe("módulo espacio / mantenimiento", () => {
  let root: string;

  beforeEach(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "space-"));
    await resetSpaceDemo(root);
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("recorrido completo de mantenimiento con pasaporte", async () => {
    const result = await runMaintenanceDemoFlow({ idempotencyKey: "flow-1" }, root);
    expect(result.steps).toEqual([
      "incidencia_creada",
      "asignada",
      "en_progreso",
      "evidencia",
      "pendiente_revision",
      "cerrada",
      "pasaporte",
    ]);
    expect(result.incident.status).toBe("cerrada");
    expect(result.passport.criteriaMet).toBe(true);
    expect(result.passport.reviewStatus).toBe("aprobado");
  });

  it("idempotencia al crear incidencias", async () => {
    const a = await createIncident(
      {
        actorId: ACTOR_RESIDENTE,
        objectId: DEMO_PIPE_ID,
        title: "Prueba",
        description: "desc",
        idempotencyKey: "same",
      },
      root,
    );
    const b = await createIncident(
      {
        actorId: ACTOR_RESIDENTE,
        objectId: DEMO_PIPE_ID,
        title: "Prueba",
        description: "desc",
        idempotencyKey: "same",
      },
      root,
    );
    expect(a.id).toBe(b.id);
    expect(await listIncidents(undefined, root)).toHaveLength(1);
  });

  it("niega creación a observador", async () => {
    await expect(
      createIncident(
        {
          actorId: ACTOR_OBSERVADOR,
          objectId: DEMO_PIPE_ID,
          title: "x",
          description: "y",
        },
        root,
      ),
    ).rejects.toThrow(/permiso/i);
  });

  it("exige evidencia antes de revisión y cierre", async () => {
    const inc = await createIncident(
      {
        actorId: ACTOR_RESIDENTE,
        objectId: DEMO_PIPE_ID,
        title: "Sin evidencia",
        description: "x",
      },
      root,
    );
    await assignIncident(
      { actorId: ACTOR_ADMIN, incidentId: inc.id, assigneeId: ACTOR_TECNICO },
      root,
    );
    await transitionIncident(
      { actorId: ACTOR_TECNICO, incidentId: inc.id, to: "en_progreso" },
      root,
    );
    await expect(
      transitionIncident(
        { actorId: ACTOR_TECNICO, incidentId: inc.id, to: "pendiente_revision" },
        root,
      ),
    ).rejects.toThrow(/evidencia/i);
  });

  it("detecta conflicto de revisión optimista", async () => {
    const inc = await createIncident(
      {
        actorId: ACTOR_RESIDENTE,
        objectId: DEMO_PIPE_ID,
        title: "Conflicto",
        description: "x",
      },
      root,
    );
    await expect(
      assignIncident(
        {
          actorId: ACTOR_ADMIN,
          incidentId: inc.id,
          assigneeId: ACTOR_TECNICO,
          expectedRevision: 999,
        },
        root,
      ),
    ).rejects.toThrow(/conflicto/i);
  });

  it("persiste tras reinicio lógico de carga", async () => {
    await createIncident(
      {
        actorId: ACTOR_RESIDENTE,
        objectId: DEMO_PIPE_ID,
        title: "Persistente",
        description: "x",
        idempotencyKey: "persist-1",
      },
      root,
    );
    const snap = await getSpaceSnapshot(root);
    expect(snap.incidents).toHaveLength(1);
    const again = await getSpaceSnapshot(root);
    expect(again.incidents[0].title).toBe("Persistente");
  });

  it("borrador se confirma sin autorizar obra externa", async () => {
    const draft = await createDraft(
      { actorId: ACTOR_RESIDENTE, name: "Mover mesa" },
      root,
    );
    await updateDraftObject(
      {
        actorId: ACTOR_RESIDENTE,
        draftId: draft.id,
        objectId: "obj-mesa-recepcion",
        props: { x: 60, color: "#112233" },
      },
      root,
    );
    const { draft: confirmed, placeRevision } = await confirmDraft(
      { actorId: ACTOR_ADMIN, draftId: draft.id },
      root,
    );
    expect(confirmed.status).toBe("confirmado");
    expect(placeRevision).toBeGreaterThan(1);
    const mesa = await getObject("obj-mesa-recepcion", root);
    expect(mesa.x).toBe(60);
    expect(confirmed.disclaimer).toMatch(/no autoriza obra/i);
  });

  it("asistente no inventa precios", async () => {
    const obj = await getObject(DEMO_PIPE_ID, root);
    const reply = askAssistant({ object: obj, question: "¿Cuál es el precio del repuesto?" });
    expect(reply.mode).toBe("no_disponible");
    expect(reply.text).toMatch(/no disponible/i);
    expect(reply.unavailable).toContain("precio");
  });

  it("extensión aislada al lugar e instalable/desinstalable", async () => {
    const installed = await installExtension(
      { actorId: ACTOR_ADMIN, manifest: SAMPLE_CHECKLIST_EXTENSION },
      root,
    );
    expect(installed.scopedPlaceId).toContain("place-");
    const remaining = await uninstallExtension(
      { actorId: ACTOR_ADMIN, extensionId: SAMPLE_CHECKLIST_EXTENSION.id },
      root,
    );
    expect(remaining).toHaveLength(0);
  });

  it("bloqueo de visita evita sobrescritura silenciosa", async () => {
    await acquireObjectLock({ actorId: ACTOR_TECNICO, objectId: DEMO_PIPE_ID }, root);
    await expect(
      acquireObjectLock({ actorId: ACTOR_RESIDENTE, objectId: DEMO_PIPE_ID }, root),
    ).rejects.toThrow(/conflicto/i);
    await releaseObjectLock({ actorId: ACTOR_TECNICO, objectId: DEMO_PIPE_ID }, root);
    await acquireObjectLock({ actorId: ACTOR_RESIDENTE, objectId: DEMO_PIPE_ID }, root);
  });

  it("reinicio de demo limpia incidencias y conserva semilla", async () => {
    await runMaintenanceDemoFlow({ idempotencyKey: "reset-me" }, root);
    const reset = await recordDemoReset(ACTOR_ADMIN, root);
    expect(reset.incidents).toHaveLength(0);
    expect(reset.objects.some((o) => o.id === DEMO_PIPE_ID)).toBe(true);
    expect(reset.timeline[0]?.kind).toBe("demo_reiniciada");
  });

  it("revisor puede cerrar tras evidencia; tecnico no", async () => {
    const inc = await createIncident(
      {
        actorId: ACTOR_RESIDENTE,
        objectId: DEMO_PIPE_ID,
        title: "Cierre",
        description: "x",
      },
      root,
    );
    await assignIncident(
      { actorId: ACTOR_ADMIN, incidentId: inc.id, assigneeId: ACTOR_TECNICO },
      root,
    );
    await transitionIncident(
      { actorId: ACTOR_TECNICO, incidentId: inc.id, to: "en_progreso" },
      root,
    );
    await attachEvidence(
      {
        actorId: ACTOR_TECNICO,
        incidentId: inc.id,
        kind: "nota",
        title: "Nota",
        body: "ok",
      },
      root,
    );
    await transitionIncident(
      { actorId: ACTOR_TECNICO, incidentId: inc.id, to: "pendiente_revision" },
      root,
    );
    await expect(
      transitionIncident({ actorId: ACTOR_TECNICO, incidentId: inc.id, to: "cerrada" }, root),
    ).rejects.toThrow(/permiso/i);
    const closed = await transitionIncident(
      { actorId: ACTOR_REVISOR, incidentId: inc.id, to: "cerrada" },
      root,
    );
    expect(closed.status).toBe("cerrada");
  });
});
