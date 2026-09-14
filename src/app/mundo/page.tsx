"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppState } from "@/components/AppProvider";

const rooms = [
  {
    id: "control",
    title: "Centro de control",
    href: "/",
    action: "Resumen y acceso rápido",
    accent: "var(--teal)",
  },
  {
    id: "taller",
    title: "Taller",
    href: "/tareas",
    action: "Crear y verificar aplicaciones",
    accent: "#b86b2c",
  },
  {
    id: "biblioteca",
    title: "Biblioteca de memoria",
    href: "/memoria",
    action: "Hechos, decisiones, propuestas",
    accent: "#1f6f66",
  },
  {
    id: "observatorio",
    title: "Observatorio",
    href: "/herramientas",
    action: "Inspeccionar herramientas y límites",
    accent: "#0d3d38",
  },
  {
    id: "actividad",
    title: "Sala de actividad",
    href: "/mundo#actividad",
    action: "Registro reciente de acciones",
    accent: "#2a7a70",
  },
  {
    id: "comercio",
    title: "Comercio demo",
    href: "/comercio",
    action: "Sandbox inmersivo (sin cobros reales)",
    accent: "#8a5a2b",
  },
];

export default function WorldPage() {
  const { config } = useAppState();
  const [events, setEvents] = useState<{ id: string; at: string; message: string; type: string }[]>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/activity?limit=20");
      const json = await res.json();
      setEvents(json.events ?? []);
    })();
  }, []);

  return (
    <div className="stack">
      <header className="world-hero">
        <div className="world-hero-glow" aria-hidden />
        <p className="badge">Mundo visual · profundidad ligera</p>
        <h1 className="h-display">Mundo en evolución</h1>
        <p className="muted" style={{ maxWidth: "40rem" }}>
          Espacio conectado a funciones reales. Perspectiva 3D suave en CSS (sin WebGL en v0.1) para mantener
          accesibilidad y rendimiento. Respeta <code>prefers-reduced-motion</code>. Modo directo:{" "}
          {config?.directMode ? "activado" : "desactivado"}.
        </p>
      </header>

      <div
        className="world-stage"
        onMouseMove={(e) => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          setTilt({ x: py * -6, y: px * 8 });
        }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div
          className="world-orbit"
          style={{
            transform: `rotateX(${12 + tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          <div className="world-core" aria-hidden>
            <span>Allviewser</span>
          </div>
          <div className="world-grid">
            {rooms.map((r, i) => (
              <Link
                key={r.id}
                href={r.href}
                className="world-node world-node-3d"
                style={{
                  ["--node-accent" as string]: r.accent,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <strong>{r.title}</strong>
                <p className="muted">{r.action}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="panel" id="actividad">
        <h2>Sala de actividad</h2>
        {!events.length && <div className="empty">Sin actividad registrada.</div>}
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              <span className="badge">{e.type}</span> {e.message}{" "}
              <span className="muted">{new Date(e.at).toLocaleString("es")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
