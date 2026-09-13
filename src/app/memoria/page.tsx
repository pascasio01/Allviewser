"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/components/AppProvider";
import type { MemoryEntry, MemoryKind } from "@/lib/memory/types";

export default function MemoryPage() {
  const { projectId } = useAppState();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [content, setContent] = useState("");
  const [kind, setKind] = useState<MemoryKind>("hecho");
  const [forceSensitive, setForceSensitive] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      body: JSON.stringify({ projectId, content, kind, forceSensitive }),
    });
    const json = await res.json();
    if (!res.ok) setError(json.error);
    else {
      setContent("");
      await reload();
    }
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
    const blob = new Blob([JSON.stringify(json.memories, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memoria-${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!projectId) return <div className="empty">Selecciona un proyecto.</div>;

  return (
    <div className="stack">
      <h1>Memoria</h1>
      <p className="muted">
        Hechos, decisiones y propuestas. No se guarda información sensible automáticamente.
      </p>
      {error && <div className="error">{error}</div>}
      <section className="panel stack">
        <select className="select" value={kind} onChange={(e) => setKind(e.target.value as MemoryKind)}>
          <option value="hecho">Hecho aportado</option>
          <option value="decision">Decisión</option>
          <option value="propuesta">Propuesta</option>
        </select>
        <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} />
        <label className="row">
          <input type="checkbox" checked={forceSensitive} onChange={(e) => setForceSensitive(e.target.checked)} />
          Confirmar almacenamiento sensible (explícito)
        </label>
        <div className="row">
          <button type="button" className="btn" onClick={() => void add()}>
            Añadir recuerdo
          </button>
          <button type="button" className="btn secondary" onClick={() => void exportAll()}>
            Exportar
          </button>
        </div>
      </section>
      <section className="panel">
        {!memories.length && <div className="empty">Biblioteca vacía.</div>}
        <ul className="stack">
          {memories.map((m) => (
            <li key={m.id} className="panel" style={{ boxShadow: "none" }}>
              <span className="badge">{m.kind}</span> {m.sensitive && <span className="badge">sensible</span>}
              <p>{m.content}</p>
              <button type="button" className="btn secondary" onClick={() => void remove(m.id)}>
                Borrar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
