"use client";

import { useMemo, useState } from "react";
import type { Actor, SpaceRole, TimelineEvent } from "@/lib/space/types";
import { shadowRoleView } from "@/lib/space/shadow";
import { buildCareNarrative, narrativeScript } from "@/lib/space/narrative";
import { spaceActionContract, type ActionContract } from "@/lib/trust/contracts";
import { MODULE_VOICE, SPACE_VOICE } from "@/lib/voice/companion";

const SHADOW_ROLES: SpaceRole[] = [
  "observador",
  "residente",
  "tecnico",
  "revisor",
  "administrador",
];

export function EspacioElitePanel({
  actor,
  timeline,
  onLogTrust,
}: {
  actor: Actor | undefined;
  timeline: TimelineEvent[];
  onLogTrust: (payload: { title: string; summary: string }) => Promise<void>;
}) {
  const [shadowRole, setShadowRole] = useState<SpaceRole>("tecnico");
  const [contract, setContract] = useState<ActionContract | null>(null);
  const [replayOpen, setReplayOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const shadow = useMemo(() => shadowRoleView(shadowRole, actor), [shadowRole, actor]);
  const beats = useMemo(() => buildCareNarrative(timeline), [timeline]);
  const script = useMemo(() => narrativeScript(beats), [beats]);

  async function sealSession() {
    setBusy(true);
    try {
      await onLogTrust({
        title: "Cierre de sesión en Espacio",
        summary:
          beats.length > 0
            ? `Se revisaron ${beats.length} momentos del cuidado. Relato disponible en replay.`
            : "Sesión exploratoria sin eventos firmados. El silencio queda registrado con honestidad.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel stack" aria-label="Capas de confianza del Espacio">
      <h2>Presencia de élite</h2>
      <p className="muted">{MODULE_VOICE.shadowModeCue}</p>

      <div className="stack">
        <h3>{SPACE_VOICE.shadowTitle}</h3>
        <label>
          Ver como rol
          <select
            className="select"
            value={shadowRole}
            onChange={(e) => setShadowRole(e.target.value as SpaceRole)}
          >
            {SHADOW_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <p className="muted">{shadow.note}</p>
        <ul className="stack">
          {shadow.actions.map((a) => (
            <li key={a.id} className={a.ghost ? "muted" : ""}>
              <strong>{a.label}</strong>
              {a.ghost ? " — fantasma (no firmable desde tu rol activo)" : " — firmable por ese rol"}
              {a.availability.reason && (
                <span className="muted"> · {a.availability.reason}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="stack">
        <h3>{SPACE_VOICE.contractTitle}</h3>
        <div className="row" style={{ flexWrap: "wrap" }}>
          {[
            "create_incident",
            "assign_incident",
            "attach_evidence",
            "close_incident",
            "run_demo_flow",
            "reset_demo",
          ].map((id) => (
            <button
              key={id}
              type="button"
              className="btn secondary"
              onClick={() =>
                setContract(spaceActionContract(id, actor?.role ?? "observador"))
              }
            >
              {id}
            </button>
          ))}
        </div>
        {contract && (
          <article className="panel" style={{ boxShadow: "none" }}>
            <h4>{contract.title}</h4>
            <p>
              <span className="muted">Quién firma:</span> {contract.whoSigns}
            </p>
            <p>
              <span className="muted">Qué se registra:</span> {contract.whatGetsRecorded}
            </p>
            <p>
              <span className="muted">Qué no afirma:</span> {contract.whatIsNotClaimed}
            </p>
            <p className="muted">
              {contract.reversible ? "Reversible con cuidado." : "No es trivialmente reversible."}
            </p>
          </article>
        )}
      </div>

      <div className="stack">
        <h3>{SPACE_VOICE.replayTitle}</h3>
        <p className="muted">{MODULE_VOICE.replayCue}</p>
        <button type="button" className="btn secondary" onClick={() => setReplayOpen((v) => !v)}>
          {SPACE_VOICE.playReplay}
        </button>
        {replayOpen && (
          <pre
            className="panel"
            style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", boxShadow: "none" }}
          >
            {script}
          </pre>
        )}
        {!beats.length && (
          <p className="muted">
            {SPACE_VOICE.honestMissingPrefix} eventos firmados. {MODULE_VOICE.honestSilence}
          </p>
        )}
      </div>

      <button type="button" className="btn" disabled={busy} onClick={() => void sealSession()}>
        {busy ? "Sellando…" : "Sellar sesión en diario de confianza"}
      </button>
    </section>
  );
}
