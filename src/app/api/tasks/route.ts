import { NextResponse } from "next/server";
import { cancelTask, createTask, getTask, listTasks, resumeTask, startTask } from "@/lib/tasks/engine";
import { logActivity } from "@/lib/activity/log";
import { runTool } from "@/lib/tools/registry";
import { applyWorkshopCorrection } from "@/lib/tools/workshop";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
  const taskId = searchParams.get("taskId");
  if (taskId) return NextResponse.json({ task: await getTask(projectId, taskId) });
  return NextResponse.json({ tasks: await listTasks(projectId) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const projectId = body.projectId as string;

  if (body.action === "create") {
    const task = await createTask({
      projectId,
      objective: body.objective,
      acceptanceCriteria: body.acceptanceCriteria,
      idempotencyKey: body.idempotencyKey,
    });
    await logActivity({ type: "task.create", projectId, message: task.objective });
    return NextResponse.json({ task }, { status: 201 });
  }

  if (body.action === "cancel") {
    const ok = cancelTask(body.taskId);
    return NextResponse.json({ ok });
  }

  if (body.action === "start" || body.action === "resume") {
    const runner = async (ctx: {
      signal: AbortSignal;
      record: (msg: string, key?: string) => Promise<void>;
    }) => {
      await ctx.record("Preparando requisitos del taller", "req");
      const created = await runTool(
        "workshop.create_app",
        { template: "todos", requirements: body.requirements },
        { projectId, signal: ctx.signal },
      );
      if (!created.ok) throw new Error(created.error);
      await ctx.record("Archivos creados", "files");
      const snap = await runTool(
        "workshop.diff_versions",
        { appPath: "apps/todos", action: "snapshot" },
        { projectId, signal: ctx.signal },
      );
      await ctx.record("Versión guardada", "snap");
      const preview = await runTool(
        "workshop.preview",
        { appPath: "apps/todos" },
        { projectId, signal: ctx.signal },
      );
      await ctx.record("Vista previa lista", "preview");
      if (body.correction) {
        await ctx.record("Aplicando corrección del usuario", "fix");
        await applyWorkshopCorrection(projectId, body.correction);
      }
      const tests = await runTool(
        "workshop.run_tests",
        { appPath: "apps/todos" },
        { projectId, signal: ctx.signal },
      );
      if (!tests.ok) throw new Error(tests.error);
      if (!(tests.output as { passed?: boolean }).passed) {
        throw new Error(`Pruebas fallidas: ${(tests.output as { stderr?: string }).stderr}`);
      }
      await ctx.record("Pruebas superadas", "tests");
      return {
        summary: "Aplicación de tareas creada, corregida (si aplica) y verificada.",
        artifacts: [
          "apps/todos",
          String((snap.output as { versionId?: string })?.versionId ?? ""),
          String((preview.output as { stage?: string })?.stage ?? ""),
        ],
      };
    };

    const task =
      body.action === "resume"
        ? await resumeTask(projectId, body.taskId, runner)
        : await startTask(projectId, body.taskId, runner);
    await logActivity({ type: `task.${body.action}`, projectId, message: task.status, meta: { taskId: task.id } });
    return NextResponse.json({ task });
  }

  return NextResponse.json({ error: "acción desconocida" }, { status: 400 });
}
