import { NextResponse } from "next/server";
import { loadConfig, saveConfig } from "@/lib/config/store";
import { AppConfigSchema } from "@/lib/config/types";
import { brand } from "@/lib/brand";

export const runtime = "nodejs";

export async function GET() {
  const config = await loadConfig();
  return NextResponse.json({ brand, config });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const parsed = AppConfigSchema.parse(body);
  const config = await saveConfig(parsed);
  return NextResponse.json({ config });
}
