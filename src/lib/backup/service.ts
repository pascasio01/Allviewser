import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { ensureDataLayout, sha256 } from "../config/store";
import { getPaths } from "../paths";

export type BackupManifest = {
  id: string;
  createdAt: string;
  checksum: string;
  note: string;
  sameDisk: true;
  warning: string;
};

async function hashTree(dir: string): Promise<string> {
  const hash = createHash("sha256");
  async function walk(current: string, prefix = "") {
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const e of entries) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (e.name === "backups") continue;
        await walk(path.join(current, e.name), rel);
      } else {
        const buf = await fs.readFile(path.join(current, e.name));
        hash.update(rel);
        hash.update(buf);
      }
    }
  }
  await walk(dir);
  return hash.digest("hex");
}

export async function createBackup(note = "exportación local", dataRoot?: string): Promise<BackupManifest> {
  const paths = await ensureDataLayout(dataRoot);
  const id = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(paths.backups, id);
  await fs.mkdir(dest, { recursive: true });
  for (const name of ["config.json", "projects", "memories", "conversations", "tasks", "workspace", "activity"]) {
    const src = path.join(paths.root, name);
    try {
      await fs.cp(src, path.join(dest, name), { recursive: true });
    } catch {
      // optional
    }
  }
  const checksum = await hashTree(dest);
  const manifest: BackupManifest = {
    id,
    createdAt: new Date().toISOString(),
    checksum,
    note,
    sameDisk: true,
    warning:
      "Esta copia está en el mismo disco que los datos vivos. No es un respaldo independiente frente a fallo de disco.",
  };
  await fs.writeFile(path.join(dest, "manifest.json"), JSON.stringify(manifest, null, 2));
  return manifest;
}

export async function listBackups(dataRoot?: string): Promise<BackupManifest[]> {
  const paths = await ensureDataLayout(dataRoot);
  const dirs = await fs.readdir(paths.backups).catch(() => []);
  const out: BackupManifest[] = [];
  for (const d of dirs) {
    try {
      const raw = await fs.readFile(path.join(paths.backups, d, "manifest.json"), "utf8");
      out.push(JSON.parse(raw) as BackupManifest);
    } catch {
      // skip
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function validateBackup(backupId: string, dataRoot?: string): Promise<{ ok: boolean; expected: string; actual: string }> {
  const paths = getPaths(dataRoot);
  const dest = path.join(paths.backups, backupId);
  const raw = await fs.readFile(path.join(dest, "manifest.json"), "utf8");
  const manifest = JSON.parse(raw) as BackupManifest;
  // Re-validate by hashing content dirs only (manifest se escribió después del checksum).
  const contentHash = createHash("sha256");
  async function walk(current: string, prefix = "") {
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const e of entries) {
      if (e.name === "manifest.json") continue;
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) await walk(path.join(current, e.name), rel);
      else {
        const buf = await fs.readFile(path.join(current, e.name));
        contentHash.update(rel);
        contentHash.update(buf);
      }
    }
  }
  await walk(dest);
  const recomputed = contentHash.digest("hex");
  return { ok: recomputed === manifest.checksum, expected: manifest.checksum, actual: recomputed };
}

export async function restoreBackup(backupId: string, dataRoot?: string): Promise<{ ok: boolean; restored: string[] }> {
  const validation = await validateBackup(backupId, dataRoot);
  if (!validation.ok) {
    throw new Error(`Integridad del respaldo falló. Esperado ${validation.expected}, actual ${validation.actual}`);
  }
  const paths = await ensureDataLayout(dataRoot);
  const src = path.join(paths.backups, backupId);
  const restored: string[] = [];
  for (const name of ["config.json", "projects", "memories", "conversations", "tasks", "workspace", "activity"]) {
    const from = path.join(src, name);
    const to = path.join(paths.root, name);
    try {
      await fs.rm(to, { recursive: true, force: true });
      await fs.cp(from, to, { recursive: true });
      restored.push(name);
    } catch {
      // missing in backup
    }
  }
  return { ok: true, restored };
}

export { sha256 };
