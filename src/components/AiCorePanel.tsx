"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type AiStatusPayload = {
  ai: {
    configured: boolean;
    reachable: boolean;
    provider: string;
    modelId?: string;
    baseUrl?: string;
    latencyMs?: number;
    message: string;
    nextStep?: { label: string; href: string };
  };
};

type Props = {
  compact?: boolean;
};

export function AiCorePanel({ compact = false }: Props) {
  const [data, setData] = useState<AiStatusPayload["ai"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/status", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo sondear la IA");
      const json = (await res.json()) as AiStatusPayload;
      setData(json.ai);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const state = !data
    ? "unknown"
    : data.reachable
      ? "online"
      : data.configured
        ? "degraded"
        : "idle";

  if (compact) {
    return (
      <button
        type="button"
        className={`ai-chip ai-chip-${state}`}
        onClick={() => void load()}
        title={data?.message ?? "Sondear IA"}
      >
        <span className="ai-pulse" aria-hidden />
        <span>
          {loading
            ? "IA…"
            : state === "online"
              ? "IA activa"
              : state === "degraded"
                ? "IA offline"
                : "IA lista para activar"}
        </span>
      </button>
    );
  }

  return (
    <section className="ai-core panel">
      <div className="ai-core-head">
        <div>
          <p className="badge">Núcleo de IA · real</p>
          <h2 className="h-display" style={{ margin: "0.35rem 0" }}>
            Motor cognitivo
          </h2>
          <p className="muted" style={{ maxWidth: "40rem" }}>
            Sondeo vivo del proveedor configurado. Sin modelo no hay teatro: hay herramientas útiles y una ruta clara
            para conectar Ollama u otro endpoint OpenAI-compatible.
          </p>
        </div>
        <div className={`ai-orb ai-orb-${state}`} aria-hidden>
          <span className="ai-orb-ring" />
          <span className="ai-orb-core" />
        </div>
      </div>

      <div className="ai-status-grid">
        <div className="ai-stat">
          <span className="muted">Estado</span>
          <strong>
            {loading
              ? "Sondeando…"
              : state === "online"
                ? "En línea"
                : state === "degraded"
                  ? "Configurado · no alcanzable"
                  : "En espera"}
          </strong>
        </div>
        <div className="ai-stat">
          <span className="muted">Proveedor</span>
          <strong>{data?.provider ?? "—"}</strong>
        </div>
        <div className="ai-stat">
          <span className="muted">Modelo</span>
          <strong>{data?.modelId ?? "ninguno"}</strong>
        </div>
        <div className="ai-stat">
          <span className="muted">Latencia</span>
          <strong>{data?.latencyMs != null ? `${data.latencyMs} ms` : "—"}</strong>
        </div>
      </div>

      <p className={error ? "error" : "muted"} style={{ marginTop: "0.85rem" }}>
        {error ?? data?.message ?? "Consultando proveedor…"}
      </p>

      <div className="row" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn" onClick={() => void load()} disabled={loading}>
          {loading ? "Sondeando…" : "Probar conexión IA"}
        </button>
        {data?.nextStep && (
          <Link className="btn secondary" href={data.nextStep.href}>
            {data.nextStep.label}
          </Link>
        )}
        <Link className="btn secondary" href="/conversacion">
          Conversar
        </Link>
      </div>
    </section>
  );
}
