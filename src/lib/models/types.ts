import type { AppConfig } from "../config/types";

export type ModelMessage = { role: "system" | "user" | "assistant"; content: string };

export type ModelRequest = {
  messages: ModelMessage[];
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type ModelResponse =
  | { ok: true; content: string; provider: string; modelId?: string }
  | { ok: false; error: string; code: "not_configured" | "timeout" | "cancelled" | "provider_error" | "unavailable"; instructions?: string };

export interface ModelAdapter {
  id: string;
  label: string;
  chat(req: ModelRequest): Promise<ModelResponse>;
}

export function setupInstructions(config: AppConfig): string {
  return [
    "No hay un modelo de IA activo configurado.",
    "",
    "Para usar un modelo local (compatible con API estilo OpenAI, p. ej. Ollama):",
    "1. Instala y arranca tu servidor local (ejemplo: ollama serve).",
    "2. En Configuración → Modelo, elige proveedor «local» o «openai-compatible».",
    "3. Indica la URL base (p. ej. http://127.0.0.1:11434/v1) y el identificador del modelo.",
    "4. Si el proveedor requiere clave, define la variable de entorno referenciada (nunca pegues secretos en el repositorio).",
    "",
    `Estado actual: proveedor=${config.model.provider}.`,
    "Esta aplicación no inventará respuestas inteligentes mientras no haya un modelo configurado y disponible.",
  ].join("\n");
}
