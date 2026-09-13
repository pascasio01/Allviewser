#!/usr/bin/env node
/**
 * Escaneo básico de secretos en archivos que se publicarán.
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", ".next", "data", "coverage"]);
const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "aws_access_key", re: /AKIA[0-9A-Z]{16}/g },
  { name: "generic_api_key_assignment", re: /(?:api[_-]?key|secret|token)\s*[:=]\s*['\"][A-Za-z0-9_\\-]{16,}['\"]/gi },
  { name: "private_key_block", re: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/g },
];

async function walk(dir: string, out: string[] = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else if (/\.(ts|tsx|js|mjs|json|md|yml|yaml|env|txt)$/i.test(e.name)) out.push(full);
  }
  return out;
}

async function main() {
  const files = await walk(ROOT);
  let hits = 0;
  for (const file of files) {
    if (file.endsWith(".env.example")) continue;
    const text = await fs.readFile(file, "utf8");
    for (const p of PATTERNS) {
      const matches = text.match(p.re);
      if (matches?.length) {
        hits += matches.length;
        console.error(`POSIBLE SECRETO (${p.name}) en ${path.relative(ROOT, file)}`);
      }
    }
  }
  if (hits > 0) {
    console.error(`Falló secret-scan: ${hits} coincidencia(s).`);
    process.exit(1);
  }
  console.log(`secret-scan OK (${files.length} archivos revisados).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
