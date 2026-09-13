import { describe, expect, it } from "vitest";
import {
  COMPANION_CONTRACT,
  INTENTIONS,
  SPACE_VOICE,
  intentionById,
} from "@/lib/voice/companion";
import { brand } from "@/lib/brand";

describe("voz psicológica del compañero", () => {
  it("define cuatro intenciones con necesidad, oferta y límite", () => {
    expect(INTENTIONS).toHaveLength(4);
    for (const i of INTENTIONS) {
      expect(i.need.length).toBeGreaterThan(10);
      expect(i.offer.length).toBeGreaterThan(10);
      expect(i.boundary.toLowerCase()).toMatch(/no /);
    }
    expect(intentionById("resolver").label).toBe("Resolver");
  });

  it("expone un contrato emocional honesto", () => {
    expect(COMPANION_CONTRACT.pledges.length).toBeGreaterThanOrEqual(4);
    expect(COMPANION_CONTRACT.calmCue.toLowerCase()).toMatch(/demo|respir/);
  });

  it("alinea la marca con honestidad guiada", () => {
    expect(brand.tagline.toLowerCase()).toMatch(/honest/);
    expect(SPACE_VOICE.provenanceCue.toLowerCase()).toMatch(/procedencia|simulado|confianza/);
  });
});
