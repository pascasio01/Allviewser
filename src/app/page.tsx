"use client";

import Link from "next/link";
import { brand } from "@/lib/brand";
import { useAppState } from "@/components/AppProvider";
import { StateBlock } from "@/components/StateBlock";
import { AiCorePanel } from "@/components/AiCorePanel";

const modules = [
  {
    href: "/conversacion",
    title: "Conversación IA",
    blurb: "Chat con proveedor real (Ollama / OpenAI-compatible). Sin teatro si no hay modelo.",
  },
  {
    href: "/proyectos",
    title: "Proyectos",
    blurb: "Contextos aislados con memoria, tareas y archivos en sandbox.",
  },
  {
    href: "/memoria",
    title: "Memoria aprobada",
    blurb: "Hechos y decisiones que tú autorizas — no alucinaciones persistentes.",
  },
  {
    href: "/tareas",
    title: "Taller verificable",
    blurb: "Genera utilidades pequeñas y demuéstralas con pruebas.",
  },
  {
    href: "/comercio",
    title: "Comercio demo",
    blurb: "Flujo inmersivo en sandbox. Cero cobros reales.",
  },
  {
    href: "/mundo",
    title: "Mundo visual",
    blurb: "Mapa vivo del sistema con profundidad 3D ligera.",
  },
];

export default function HomePage() {
  const { loading, error, offline, refresh, projectId, projects, config } = useAppState();
  const project = projects.find((p) => p.id === projectId);
  const hasModel = Boolean(config?.model.provider && config.model.provider !== "none");

  return (
    <div className="stack">
      <header className="home-hero">
        <div className="home-hero-copy">
          <p className="badge">
            v{brand.version} · {brand.status}
          </p>
          <h1
            className="h-display tech-title"
            style={{ fontSize: "clamp(2rem, 4.2vw, 3.15rem)", margin: "0.4rem 0" }}
          >
            {brand.shortName}
          </h1>
          <p className="lede">{brand.tagline}</p>
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            {brand.founder.role}: {brand.founder.name}
          </p>
          <div className="row" style={{ marginTop: "1.1rem" }}>
            <Link className="btn" href={hasModel ? "/conversacion" : "/configuracion"}>
              {hasModel ? "Hablar con la IA" : "Conectar modelo real"}
            </Link>
            <Link className="btn secondary" href="/proyectos">
              Abrir proyectos
            </Link>
            <Link className="btn secondary" href="/mundo">
              Mundo visual
            </Link>
          </div>
        </div>
        <div className="home-hero-visual" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hero.png" alt="" className="home-hero-img" />
          <div className="home-hero-orbit" />
          <div className="home-hero-scan" />
        </div>
      </header>

      <StateBlock loading={loading} error={error} offline={offline} onRetry={() => void refresh()}>
        <AiCorePanel />

        <section className="panel hud-panel">
          <div className="hud-row">
            <div>
              <h2>Centro de misión</h2>
              <p className="muted">
                Proyecto: <strong>{project?.name ?? "ninguno"}</strong>
                {" · "}
                Modelo: <strong>{config?.model.provider ?? "none"}</strong>
                {config?.model.modelId ? ` / ${config.model.modelId}` : ""}
                {" · "}
                Continuidad:{" "}
                <strong>{config?.remoteContinuity.enabled ? "declarada" : "local-first"}</strong>
              </p>
            </div>
            <Link className="btn secondary" href="/configuracion">
              Ajustes
            </Link>
          </div>
        </section>

        <section className="stack">
          <div>
            <h2 className="h-display" style={{ marginBottom: "0.35rem" }}>
              Módulos útiles
            </h2>
            <p className="muted">Cada bloque hace algo real hoy. La IA potencia; no sustituye el trabajo.</p>
          </div>
          <div className="module-grid">
            {modules.map((m) => (
              <Link key={m.href} href={m.href} className="module-card">
                <strong>{m.title}</strong>
                <p className="muted">{m.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Por qué es aditivo</h2>
          <ul className="feature-list">
            <li>
              <strong>IA real o silencio honesto</strong> — Ollama / OpenAI-compatible; sin proveedor no inventa
              genio.
            </li>
            <li>
              <strong>Local-first</strong> — tus datos en disco; upgrades opcionales, no peajes.
            </li>
            <li>
              <strong>Taller + pruebas</strong> — no solo chat: genera y verifica.
            </li>
            <li>
              <strong>Memoria aprobada</strong> — tú decides qué persiste.
            </li>
          </ul>
        </section>
      </StateBlock>
    </div>
  );
}
