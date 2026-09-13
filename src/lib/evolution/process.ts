import path from "node:path";
import { v4 as uuid } from "uuid";
import { ensureDataLayout, readJsonFile, writeJsonFile } from "../config/store";

export type EvolutionIssue = {
  id: string;
  title: string;
  description: string;
  risk: "bajo" | "medio" | "alto";
  status: "registrado" | "propuesto" | "implementando" | "probado" | "revision" | "publicado" | "revertido";
  createdAt: string;
  updatedAt: string;
};

/**
 * Actualizaciones revisables: no autorreescritura ilimitada.
 * Las pruebas de aceptación del núcleo viven en /tests y no deben alterarse
 * desde herramientas del agente para autoaprobarse.
 */
export async function registerIssue(
  input: { title: string; description: string; risk?: EvolutionIssue["risk"] },
  dataRoot?: string,
): Promise<EvolutionIssue> {
  const paths = await ensureDataLayout(dataRoot);
  const file = path.join(paths.evolution, "issues.json");
  const all = await readJsonFile<EvolutionIssue[]>(file, []);
  const now = new Date().toISOString();
  const issue: EvolutionIssue = {
    id: uuid(),
    title: input.title,
    description: input.description,
    risk: input.risk ?? "medio",
    status: "registrado",
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(issue);
  await writeJsonFile(file, all);
  return issue;
}

export async function listIssues(dataRoot?: string) {
  const paths = await ensureDataLayout(dataRoot);
  return readJsonFile<EvolutionIssue[]>(path.join(paths.evolution, "issues.json"), []);
}

export const evolutionProcess = [
  "1. Registrar un problema",
  "2. Proponer un cambio",
  "3. Implementarlo en una rama o entorno aislado",
  "4. Ejecutar pruebas y comparación",
  "5. Solicitar revisión según el riesgo",
  "6. Publicar una versión",
  "7. Recuperar la versión previa si es necesario",
] as const;
