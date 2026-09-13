import { NextResponse } from "next/server";
import {
  addMemory,
  clearMemories,
  deleteMemory,
  exportMemories,
  listMemories,
  updateMemory,
} from "@/lib/memory/store";
import { logActivity } from "@/lib/activity/log";
import { appendTrustEntry } from "@/lib/trust/journal";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
  if (searchParams.get("export") === "1") {
    return NextResponse.json({ memories: await exportMemories(projectId) });
  }
  return NextResponse.json({ memories: await listMemories(projectId) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const memory = await addMemory({
      projectId: body.projectId,
      kind: body.kind,
      content: body.content,
      forceSensitive: body.forceSensitive,
      source: body.source ?? "usuario",
      ritualStatus: body.ritualStatus,
    });
    await logActivity({
      type: "memory.add",
      projectId: body.projectId,
      message: `Recuerdo añadido (${memory.kind})`,
    });
    return NextResponse.json({ memory }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const memory = await updateMemory(body.projectId, body.id, {
    content: body.content,
    kind: body.kind,
    approved: body.approved,
    ritualStatus: body.ritualStatus,
  });
  if (body.ritualStatus === "aprobado" || body.approved === true) {
    await appendTrustEntry({
      projectId: body.projectId,
      title: "Recuerdo aprobado",
      summary: "Un hecho pasó el ritual de confianza y ya puede usarse como base.",
      source: "memoria",
      did: [{ kind: "hecho", text: memory.content.slice(0, 240) }],
      didNotClaim: [
        { kind: "limite", text: "La aprobación es local; no implica verificación externa." },
      ],
      pending: [],
      signedByRole: "usuario",
    });
  }
  return NextResponse.json({ memory });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  if (body.clear) {
    await clearMemories(body.projectId);
  } else {
    await deleteMemory(body.projectId, body.id);
  }
  return NextResponse.json({ ok: true });
}
