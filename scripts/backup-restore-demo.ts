#!/usr/bin/env node
/**
 * Demostración real de respaldo y restauración.
 * Ejecutar: npm run backup:demo
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createProject } from "../src/lib/projects/store";
import { addMemory, listMemories } from "../src/lib/memory/store";
import { createBackup, restoreBackup, validateBackup } from "../src/lib/backup/service";

async function main() {
  const dataRoot = await fs.mkdtemp(path.join(os.tmpdir(), "companero-backup-demo-"));
  console.log("Data root:", dataRoot);
  const project = await createProject({ name: "Demo backup" }, dataRoot);
  await addMemory({ projectId: project.id, kind: "hecho", content: "valor original" }, dataRoot);
  const backup = await createBackup("demo", dataRoot);
  console.log("Backup:", backup);
  console.log("Warning:", backup.warning);
  const ok = await validateBackup(backup.id, dataRoot);
  console.log("Validate:", ok);
  await addMemory({ projectId: project.id, kind: "propuesta", content: "ruido" }, dataRoot);
  console.log("Antes de restaurar:", await listMemories(project.id, dataRoot));
  const restored = await restoreBackup(backup.id, dataRoot);
  console.log("Restore:", restored);
  console.log("Después:", await listMemories(project.id, dataRoot));
  await fs.rm(dataRoot, { recursive: true, force: true });
  if (!ok.ok) process.exit(1);
  console.log("OK: restauración comprobada.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
