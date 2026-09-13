import { NextResponse } from "next/server";
import { createBackup, listBackups, restoreBackup, validateBackup } from "@/lib/backup/service";
import { logActivity } from "@/lib/activity/log";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ backups: await listBackups() });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (body.action === "create") {
    const backup = await createBackup(body.note);
    await logActivity({ type: "backup.create", message: backup.id });
    return NextResponse.json({ backup });
  }
  if (body.action === "validate") {
    return NextResponse.json(await validateBackup(body.id));
  }
  if (body.action === "restore") {
    const result = await restoreBackup(body.id);
    await logActivity({ type: "backup.restore", message: body.id, meta: result });
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: "acción desconocida" }, { status: 400 });
}
