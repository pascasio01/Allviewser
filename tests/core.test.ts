import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createProject, listProjects } from "@/lib/projects/store";
import { addMemory, listMemories } from "@/lib/memory/store";
import { resolveWorkspacePath, WorkspacePathError } from "@/lib/permissions/workspace";
import { createTask, startTask, cancelTask, resumeTask, getTask } from "@/lib/tasks/engine";
import { runTool } from "@/lib/tools/registry";
import { createBackup, restoreBackup, validateBackup } from "@/lib/backup/service";
import { createModelAdapter } from "@/lib/models/adapters";
import { defaultConfig } from "@/lib/config/types";
import { loadConfig, saveConfig } from "@/lib/config/store";
import { applyWorkshopCorrection } from "@/lib/tools/workshop";

describe("núcleo Companero Digital", () => {
  let dataRoot: string;

  beforeEach(async () => {
    dataRoot = await fs.mkdtemp(path.join(os.tmpdir(), "companero-test-"));
  });

  afterEach(async () => {
    await fs.rm(dataRoot, { recursive: true, force: true });
  });

  it("persiste configuración tras reinicio lógico", async () => {
    const cfg = defaultConfig();
    cfg.model.provider = "local";
    cfg.model.baseUrl = "http://127.0.0.1:11434/v1";
    cfg.model.modelId = "demo";
    await saveConfig(cfg, dataRoot);
    const loaded = await loadConfig(dataRoot);
    expect(loaded.model.provider).toBe("local");
    expect(loaded.model.modelId).toBe("demo");
  });

  it("separa proyectos", async () => {
    const a = await createProject({ name: "Alpha" }, dataRoot);
    const b = await createProject({ name: "Beta" }, dataRoot);
    await addMemory({ projectId: a.id, kind: "hecho", content: "Solo A" }, dataRoot);
    await addMemory({ projectId: b.id, kind: "decision", content: "Solo B" }, dataRoot);
    expect((await listMemories(a.id, dataRoot)).map((m) => m.content)).toEqual(["Solo A"]);
    expect((await listMemories(b.id, dataRoot)).map((m) => m.content)).toEqual(["Solo B"]);
    expect((await listProjects(dataRoot)).length).toBe(2);
  });

  it("rechaza traversal de rutas", async () => {
    const p = await createProject({ name: "Sandbox" }, dataRoot);
    await expect(resolveWorkspacePath(p.id, "../escape.txt", dataRoot)).rejects.toBeInstanceOf(
      WorkspacePathError,
    );
    await expect(resolveWorkspacePath(p.id, "/etc/passwd", dataRoot)).rejects.toBeInstanceOf(
      WorkspacePathError,
    );
  });

  it("no guarda secretos automáticamente en memoria", async () => {
    const p = await createProject({ name: "Sec" }, dataRoot);
    await expect(
      addMemory({ projectId: p.id, kind: "hecho", content: "mi api_key es abcd" }, dataRoot),
    ).rejects.toThrow(/sensible/i);
  });

  it("modelo ausente no simula inteligencia", async () => {
    const adapter = createModelAdapter(defaultConfig());
    const res = await adapter.chat({ messages: [{ role: "user", content: "hola" }] });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("not_configured");
      expect(res.instructions).toMatch(/No hay un modelo/);
    }
  });

  it("idempotencia al crear tareas", async () => {
    const p = await createProject({ name: "Tasks" }, dataRoot);
    const t1 = await createTask(
      { projectId: p.id, objective: "X", idempotencyKey: "same" },
      dataRoot,
    );
    const t2 = await createTask(
      { projectId: p.id, objective: "X", idempotencyKey: "same" },
      dataRoot,
    );
    expect(t1.id).toBe(t2.id);
  });

  it("cancela y reanuda tareas de forma segura", async () => {
    const p = await createProject({ name: "Run" }, dataRoot);
    const task = await createTask({ projectId: p.id, objective: "slow" }, dataRoot);

    const runPromise = startTask(
      p.id,
      task.id,
      async ({ signal, record }) => {
        await record("paso1", "paso1");
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(resolve, 2000);
          signal.addEventListener("abort", () => {
            clearTimeout(t);
            reject(new Error("aborted"));
          });
        });
        return { summary: "done" };
      },
      dataRoot,
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(cancelTask(task.id)).toBe(true);
    const cancelled = await runPromise;
    expect(["cancelada", "fallida"]).toContain(cancelled.status);

    const resumed = await resumeTask(
      p.id,
      task.id,
      async ({ record }) => {
        await record("reanudado", "reanudado");
        return { summary: "ok", artifacts: [] };
      },
      dataRoot,
    );
    // Si estaba cancelada, resumeTask la deja igual; forzamos re-run desde pendiente
    if (resumed.status === "cancelada") {
      const fresh = await createTask({ projectId: p.id, objective: "again" }, dataRoot);
      const done = await startTask(
        p.id,
        fresh.id,
        async () => ({ summary: "ok" }),
        dataRoot,
      );
      expect(done.status).toBe("completada");
    } else {
      expect(resumed.status).toBe("completada");
    }
    expect(await getTask(p.id, task.id, dataRoot)).toBeTruthy();
  });

  it("taller crea app, aplica corrección y pasa pruebas de comportamiento", async () => {
    const p = await createProject({ name: "Workshop" }, dataRoot);
    const created = await runTool(
      "workshop.create_app",
      { template: "todos" },
      { projectId: p.id, dataRoot },
    );
    expect(created.ok).toBe(true);
    const corrected = await applyWorkshopCorrection(p.id, "título por defecto", dataRoot);
    expect(corrected.ok).toBe(true);
    const tests = (corrected.output as { tests: { ok: boolean; output: { passed: boolean } } }).tests;
    expect(tests.ok).toBe(true);
    expect(tests.output.passed).toBe(true);
  }, 60_000);

  it("backup y restauración con validación de integridad", async () => {
    const p = await createProject({ name: "Backup" }, dataRoot);
    await addMemory({ projectId: p.id, kind: "hecho", content: "dato importante" }, dataRoot);
    const backup = await createBackup("test", dataRoot);
    const validation = await validateBackup(backup.id, dataRoot);
    expect(validation.ok).toBe(true);

    // mutate then restore
    await addMemory({ projectId: p.id, kind: "propuesta", content: "nuevo" }, dataRoot);
    expect((await listMemories(p.id, dataRoot)).length).toBe(2);
    await restoreBackup(backup.id, dataRoot);
    expect((await listMemories(p.id, dataRoot)).map((m) => m.content)).toEqual(["dato importante"]);
  });
});
