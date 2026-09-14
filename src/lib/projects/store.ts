import path from "node:path";
import { v4 as uuid } from "uuid";
import { ensureDataLayout, readJsonFile, writeJsonFile } from "../config/store";
import { ProjectSchema, type Project } from "./types";
import { workspaceRoot } from "../permissions/workspace";
import fs from "node:fs/promises";

async function indexFile(dataRoot?: string) {
  const paths = await ensureDataLayout(dataRoot);
  return path.join(paths.projects, "index.json");
}

export async function listProjects(dataRoot?: string): Promise<Project[]> {
  const file = await indexFile(dataRoot);
  const raw = await readJsonFile<Project[]>(file, []);
  return raw.map((p) => ProjectSchema.parse(p));
}

export async function getProject(id: string, dataRoot?: string): Promise<Project | null> {
  const all = await listProjects(dataRoot);
  return all.find((p) => p.id === id) ?? null;
}

export async function createProject(
  input: { name: string; description?: string },
  dataRoot?: string,
): Promise<Project> {
  const now = new Date().toISOString();
  const project = ProjectSchema.parse({
    id: uuid(),
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    status: "activo",
    createdAt: now,
    updatedAt: now,
  });
  const all = await listProjects(dataRoot);
  all.push(project);
  await writeJsonFile(await indexFile(dataRoot), all);
  await fs.mkdir(workspaceRoot(project.id, dataRoot), { recursive: true });
  return project;
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name" | "description" | "status">>,
  dataRoot?: string,
): Promise<Project> {
  const all = await listProjects(dataRoot);
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Proyecto no encontrado.");
  const updated = ProjectSchema.parse({
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
    archivedAt: patch.status === "archivado" ? new Date().toISOString() : all[idx].archivedAt,
  });
  all[idx] = updated;
  await writeJsonFile(await indexFile(dataRoot), all);
  return updated;
}

export async function archiveProject(id: string, dataRoot?: string): Promise<Project> {
  return updateProject(id, { status: "archivado" }, dataRoot);
}
