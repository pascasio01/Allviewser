"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/components/AppProvider";
import type { TrustJournalEntry } from "@/lib/trust/journal";
import { MODULE_VOICE } from "@/lib/voice/companion";

export default function ConfianzaPage() {
  const { projectId } = useAppState();
  const [entries, setEntries] = useState<TrustJournalEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Cierre de sesión de cuidado");
  const [summary, setSummary] = useState("");

  const reload = useCallback(async () => {
    const res = await fetch("/api/trust?limit=40");
    const json = await res.json();
    if (!res.ok) setError(json.error ?? "No pude cargar el diario.");
    else setEntries(json.entries ?? []);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function appendManual() {
    setError(null);
    const res = await fetch("/api/trust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: projectId ?? undefined,
        title: title.trim() || "Nota de confianza",
        summary: summary.trim() || "Registro manual en el diario.",
        source: "usuario",
        did: [{ kind: "sesion", text: summary.trim() || "Sesión revisada por la persona." }],
        didNotClaim: [
          { kind: "limite", text: "No se afirma conciencia, sensores en vivo ni obra física." },
        ],
        pending: [{ kind: "pendiente", text: "Seguir solo con datos que existan en disco." }],
      }),
    });
    const json = await res.json();
    if (!res.ok) setError(json.error ?? "No pude guardar.");
    else {
      setSummary("");
      await reload();
    }
  }

  async function exportJson() {
    const res = await fetch("/api/trust?export=1");
    const json = await res.json();
    const blob = new Blob([JSON.stringify(json.entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diario-confianza.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="stack">
      <header className="stack" style={{ gap: "0.4rem" }}>
        <h1>Diario de confianza</h1>
        <p className="muted">{MODULE_VOICE.trustIntro}</p>
        <p className="muted">
          Cada entrada dice qué se hizo, qué no se afirma y qué queda pendiente.{" "}
          <Link href="/por-que-existe">Por qué existe este producto</Link>.
        </p>
      </header>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <section className="panel stack">
        <h2>Añadir cierre de sesión</h2>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Título del cierre"
        />
        <textarea
          className="textarea"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Qué ocurrió en esta sesión, con calma y sin inventar."
        />
        <div className="row">
          <button type="button" className="btn" onClick={() => void appendManual()}>
            Guardar en el diario
          </button>
          <button type="button" className="btn secondary" onClick={() => void exportJson()}>
            Exportar JSON
          </button>
        </div>
      </section>

      <section className="panel stack">
        <h2>Entradas</h2>
        {!entries.length && <div className="empty">{MODULE_VOICE.trustEmpty}</div>}
        <ul className="stack">
          {entries.map((e) => (
            <li key={e.id} className="panel" style={{ boxShadow: "none" }}>
              <div className="row" style={{ justifyContent: "space-between", gap: "0.5rem" }}>
                <strong>{e.title}</strong>
                <span className="badge">{e.source}</span>
              </div>
              <p className="muted" style={{ fontSize: "0.85rem" }}>
                {new Date(e.at).toLocaleString("es")}
                {e.signedByRole ? ` · firmó: ${e.signedByRole}` : ""}
              </p>
              <p>{e.summary}</p>
              {!!e.did.length && (
                <div>
                  <p className="muted">Qué sí ocurrió</p>
                  <ul>
                    {e.did.map((c, i) => (
                      <li key={`${e.id}-did-${i}`}>{c.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!e.didNotClaim.length && (
                <div>
                  <p className="muted">Qué no afirma</p>
                  <ul>
                    {e.didNotClaim.map((c, i) => (
                      <li key={`${e.id}-not-${i}`}>{c.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!e.pending.length && (
                <div>
                  <p className="muted">Pendiente</p>
                  <ul>
                    {e.pending.map((c, i) => (
                      <li key={`${e.id}-p-${i}`}>{c.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
