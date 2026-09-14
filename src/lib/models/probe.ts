import type { AppConfig } from "../config/types";

export type AiProbeResult = {
  configured: boolean;
  reachable: boolean;
  provider: AppConfig["model"]["provider"];
  modelId?: string;
  baseUrl?: string;
  latencyMs?: number;
  message: string;
  nextStep?: { label: string; href: string };
};

/**
 * Sondea el proveedor configurado (GET /models o health ligero).
 * No inventa disponibilidad: solo reporta lo que responde el endpoint.
 */
export async function probeAiProvider(config: AppConfig): Promise<AiProbeResult> {
  const provider = config.model.provider;
  const baseUrl = config.model.baseUrl?.replace(/\/$/, "");
  const modelId = config.model.modelId;

  if (provider === "none") {
    return {
      configured: false,
      reachable: false,
      provider,
      message: "Sin modelo. La app sigue siendo útil: proyectos, memoria, taller y comercio demo.",
      nextStep: { label: "Activar IA en Configuración", href: "/configuracion" },
    };
  }

  if (!baseUrl || !modelId) {
    return {
      configured: false,
      reachable: false,
      provider,
      baseUrl,
      modelId,
      message: "Proveedor elegido, pero faltan URL base o modelId.",
      nextStep: { label: "Completar configuración", href: "/configuracion" },
    };
  }

  const keyEnv = config.model.apiKeyEnv;
  const apiKey = keyEnv ? process.env[keyEnv] : undefined;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(config.model.timeoutMs ?? 60_000, 8_000));

  try {
    const res = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      signal: controller.signal,
    });
    const latencyMs = Date.now() - started;

    if (!res.ok) {
      return {
        configured: true,
        reachable: false,
        provider,
        modelId,
        baseUrl,
        latencyMs,
        message: `El endpoint respondió ${res.status}. Revisa URL, modelo o clave.`,
        nextStep: { label: "Revisar configuración", href: "/configuracion" },
      };
    }

    const data = (await res.json().catch(() => null)) as
      | { data?: { id?: string }[] }
      | null;
    const ids = data?.data?.map((m) => m.id).filter(Boolean) as string[] | undefined;
    const listed = !ids || ids.length === 0 || ids.includes(modelId);

    return {
      configured: true,
      reachable: true,
      provider,
      modelId,
      baseUrl,
      latencyMs,
      message: listed
        ? `IA lista · ${modelId} · ${latencyMs} ms`
        : `Endpoint OK, pero «${modelId}» no aparece en /models. Puede funcionar igual.`,
      nextStep: { label: "Abrir conversación", href: "/conversacion" },
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      configured: true,
      reachable: false,
      provider,
      modelId,
      baseUrl,
      latencyMs: Date.now() - started,
      message: aborted
        ? "Tiempo de espera agotado al sondear el proveedor."
        : `No se pudo alcanzar el proveedor: ${err instanceof Error ? err.message : String(err)}`,
      nextStep: { label: "Revisar configuración", href: "/configuracion" },
    };
  } finally {
    clearTimeout(timer);
  }
}
