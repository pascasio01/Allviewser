import path from "node:path";
import { brand } from "./brand";

/** Directorio raíz de datos locales (no se publica). */
export function getDataRoot(override?: string): string {
  return override ?? process.env.COMPANERO_DATA_DIR ?? path.join(process.cwd(), "data");
}

export function getPaths(dataRoot?: string) {
  const root = getDataRoot(dataRoot);
  return {
    root,
    config: path.join(root, "config.json"),
    projects: path.join(root, "projects"),
    memories: path.join(root, "memories"),
    conversations: path.join(root, "conversations"),
    tasks: path.join(root, "tasks"),
    activity: path.join(root, "activity"),
    backups: path.join(root, "backups"),
    workspace: path.join(root, "workspace"),
    versions: path.join(root, "versions"),
    evolution: path.join(root, "evolution"),
    brandMarker: path.join(root, `${brand.productCode}.marker`),
  };
}

export type AppPaths = ReturnType<typeof getPaths>;
