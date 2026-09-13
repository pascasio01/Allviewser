import path from "node:path";
import fs from "node:fs/promises";
import { getPaths } from "../paths";

export class WorkspacePathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspacePathError";
  }
}

/**
 * Resuelve una ruta relativa dentro del espacio autorizado del proyecto.
 * Rechaza traversal (..), absolutas fuera del root y enlaces que escapen.
 */
export async function resolveWorkspacePath(
  projectId: string,
  relativePath: string,
  dataRoot?: string,
): Promise<string> {
  if (!projectId || projectId.includes("..") || path.isAbsolute(projectId)) {
    throw new WorkspacePathError("Identificador de proyecto inválido.");
  }
  const paths = getPaths(dataRoot);
  const root = path.resolve(paths.workspace, projectId);
  await fs.mkdir(root, { recursive: true });

  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized)) {
    throw new WorkspacePathError("No se permiten rutas absolutas.");
  }
  if (normalized.split("/").some((p) => p === "..")) {
    throw new WorkspacePathError("Ruta fuera del espacio autorizado.");
  }

  const resolved = path.resolve(root, normalized);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new WorkspacePathError("Ruta fuera del espacio autorizado.");
  }

  // Comprobar symlink escape si el archivo existe
  try {
    const real = await fs.realpath(resolved);
    const realRoot = await fs.realpath(root);
    if (!real.startsWith(realRoot + path.sep) && real !== realRoot) {
      throw new WorkspacePathError("El enlace escapa del espacio autorizado.");
    }
    return real;
  } catch (err) {
    if (err instanceof WorkspacePathError) throw err;
    // Archivo aún no existe: validar el directorio padre real si existe
    return resolved;
  }
}

export function workspaceRoot(projectId: string, dataRoot?: string): string {
  return path.resolve(getPaths(dataRoot).workspace, projectId);
}
