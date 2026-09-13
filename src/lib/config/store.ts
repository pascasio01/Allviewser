import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { getPaths, type AppPaths } from "../paths";
import { brand } from "../brand";
import { defaultConfig, AppConfigSchema, type AppConfig } from "./types";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function ensureDataLayout(dataRoot?: string): Promise<AppPaths> {
  const paths = getPaths(dataRoot);
  await Promise.all([
    ensureDir(paths.root),
    ensureDir(paths.projects),
    ensureDir(paths.memories),
    ensureDir(paths.conversations),
    ensureDir(paths.tasks),
    ensureDir(paths.activity),
    ensureDir(paths.backups),
    ensureDir(paths.workspace),
    ensureDir(paths.versions),
    ensureDir(paths.evolution),
    ensureDir(paths.trust),
  ]);
  try {
    await fs.access(paths.config);
  } catch {
    await fs.writeFile(paths.config, JSON.stringify(defaultConfig(), null, 2), "utf8");
  }
  await fs.writeFile(
    paths.brandMarker,
    JSON.stringify({ product: brand.internalProductId, createdAt: new Date().toISOString() }),
    "utf8",
  );
  return paths;
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const tmp = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, filePath);
}

export async function loadConfig(dataRoot?: string): Promise<AppConfig> {
  const paths = await ensureDataLayout(dataRoot);
  const raw = await readJsonFile(paths.config, defaultConfig());
  return AppConfigSchema.parse(raw);
}

export async function saveConfig(config: AppConfig, dataRoot?: string): Promise<AppConfig> {
  const paths = await ensureDataLayout(dataRoot);
  const parsed = AppConfigSchema.parse(config);
  await writeJsonFile(paths.config, parsed);
  return parsed;
}

export function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function fileChecksum(filePath: string): Promise<string> {
  const buf = await fs.readFile(filePath);
  return sha256(buf);
}
