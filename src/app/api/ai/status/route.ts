import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config/store";
import { probeAiProvider } from "@/lib/models/probe";
import { brand } from "@/lib/brand";

export const runtime = "nodejs";

export async function GET() {
  const config = await loadConfig();
  const probe = await probeAiProvider(config);
  return NextResponse.json({
    brand: brand.shortName,
    version: brand.version,
    offlineCapable: true,
    ai: probe,
    model: {
      provider: config.model.provider,
      modelId: config.model.modelId ?? null,
      baseUrl: config.model.baseUrl ?? null,
      // nunca devolver el secreto; solo si hay nombre de env
      apiKeyEnv: config.model.apiKeyEnv ?? null,
    },
  });
}
