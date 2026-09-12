import path from "node:path";
import { v4 as uuid } from "uuid";
import { ensureDataLayout, readJsonFile, writeJsonFile } from "../config/store";
import {
  MemoryEntrySchema,
  looksSensitive,
  type MemoryEntry,
  type MemoryKind,
} from "./types";

function memoryFile(projectId: string, dataRoot?: string) {
  const paths = ensureDataLayout(dataRoot);
  return paths.then((p) => path.join(p.memories, `${projectId}.json`));
}

export async function listMemories(projectId: string, dataRoot?: string): Promise<MemoryEntry[]> {
  const file = await memoryFile(projectId, dataRoot);
  const raw = await readJsonFile<MemoryEntry[]>(file, []);
  return raw.map((m) => MemoryEntrySchema.parse(m));
}

export async function addMemory(
  input: {
    projectId: string;
    kind: MemoryKind;
    content: string;
    source?: MemoryEntry["source"];
    forceSensitive?: boolean;
  },
  dataRoot?: string,
): Promise<MemoryEntry> {
  if (looksSensitive(input.content) && !input.forceSensitive) {
    throw new Error(
      "El contenido parece sensible. No se guarda automáticamente. Confirma de forma explícita si deseas almacenarlo marcado como sensible.",
    );
  }
  const now = new Date().toISOString();
  const entry = MemoryEntrySchema.parse({
    id: uuid(),
    projectId: input.projectId,
    kind: input.kind,
    content: input.content.trim(),
    source: input.source ?? "usuario",
    sensitive: Boolean(input.forceSensitive) || looksSensitive(input.content),
    createdAt: now,
    updatedAt: now,
    approved: true,
  });
  const all = await listMemories(input.projectId, dataRoot);
  all.push(entry);
  const file = await memoryFile(input.projectId, dataRoot);
  await writeJsonFile(file, all);
  return entry;
}

export async function updateMemory(
  projectId: string,
  id: string,
  patch: Partial<Pick<MemoryEntry, "content" | "kind" | "approved">>,
  dataRoot?: string,
): Promise<MemoryEntry> {
  const all = await listMemories(projectId, dataRoot);
  const idx = all.findIndex((m) => m.id === id);
  if (idx < 0) throw new Error("Recuerdo no encontrado.");
  if (patch.content && looksSensitive(patch.content) && !all[idx].sensitive) {
    throw new Error("La corrección parece sensible; márcala explícitamente como sensible.");
  }
  const updated = MemoryEntrySchema.parse({
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  all[idx] = updated;
  const file = await memoryFile(projectId, dataRoot);
  await writeJsonFile(file, all);
  return updated;
}

export async function deleteMemory(projectId: string, id: string, dataRoot?: string): Promise<void> {
  const all = await listMemories(projectId, dataRoot);
  const next = all.filter((m) => m.id !== id);
  const file = await memoryFile(projectId, dataRoot);
  await writeJsonFile(file, next);
}

export async function exportMemories(projectId: string, dataRoot?: string): Promise<MemoryEntry[]> {
  return listMemories(projectId, dataRoot);
}

export async function clearMemories(projectId: string, dataRoot?: string): Promise<void> {
  const file = await memoryFile(projectId, dataRoot);
  await writeJsonFile(file, []);
}
