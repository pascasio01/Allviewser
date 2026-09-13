"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Actor,
  AssistantReply,
  Incident,
  Place,
  SpaceObject,
  SpaceState,
  TimelineEvent,
} from "@/lib/space/types";
import { INCIDENT_STATUS_LABELS, OBJECT_KIND_LABELS } from "@/lib/space/types";
import { DEMO_PIPE_ID, ACTOR_TECNICO } from "@/lib/space/seed";
import {
  availabilityAssign,
  availabilityAttach,
  availabilityConfirmDraft,
  availabilityCreateIncident,
  availabilityExtensions,
  availabilityTransition,
  nextGuidedStep,
} from "@/lib/space/ui-actions";
import { formatProvenance } from "@/lib/media/provenance";
import { INTENTIONS, SPACE_VOICE, intentionById, type IntentionId } from "@/lib/voice/companion";

type Tab =
  | "directo"
  | "inmersivo"
  | "incidencias"
  | "timeline"
  | "borradores"
  | "decisiones"
  | "visita"
  | "asistente"
  | "extensiones"
  | "pasaporte";

async function apiGet(action: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ action, ...params });
  const res = await fetch(`/api/space?${qs}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "No pude completar esa acción. Reintenta con calma.");
  return json;
}

async function apiPost(body: Record<string, unknown>) {
  const res = await fetch("/api/space", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "No pude completar esa acción. Reintenta con calma.");
  return json;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "directo", label: "Directo" },
  { id: "inmersivo", label: "Inmersivo" },
  { id: "incidencias", label: "Incidencias" },
  { id: "timeline", label: "Línea de tiempo" },
  { id: "borradores", label: "Borradores" },
  { id: "decisiones", label: "Decisiones" },
  { id: "visita", label: "Visita" },
  { id: "asistente", label: "Asistente" },
  { id: "extensiones", label: "Extensiones" },
  { id: "pasaporte", label: "Pasaporte" },
];

export default function EspacioPage() {
  const [tab, setTab] = useState<Tab>("directo");
  const [state, setState] = useState<SpaceState | null>(null);
  const [actorId, setActorId] = useState("actor-residente");
  const [selectedId, setSelectedId] = useState<string | null>(DEMO_PIPE_ID);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("¿Qué documentos hay?");
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [incidentTitle, setIncidentTitle] = useState("Humedad en tubería");
  const [incidentDesc, setIncidentDesc] = useState("Se observa mancha de humedad en el falso techo.");

  const refresh = useCallback(async () => {
    const snap = await apiGet("snapshot");
    setState(snap as SpaceState);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const place: Place | undefined = state?.places[0];
  const objects = useMemo(() => state?.objects ?? [], [state?.objects]);
  const actors = useMemo(() => state?.actors ?? [], [state?.actors]);
  const incidents = useMemo(() => state?.incidents ?? [], [state?.incidents]);
  const timeline = useMemo(() => state?.timeline ?? [], [state?.timeline]);
  const selected: SpaceObject | undefined = objects.find((o) => o.id === selectedId);
  const actor: Actor | undefined = actors.find((a) => a.id === actorId);

  const guided = useMemo(
    () => nextGuidedStep(incidents.find((i) => i.objectId === selectedId && i.status !== "cerrada" && i.status !== "cancelada") ?? incidents.find((i) => i.status !== "cerrada" && i.status !== "cancelada"), actor),
    [incidents, selectedId, actor],
  );
  const createAvail = availabilityCreateIncident(actor?.role ?? "observador");
  const assignAvail = availabilityAssign(actor?.role ?? "observador");
  const attachAvail = availabilityAttach(actor?.role ?? "observador");
  const confirmAvail = availabilityConfirmDraft(actor?.role ?? "observador");
  const extAvail = availabilityExtensions(actor?.role ?? "observador");
  const toProgress = availabilityTransition(actor?.role ?? "observador", "en_progreso");
  const toReview = availabilityTransition(actor?.role ?? "observador", "pendiente_revision");
  const toClose = availabilityTransition(actor?.role ?? "observador", "cerrada");
  const online = typeof navigator === "undefined" ? true : navigator.onLine;

  const selectedIncidents: Incident[] = useMemo(
    () => incidents.filter((i) => !selectedId || i.objectId === selectedId),
    [incidents, selectedId],
  );

  async function run(label: string, fn: () => Promise<unknown>) {
    setError(null);
    setMessage(null);
    try {
      await fn();
      await refresh();
      setMessage(label);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <div className="stack"><p className="muted">{SPACE_VOICE.loading}</p></div>;
  if (!state || !place) {
    return <div className="stack"><p className="error">{error ?? SPACE_VOICE.noState}</p></div>;
  }

  return (
    <div className="stack espacio">
      <header className="stack" style={{ gap: "0.5rem" }}>
        <h1>Espacio · mantenimiento</h1>
        <p className="muted">{SPACE_VOICE.placeIntro}</p>
        <p className="muted">{place.description}</p>
        <div className="banner-warn" role="status">
          <strong>FICTICIO:</strong> {place.fictionalBanner}
        </div>
        <p className="muted">{SPACE_VOICE.roleCue}</p>
        <p className="muted">{SPACE_VOICE.provenanceCue}</p>
        <p className="muted">
          Plataforma: aplicación web en navegador (no es app nativa). Modo 3D real desactivado;
          el plano inmersivo es 2D SVG.
        </p>
      </header>

      <div className="toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "end" }}>
        <label>
          Actor activo
          <select
            className="select"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            aria-label="Seleccionar actor"
          >
            {actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName} ({a.role})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn"
          onClick={() =>
            run("Recorrido de mantenimiento completado", async () => {
              await apiPost({ action: "run_demo_flow", idempotencyKey: `ui-${Date.now()}` });
            })
          }
        >
          {SPACE_VOICE.runFullFlow}
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={() =>
            run("Demo reiniciada", async () => {
              await apiPost({ action: "reset_demo", actorId });
            })
          }
        >
          {SPACE_VOICE.resetDemo}
        </button>
      </div>

      {message && <p className="ok" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <div className="status-row" role="status">
        <span className={`conn-dot ${online ? "ok" : "bad"}`} aria-hidden />
        <span className="muted">{online ? "Conexión local activa" : "Sin conexión de red (datos locales)"}</span>
      </div>
      <div className="mode-rail" role="navigation" aria-label="Intenciones">
        {INTENTIONS.map((intention) => {
          const tabMap: Record<IntentionId, Tab> = {
            explorar: "directo",
            crear: "borradores",
            resolver: "incidencias",
            revisar: "timeline",
          };
          const target = tabMap[intention.id];
          const active = tab === target;
          return (
            <button
              key={intention.id}
              type="button"
              className={`btn secondary mode-chip ${active ? "active" : ""}`}
              onClick={() => setTab(target)}
              title={`${intention.need} · ${intention.boundary}`}
              aria-pressed={active}
            >
              {intention.label}
            </button>
          );
        })}
        <p className="muted intention-whisper" style={{ width: "100%", margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
          {intentionById(
            (tab === "directo" || tab === "inmersivo"
              ? "explorar"
              : tab === "borradores"
                ? "crear"
                : tab === "incidencias"
                  ? "resolver"
                  : "revisar") as IntentionId,
          ).need}{" "}
          <span aria-hidden>·</span>{" "}
          {intentionById(
            (tab === "directo" || tab === "inmersivo"
              ? "explorar"
              : tab === "borradores"
                ? "crear"
                : tab === "incidencias"
                  ? "resolver"
                  : "revisar") as IntentionId,
          ).boundary}
        </p>
      </div>
      <div className="guide-banner panel" role="status">
        <strong>Te acompaño en esto:</strong> {guided.label}
        {!guided.availability.enabled && guided.availability.reason && (
          <p className="muted" style={{ margin: "0.35rem 0 0" }}>{guided.availability.reason}</p>
        )}
        {guided.availability.suggestActorId && !guided.availability.enabled && (
          <button
            type="button"
            className="btn secondary"
            style={{ marginTop: "0.5rem" }}
            onClick={() => {
              setActorId(guided.availability.suggestActorId!);
              setTab(guided.tabHint as Tab);
            }}
          >
            Ponerme en el rol que hace falta
          </button>
        )}
      </div>


      <nav className="tabs" aria-label="Secciones del espacio" style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`btn ${tab === t.id ? "" : "secondary"}`}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {(tab === "directo" || tab === "inmersivo") && (
        <section className="panel stack">
          <h2>{tab === "directo" ? "Modo directo (listas)" : "Modo inmersivo (plano 2D)"}</h2>
          {tab === "inmersivo" && (
            <svg
              viewBox="0 0 100 100"
              role="img"
              aria-label="Plano del edificio demo"
              style={{ width: "100%", maxWidth: 480, background: "#dfeae6", borderRadius: 12 }}
            >
              <rect x="5" y="5" width="90" height="90" fill="#f4faf8" stroke="#1f6f66" />
              <text x="8" y="12" fontSize="4" fill="#0d3d38">
                Planta esquemática (demo)
              </text>
              {objects.map((o) => (
                <g key={o.id}>
                  <circle
                    cx={o.x}
                    cy={o.y}
                    r={selectedId === o.id ? 4.5 : 3.2}
                    fill={o.mutableProps.color ?? "#1f6f66"}
                    stroke={selectedId === o.id ? "#b86b2c" : "#102a28"}
                    strokeWidth={selectedId === o.id ? 1.2 : 0.4}
                    tabIndex={0}
                    role="button"
                    aria-label={o.name}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedId(o.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(o.id);
                      }
                    }}
                  />
                  <title>{o.name}</title>
                </g>
              ))}
            </svg>
          )}

          <ul className="object-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {objects.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className={`btn secondary`}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    marginBottom: "0.35rem",
                    borderColor: selectedId === o.id ? "var(--amber)" : undefined,
                  }}
                  aria-pressed={selectedId === o.id}
                  onClick={() => setSelectedId(o.id)}
                >
                  <strong>{o.name}</strong>
                  <span className="muted"> · {OBJECT_KIND_LABELS[o.kind]} · {o.locationLabel}</span>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <article className="panel" aria-live="polite">
              <h3>Ficha · {selected.name}</h3>
              <p>
                <span className="provenance-badge" title={selected.provenance.caveat}>
                  {formatProvenance(selected.provenance)}
                </span>
              </p>
              <p>{selected.description}</p>
              <p className="muted">
                Fuente: {selected.source} · Información a {selected.infoAsOf}
              </p>
              <p>
                <strong>Hechos conocidos:</strong>{" "}
                {Object.entries(selected.knownFacts)
                  .map(([k, v]) => `${k}=${v}`)
                  .join("; ") || "—"}
              </p>
              <p>
                <strong>Campos sin dato:</strong> {selected.unknownFields.join(", ") || "ninguno"}
              </p>
              <h4>Documentos autorizados</h4>
              {!selected.documents.length && <p className="muted">Ninguno cargado.</p>}
              <ul>
                {selected.documents.map((d) => (
                  <li key={d.id}>
                    {d.title} — {d.source} ({d.issuedAt})
                  </li>
                ))}
              </ul>
              <h4>Historial del objeto</h4>
              <ul>
                {selected.history.slice(0, 8).map((h) => (
                  <li key={h.id}>
                    <span className="badge">{h.kind}</span> {h.detail}{" "}
                    <span className="muted">{new Date(h.at).toLocaleString("es")}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <input
                  className="input"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  aria-label="Título de incidencia"
                />
                <input
                  className="input"
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  aria-label="Descripción de incidencia"
                  style={{ minWidth: "16rem" }}
                />
                <button
                  type="button"
                  className="btn"
                  disabled={!createAvail.enabled}
                  title={createAvail.reason}
                  onClick={() =>
                    run("Incidencia creada", async () => {
                      await apiPost({
                        action: "create_incident",
                        actorId,
                        objectId: selected.id,
                        title: incidentTitle,
                        description: incidentDesc,
                        idempotencyKey: `manual-${selected.id}-${Date.now()}`,
                      });
                      setTab("incidencias");
                    })
                  }
                >
                  Crear incidencia
                </button>
                {!createAvail.enabled && <p className="muted">{createAvail.reason}</p>}
              </div>
              <p className="muted">Actor actual: {actor?.displayName ?? actorId}</p>
            </article>
          )}
        </section>
      )}

      {tab === "incidencias" && (
        <section className="panel stack">
          <h2>Incidencias</h2>
          {!incidents.length && <p className="muted">{SPACE_VOICE.emptyIncidents}</p>}
          {incidents.map((inc) => (
            <article key={inc.id} className="panel">
              <h3>{inc.title}</h3>
              <p>
                <span className="badge">{INCIDENT_STATUS_LABELS[inc.status]}</span> · rev {inc.revision}
              </p>
              <p className="muted">{inc.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {inc.status === "abierta" && (
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={!assignAvail.enabled}
                    title={assignAvail.reason}
                    onClick={() =>
                      run("Asignada", () =>
                        apiPost({
                          action: "assign_incident",
                          actorId,
                          incidentId: inc.id,
                          assigneeId: ACTOR_TECNICO,
                        }),
                      )
                    }
                  >
                    Asignar a técnico
                  </button>
                )}
                {inc.status === "asignada" && (
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={!toProgress.enabled}
                    title={toProgress.reason}
                    onClick={() =>
                      run("En progreso", () =>
                        apiPost({
                          action: "transition_incident",
                          actorId,
                          incidentId: inc.id,
                          to: "en_progreso",
                        }),
                      )
                    }
                  >
                    Marcar en progreso
                  </button>
                )}
                {(inc.status === "en_progreso" || inc.status === "asignada") && (
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={!attachAvail.enabled}
                    title={attachAvail.reason}
                    onClick={() =>
                      run("Evidencia anexada", () =>
                        apiPost({
                          action: "attach_evidence",
                          actorId,
                          incidentId: inc.id,
                          kind: "fotografia_demo",
                          title: "Evidencia demo",
                          body: "Adjunto de demostración",
                          demoAssetLabel: "demo-evidence.svg",
                        }),
                      )
                    }
                  >
                    Anexar evidencia demo
                  </button>
                )}
                {inc.status === "en_progreso" && (
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={!toReview.enabled}
                    title={toReview.reason}
                    onClick={() =>
                      run("Pendiente revisión", () =>
                        apiPost({
                          action: "transition_incident",
                          actorId,
                          incidentId: inc.id,
                          to: "pendiente_revision",
                        }),
                      )
                    }
                  >
                    Solicitar revisión
                  </button>
                )}
                {inc.status === "pendiente_revision" && (
                  <button
                    type="button"
                    className="btn"
                    disabled={!toClose.enabled}
                    title={toClose.reason}
                    onClick={() =>
                      run("Cerrada", () =>
                        apiPost({
                          action: "transition_incident",
                          actorId,
                          incidentId: inc.id,
                          to: "cerrada",
                          note: "Cierre verificado",
                        }),
                      )
                    }
                  >
                    Verificar y cerrar
                  </button>
                )}
              </div>
              <h4>Historial de estados</h4>
              <ul>
                {inc.statusHistory.map((s, idx) => (
                  <li key={`${inc.id}-${idx}`}>
                    {s.from} → {s.to}{" "}
                    <span className="muted">{new Date(s.at).toLocaleString("es")}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {selectedId && !selectedIncidents.length && (
            <p className="muted">{SPACE_VOICE.emptyObjectIncidents}</p>
          )}
        </section>
      )}

      {tab === "timeline" && (
        <section className="panel stack">
          <h2>Línea de tiempo del lugar</h2>
          <p className="muted">
            Distingue fecha de evento / captura / carga cuando existen. No se reconstruye un pasado
            inexistente como evidencia real.
          </p>
          <ul>
            {timeline.map((ev: TimelineEvent) => (
              <li key={ev.id}>
                <span className="badge">{ev.kind}</span> <strong>{ev.title}</strong> — {ev.detail}{" "}
                <span className="muted">
                  carga {new Date(ev.dates.uploadedAt).toLocaleString("es")}
                  {ev.dates.eventAt ? ` · evento ${new Date(ev.dates.eventAt).toLocaleString("es")}` : ""}
                  {ev.dates.capturedAt
                    ? ` · captura ${new Date(ev.dates.capturedAt).toLocaleString("es")}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "borradores" && (
        <section className="panel stack">
          <h2>Probar antes de cambiar</h2>
          <p className="muted">
            Los cambios permanecen en borrador hasta confirmarlos. Confirmar actualiza el modelo demo,
            no autoriza obra física.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() =>
              run("Borrador creado", async () => {
                const { draft } = await apiPost({
                  action: "create_draft",
                  actorId,
                  name: "Propuesta recepción",
                });
                await apiPost({
                  action: "update_draft_object",
                  actorId,
                  draftId: draft.id,
                  objectId: "obj-mesa-recepcion",
                  props: { color: "#6b8f71", x: 55, y: 65, label: "Mesa recepción (propuesta)" },
                });
              })
            }
          >
            Crear borrador de mesa
          </button>
          <ul>
            {state.drafts.map((d) => (
              <li key={d.id} className="panel">
                <strong>{d.name}</strong> · {d.status}
                <p className="muted">{d.disclaimer}</p>
                {d.status === "borrador" && (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                  disabled={!confirmAvail.enabled}
                  title={confirmAvail.reason}
                      type="button"
                      className="btn"
                      onClick={() =>
                        run("Borrador confirmado", () =>
                          apiPost({ action: "confirm_draft", actorId, draftId: d.id }),
                        )
                      }
                    >
                      Confirmar (admin)
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() =>
                        run("Borrador descartado", () =>
                          apiPost({ action: "discard_draft", actorId, draftId: d.id }),
                        )
                      }
                    >
                      Descartar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "decisiones" && (
        <section className="panel stack">
          <h2>Memoria de decisiones</h2>
          <button
            type="button"
            className="btn"
            onClick={() =>
              run("Decisión registrada", () =>
                apiPost({
                  action: "record_decision",
                  actorId,
                  objectId: selectedId ?? undefined,
                  decision: "Priorizar inspección de tubería planta 1",
                  rationale: "Humedad visible reportada por residente",
                  discardedAlternative: "Esperar sin abrir incidencia",
                  source: "humana_aprobada",
                }),
              )
            }
          >
            Registrar decisión humana
          </button>
          <ul>
            {state.decisions
              .filter((d) => !d.deletedAt)
              .map((d) => (
                <li key={d.id}>
                  <strong>{d.decision}</strong> ({d.source})
                  <p className="muted">{d.rationale}</p>
                </li>
              ))}
          </ul>
        </section>
      )}

      {tab === "visita" && (
        <section className="panel stack">
          <h2>Visita compartida (local)</h2>
          <p className="muted">
            Voz y grabación desactivadas por defecto. Bloqueos suaves evitan sobrescritura silenciosa.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() =>
              run("Presencia actualizada", () =>
                apiPost({
                  action: "upsert_presence",
                  actorId,
                  x: selected?.x ?? 50,
                  y: selected?.y ?? 50,
                  selectedObjectId: selectedId ?? undefined,
                }),
              )
            }
          >
            {SPACE_VOICE.updatePresence}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              run("Comentario publicado", () =>
                apiPost({
                  action: "visit_comment",
                  actorId,
                  body: "Revisar este punto en la visita",
                  objectId: selectedId ?? undefined,
                  x: selected?.x ?? 50,
                  y: selected?.y ?? 50,
                }),
              )
            }
          >
            Comentar en ubicación
          </button>
          {selectedId && (
            <>
              <button
                type="button"
                className="btn secondary"
                onClick={() =>
                  run("Objeto bloqueado", () =>
                    apiPost({ action: "lock_object", actorId, objectId: selectedId }),
                  )
                }
              >
                Bloquear objeto seleccionado
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() =>
                  run("Bloqueo liberado", () =>
                    apiPost({ action: "unlock_object", actorId, objectId: selectedId }),
                  )
                }
              >
                Liberar bloqueo
              </button>
            </>
          )}
          <p>Participantes: {state.visit.participants.map((p) => p.displayName).join(", ") || "ninguno"}</p>
          <p>Bloqueos: {Object.keys(state.visit.locks).join(", ") || "ninguno"}</p>
          <ul>
            {state.visit.comments.map((c) => (
              <li key={c.id}>{c.body}</li>
            ))}
          </ul>
        </section>
      )}

      {tab === "asistente" && (
        <section className="panel stack">
          <h2>{SPACE_VOICE.assistantTitle}</h2>
          <p className="muted">{SPACE_VOICE.assistantCue}</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              className="input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              aria-label="Pregunta al asistente"
              style={{ flex: 1, minWidth: "12rem" }}
            />
            <button
              type="button"
              className="btn"
              onClick={async () => {
                try {
                  const json = await apiGet("assistant", {
                    objectId: selectedId ?? "",
                    q: question,
                  });
                  setReply(json.reply);
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e));
                }
              }}
            >
              Preguntar
            </button>
          </div>
          {reply && (
            <article className="panel">
              <p><strong>Modo de respuesta:</strong> {reply.mode}</p>
              <p>{reply.text}</p>
              <p><strong>{SPACE_VOICE.observedLabel}:</strong> {reply.observed.join(" · ") || "—"}</p>
              <p><strong>{SPACE_VOICE.inferredLabel}:</strong> {reply.inferred.join(" · ") || "—"}</p>
              <p><strong>{SPACE_VOICE.unavailableLabel}:</strong> {reply.unavailable.join(" · ") || "—"}</p>
            </article>
          )}
        </section>
      )}

      {tab === "extensiones" && (
        <section className="panel stack">
          <h2>Extensiones (aisladas al lugar)</h2>
          <button
                disabled={!extAvail.enabled}
                title={extAvail.reason}
            type="button"
            className="btn"
            onClick={() =>
              run("Extensión instalada", () =>
                apiPost({ action: "install_extension", actorId }),
              )
            }
          >
            Instalar checklist demo (admin)
          </button>
          <ul>
            {state.extensions.map((ext) => (
              <li key={`${ext.manifest.id}-${ext.scopedPlaceId}`} className="panel">
                <strong>{ext.manifest.name}</strong> v{ext.manifest.version} · {ext.manifest.license}
                <p className="muted">
                  Permisos: {ext.manifest.permissions.join(", ")} · Red:{" "}
                  {ext.manifest.networkAccess ? "sí" : "no"} · Alcance: {ext.scopedPlaceId}
                </p>
                <p className="muted">{ext.manifest.uninstallProcedure}</p>
                <button
                      disabled={!extAvail.enabled}
                      title={extAvail.reason}
                  type="button"
                  className="btn secondary"
                  onClick={() =>
                    run("Extensión desinstalada", () =>
                      apiPost({
                        action: "uninstall_extension",
                        actorId,
                        extensionId: ext.manifest.id,
                      }),
                    )
                  }
                >
                  Desinstalar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "pasaporte" && (
        <section className="panel stack">
          <h2>Pasaporte de resultados</h2>
          {!state.passports.length && (
            <p className="muted">{SPACE_VOICE.emptyPassports}</p>
          )}
          {state.passports.map((p) => (
            <article key={p.id} className="panel">
              <h3>{p.objective}</h3>
              <p>Estado de revisión: {p.reviewStatus}</p>
              <p>Criterios: {p.acceptanceCriteria.join("; ")}</p>
              <p>Pruebas: {p.testsRun.join("; ")}</p>
              <p>Limitaciones: {p.limitations.join("; ")}</p>
              <p className="muted">Recuperación: {p.previousVersionHint}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
