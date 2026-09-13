import { z } from "zod";

export const ModelProviderSchema = z.enum(["none", "local", "openai-compatible"]);

export const AppConfigSchema = z.object({
  locale: z.string().default("es"),
  theme: z.enum(["system", "light", "dim"]).default("dim"),
  reducedMotion: z.boolean().default(false),
  visualQuality: z.enum(["low", "medium", "high"]).default("medium"),
  directMode: z.boolean().default(true),
  model: z.object({
    provider: ModelProviderSchema.default("none"),
    baseUrl: z.string().optional(),
    modelId: z.string().optional(),
    /** Nombre de variable de entorno para la clave; nunca el secreto en sí. */
    apiKeyEnv: z.string().optional(),
    timeoutMs: z.number().int().positive().default(60_000),
  }),
  limits: z.object({
    maxRetries: z.number().int().nonnegative().default(2),
    maxTaskRuntimeMs: z.number().int().positive().default(120_000),
    maxFileBytes: z.number().int().positive().default(2_000_000),
  }),
  remoteContinuity: z.object({
    enabled: z.boolean().default(false),
    endpoint: z.string().optional(),
    note: z.string().default(
      "La continuidad remota requiere un servidor autorizado activo. Una computadora apagada no ejecuta tareas.",
    ),
  }),
  permissions: z.object({
    networkByDefault: z.literal(false).default(false),
    requireConfirmSensitive: z.boolean().default(true),
  }),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export const defaultConfig = (): AppConfig =>
  AppConfigSchema.parse({
    locale: "es",
    theme: "dim",
    reducedMotion: false,
    visualQuality: "medium",
    directMode: true,
    model: { provider: "none", timeoutMs: 60_000 },
    limits: {
      maxRetries: 2,
      maxTaskRuntimeMs: 120_000,
      maxFileBytes: 2_000_000,
    },
    remoteContinuity: {
      enabled: false,
      note: "La continuidad remota requiere un servidor autorizado activo. Una computadora apagada no ejecuta tareas.",
    },
    permissions: {
      networkByDefault: false,
      requireConfirmSensitive: true,
    },
  });
