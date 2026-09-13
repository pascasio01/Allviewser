import { describe, expect, it } from "vitest";
import {
  PROVENANCE_KINDS,
  demoInventoryProvenance,
  formatProvenance,
} from "@/lib/media/provenance";
import {
  ACTOR_ADMIN,
  ACTOR_OBSERVADOR,
  ACTOR_RESIDENTE,
  ACTOR_REVISOR,
  ACTOR_TECNICO,
  createInitialSpaceState,
} from "@/lib/space/seed";
import {
  availabilityAssign,
  availabilityCreateIncident,
  availabilityTransition,
  nextGuidedStep,
} from "@/lib/space/ui-actions";

describe("procedencia de datos", () => {
  it("incluye las seis clases requeridas", () => {
    expect([...PROVENANCE_KINDS].sort()).toEqual(
      ["en_vivo", "estimado", "generado", "grabado", "periodico", "simulado"].sort(),
    );
  });

  it("marca el inventario demo como simulado, nunca en vivo", () => {
    const label = demoInventoryProvenance("semilla", "2026-09-01");
    expect(label.kind).toBe("simulado");
    expect(formatProvenance(label)).toMatch(/Simulado/i);
    expect(label.caveat).toBeTruthy();
  });

  it("adjunta procedencia a objetos de la semilla", () => {
    const state = createInitialSpaceState();
    for (const obj of state.objects) {
      expect(obj.provenance.kind).toBe("simulado");
      expect(obj.provenance.caveat).toBeTruthy();
    }
  });
});

describe("acciones UI por rol", () => {
  it("niega crear incidencia al observador y sugiere residente", () => {
    const a = availabilityCreateIncident("observador");
    expect(a.enabled).toBe(false);
    expect(a.suggestActorId).toBe(ACTOR_RESIDENTE);
  });

  it("permite asignar a administrador o revisor", () => {
    expect(availabilityAssign("residente").enabled).toBe(false);
    expect(availabilityAssign("administrador").enabled).toBe(true);
    expect(availabilityAssign("revisor").enabled).toBe(true);
  });

  it("guia el siguiente paso sin inventar permisos", () => {
    const observador = {
      id: ACTOR_OBSERVADOR,
      displayName: "Olivia Observadora",
      role: "observador" as const,
    };
    const step = nextGuidedStep(undefined, observador);
    expect(step.availability.enabled).toBe(false);

    expect(availabilityTransition("tecnico", "en_progreso").enabled).toBe(true);
    expect(availabilityTransition("residente", "cerrada").enabled).toBe(false);
    expect(availabilityTransition("residente", "cerrada").suggestActorId).toBe(ACTOR_REVISOR);

    expect([ACTOR_TECNICO, ACTOR_ADMIN, ACTOR_REVISOR, ACTOR_RESIDENTE]).toContain(
      ACTOR_TECNICO,
    );
  });
});
