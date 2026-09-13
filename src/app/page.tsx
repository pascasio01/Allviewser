"use client";

import Link from "next/link";
import { brand } from "@/lib/brand";
import { useAppState } from "@/components/AppProvider";
import { StateBlock } from "@/components/StateBlock";
import { COMPANION_CONTRACT, INTENTIONS, MODULE_VOICE, humanModelLabel } from "@/lib/voice/companion";

export default function HomePage() {
  const { loading, error, offline, refresh, projectId, projects, config } = useAppState();
  const project = projects.find((p) => p.id === projectId);

  return (
    <div className="stack">
      <header>
        <p className="badge">
          v{brand.version} · {brand.status}
        </p>
        <h1 className="h-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "0.4rem 0" }}>
          {brand.shortName}
        </h1>
        <p className="muted" style={{ maxWidth: "42rem", fontSize: "1.05rem" }}>
          {brand.tagline}
        </p>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          {brand.founder.role}: {brand.founder.name}
        </p>
        <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem", maxWidth: "42rem" }}>
          {brand.provisionalNotice}
        </p>
      </header>

      <StateBlock loading={loading} error={error} offline={offline} onRetry={() => void refresh()}>
        <section className="panel companion-presence">
          <h2>{COMPANION_CONTRACT.title}</h2>
          <p className="muted">{COMPANION_CONTRACT.calmCue}</p>
          <ul>
            {COMPANION_CONTRACT.pledges.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="row" style={{ marginTop: "1rem" }}>
            <Link className="btn" href="/espacio">
              Entrar al Espacio
            </Link>
            <Link className="btn secondary" href="/proyectos">
              Abrir proyectos
            </Link>
            <Link className="btn secondary" href="/conversacion">
              Conversar
            </Link>
            <Link className="btn secondary" href="/tareas">
              Taller / tareas
            </Link>
          </div>
          <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
            Proyecto activo: <strong>{project?.name ?? "ninguno"}</strong>
            {" · "}
            Modelo: <strong>{humanModelLabel(config?.model.provider)}</strong>
            {" · "}
            Continuidad remota:{" "}
            <strong>{config?.remoteContinuity?.enabled ? MODULE_VOICE.remoteDeclared : MODULE_VOICE.remoteLocal}</strong>
          </p>
        </section>

        <section className="panel">
          <h2>Cuatro intenciones</h2>
          <p className="muted">
            Cada intención responde a una necesidad humana y deja claro el límite. Esa honestidad es el
            carácter del producto.
          </p>
          <div className="intention-grid">
            {INTENTIONS.map((i) => (
              <article key={i.id} className="intention-card">
                <h3>{i.label}</h3>
                <p>
                  <span className="muted">Necesidad:</span> {i.need}
                </p>
                <p>
                  <span className="muted">Ofrece:</span> {i.offer}
                </p>
                <p>
                  <span className="muted">No promete:</span> {i.boundary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>{MODULE_VOICE.capabilityTitle}</h2>
          <ul>
            <li>Persistencia local por proyecto (conversaciones, memoria, tareas, archivos).</li>
            <li>Adaptador de modelo local / OpenAI-compatible; sin simulación si no hay modelo.</li>
            <li>Espacio de mantenimiento demo con permisos, evidencias y procedencia de datos.</li>
            <li>Herramientas de archivos y taller de creación de apps con pruebas.</li>
            <li>Exportación/restauración con validación de integridad (mismo disco).</li>
          </ul>
          <p className="muted">
            No promete conciencia, acceso universal ni cero errores. Voz, visión 3D en vivo y remoto
            permanecen inactivos hasta configurar integraciones reales.
          </p>
        </section>
      </StateBlock>
    </div>
  );
}
