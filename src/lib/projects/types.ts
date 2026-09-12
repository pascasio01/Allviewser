import { z } from "zod";

export const ProjectStatusSchema = z.enum(["activo", "archivado"]);

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  status: ProjectStatusSchema.default("activo"),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
