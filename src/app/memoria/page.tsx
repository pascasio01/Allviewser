"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/components/AppProvider";
import type { MemoryEntry, MemoryKind, MemoryRitualStatus } from "@/lib/memory/types";
import { ritualLabel } from "@/lib/memory/types";
import { MODULE_VOICE } from "@/lib/voice/companion";

export default function MemoryPage() {
  const { projectId } = useAppState();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [content, setContent] = useState("");
  const [kind, setKind] = useState<MemoryKind>("hecho");
  const [forceSensitive, setForceSensitive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todos" | MemoryRitualStatus>("todos");

  const reload = useCallback(async () => {
    if (!projectId) return;
    const res = await fetch(`/api/memory?projectId=${projectId}`);
    const json = await res.json();
    setMemories(json.memories ?? []);
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function add() {
    if (!projectId) return;
    setError(null);
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        content,
        kind,
        forceSensitive,
        ritualStatus: "propuesto",
      }),
    });
    const json = await res.json();
    if (!res.ok) setError(json.error);
    else {
      setContent("");
      await reload();
    }
  }

  async function setRitual(id: string, ritualStatus: MemoryRitualStatus) {
    await fetch("/api/memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, id, ritualStatus }),
    });
    await reload();
  }

  async function remove(id: string) {
    await fetch("/api/memory", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, id }),
    });
    await reload();
  }

  async function exportAll() {
    const res = await fetch(`/api/memory?projectId=${projectId}&export=1`);
    const json = await res.json();
    const blob = new Blob([JSON.stringify(json.memories, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memoria-${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!projectId) return <div className="empty">{MODULE_VOICE.projectGate}</div>;

  const visible = memories.filter((m) => {
    const status = m.ritualStatus ?? (m.approved ? "aprobado" : "propuesto");
    return filter === "todos" || status === filter;
  });

  return (
    <div className="stack">
      <h1>Memoria</h1>
      <p className="muted">{MODULE_VOICE.memoryIntro}</p>
      <p className="muted">{MODULE_VOICE.memoryRitualIntro}</p>
      {error && <div className="error">{error}</div>}

      <section className="panel stack">
        <select
          className="select"
          value={kind}
          onChange={(e) => setKind(e.target.value as MemoryKind)}
        >
          <option value="hecho">Hecho aportado</option>
          <option value="decision">Decisión</option>
          <option value="propuesta">Propuesta</option>
        </select>
        <textarea
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe algo que quieras poder revisar después…"
        />
        <label className="row">
          <input
            type="checkbox"
            checked={forceSensitive}
            onChange={(e) => setForceSensitive(e.target.checked)}
          />
          Confirmar almacenamiento sensible (explícito)
        </label>
        <div className="row">
          <button type="button" className="btn" onClick={() => void add()}>
            Proponer recuerdo
          </button>
          <button type="button" className="btn secondary" onClick={() => void exportAll()}>
            Exportar
          </button>
        </div>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          Entra como <strong>propuesto</strong>. Solo los <strong>aprobados</strong> cuentan como
          base de confianza.
        </p>
      </section>

      <section className="panel stack">
        <div className="row" role="group" aria-label="Filtro de ritual">
          {(["todos", "sugerido", "propuesto", "aprobado"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`btn secondary ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "todos" ? "Todos" : ritualLabel(f)}
            </button>
          ))}
        </div>
        {!visible.length && <div className="empty">{MODULE_VOICE.memoryEmpty}</div>}
        <ul className="stack">
          {visible.map((m) => {
            const status = m.ritualStatus ?? (m.approved ? "aprobado" : "propuesto");
            return (
              <li key={m.id} className="panel" style={{ boxShadow: "none" }}>
                <div className="row" style={{ gap: "0.35rem", flexWrap: "wrap" }}>
                  <span className="badge">{m.kind}</span>
                  <span className="badge">{ritualLabel(status)}</span>
                  {m.sensitive && <span className="badge">sensible</span>}
                  <span className="badge">{m.source}</span>
                </div>
                <p>{m.content}</p>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  {status === "sugerido" && (
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => void setRitual(m.id, "propuesto")}
                    >
                      Pasar a propuesto
                    </button>
                  )}
                  {status !== "aprobado" && (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => void setRitual(m.id, "aprobado")}
                    >
                      Aprobar
                    </button>
                  )}
                  {status === "aprobado" && (
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => void setRitual(m.id, "propuesto")}
                    >
                      Devolver a propuesto
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => void remove(m.id)}
                  >
                    Borrar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
