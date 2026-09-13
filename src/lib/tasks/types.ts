import { z } from "zod";

export const TaskStatusSchema = z.enum([
  "pendiente",
  "ejecutando",
  "bloqueada",
  "fallida",
  "cancelada",
  "completada",
]);

export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  objective: z.string().min(1),
  acceptanceCriteria: z.array(z.string()).default([]),
  status: TaskStatusSchema.default("pendiente"),
  progress: z.array(
    z.object({
      at: z.string(),
      message: z.string(),
      idempotencyKey: z.string().optional(),
    }),
  ).default([]),
  result: z
    .object({
      summary: z.string(),
      artifacts: z.array(z.string()).default([]),
    })
    .optional(),
  error: z.string().optional(),
  idempotencyKey: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
