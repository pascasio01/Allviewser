import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { resolveWorkspacePath, workspaceRoot } from "../permissions/workspace";
import { assertPermission, defaultToolGrant } from "../permissions/grants";
import type { Tool, ToolResult } from "./types";
import { fileWriteTool } from "./files";
import { sha256 } from "../config/store";
import { getPaths } from "../paths";

const TODO_APP_FILES: Record<string, string> = {
  "package.json": JSON.stringify(
    {
      name: "taller-tareas",
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: {
        test: "node --test test/todos.test.js",
        start: "node src/cli.js",
      },
    },
    null,
    2,
  ),
  "README.md": `# Aplicación de tareas (taller)

Aplicación ejecutable de línea de comandos con persistencia local.

## Funciones
- Crear, editar, completar, eliminar tareas
- Persistencia en \`data/todos.json\`

## Ejecutar
\`\`\`bash
npm test
node src/cli.js add "Comprar pan"
node src/cli.js list
\`\`\`

Plataforma entregada: **Node.js CLI** (no es aplicación nativa móvil/desktop).
`,
  "src/todos.js": `import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DATA = path.join(process.cwd(), "data", "todos.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA, "utf8"));
  } catch {
    return [];
  }
}

function save(items) {
  fs.mkdirSync(path.dirname(DATA), { recursive: true });
  fs.writeFileSync(DATA, JSON.stringify(items, null, 2));
}

export function createTodo(title) {
  const items = load();
  const todo = { id: randomUUID(), title, done: false, createdAt: new Date().toISOString() };
  items.push(todo);
  save(items);
  return todo;
}

export function updateTodo(id, patch) {
  const items = load();
  const i = items.findIndex((t) => t.id === id);
  if (i < 0) throw new Error("No encontrado");
  items[i] = { ...items[i], ...patch };
  save(items);
  return items[i];
}

export function completeTodo(id) {
  return updateTodo(id, { done: true, completedAt: new Date().toISOString() });
}

export function deleteTodo(id) {
  const items = load().filter((t) => t.id !== id);
  save(items);
  return true;
}

export function listTodos() {
  return load();
}
`,
  "src/cli.js": `#!/usr/bin/env node
import { createTodo, completeTodo, deleteTodo, listTodos, updateTodo } from "./todos.js";

const [cmd, ...args] = process.argv.slice(2);

function print(items) {
  for (const t of items) {
    console.log(\`[\${t.done ? "x" : " "}] \${t.id.slice(0, 8)} \${t.title}\`);
  }
}

switch (cmd) {
  case "add":
    console.log(JSON.stringify(createTodo(args.join(" ") || "Sin título"), null, 2));
    break;
  case "edit":
    console.log(JSON.stringify(updateTodo(args[0], { title: args.slice(1).join(" ") }), null, 2));
    break;
  case "done":
    console.log(JSON.stringify(completeTodo(args[0]), null, 2));
    break;
  case "rm":
    deleteTodo(args[0]);
    console.log("ok");
    break;
  case "list":
  default:
    print(listTodos());
}
`,
  "test/todos.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function withTempApp(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taller-todos-"));
  for (const rel of ["src/todos.js", "src/cli.js", "package.json"]) {
    const dest = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(root, rel), dest);
  }
  const prev = process.cwd();
  process.chdir(dir);
  try {
    return await fn(dir);
  } finally {
    process.chdir(prev);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("crear y persistir", async () => {
  await withTempApp(async (dir) => {
    const mod = await import(pathToFileURL(path.join(dir, "src/todos.js")).href + "?t=" + Date.now());
    const a = mod.createTodo("Uno");
    const list = mod.listTodos();
    assert.equal(list.length, 1);
    assert.equal(list[0].title, "Uno");
    assert.equal(a.done, false);
    const raw = fs.readFileSync(path.join(dir, "data/todos.json"), "utf8");
    assert.match(raw, /Uno/);
  });
});

test("editar, completar y eliminar", async () => {
  await withTempApp(async (dir) => {
    const mod = await import(pathToFileURL(path.join(dir, "src/todos.js")).href + "?t=" + Date.now());
    const a = mod.createTodo("A");
    mod.updateTodo(a.id, { title: "B" });
    mod.completeTodo(a.id);
    let list = mod.listTodos();
    assert.equal(list[0].title, "B");
    assert.equal(list[0].done, true);
    mod.deleteTodo(a.id);
    list = mod.listTodos();
    assert.equal(list.length, 0);
  });
});

test("cli list vacío", async () => {
  await withTempApp(async (dir) => {
    const r = spawnSync(process.execPath, ["src/cli.js", "list"], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0);
  });
});
`,
};

export const workshopCreateAppTool: Tool = {
  manifest: {
    id: "workshop.create_app",
    version: "1.0.0",
    title: "Crear aplicación de taller",
    description: "Crea un proyecto pequeño aislado (caso inicial: app de tareas).",
    inputSchema: { template: "todos", requirements: "string[]?" },
    outputSchema: { files: "string[]", preview: "string", stage: "string" },
    permissions: ["fs.write", "fs.list"],
    dataUsed: ["workspace"],
    networkAccess: false,
    dependencies: ["Node.js"],
    possibleCosts: "Ninguno (local)",
    maxDurationMs: 60_000,
    cancelBehavior: "Puede dejar archivos parciales; usar versionado para recuperar.",
    reversible: true,
  },
  async execute(input, ctx): Promise<ToolResult> {
    try {
      assertPermission(defaultToolGrant(), "fs.write");
      const template = (input as { template?: string }).template ?? "todos";
      if (template !== "todos") {
        return { ok: false, error: "Plantilla no disponible en v0.1. Solo 'todos'." };
      }
      const requirements = (input as { requirements?: string[] }).requirements ?? [
        "Crear tareas",
        "Editar tareas",
        "Finalizar tareas",
        "Eliminar tareas",
        "Persistencia local",
      ];
      const written: string[] = [];
      for (const [rel, content] of Object.entries(TODO_APP_FILES)) {
        if (ctx.signal?.aborted) return { ok: false, error: "Cancelado" };
        const res = await fileWriteTool.execute({ path: `apps/todos/${rel}`, content }, ctx);
        if (!res.ok) return res;
        written.push(`apps/todos/${rel}`);
      }
      const reqDoc = `# Requisitos concretos\n\n${requirements.map((r) => `- ${r}`).join("\n")}\n\nEstado: prototipo → aplicación ejecutable (CLI Node.js).\n`;
      await fileWriteTool.execute({ path: "apps/todos/REQUISITOS.md", content: reqDoc }, ctx);
      written.push("apps/todos/REQUISITOS.md");

      return {
        ok: true,
        output: {
          files: written,
          preview: "CLI de tareas con persistencia JSON. Ejecutar: cd apps/todos && npm test && node src/cli.js list",
          stage: "aplicacion-ejecutable",
          platform: "Node.js CLI",
          notNative: true,
        },
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

function runIsolated(
  cwd: string,
  command: string,
  args: string[],
  signal?: AbortSignal,
  timeoutMs = 60_000,
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, PATH: process.env.PATH, HOME: process.env.HOME },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += String(d);
    });
    child.stderr.on("data", (d) => {
      stderr += String(d);
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Tiempo máximo de ejecución agotado"));
    }, timeoutMs);
    const onAbort = () => child.kill("SIGTERM");
    signal?.addEventListener("abort", onAbort);
    child.on("close", (code) => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve({ code, stdout, stderr });
    });
  });
}

export const workshopRunTestsTool: Tool = {
  manifest: {
    id: "workshop.run_tests",
    version: "1.0.0",
    title: "Ejecutar pruebas aisladas",
    description: "Ejecuta pruebas del proyecto de taller sin red.",
    inputSchema: { appPath: "string" },
    outputSchema: { passed: "boolean", stdout: "string", stderr: "string" },
    permissions: ["shell.run", "fs.read"],
    dataUsed: ["workspace app"],
    networkAccess: false,
    dependencies: ["Node.js"],
    possibleCosts: "CPU local",
    maxDurationMs: 90_000,
    cancelBehavior: "Se envía señal de terminación al proceso hijo.",
    reversible: true,
  },
  async execute(input, ctx): Promise<ToolResult> {
    try {
      assertPermission(defaultToolGrant(), "shell.run");
      const appPath = (input as { appPath?: string }).appPath ?? "apps/todos";
      const cwd = await resolveWorkspacePath(ctx.projectId, appPath, ctx.dataRoot);
      const result = await runIsolated(cwd, process.execPath, ["--test", "test/todos.test.js"], ctx.signal, 60_000);
      return {
        ok: true,
        output: {
          passed: result.code === 0,
          code: result.code,
          stdout: result.stdout.slice(0, 8000),
          stderr: result.stderr.slice(0, 4000),
        },
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export const workshopPreviewTool: Tool = {
  manifest: {
    id: "workshop.preview",
    version: "1.0.0",
    title: "Vista previa",
    description: "Genera una vista previa textual del resultado del taller.",
    inputSchema: { appPath: "string" },
    outputSchema: { preview: "string", files: "string[]" },
    permissions: ["fs.list", "fs.read"],
    dataUsed: ["workspace"],
    networkAccess: false,
    dependencies: [],
    possibleCosts: "Ninguno",
    maxDurationMs: 15_000,
    cancelBehavior: "Sin efectos.",
    reversible: true,
  },
  async execute(input, ctx): Promise<ToolResult> {
    try {
      const appPath = (input as { appPath?: string }).appPath ?? "apps/todos";
      const root = workspaceRoot(ctx.projectId, ctx.dataRoot);
      const abs = path.join(root, appPath);
      const readme = await fs.readFile(path.join(abs, "README.md"), "utf8").catch(() => "(sin README)");
      async function walk(dir: string, prefix = ""): Promise<string[]> {
        const out: string[] = [];
        const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
        for (const e of entries) {
          const rel = prefix ? `${prefix}/${e.name}` : e.name;
          if (e.isDirectory()) out.push(...(await walk(path.join(dir, e.name), rel)));
          else out.push(rel);
        }
        return out;
      }
      const files = await walk(abs);
      return {
        ok: true,
        output: {
          preview: readme.slice(0, 2000),
          files,
          stage: "aplicacion-ejecutable",
          platform: "Node.js CLI",
        },
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export const workshopDiffTool: Tool = {
  manifest: {
    id: "workshop.diff_versions",
    version: "1.0.0",
    title: "Diferencias y versiones",
    description: "Guarda una versión del árbol y compara checksums.",
    inputSchema: { appPath: "string", action: "snapshot|list" },
    outputSchema: { versionId: "string?", versions: "object[]?" },
    permissions: ["fs.read", "fs.write"],
    dataUsed: ["workspace", "versions"],
    networkAccess: false,
    dependencies: [],
    possibleCosts: "Disco local",
    maxDurationMs: 30_000,
    cancelBehavior: "Snapshot parcial no se registra.",
    reversible: true,
  },
  async execute(input, ctx): Promise<ToolResult> {
    try {
      const appPath = (input as { appPath?: string }).appPath ?? "apps/todos";
      const action = (input as { action?: string }).action ?? "snapshot";
      const paths = getPaths(ctx.dataRoot);
      const versionDir = path.join(paths.versions, ctx.projectId);
      await fs.mkdir(versionDir, { recursive: true });
      if (action === "list") {
        const versions = await fs.readdir(versionDir).catch(() => []);
        const meta = [];
        for (const v of versions) {
          const m = await fs.readFile(path.join(versionDir, v, "meta.json"), "utf8").catch(() => null);
          if (m) meta.push(JSON.parse(m));
        }
        return { ok: true, output: { versions: meta } };
      }
      const abs = await resolveWorkspacePath(ctx.projectId, appPath, ctx.dataRoot);
      const versionId = new Date().toISOString().replace(/[:.]/g, "-");
      const dest = path.join(versionDir, versionId);
      await fs.cp(abs, path.join(dest, "tree"), { recursive: true });
      const files: { path: string; sha256: string }[] = [];
      async function walk(dir: string, prefix = "") {
        for (const e of await fs.readdir(dir, { withFileTypes: true })) {
          const rel = prefix ? `${prefix}/${e.name}` : e.name;
          if (e.isDirectory()) await walk(path.join(dir, e.name), rel);
          else {
            const buf = await fs.readFile(path.join(dir, e.name));
            files.push({ path: rel, sha256: sha256(buf) });
          }
        }
      }
      await walk(abs);
      const meta = { versionId, appPath, at: new Date().toISOString(), files };
      await fs.writeFile(path.join(dest, "meta.json"), JSON.stringify(meta, null, 2));
      return { ok: true, output: { versionId, fileCount: files.length, files } };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export async function applyWorkshopCorrection(
  projectId: string,
  correction: string,
  dataRoot?: string,
): Promise<ToolResult> {
  const { fileReadTool, fileWriteTool } = await import("./files");
  const ctx = { projectId, dataRoot };
  const target = "apps/todos/src/todos.js";
  const read = await fileReadTool.execute({ path: target }, ctx);
  if (!read.ok) return read;
  let content = (read.output as { content: string }).content;
  if (/título|titulo|default|vacío|vacio/i.test(correction)) {
    content = content.replace(
      "export function createTodo(title) {",
      'export function createTodo(title = "Nueva tarea") {',
    );
    content = content.replace(
      "title, done: false",
      'title: String(title || "Nueva tarea"), done: false',
    );
  }
  await workshopDiffTool.execute({ appPath: "apps/todos", action: "snapshot" }, ctx);
  const write = await fileWriteTool.execute({ path: target, content }, ctx);
  if (!write.ok) return write;
  const tests = await workshopRunTestsTool.execute({ appPath: "apps/todos" }, ctx);
  return {
    ok: true,
    output: {
      correction,
      write,
      tests,
      stage: tests.ok && (tests.output as { passed?: boolean }).passed ? "version-probada" : "prototipo",
    },
  };
}
