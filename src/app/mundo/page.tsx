"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppState } from "@/components/AppProvider";
import { MODULE_VOICE } from "@/lib/voice/companion";

const rooms = [
  { id: "control", title: "Centro de control", href: "/", action: "Resumen y acceso rápido" },
  { id: "taller", title: "Taller", href: "/tareas", action: "Crear y verificar aplicaciones" },
  { id: "biblioteca", title: "Biblioteca de memoria", href: "/memoria", action: "Hechos, decisiones, propuestas" },
  { id: "observatorio", title: "Observatorio", href: "/herramientas", action: "Inspeccionar herramientas y límites" },
  { id: "actividad", title: "Sala de actividad", href: "/mundo#actividad", action: "Registro reciente de acciones" },
];

export default function WorldPage() {
  const { config } = useAppState();
  const [events, setEvents] = useState<{ id: string; at: string; message: string; type: string }[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/activity?limit=20");
      const json = await res.json();
      setEvents(json.events ?? []);
    })();
  }, []);

  return (
    <div className="stack">
      <h1>Mundo visual</h1>
      <p className="muted">
        {MODULE_VOICE.worldIntro}
        Modo directo: {config?.directMode ? "activado" : "desactivado"}.
      </p>
      <div className="world-grid">
        {rooms.map((r) => (
          <Link key={r.id} href={r.href} className="world-node">
            <strong>{r.title}</strong>
            <p className="muted">{r.action}</p>
          </Link>
        ))}
      </div>
      <section className="panel" id="actividad">
        <h2>Sala de actividad</h2>
        {!events.length && <div className="empty">{MODULE_VOICE.worldEmpty}</div>}
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
