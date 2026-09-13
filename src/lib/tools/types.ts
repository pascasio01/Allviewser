import { z } from "zod";

export const ToolManifestSchema = z.object({
  id: z.string(),
  version: z.string(),
  title: z.string(),
  description: z.string(),
  inputSchema: z.record(z.string(), z.unknown()),
  outputSchema: z.record(z.string(), z.unknown()),
  permissions: z.array(z.string()),
  dataUsed: z.array(z.string()),
  networkAccess: z.boolean(),
  dependencies: z.array(z.string()),
  possibleCosts: z.string(),
  maxDurationMs: z.number(),
  cancelBehavior: z.string(),
  reversible: z.boolean(),
});

export type ToolManifest = z.infer<typeof ToolManifestSchema>;

export type ToolContext = {
  projectId: string;
  dataRoot?: string;
  signal?: AbortSignal;
  grantNetwork?: boolean;
  confirmSensitive?: boolean;
};

export type ToolResult = {
  ok: boolean;
  output?: unknown;
  error?: string;
};

export interface Tool {
  manifest: ToolManifest;
  execute(input: unknown, ctx: ToolContext): Promise<ToolResult>;
}
