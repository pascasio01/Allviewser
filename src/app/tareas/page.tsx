"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/components/AppProvider";
import { StateBlock } from "@/components/StateBlock";
import type { Task } from "@/lib/tasks/types";

export default function TasksPage() {
  const { projectId } = useAppState();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [objective, setObjective] = useState(
    "Crear aplicación de tareas con persistencia y pruebas",
  );
  const [correction, setCorrection] = useState("Usar título por defecto si viene vacío");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!projectId) return;
    const res = await fetch(`/api/tasks?projectId=${projectId}`);
    const json = await res.json();
    setTasks(json.tasks ?? []);
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function createAndRun() {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const created = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          projectId,
          objective,
          acceptanceCriteria: [
            "Crear/editar/completar/eliminar tareas",
            "Persistencia tras reinicio del proceso de pruebas",
            "Pruebas de comportamiento, no solo existencia de archivos",
          ],
          idempotencyKey: `workshop-todos:${projectId}`,
        }),
      });
      const { task } = await created.json();
      setBusyId(task.id);
      const started = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          projectId,
          taskId: task.id,
          correction,
        }),
      });
      const result = await started.json();
      if (!started.ok) throw new Error(result.error ?? "Fallo al ejecutar");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setBusyId(null);
    }
  }

  async function cancel(taskId: string) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", projectId, taskId }),
    });
  }

  async function resume(taskId: string) {
    setBusyId(taskId);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resume", projectId, taskId, correction }),
      });
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  if (!projectId) return <div className="empty">Selecciona un proyecto.</div>;

  return (
    <div className="stack">
      <h1>Tareas y taller</h1>
      <p className="muted">
        Flujo demostrable: requisitos → archivos aislados → vista previa → corrección → pruebas → entrega.
      </p>
      <StateBlock error={error}>
        <section className="panel stack">
          <label htmlFor="obj">Objetivo</label>
          <textarea id="obj" className="textarea" value={objective} onChange={(e) => setObjective(e.target.value)} />
          <label htmlFor="corr">Corrección del usuario (opcional)</label>
          <input id="corr" className="input" value={correction} onChange={(e) => setCorrection(e.target.value)} />
          <div className="row">
            <button type="button" className="btn" disabled={loading} onClick={() => void createAndRun()}>
              {loading ? "Ejecutando taller…" : "Crear y ejecutar flujo de taller"}
            </button>
            {busyId && (
              <button type="button" className="btn danger" onClick={() => void cancel(busyId)}>
                Detener tarea
              </button>
            )}
          </div>
        </section>
        <section className="panel">
          <h2>Historial</h2>
          {!tasks.length && <div className="empty">Sin tareas aún.</div>}
          <table className="table">
            <thead>
              <tr>
                <th>Objetivo</th>
                <th>Estado</th>
                <th>Avance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.objective}
                    {t.result?.summary && <div className="muted">{t.result.summary}</div>}
                    {t.error && <div className="error">{t.error}</div>}
                  </td>
                  <td>
                    <span className="badge">{t.status}</span>
                  </td>
                  <td>
                    <ul>
                      {t.progress.slice(-4).map((p, i) => (
                        <li key={i}>{p.message}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="row">
                    {["fallida", "bloqueada", "pendiente"].includes(t.status) && (
                      <button type="button" className="btn secondary" onClick={() => void resume(t.id)}>
                        Reanudar
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
