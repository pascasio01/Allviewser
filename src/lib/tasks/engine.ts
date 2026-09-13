import path from "node:path";
import { v4 as uuid } from "uuid";
import { ensureDataLayout, readJsonFile, writeJsonFile } from "../config/store";
import { TaskSchema, type Task, type TaskStatus } from "./types";

const running = new Map<string, AbortController>();

async function taskFile(projectId: string, taskId: string, dataRoot?: string) {
  const paths = await ensureDataLayout(dataRoot);
  return path.join(paths.tasks, projectId, `${taskId}.json`);
}

async function indexFile(projectId: string, dataRoot?: string) {
  const paths = await ensureDataLayout(dataRoot);
  return path.join(paths.tasks, projectId, "index.json");
}

export async function listTasks(projectId: string, dataRoot?: string): Promise<Task[]> {
  const index = await readJsonFile<string[]>(await indexFile(projectId, dataRoot), []);
  const tasks: Task[] = [];
  for (const id of index) {
    const t = await readJsonFile<Task | null>(await taskFile(projectId, id, dataRoot), null);
    if (t) tasks.push(TaskSchema.parse(t));
  }
  return tasks;
}

export async function getTask(projectId: string, taskId: string, dataRoot?: string): Promise<Task | null> {
  const t = await readJsonFile<Task | null>(await taskFile(projectId, taskId, dataRoot), null);
  return t ? TaskSchema.parse(t) : null;
}

async function saveTask(task: Task, dataRoot?: string) {
  await writeJsonFile(await taskFile(task.projectId, task.id, dataRoot), task);
  const index = await readJsonFile<string[]>(await indexFile(task.projectId, dataRoot), []);
  if (!index.includes(task.id)) {
    index.unshift(task.id);
    await writeJsonFile(await indexFile(task.projectId, dataRoot), index);
  }
}

export async function createTask(
  input: {
    projectId: string;
    objective: string;
    acceptanceCriteria?: string[];
    idempotencyKey?: string;
  },
  dataRoot?: string,
): Promise<Task> {
  const existing = await listTasks(input.projectId, dataRoot);
  if (input.idempotencyKey) {
    const dup = existing.find((t) => t.idempotencyKey === input.idempotencyKey);
    if (dup) return dup;
  }
  const now = new Date().toISOString();
  const task = TaskSchema.parse({
    id: uuid(),
    projectId: input.projectId,
    objective: input.objective.trim(),
    acceptanceCriteria: input.acceptanceCriteria ?? [],
    status: "pendiente",
    progress: [{ at: now, message: "Tarea creada", idempotencyKey: "created" }],
    idempotencyKey: input.idempotencyKey ?? uuid(),
    createdAt: now,
    updatedAt: now,
  });
  await saveTask(task, dataRoot);
  return task;
}

async function transition(
  projectId: string,
  taskId: string,
  status: TaskStatus,
  message: string,
  dataRoot?: string,
  extra?: Partial<Task>,
): Promise<Task> {
  const task = await getTask(projectId, taskId, dataRoot);
  if (!task) throw new Error("Tarea no encontrada.");
  const now = new Date().toISOString();
  const next = TaskSchema.parse({
    ...task,
    ...extra,
    status,
    updatedAt: now,
    progress: [...task.progress, { at: now, message }],
  });
  await saveTask(next, dataRoot);
  return next;
}

export async function startTask(
  projectId: string,
  taskId: string,
  runner: (ctx: { signal: AbortSignal; record: (msg: string, key?: string) => Promise<void> }) => Promise<{
    summary: string;
    artifacts?: string[];
  }>,
  dataRoot?: string,
): Promise<Task> {
  let task = await getTask(projectId, taskId, dataRoot);
  if (!task) throw new Error("Tarea no encontrada.");
  if (task.status === "completada") return task;
  if (task.status === "ejecutando") {
    throw new Error("La tarea ya está en ejecución.");
  }

  const controller = new AbortController();
  running.set(taskId, controller);
  const now = new Date().toISOString();
  task = TaskSchema.parse({
    ...task,
    status: "ejecutando",
    startedAt: task.startedAt ?? now,
    updatedAt: now,
    progress: [...task.progress, { at: now, message: "Ejecución iniciada", idempotencyKey: `start:${now}` }],
  });
  await saveTask(task, dataRoot);

  const recordedKeys = new Set(
    task.progress.map((p) => p.idempotencyKey).filter(Boolean) as string[],
  );

  try {
    const result = await runner({
      signal: controller.signal,
      record: async (msg, key) => {
        if (key && recordedKeys.has(key)) return;
        if (key) recordedKeys.add(key);
        const current = await getTask(projectId, taskId, dataRoot);
        if (!current) return;
        const at = new Date().toISOString();
        current.progress.push({ at, message: msg, idempotencyKey: key });
        current.updatedAt = at;
        await saveTask(current, dataRoot);
      },
    });

    if (controller.signal.aborted) {
      return transition(projectId, taskId, "cancelada", "Cancelada por el usuario", dataRoot, {
        finishedAt: new Date().toISOString(),
      });
    }

    const finished = await transition(projectId, taskId, "completada", "Completada", dataRoot, {
      result: { summary: result.summary, artifacts: result.artifacts ?? [] },
      finishedAt: new Date().toISOString(),
      error: undefined,
    });
    return finished;
  } catch (err) {
    if (controller.signal.aborted) {
      return transition(projectId, taskId, "cancelada", "Cancelada por el usuario", dataRoot, {
        finishedAt: new Date().toISOString(),
      });
    }
    return transition(projectId, taskId, "fallida", "Falló la ejecución", dataRoot, {
      error: err instanceof Error ? err.message : String(err),
      finishedAt: new Date().toISOString(),
    });
  } finally {
    running.delete(taskId);
  }
}

export function cancelTask(taskId: string): boolean {
  const c = running.get(taskId);
  if (!c) return false;
  c.abort();
  return true;
}

/** Reanuda de forma segura: solo si estaba ejecutando/bloqueada/fallida y no hay proceso vivo. */
export async function resumeTask(
  projectId: string,
  taskId: string,
  runner: Parameters<typeof startTask>[2],
  dataRoot?: string,
): Promise<Task> {
  const task = await getTask(projectId, taskId, dataRoot);
  if (!task) throw new Error("Tarea no encontrada.");
  if (running.has(taskId)) throw new Error("Ya hay una ejecución activa.");
  if (task.status === "completada" || task.status === "cancelada") {
    return task;
  }
  if (task.status === "ejecutando") {
    // Recuperación tras interrupción del proceso
    await transition(projectId, taskId, "pendiente", "Recuperada tras interrupción", dataRoot);
  }
  return startTask(projectId, taskId, runner, dataRoot);
}
