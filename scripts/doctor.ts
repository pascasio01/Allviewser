#!/usr/bin/env tsx
/**
 * Setup doctor — comprueba el entorno antes de `npm run dev`.
 * No imprime secretos; solo nombres de variables y rutas.
 */

import { accessSync, constants, existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

type Check = { ok: boolean; label: string; detail: string; level: "error" | "warn" | "info" };

function parseSemver(v: string): [number, number, number] {
  const m = v.replace(/^v/, "").split(".").map((n) => Number.parseInt(n, 10));
  return [m[0] || 0, m[1] || 0, m[2] || 0];
}

function nodeCheck(): Check {
  const version = process.versions.node;
  const [major] = parseSemver(version);
  if (major < 20) {
    return {
      ok: false,
      level: "error",
      label: "Node.js",
      detail: `Detectado ${version}. Se requiere Node.js 20.x o 22.x (recomendado: 22 LTS).`,
    };
  }
  if (major === 21 || major === 23) {
    return {
      ok: true,
      level: "warn",
      label: "Node.js",
      detail: `Detectado ${version}. Funciona, pero CI usa Node 22. Prefiere 20.x o 22.x LTS.`,
    };
  }
  if (major >= 25) {
    return {
      ok: true,
      level: "warn",
      label: "Node.js",
      detail: `Detectado ${version}. Versión muy nueva / posiblemente inestable. Usa 22.x LTS si algo falla.`,
    };
  }
  return {
    ok: true,
    level: "info",
    label: "Node.js",
    detail: `${version} — OK (soportado: 20.x / 22.x; CI: 22).`,
  };
}

function npmCheck(): Check {
  const r = spawnSync("npm", ["-v"], { encoding: "utf8" });
  if (r.status !== 0) {
    return { ok: false, level: "error", label: "npm", detail: "No se pudo ejecutar `npm -v`." };
  }
  const version = (r.stdout || "").trim();
  const [major] = parseSemver(version);
  if (major < 10) {
    return {
      ok: false,
      level: "error",
      label: "npm",
      detail: `Detectado ${version}. Se requiere npm 10+.`,
    };
  }
  return { ok: true, level: "info", label: "npm", detail: `${version} — OK.` };
}

function lockfileCheck(): Check {
  if (!existsSync(join(process.cwd(), "package-lock.json"))) {
    return {
      ok: false,
      level: "error",
      label: "package-lock.json",
      detail: "Falta el lockfile. Clona el repo completo o restaura package-lock.json.",
    };
  }
  return {
    ok: true,
    level: "info",
    label: "package-lock.json",
    detail: "Presente — usa `npm ci` para instalación reproducible.",
  };
}

function modulesCheck(): Check {
  if (!existsSync(join(process.cwd(), "node_modules", "next"))) {
    return {
      ok: false,
      level: "error",
      label: "Dependencias",
      detail: "Falta node_modules. Ejecuta `npm ci` (o `npm install`).",
    };
  }
  return { ok: true, level: "info", label: "Dependencias", detail: "node_modules/next encontrado." };
}

function dataDirCheck(): Check {
  const dataDir = process.env.COMPANERO_DATA_DIR?.trim() || join(process.cwd(), "data");
  try {
    mkdirSync(dataDir, { recursive: true });
    const probe = join(dataDir, `.doctor-write-${process.pid}`);
    writeFileSync(probe, "ok");
    unlinkSync(probe);
    return {
      ok: true,
      level: "info",
      label: "Directorio de datos",
      detail: `Escribible: ${dataDir}`,
    };
  } catch (err) {
    return {
      ok: false,
      level: "error",
      label: "Directorio de datos",
      detail: `No se puede escribir en ${dataDir}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

function envExampleCheck(): Check {
  const path = join(process.cwd(), ".env.example");
  try {
    accessSync(path, constants.R_OK);
    return {
      ok: true,
      level: "info",
      label: ".env.example",
      detail: "Presente. Copia a .env.local solo si necesitas claves (opcionales).",
    };
  } catch {
    return {
      ok: false,
      level: "warn",
      label: ".env.example",
      detail: "No encontrado. No bloquea el arranque; las claves siguen siendo opcionales en la UI.",
    };
  }
}

function optionalKeysCheck(): Check {
  const names = ["COMPANERO_MODEL_API_KEY", "COMPANERO_REMOTE_TOKEN", "COMPANERO_REMOTE_ENDPOINT"];
  const set = names.filter((n) => Boolean(process.env[n]?.trim()));
  if (set.length === 0) {
    return {
      ok: true,
      level: "info",
      label: "Claves / upgrades",
      detail:
        "Ninguna clave en el entorno. Correcto: el modelo y la continuidad remota se configuran en la app (Configuración).",
    };
  }
  return {
    ok: true,
    level: "info",
    label: "Claves / upgrades",
    detail: `Variables definidas (solo nombres): ${set.join(", ")}. No se muestran valores.`,
  };
}

function main() {
  const checks = [
    nodeCheck(),
    npmCheck(),
    lockfileCheck(),
    modulesCheck(),
    dataDirCheck(),
    envExampleCheck(),
    optionalKeysCheck(),
  ];

  console.log("Allviewser — setup doctor\n");
  for (const c of checks) {
    const mark = c.ok ? (c.level === "warn" ? "!" : "✓") : "✗";
    console.log(`${mark} ${c.label}: ${c.detail}`);
  }

  const errors = checks.filter((c) => !c.ok && c.level === "error");
  const warns = checks.filter((c) => c.level === "warn");

  console.log("");
  if (errors.length) {
    console.log(`Doctor: ${errors.length} error(es). Corrige antes de \`npm run dev\`.`);
    console.log("Guía: docs/INSTALL.md");
    process.exit(1);
  }
  if (warns.length) {
    console.log(`Doctor: OK con ${warns.length} aviso(s). Puedes continuar con \`npm run dev\`.`);
  } else {
    console.log("Doctor: todo listo. Siguiente: `npm run dev` → http://localhost:3000");
  }
  console.log("Después: abre Proyectos, Conversación, Comercio o Configuración desde el centro de control.");
}

main();
