"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/AppProvider";
import type { AppConfig } from "@/lib/config/types";

export default function SettingsPage() {
  const { config, saveConfig, refresh } = useAppState();
  const [draft, setDraft] = useState<AppConfig | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [backups, setBackups] = useState<{ id: string; warning: string; checksum: string }[]>([]);
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  useEffect(() => {
    void (async () => {
      const [b, s] = await Promise.all([fetch("/api/backup"), fetch("/api/status")]);
      setBackups((await b.json()).backups ?? []);
      setStatus(await s.json());
    })();
  }, []);

  if (!draft) return <div className="loading">Cargando configuración…</div>;

  async function save() {
    if (!draft) return;
    await saveConfig(draft);
    setMessage("Configuración guardada en disco local.");
    await refresh();
  }

  async function doBackup() {
    const res = await fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", note: "manual" }),
    });
    const json = await res.json();
    setMessage(`Copia creada: ${json.backup.id}. ${json.backup.warning}`);
    const b = await fetch("/api/backup");
    setBackups((await b.json()).backups ?? []);
  }

  async function restore(id: string) {
    const res = await fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", id }),
    });
    const json = await res.json();
    setMessage(json.ok ? `Restaurado: ${json.restored.join(", ")}` : "Fallo al restaurar");
    await refresh();
  }

  return (
    <div className="stack">
      <h1>Configuración</h1>
      {message && <div className="panel">{message}</div>}
      <section className="panel stack">
        <h2>Modelo</h2>
        <label>
          Proveedor
          <select
            className="select"
            value={draft.model.provider}
            onChange={(e) =>
              setDraft({
                ...draft,
                model: { ...draft.model, provider: e.target.value as AppConfig["model"]["provider"] },
              })
            }
          >
            <option value="none">none (sin modelo)</option>
            <option value="local">local</option>
            <option value="openai-compatible">openai-compatible</option>
          </select>
        </label>
        <label>
          URL base
          <input
            className="input"
            value={draft.model.baseUrl ?? ""}
            onChange={(e) => setDraft({ ...draft, model: { ...draft.model, baseUrl: e.target.value } })}
            placeholder="http://127.0.0.1:11434/v1"
          />
        </label>
        <label>
          Model ID
          <input
            className="input"
            value={draft.model.modelId ?? ""}
            onChange={(e) => setDraft({ ...draft, model: { ...draft.model, modelId: e.target.value } })}
          />
        </label>
        <label>
          Nombre de variable de entorno para API key (no el secreto)
          <input
            className="input"
            value={draft.model.apiKeyEnv ?? ""}
            onChange={(e) => setDraft({ ...draft, model: { ...draft.model, apiKeyEnv: e.target.value } })}
            placeholder="COMPANERO_MODEL_API_KEY"
          />
        </label>
      </section>
      <section className="panel stack">
        <h2>Accesibilidad y mundo visual</h2>
        <label className="row">
          <input
            type="checkbox"
            checked={draft.reducedMotion}
            onChange={(e) => setDraft({ ...draft, reducedMotion: e.target.checked })}
          />
          Movimiento reducido
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={draft.directMode}
            onChange={(e) => setDraft({ ...draft, directMode: e.target.checked })}
          />
          Modo directo (sin navegación 3D)
        </label>
        <label>
          Calidad visual
          <select
            className="select"
            value={draft.visualQuality}
            onChange={(e) =>
              setDraft({ ...draft, visualQuality: e.target.value as AppConfig["visualQuality"] })
            }
          >
            <option value="low">baja</option>
            <option value="medium">media</option>
            <option value="high">alta</option>
          </select>
        </label>
      </section>
      <section className="panel stack">
        <h2>Continuidad remota</h2>
        <p className="muted">{draft.remoteContinuity.note}</p>
        <label className="row">
          <input
            type="checkbox"
            checked={draft.remoteContinuity.enabled}
            onChange={(e) =>
              setDraft({
                ...draft,
                remoteContinuity: { ...draft.remoteContinuity, enabled: e.target.checked },
              })
            }
          />
          Declarar endpoint remoto (no activa magia: hace falta servidor real)
        </label>
        <input
          className="input"
          placeholder="https://servidor-autorizado.ejemplo"
          value={draft.remoteContinuity.endpoint ?? ""}
          onChange={(e) =>
            setDraft({
              ...draft,
              remoteContinuity: { ...draft.remoteContinuity, endpoint: e.target.value },
            })
          }
        />
      </section>
      <button type="button" className="btn" onClick={() => void save()}>
        Guardar configuración
      </button>
      <section className="panel stack">
        <h2>Copias de seguridad</h2>
        <button type="button" className="btn secondary" onClick={() => void doBackup()}>
          Exportar copia local
        </button>
        <ul>
          {backups.map((b) => (
            <li key={b.id} className="row">
              <span>
                {b.id} <span className="muted">({b.checksum.slice(0, 8)}…)</span>
              </span>
              <button type="button" className="btn secondary" onClick={() => void restore(b.id)}>
                Restaurar
              </button>
            </li>
          ))}
        </ul>
        <p className="muted">Una copia en el mismo disco no es un respaldo independiente.</p>
      </section>
      <section className="panel">
        <h2>Estado de módulos</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
          {JSON.stringify(status, null, 2)}
        </pre>
      </section>
    </div>
  );
}
