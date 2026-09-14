import { describe, expect, it } from "vitest";
import { probeAiProvider } from "@/lib/models/probe";
import { defaultConfig } from "@/lib/config/types";

describe("probeAiProvider", () => {
  it("reports idle when provider is none", async () => {
    const result = await probeAiProvider(defaultConfig());
    expect(result.configured).toBe(false);
    expect(result.reachable).toBe(false);
    expect(result.provider).toBe("none");
    expect(result.nextStep?.href).toContain("configuracion");
  });

  it("requires baseUrl and modelId when provider is set", async () => {
    const config = defaultConfig();
    config.model.provider = "local";
    const result = await probeAiProvider(config);
    expect(result.configured).toBe(false);
    expect(result.reachable).toBe(false);
    expect(result.message).toMatch(/URL|modelId/i);
  });
});
