import { z } from "zod";

export const MemoryKindSchema = z.enum(["hecho", "decision", "propuesta"]);

export const MemoryEntrySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  kind: MemoryKindSchema,
  content: z.string().min(1).max(8000),
  source: z.enum(["usuario", "agente", "sistema"]).default("usuario"),
  sensitive: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  approved: z.boolean().default(true),
});

export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;
export type MemoryKind = z.infer<typeof MemoryKindSchema>;

const SENSITIVE_HINTS =
  /\b(password|contraseña|api[_-]?key|secret|token|ssn|tarjeta|cvv|private[_-]?key)\b/i;

export function looksSensitive(content: string): boolean {
  return SENSITIVE_HINTS.test(content);
}
