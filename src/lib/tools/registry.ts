import { fileListTool, fileReadTool, fileSearchTool, fileWriteTool } from "./files";
import {
  workshopCreateAppTool,
  workshopDiffTool,
  workshopPreviewTool,
  workshopRunTestsTool,
} from "./workshop";
import type { Tool, ToolManifest } from "./types";

const tools: Tool[] = [
  fileReadTool,
  fileWriteTool,
  fileListTool,
  fileSearchTool,
  workshopCreateAppTool,
  workshopRunTestsTool,
  workshopPreviewTool,
  workshopDiffTool,
];

export function listToolManifests(): ToolManifest[] {
  return tools.map((t) => t.manifest);
}

export function getTool(id: string): Tool | undefined {
  return tools.find((t) => t.manifest.id === id);
}

export async function runTool(
  id: string,
  input: unknown,
  ctx: Parameters<Tool["execute"]>[1],
) {
  const tool = getTool(id);
  if (!tool) return { ok: false as const, error: `Herramienta desconocida: ${id}` };
  if (tool.manifest.networkAccess && !ctx.grantNetwork) {
    return { ok: false as const, error: "Esta herramienta requiere red y no está concedida." };
  }
  return tool.execute(input, ctx);
}
