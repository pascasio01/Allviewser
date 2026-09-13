import { NextResponse } from "next/server";
import { archiveProject, createProject, listProjects, updateProject } from "@/lib/projects/store";
import { logActivity } from "@/lib/activity/log";

export const runtime = "nodejs";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const body = await req.json();
  const project = await createProject({ name: body.name, description: body.description });
  await logActivity({ type: "project.create", projectId: project.id, message: `Proyecto creado: ${project.name}` });
  return NextResponse.json({ project }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const project =
    body.action === "archive"
      ? await archiveProject(body.id)
      : await updateProject(body.id, { name: body.name, description: body.description, status: body.status });
  await logActivity({ type: "project.update", projectId: project.id, message: `Proyecto actualizado: ${project.name}` });
  return NextResponse.json({ project });
}
