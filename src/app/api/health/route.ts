import { NextResponse } from "next/server";
import { ensureDataLayout } from "@/lib/config/store";
import { brand } from "@/lib/brand";

export const runtime = "nodejs";

export async function GET() {
  await ensureDataLayout();
  return NextResponse.json({ ok: true, brand: brand.shortName, version: brand.version });
}
