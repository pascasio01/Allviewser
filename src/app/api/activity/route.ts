import { NextResponse } from "next/server";
import { listActivity } from "@/lib/activity/log";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 50);
  return NextResponse.json({ events: await listActivity(limit) });
}
