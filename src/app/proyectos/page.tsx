"use client";

import { useState } from "react";
import { useAppState } from "@/components/AppProvider";
import { StateBlock } from "@/components/StateBlock";

export default function ProjectsPage() {
  const { projects, loading, error, offline, refresh, setProjectId, projectId } = useAppState();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setLocalError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo crear");
      setName("");
      setDescription("");
      setProjectId(json.project.id);
      await refresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function archive(id: string) {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "archive" }),
    });
    await refresh();
  }

  return (
    <div className="stack">
      <h1>Proyectos</h1>
      <p className="muted">Datos y conversaciones se separan por proyecto.</p>
      <StateBlock loading={loading} error={error ?? localError} offline={offline} onRetry={() => void refresh()}>
        <section className="panel stack">
          <h2>Crear proyecto</h2>
          <input className="input" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <textarea
            className="textarea"
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="button" className="btn" disabled={busy || !name.trim()} onClick={() => void create()}>
            Crear
          </button>
        </section>
        <section className="panel">
          <h2>Lista</h2>
          {!projects.length && <div className="empty">No hay proyectos todavía.</div>}
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.name}
                    {p.id === projectId ? " · activo" : ""}
                    <div className="muted">{p.description}</div>
                  </td>
                  <td>
                    <span className="badge">{p.status}</span>
                  </td>
                  <td className="row">
                    <button type="button" className="btn secondary" onClick={() => setProjectId(p.id)}>
                      Abrir
                    </button>
                    {p.status === "activo" && (
                      <button type="button" className="btn secondary" onClick={() => void archive(p.id)}>
                        Archivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </StateBlock>
    </div>
  );
}
