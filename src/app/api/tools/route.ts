import { NextResponse } from "next/server";
import { listToolManifests, runTool } from "@/lib/tools/registry";
import { logActivity } from "@/lib/activity/log";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ tools: listToolManifests() });
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await runTool(body.id, body.input ?? {}, {
    projectId: body.projectId,
    grantNetwork: Boolean(body.grantNetwork),
    confirmSensitive: Boolean(body.confirmSensitive),
  });
  await logActivity({
    type: "tool.run",
    projectId: body.projectId,
    message: `Herramienta ${body.id}: ${result.ok ? "ok" : "error"}`,
    meta: { toolId: body.id },
  });
  return NextResponse.json(result);
}
