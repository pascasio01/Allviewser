"use client";

import Link from "next/link";
import { brand } from "@/lib/brand";
import { useAppState } from "@/components/AppProvider";
import { StateBlock } from "@/components/StateBlock";

export default function HomePage() {
  const { loading, error, offline, refresh, projectId, projects, config } = useAppState();
  const project = projects.find((p) => p.id === projectId);

  return (
    <div className="stack">
      <header>
        <p className="badge">v{brand.version} · {brand.status}</p>
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
        <section className="panel">
          <h2>Centro de control</h2>
          <p className="muted">
            Proyecto activo: <strong>{project?.name ?? "ninguno"}</strong>
            {" · "}
            Modelo: <strong>{config?.model.provider ?? "none"}</strong>
            {" · "}
            Continuidad remota: <strong>{config?.remoteContinuity.enabled ? "declarada" : "local"}</strong>
          </p>
          <div className="row" style={{ marginTop: "1rem" }}>
            <Link className="btn" href="/proyectos">
              Abrir proyectos
            </Link>
            <Link className="btn secondary" href="/espacio">
              Espacio / mantenimiento
            </Link>
            <Link className="btn secondary" href="/conversacion">
              Conversar
            </Link>
            <Link className="btn secondary" href="/tareas">
              Taller / tareas
            </Link>
          </div>
        </section>

        <section className="panel">
          <h2>Intenciones claras</h2>
          <p className="muted">
            El compañero no finge capacidades. Cada modo pide algo concreto y muestra qué falta si no está listo.
          </p>
          <ul>
            <li>
              <strong>Explorar</strong> — fichas, plano 2D y documentos del edificio demo.
            </li>
            <li>
              <strong>Crear</strong> — taller y borradores con criterios de aceptación.
            </li>
            <li>
              <strong>Resolver</strong> — incidencias con roles, evidencias y cierre verificable.
            </li>
            <li>
              <strong>Revisar</strong> — línea de tiempo, pasaporte y persistencia real.
            </li>
          </ul>
        </section>

        <section className="panel">
          <h2>Qué está implementado</h2>
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
