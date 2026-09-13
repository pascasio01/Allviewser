import { NextResponse } from "next/server";
import {
  appendTrustEntry,
  exportTrustJournal,
  listTrustJournal,
  spaceActionContract,
} from "@/lib/trust/journal";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("export") === "1") {
    return NextResponse.json({ entries: await exportTrustJournal() });
  }
  if (searchParams.get("contract")) {
    const actionId = searchParams.get("contract")!;
    const role = searchParams.get("role") ?? "observador";
    return NextResponse.json({ contract: spaceActionContract(actionId, role) });
  }
  const limit = Number(searchParams.get("limit") ?? "50");
  return NextResponse.json({ entries: await listTrustJournal(limit) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = await appendTrustEntry({
      projectId: body.projectId,
      actorId: body.actorId,
      actorRole: body.actorRole,
      title: body.title,
      summary: body.summary,
      did: body.did ?? [],
      didNotClaim: body.didNotClaim ?? [],
      pending: body.pending ?? [],
      signedByRole: body.signedByRole,
      source: body.source ?? "usuario",
      meta: body.meta,
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }
}
