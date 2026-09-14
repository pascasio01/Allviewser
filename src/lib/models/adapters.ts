import type { AppConfig } from "../config/types";
import type { ModelAdapter, ModelRequest, ModelResponse } from "./types";
import { setupInstructions } from "./types";

export class NoneModelAdapter implements ModelAdapter {
  id = "none";
  label = "Sin modelo";

  constructor(private config: AppConfig) {}

  async chat(): Promise<ModelResponse> {
    return {
      ok: false,
      error: "Modelo no configurado",
      code: "not_configured",
      instructions: setupInstructions(this.config),
    };
  }
}

export class LocalOpenAICompatibleAdapter implements ModelAdapter {
  id = "openai-compatible";
  label = "OpenAI-compatible / local";

  constructor(private config: AppConfig) {}

  async chat(req: ModelRequest): Promise<ModelResponse> {
    const baseUrl = this.config.model.baseUrl?.replace(/\/$/, "");
    const modelId = this.config.model.modelId;
    if (!baseUrl || !modelId) {
      return {
        ok: false,
        error: "Falta URL base o modelId",
        code: "not_configured",
        instructions: setupInstructions(this.config),
      };
    }

    const keyEnv = this.config.model.apiKeyEnv;
    const apiKey = keyEnv ? process.env[keyEnv] : undefined;
    const timeoutMs = req.timeoutMs ?? this.config.model.timeoutMs;
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    req.signal?.addEventListener("abort", onAbort);
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: modelId,
          messages: req.messages,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
          ok: false,
          error: `Proveedor respondió ${res.status}: ${text.slice(0, 200)}`,
          code: "provider_error",
        };
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return { ok: false, error: "Respuesta vacía del proveedor", code: "provider_error" };
      }
      return { ok: true, content, provider: this.id, modelId };
    } catch (err) {
      if (req.signal?.aborted || (err instanceof Error && err.name === "AbortError")) {
        const cancelled = Boolean(req.signal?.aborted);
        return {
          ok: false,
          error: cancelled ? "Cancelado por el usuario" : "Tiempo de espera agotado",
          code: cancelled ? "cancelled" : "timeout",
        };
      }
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Error de proveedor",
        code: "unavailable",
        instructions: setupInstructions(this.config),
      };
    } finally {
      clearTimeout(timer);
      req.signal?.removeEventListener("abort", onAbort);
    }
  }
}

export function createModelAdapter(config: AppConfig): ModelAdapter {
  switch (config.model.provider) {
    case "local":
    case "openai-compatible":
      return new LocalOpenAICompatibleAdapter(config);
    case "none":
    default:
      return new NoneModelAdapter(config);
  }
}
