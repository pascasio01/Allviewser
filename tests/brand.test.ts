import { describe, expect, it } from "vitest";
import { brand, displayAttribution, repositoryUrl } from "@/lib/brand";

describe("configuración de marca", () => {
  it("separa identidad pública, id interno y nombre de repositorio", () => {
    expect(brand.internalProductId).toBe("companero-digital");
    expect(brand.productCode).toBe(brand.internalProductId);
    expect(brand.repositoryName).toBe("Allviewser");
    expect(brand.shortName).not.toBe(brand.internalProductId);
    expect(brand.legalStatus).toBe("provisional_unverified");
    expect(brand.provisionalNotice.toLowerCase()).toMatch(/provisional/);
    expect(brand.provisionalNotice).not.toMatch(/®/);
  });

  it("expone fundador y URL de repo sin afirmar registro de marca", () => {
    expect(brand.founder.name).toBe("Pascasio Emmanuel Reynoso Reyes");
    expect(displayAttribution()).toContain("CEO");
    expect(repositoryUrl()).toBe("https://github.com/pascasio01/Allviewser");
    expect(brand.alternateCandidates).toContain("Brainluk");
  });

  it("apunta a un logo de identidad visual separable", () => {
    expect(brand.logoPath).toBe("/brand/logo.svg");
  });
});
