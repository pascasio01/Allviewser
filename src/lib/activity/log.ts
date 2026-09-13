import path from "node:path";
import { v4 as uuid } from "uuid";
import { ensureDataLayout, readJsonFile, writeJsonFile } from "../config/store";

export type ActivityEvent = {
  id: string;
  at: string;
  type: string;
  projectId?: string;
  message: string;
  meta?: Record<string, unknown>;
};

function redact(meta?: Record<string, unknown>) {
  if (!meta) return meta;
  const clone = { ...meta };
  for (const key of Object.keys(clone)) {
    if (/secret|password|token|apikey|api_key|authorization/i.test(key)) {
      clone[key] = "[redacted]";
    }
  }
  return clone;
}

export async function logActivity(
  event: Omit<ActivityEvent, "id" | "at"> & { at?: string },
  dataRoot?: string,
): Promise<ActivityEvent> {
  const paths = await ensureDataLayout(dataRoot);
  const file = path.join(paths.activity, "log.json");
  const all = await readJsonFile<ActivityEvent[]>(file, []);
  const entry: ActivityEvent = {
    id: uuid(),
    at: event.at ?? new Date().toISOString(),
    type: event.type,
    projectId: event.projectId,
    message: event.message,
    meta: redact(event.meta),
  };
  all.unshift(entry);
  await writeJsonFile(file, all.slice(0, 1000));
  return entry;
}

export async function listActivity(limit = 100, dataRoot?: string): Promise<ActivityEvent[]> {
  const paths = await ensureDataLayout(dataRoot);
  const file = path.join(paths.activity, "log.json");
  const all = await readJsonFile<ActivityEvent[]>(file, []);
  return all.slice(0, limit);
}
