"use client";

import { useEffect, useState } from "react";
import type { ToolManifest } from "@/lib/tools/types";

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolManifest[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/tools");
      const json = await res.json();
      setTools(json.tools ?? []);
    })();
  }, []);

  return (
    <div className="stack">
      <h1>Herramientas</h1>
      <p className="muted">Cada herramienta declara permisos, red, costes, cancelación y reversibilidad.</p>
      <div className="stack">
        {tools.map((t) => (
          <article key={t.id} className="panel">
            <h2>
              {t.title} <span className="badge">v{t.version}</span>
            </h2>
            <p>{t.description}</p>
            <ul>
              <li>ID: {t.id}</li>
              <li>Permisos: {t.permissions.join(", ")}</li>
              <li>Red: {t.networkAccess ? "sí" : "no"}</li>
              <li>Datos: {t.dataUsed.join(", ")}</li>
              <li>Dependencias: {t.dependencies.join(", ") || "ninguna"}</li>
              <li>Costes posibles: {t.possibleCosts}</li>
              <li>Tiempo máximo: {t.maxDurationMs} ms</li>
              <li>Cancelación: {t.cancelBehavior}</li>
              <li>Reversible: {t.reversible ? "sí" : "no"}</li>
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
