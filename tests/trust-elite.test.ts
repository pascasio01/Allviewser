import { describe, expect, it } from "vitest";
import { spaceActionContract } from "@/lib/trust/contracts";
import { buildCareNarrative, narrativeScript } from "@/lib/space/narrative";
import { shadowRoleView } from "@/lib/space/shadow";
import { MODULE_VOICE, SPACE_VOICE } from "@/lib/voice/companion";
import type { TimelineEvent } from "@/lib/space/types";

describe("capas de élite del compañero", () => {
  it("expone contratos de acción con límites honestos", () => {
    const c = spaceActionContract("create_incident", "residente");
    expect(c.whoSigns).toBe("residente");
    expect(c.whatIsNotClaimed.toLowerCase()).toMatch(/no /);
    expect(c.whatGetsRecorded.length).toBeGreaterThan(10);
  });

  it("construye un relato sin inventar pasado vacío", () => {
    expect(narrativeScript([])).toMatch(/silencio|Todavía no hay historia|Todavía no hay/i);
    const event = {
      id: "t1",
      placeId: "p1",
      kind: "incidencia_creada",
      title: "Humedad",
      detail: "Se abrió incidencia demo",
      actorId: "a1",
      actorName: "René",
      dates: { uploadedAt: "2026-09-13T10:00:00.000Z" },
      isSystemRecord: false,
    } as TimelineEvent;
    const beats = buildCareNarrative([event]);
    expect(beats.length).toBeGreaterThanOrEqual(1);
    expect(narrativeScript(beats).length).toBeGreaterThan(20);
  });

  it("modo sombra diferencia firmable vs fantasma", () => {
    const view = shadowRoleView("tecnico", {
      id: "actor-observador",
      displayName: "Olivia",
      role: "observador",
    });
    expect(view.note.toLowerCase()).toMatch(/sombra/);
    expect(view.actions.some((a) => a.ghost)).toBe(true);
  });

  it("voz incluye diario, ética comercial y silencio honesto", () => {
    expect(MODULE_VOICE.trustIntro.toLowerCase()).toMatch(/confianza/);
    expect(MODULE_VOICE.commerceEthicalTitle.toLowerCase()).toMatch(/ético|etica/);
    expect(SPACE_VOICE.honestMissingPrefix.toLowerCase()).toMatch(/falta/);
  });
});
