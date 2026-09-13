import fs from "node:fs/promises";
import path from "node:path";
import { resolveWorkspacePath, workspaceRoot } from "../permissions/workspace";
import { assertPermission, defaultToolGrant } from "../permissions/grants";
import type { Tool, ToolResult } from "./types";
import { loadConfig } from "../config/store";

async function checkSize(content: string, dataRoot?: string) {
  const config = await loadConfig(dataRoot);
  const bytes = Buffer.byteLength(content, "utf8");
  if (bytes > config.limits.maxFileBytes) {
    throw new Error(`Archivo supera el límite de ${config.limits.maxFileBytes} bytes.`);
  }
}

export const fileReadTool: Tool = {
  manifest: {
    id: "fs.read",
    version: "1.0.0",
    title: "Leer archivo",
    description: "Lee un archivo de texto dentro del espacio autorizado del proyecto.",
    inputSchema: { path: "string" },
    outputSchema: { content: "string", path: "string" },
    permissions: ["fs.read"],
    dataUsed: ["workspace files"],
    networkAccess: false,
    dependencies: [],
    possibleCosts: "Ninguno",
    maxDurationMs: 10_000,
    cancelBehavior: "La lectura se abandona; no hay efectos laterales.",
    reversible: true,
  },
  async execute(input, ctx): Promise<ToolResult> {
    try {
      assertPermission(defaultToolGrant(), "fs.read");
      const { path: rel } = input as { path: string };
      const abs = await resolveWorkspacePath(ctx.projectId, rel, ctx.dataRoot);
      const content = await fs.readFile(abs, "utf8");
      return { ok: true, output: { path: rel, content } };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export const fileWriteTool: Tool = {
  manifest: {
    id: "fs.write",
    version: "1.0.0",
    title: "Escribir archivo",
    description: "Escribe un archivo de texto dentro del espacio autorizado.",
    inputSchema: { path: "string", content: "string" },
    outputSchema: { path: "string", bytes: "number" },
    permissions: ["fs.write"],
    dataUsed: ["workspace files"],
    networkAccess: false,
    dependencies: [],
    possibleCosts: "Ninguno",
    maxDurationMs: 15_000,
    cancelBehavior: "Si se cancela antes de renombrar el temporal, no se aplica el cambio.",
    reversible: true,
  },
  async execute(input, ctx): Promise<ToolResult> {
    try {
      assertPermission(defaultToolGrant(), "fs.write");
      const { path: rel, content } = input as { path: string; content: string };
      await checkSize(content, ctx.dataRoot);
      const abs = await resolveWorkspacePath(ctx.projectId, rel, ctx.dataRoot);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      const tmp = `${abs}.${process.pid}.tmp`;
      await fs.writeFile(tmp, content, "utf8");
      if (ctx.signal?.aborted) {
        await fs.unlink(tmp).catch(() => undefined);
        return { ok: false, error: "Cancelado" };
      }
      await fs.rename(tmp, abs);
      return { ok: true, output: { path: rel, bytes: Buffer.byteLength(content, "utf8") } };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export const fileListTool: Tool = {
  manifest: {
    id: "fs.list",
    version: "1.0.0",
    title: "Listar archivos",
    description: "Lista archivos del espacio autorizado, con búsqueda opcional.",
    inputSchema: { query: "string?" },
    outputSchema: { files: "string[]" },
    permissions: ["fs.list"],
    dataUsed: ["workspace file names"],
    networkAccess: false,
    dependencies: [],
    possibleCosts: "Ninguno",
    maxDurationMs: 15_000,
    cancelBehavior: "Se detiene el recorrido.",
    reversible: true,
  },
  async execute(input, ctx): Promise<ToolResult> {
    try {
      assertPermission(defaultToolGrant(), "fs.list");
      const query = ((input as { query?: string }).query ?? "").toLowerCase();
      const root = workspaceRoot(ctx.projectId, ctx.dataRoot);
      const files: string[] = [];
      async function walk(dir: string, prefix = "") {
        if (ctx.signal?.aborted) return;
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const e of entries) {
          const rel = prefix ? `${prefix}/${e.name}` : e.name;
          if (e.isDirectory()) await walk(path.join(dir, e.name), rel);
          else if (!query || rel.toLowerCase().includes(query)) files.push(rel);
        }
      }
      await walk(root);
      return { ok: true, output: { files } };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

export const fileSearchTool: Tool = {
  manifest: {
    id: "fs.search",
    version: "1.0.0",
    title: "Buscar en archivos",
    description: "Busca texto en archivos del espacio autorizado.",
    inputSchema: { query: "string" },
    outputSchema: { matches: "{path,line,text}[]" },
    permissions: ["fs.read", "fs.list"],
    dataUsed: ["workspace file contents"],
    networkAccess: false,
    dependencies: [],
    possibleCosts: "Ninguno",
    maxDurationMs: 30_000,
    cancelBehavior: "Se detiene la búsqueda.",
    reversible: true,
  },
  async execute(input, ctx): Promise<ToolResult> {
    try {
      assertPermission(defaultToolGrant(), "fs.read");
      assertPermission(defaultToolGrant(), "fs.list");
      const query = (input as { query: string }).query;
      if (!query) return { ok: false, error: "Consulta vacía" };
      const listed = await fileListTool.execute({}, ctx);
      if (!listed.ok) return listed;
      const files = (listed.output as { files: string[] }).files;
      const matches: { path: string; line: number; text: string }[] = [];
      for (const f of files) {
        if (ctx.signal?.aborted) break;
        const abs = await resolveWorkspacePath(ctx.projectId, f, ctx.dataRoot);
        const content = await fs.readFile(abs, "utf8");
        content.split(/\r?\n/).forEach((line, i) => {
          if (line.includes(query)) matches.push({ path: f, line: i + 1, text: line.slice(0, 200) });
        });
      }
      return { ok: true, output: { matches } };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
