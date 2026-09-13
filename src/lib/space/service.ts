import { randomUUID } from "node:crypto";
import { SPACE_MODULE, spaceFeatureFlags } from "./flags";
import {
  canAssign,
  canAttachEvidence,
  canConfirmDraft,
  canCreateIncident,
  canEditVisit,
  canManageExtensions,
  canTransition,
  roleCanEdit,
  roleCanSetStatus,
} from "./roles";
import {
  ACTOR_ADMIN,
  ACTOR_RESIDENTE,
  ACTOR_REVISOR,
  ACTOR_TECNICO,
  DEMO_PLACE_ID,
  DEMO_PIPE_ID,
  createInitialSpaceState,
} from "./seed";
import { loadSpaceState, resetSpaceDemo, saveSpaceState } from "./store";
import type {
  Actor,
  AssistantReply,
  DecisionRecord,
  Evidence,
  EvidenceKind,
  ExtensionManifest,
  Incident,
  IncidentStatus,
  MutableProps,
  ResultPassport,
  SceneDraft,
  SpaceObject,
  SpaceState,
  TimelineEvent,
  TimelineKind,
} from "./types";
import { DRAFT_DISCLAIMER } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function requireActor(state: SpaceState, actorId: string): Actor {
  const actor = state.actors.find((a) => a.id === actorId);
  if (!actor) throw new Error(`Actor no encontrado: ${actorId}`);
  return actor;
}

function requireObject(state: SpaceState, objectId: string): SpaceObject {
  const obj = state.objects.find((o) => o.id === objectId);
  if (!obj) throw new Error(`Objeto no encontrado: ${objectId}`);
  return obj;
}

function requireIncident(state: SpaceState, incidentId: string): Incident {
  const inc = state.incidents.find((i) => i.id === incidentId);
  if (!inc) throw new Error(`Incidencia no encontrada: ${incidentId}`);
  return inc;
}

function pushTimeline(
  state: SpaceState,
  partial: {
    placeId: string;
    objectId?: string;
    incidentId?: string;
    kind: TimelineKind;
    title: string;
    detail: string;
    actorId: string;
    actorName: string;
    dates?: TimelineEvent["dates"];
    isSystemRecord?: boolean;
  },
): void {
  state.timeline.unshift({
    id: randomUUID(),
    placeId: partial.placeId,
    objectId: partial.objectId,
    incidentId: partial.incidentId,
    kind: partial.kind,
    title: partial.title,
    detail: partial.detail,
    actorId: partial.actorId,
    actorName: partial.actorName,
    dates: partial.dates ?? { uploadedAt: nowIso(), eventAt: nowIso() },
    isSystemRecord: partial.isSystemRecord ?? true,
  });
  if (state.timeline.length > 400) state.timeline.length = 400;
}

function bumpPlace(state: SpaceState, placeId: string): void {
  const place = state.places.find((p) => p.id === placeId);
  if (place) place.revision += 1;
}

export function getSpaceModuleInfo() {
  return { ...SPACE_MODULE, flags: spaceFeatureFlags };
}

export async function getSpaceSnapshot(dataRoot?: string): Promise<SpaceState> {
  return loadSpaceState(dataRoot);
}

export async function listPlaces(dataRoot?: string) {
  return (await loadSpaceState(dataRoot)).places;
}

export async function listObjects(placeId = DEMO_PLACE_ID, dataRoot?: string) {
  return (await loadSpaceState(dataRoot)).objects.filter((o) => o.placeId === placeId);
}

export async function getObject(objectId: string, dataRoot?: string) {
  return requireObject(await loadSpaceState(dataRoot), objectId);
}

export async function listActors(dataRoot?: string) {
  return (await loadSpaceState(dataRoot)).actors;
}

export async function listIncidents(placeId = DEMO_PLACE_ID, dataRoot?: string) {
  return (await loadSpaceState(dataRoot)).incidents.filter((i) => i.placeId === placeId);
}

export async function listTimeline(placeId = DEMO_PLACE_ID, dataRoot?: string) {
  return (await loadSpaceState(dataRoot)).timeline.filter((t) => t.placeId === placeId);
}

export async function listEvidence(incidentId: string, dataRoot?: string) {
  const state = await loadSpaceState(dataRoot);
  return state.evidence.filter((e) => e.incidentId === incidentId);
}

export async function createIncident(
  input: {
    actorId: string;
    objectId: string;
    title: string;
    description: string;
    idempotencyKey?: string;
    asDraft?: boolean;
  },
  dataRoot?: string,
): Promise<Incident> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!canCreateIncident(actor.role)) {
    throw new Error(`Permiso denegado: el rol «${actor.role}» no puede crear incidencias.`);
  }
  if (input.idempotencyKey && state.processedIdempotencyKeys.includes(input.idempotencyKey)) {
    const existing = state.incidents.find((i) => i.idempotencyKey === input.idempotencyKey);
    if (existing) return existing;
  }
  const obj = requireObject(state, input.objectId);
  const status: IncidentStatus = input.asDraft ? "borrador" : "abierta";
  const at = nowIso();
  const incident: Incident = {
    id: randomUUID(),
    placeId: obj.placeId,
    objectId: obj.id,
    title: input.title.trim() || `Incidencia en ${obj.name}`,
    description: input.description.trim(),
    status,
    createdBy: actor.id,
    createdAt: at,
    updatedAt: at,
    revision: 1,
    evidenceIds: [],
    statusHistory: [{ at, from: "borrador", to: status, actorId: actor.id, note: "creación" }],
    idempotencyKey: input.idempotencyKey,
  };
  if (input.idempotencyKey) state.processedIdempotencyKeys.push(input.idempotencyKey);
  state.incidents.unshift(incident);
  obj.history.unshift({
    id: randomUUID(),
    at,
    actorId: actor.id,
    actorName: actor.displayName,
    action: "incidencia_creada",
    detail: incident.title,
    kind: "incidencia_creada",
  });
  pushTimeline(state, {
    placeId: obj.placeId,
    objectId: obj.id,
    incidentId: incident.id,
    kind: "incidencia_creada",
    title: "Incidencia creada",
    detail: `${incident.title} sobre «${obj.name}»`,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  bumpPlace(state, obj.placeId);
  await saveSpaceState(state, dataRoot);
  return incident;
}

export async function assignIncident(
  input: { actorId: string; incidentId: string; assigneeId: string; expectedRevision?: number },
  dataRoot?: string,
): Promise<Incident> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!canAssign(actor.role)) {
    throw new Error(`Permiso denegado: el rol «${actor.role}» no puede asignar incidencias.`);
  }
  const assignee = requireActor(state, input.assigneeId);
  if (assignee.role !== "tecnico" && assignee.role !== "administrador") {
    throw new Error("Solo se puede asignar a un técnico o administrador autorizado.");
  }
  const incident = requireIncident(state, input.incidentId);
  if (input.expectedRevision !== undefined && incident.revision !== input.expectedRevision) {
    throw new Error(
      `Conflicto de actualización: revisión esperada ${input.expectedRevision}, actual ${incident.revision}.`,
    );
  }
  if (incident.status !== "abierta" && incident.status !== "asignada") {
    throw new Error(`No se puede asignar desde el estado «${incident.status}».`);
  }
  if (!canTransition(incident.status, "asignada") && incident.status !== "asignada") {
    throw new Error(`Transición inválida hacia asignada desde «${incident.status}».`);
  }
  const from = incident.status;
  incident.assigneeId = assignee.id;
  if (from !== "asignada") {
    incident.status = "asignada";
    incident.statusHistory.push({
      at: nowIso(),
      from,
      to: "asignada",
      actorId: actor.id,
      note: `Asignada a ${assignee.displayName}`,
    });
  }
  incident.updatedAt = nowIso();
  incident.revision += 1;
  pushTimeline(state, {
    placeId: incident.placeId,
    objectId: incident.objectId,
    incidentId: incident.id,
    kind: "incidencia_asignada",
    title: "Incidencia asignada",
    detail: `Asignada a ${assignee.displayName}`,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return incident;
}

export async function attachEvidence(
  input: {
    actorId: string;
    incidentId: string;
    kind: EvidenceKind;
    title: string;
    body: string;
    eventAt?: string;
    capturedAt?: string;
    demoAssetLabel?: string;
  },
  dataRoot?: string,
): Promise<Evidence> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!canAttachEvidence(actor.role)) {
    throw new Error(`Permiso denegado: el rol «${actor.role}» no puede anexar evidencia.`);
  }
  const incident = requireIncident(state, input.incidentId);
  if (incident.status === "cerrada" || incident.status === "cancelada") {
    throw new Error("No se puede anexar evidencia a una incidencia cerrada o cancelada.");
  }
  const evidence: Evidence = {
    id: randomUUID(),
    incidentId: incident.id,
    kind: input.kind,
    title: input.title.trim(),
    body: input.body.trim(),
    dates: {
      uploadedAt: nowIso(),
      eventAt: input.eventAt,
      capturedAt: input.capturedAt,
    },
    uploadedBy: actor.id,
    demoAssetLabel: input.demoAssetLabel,
    provenance: {
      kind: "simulado",
      source: "Evidencia de demostración",
      updatedAt: nowIso(),
      caveat: "Adjunto demo. No es fotografía de campo ni medición calibrada.",
    },
  };
  state.evidence.unshift(evidence);
  incident.evidenceIds.push(evidence.id);
  incident.updatedAt = nowIso();
  incident.revision += 1;
  pushTimeline(state, {
    placeId: incident.placeId,
    objectId: incident.objectId,
    incidentId: incident.id,
    kind: "evidencia_anexada",
    title: "Evidencia anexada",
    detail: `${evidence.kind}: ${evidence.title}`,
    actorId: actor.id,
    actorName: actor.displayName,
    dates: evidence.dates,
  });
  await saveSpaceState(state, dataRoot);
  return evidence;
}

export async function transitionIncident(
  input: {
    actorId: string;
    incidentId: string;
    to: IncidentStatus;
    note?: string;
    expectedRevision?: number;
  },
  dataRoot?: string,
): Promise<Incident> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  const incident = requireIncident(state, input.incidentId);
  if (input.expectedRevision !== undefined && incident.revision !== input.expectedRevision) {
    throw new Error(
      `Conflicto de actualización: revisión esperada ${input.expectedRevision}, actual ${incident.revision}.`,
    );
  }
  if (!canTransition(incident.status, input.to)) {
    throw new Error(`Transición inválida: ${incident.status} → ${input.to}`);
  }
  if (!roleCanSetStatus(actor.role, input.to)) {
    throw new Error(`Permiso denegado: el rol «${actor.role}» no puede pasar a «${input.to}».`);
  }
  if (input.to === "pendiente_revision" && incident.evidenceIds.length === 0) {
    throw new Error("Se requiere al menos una evidencia antes de solicitar revisión.");
  }
  if (input.to === "cerrada" && incident.evidenceIds.length === 0) {
    throw new Error("No se puede cerrar sin evidencia anexada.");
  }
  const from = incident.status;
  const at = nowIso();
  incident.status = input.to;
  incident.updatedAt = at;
  incident.revision += 1;
  incident.statusHistory.push({ at, from, to: input.to, actorId: actor.id, note: input.note });
  const kind: TimelineKind =
    input.to === "cerrada" ? "incidencia_estado" : "incidencia_estado";
  pushTimeline(state, {
    placeId: incident.placeId,
    objectId: incident.objectId,
    incidentId: incident.id,
    kind,
    title: `Estado → ${input.to}`,
    detail: input.note ?? `${from} → ${input.to}`,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  const obj = requireObject(state, incident.objectId);
  obj.history.unshift({
    id: randomUUID(),
    at,
    actorId: actor.id,
    actorName: actor.displayName,
    action: `estado_${input.to}`,
    detail: input.note ?? "",
    kind,
  });
  bumpPlace(state, incident.placeId);
  await saveSpaceState(state, dataRoot);
  return incident;
}

export async function issuePassport(
  input: {
    actorId: string;
    placeId: string;
    objective: string;
    modifiedElementIds: string[];
    sourcesUsed: string[];
    testsRun: string[];
    limitations: string[];
    acceptanceCriteria: string[];
    linkedIncidentId?: string;
    markApproved?: boolean;
  },
  dataRoot?: string,
): Promise<ResultPassport> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (input.acceptanceCriteria.length === 0) {
    throw new Error("No se emite pasaporte: faltan criterios de aceptación.");
  }
  const passport: ResultPassport = {
    id: randomUUID(),
    placeId: input.placeId,
    createdAt: nowIso(),
    createdBy: actor.id,
    objective: input.objective,
    modifiedElementIds: input.modifiedElementIds,
    sourcesUsed: input.sourcesUsed,
    testsRun: input.testsRun,
    limitations: input.limitations,
    reviewStatus: input.markApproved ? "aprobado" : "pendiente",
    previousVersionHint:
      "Reinicia la demo o restaura un respaldo de data/space/state.json para recuperar el estado anterior.",
    acceptanceCriteria: input.acceptanceCriteria,
    criteriaMet: true,
    linkedIncidentId: input.linkedIncidentId,
  };
  state.passports.unshift(passport);
  pushTimeline(state, {
    placeId: input.placeId,
    incidentId: input.linkedIncidentId,
    kind: "pasaporte_emitido",
    title: "Pasaporte de resultado emitido",
    detail: passport.objective,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return passport;
}

export async function runMaintenanceDemoFlow(
  input: { idempotencyKey?: string } = {},
  dataRoot?: string,
): Promise<{ incident: Incident; evidence: Evidence; passport: ResultPassport; steps: string[] }> {
  const key = input.idempotencyKey ?? `demo-flow-${randomUUID()}`;
  const steps: string[] = [];
  const created = await createIncident(
    {
      actorId: ACTOR_RESIDENTE,
      objectId: DEMO_PIPE_ID,
      title: "Fuga aparente en tubería de aseo planta 1",
      description: "Se observa humedad en el falso techo del aseo. Requiere inspección.",
      idempotencyKey: key,
    },
    dataRoot,
  );
  steps.push("incidencia_creada");
  const assigned = await assignIncident(
    { actorId: ACTOR_ADMIN, incidentId: created.id, assigneeId: ACTOR_TECNICO },
    dataRoot,
  );
  steps.push("asignada");
  await transitionIncident(
    { actorId: ACTOR_TECNICO, incidentId: assigned.id, to: "en_progreso", note: "Inspección iniciada" },
    dataRoot,
  );
  steps.push("en_progreso");
  const evidence = await attachEvidence(
    {
      actorId: ACTOR_TECNICO,
      incidentId: assigned.id,
      kind: "fotografia_demo",
      title: "Foto demo de humedad",
      body: "Evidencia de demostración (no es una fotografía real de campo).",
      capturedAt: nowIso(),
      eventAt: nowIso(),
      demoAssetLabel: "demo-humedad-aseo.svg",
    },
    dataRoot,
  );
  steps.push("evidencia");
  await transitionIncident(
    {
      actorId: ACTOR_TECNICO,
      incidentId: assigned.id,
      to: "pendiente_revision",
      note: "Trabajo demo listo para revisión",
    },
    dataRoot,
  );
  steps.push("pendiente_revision");
  const closed = await transitionIncident(
    {
      actorId: ACTOR_REVISOR,
      incidentId: assigned.id,
      to: "cerrada",
      note: "Verificado en demo; cierre autorizado por revisor",
    },
    dataRoot,
  );
  steps.push("cerrada");
  const passport = await issuePassport(
    {
      actorId: ACTOR_REVISOR,
      placeId: closed.placeId,
      objective: "Cerrar incidencia de tubería en recorrido demo",
      modifiedElementIds: [closed.objectId, closed.id],
      sourcesUsed: ["ficha del objeto", "evidencia anexada", "historial de estados"],
      testsRun: ["flujo de roles", "evidencia obligatoria", "persistencia"],
      limitations: ["Edificio ficticio", "Sin obra física", "Evidencia etiquetada como demo"],
      acceptanceCriteria: [
        "Incidencia creada sobre tubería",
        "Asignada a técnico",
        "Evidencia anexada",
        "Revisión y cierre por rol autorizado",
      ],
      linkedIncidentId: closed.id,
      markApproved: true,
    },
    dataRoot,
  );
  steps.push("pasaporte");
  return { incident: closed, evidence, passport, steps };
}

export async function createDraft(
  input: { actorId: string; placeId?: string; name: string },
  dataRoot?: string,
): Promise<SceneDraft> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!roleCanEdit(actor.role)) {
    throw new Error(`Permiso denegado: el rol «${actor.role}» no puede crear borradores.`);
  }
  const placeId = input.placeId ?? DEMO_PLACE_ID;
  const place = state.places.find((p) => p.id === placeId);
  if (!place) throw new Error("Lugar no encontrado");
  const draft: SceneDraft = {
    id: randomUUID(),
    placeId,
    name: input.name.trim() || "Borrador sin título",
    basedOnRevision: place.revision,
    createdBy: actor.id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: "borrador",
    objectOverrides: {},
    disclaimer: DRAFT_DISCLAIMER,
  };
  state.drafts.unshift(draft);
  pushTimeline(state, {
    placeId,
    kind: "borrador_creado",
    title: "Borrador de escena creado",
    detail: draft.name,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return draft;
}

export async function updateDraftObject(
  input: { actorId: string; draftId: string; objectId: string; props: MutableProps },
  dataRoot?: string,
): Promise<SceneDraft> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!roleCanEdit(actor.role)) throw new Error("Permiso denegado para editar borrador.");
  const draft = state.drafts.find((d) => d.id === input.draftId);
  if (!draft || draft.status !== "borrador") throw new Error("Borrador no editable.");
  requireObject(state, input.objectId);
  draft.objectOverrides[input.objectId] = {
    ...draft.objectOverrides[input.objectId],
    ...input.props,
  };
  draft.updatedAt = nowIso();
  await saveSpaceState(state, dataRoot);
  return draft;
}

export async function confirmDraft(
  input: { actorId: string; draftId: string },
  dataRoot?: string,
): Promise<{ draft: SceneDraft; placeRevision: number }> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!canConfirmDraft(actor.role)) {
    throw new Error(`Permiso denegado: el rol «${actor.role}» no puede confirmar borradores.`);
  }
  const draft = state.drafts.find((d) => d.id === input.draftId);
  if (!draft || draft.status !== "borrador") throw new Error("Borrador no confirmable.");
  for (const [objectId, props] of Object.entries(draft.objectOverrides)) {
    const obj = requireObject(state, objectId);
    obj.mutableProps = { ...obj.mutableProps, ...props };
    if (props.x !== undefined) obj.x = props.x;
    if (props.y !== undefined) obj.y = props.y;
    if (props.label) obj.name = props.label;
    obj.history.unshift({
      id: randomUUID(),
      at: nowIso(),
      actorId: actor.id,
      actorName: actor.displayName,
      action: "borrador_aplicado",
      detail: `Cambios de borrador «${draft.name}» aplicados al modelo demo.`,
      kind: "borrador_confirmado",
    });
  }
  draft.status = "confirmado";
  draft.updatedAt = nowIso();
  bumpPlace(state, draft.placeId);
  const place = state.places.find((p) => p.id === draft.placeId)!;
  pushTimeline(state, {
    placeId: draft.placeId,
    kind: "borrador_confirmado",
    title: "Borrador confirmado (solo modelo demo)",
    detail: `${draft.name}. ${DRAFT_DISCLAIMER}`,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return { draft, placeRevision: place.revision };
}

export async function discardDraft(
  input: { actorId: string; draftId: string },
  dataRoot?: string,
): Promise<SceneDraft> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  const draft = state.drafts.find((d) => d.id === input.draftId);
  if (!draft || draft.status !== "borrador") throw new Error("Borrador no descartable.");
  draft.status = "descartado";
  draft.updatedAt = nowIso();
  pushTimeline(state, {
    placeId: draft.placeId,
    kind: "borrador_descartado",
    title: "Borrador descartado",
    detail: draft.name,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return draft;
}

export async function recordDecision(
  input: {
    actorId: string;
    placeId?: string;
    objectId?: string;
    incidentId?: string;
    decision: string;
    rationale: string;
    discardedAlternative?: string;
    observedOutcome?: string;
    source: DecisionRecord["source"];
  },
  dataRoot?: string,
): Promise<DecisionRecord> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (actor.role === "observador") throw new Error("Los observadores no registran decisiones.");
  const record: DecisionRecord = {
    id: randomUUID(),
    placeId: input.placeId ?? DEMO_PLACE_ID,
    objectId: input.objectId,
    incidentId: input.incidentId,
    decidedAt: nowIso(),
    decidedBy: actor.id,
    decision: input.decision.trim(),
    rationale: input.rationale.trim(),
    discardedAlternative: input.discardedAlternative?.trim(),
    observedOutcome: input.observedOutcome?.trim(),
    source: input.source,
    retentionNote:
      input.source === "sugerencia_asistente"
        ? "Sugerencia de asistente — no equivale a decisión aprobada."
        : undefined,
  };
  state.decisions.unshift(record);
  pushTimeline(state, {
    placeId: record.placeId,
    objectId: record.objectId,
    incidentId: record.incidentId,
    kind: "decision_registrada",
    title: "Decisión registrada",
    detail: `${record.source}: ${record.decision}`,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return record;
}

export async function correctDecision(
  input: {
    actorId: string;
    decisionId: string;
    decision?: string;
    rationale?: string;
    observedOutcome?: string;
  },
  dataRoot?: string,
): Promise<DecisionRecord> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  const record = state.decisions.find((d) => d.id === input.decisionId && !d.deletedAt);
  if (!record) throw new Error("Decisión no encontrada");
  if (input.decision) record.decision = input.decision.trim();
  if (input.rationale) record.rationale = input.rationale.trim();
  if (input.observedOutcome !== undefined) record.observedOutcome = input.observedOutcome.trim();
  pushTimeline(state, {
    placeId: record.placeId,
    kind: "decision_corregida",
    title: "Decisión corregida",
    detail: record.id,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return record;
}

export async function deleteDecision(
  input: { actorId: string; decisionId: string; retentionNote?: string },
  dataRoot?: string,
): Promise<DecisionRecord> {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (actor.role !== "administrador" && actor.role !== "revisor") {
    throw new Error("Solo revisor o administrador pueden eliminar recuerdos de decisión.");
  }
  const record = state.decisions.find((d) => d.id === input.decisionId && !d.deletedAt);
  if (!record) throw new Error("Decisión no encontrada");
  record.deletedAt = nowIso();
  record.retentionNote =
    input.retentionNote ??
    "Eliminado lógicamente. Conservar según obligaciones legales aplicables al titular.";
  pushTimeline(state, {
    placeId: record.placeId,
    kind: "decision_eliminada",
    title: "Decisión eliminada (lógico)",
    detail: record.retentionNote,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return record;
}

export async function upsertPresence(
  input: { actorId: string; x: number; y: number; selectedObjectId?: string },
  dataRoot?: string,
) {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  const existing = state.visit.participants.find((p) => p.actorId === actor.id);
  const cursor = {
    actorId: actor.id,
    displayName: actor.displayName,
    role: actor.role,
    x: input.x,
    y: input.y,
    selectedObjectId: input.selectedObjectId,
    updatedAt: nowIso(),
    canEdit: roleCanEdit(actor.role),
  };
  if (existing) Object.assign(existing, cursor);
  else state.visit.participants.push(cursor);
  await saveSpaceState(state, dataRoot);
  return state.visit;
}

export async function addVisitComment(
  input: { actorId: string; body: string; objectId?: string; x: number; y: number },
  dataRoot?: string,
) {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!canEditVisit(actor.role)) throw new Error("Los observadores no publican comentarios.");
  const comment = {
    id: randomUUID(),
    placeId: state.visit.placeId,
    objectId: input.objectId,
    x: input.x,
    y: input.y,
    authorId: actor.id,
    body: input.body.trim(),
    createdAt: nowIso(),
  };
  state.visit.comments.push(comment);
  pushTimeline(state, {
    placeId: state.visit.placeId,
    objectId: input.objectId,
    kind: "visita_comentario",
    title: "Comentario en visita",
    detail: comment.body,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return comment;
}

export async function acquireObjectLock(
  input: { actorId: string; objectId: string },
  dataRoot?: string,
) {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!roleCanEdit(actor.role)) throw new Error("Sin permiso de edición.");
  requireObject(state, input.objectId);
  const current = state.visit.locks[input.objectId];
  if (current && current.actorId !== actor.id) {
    throw new Error(
      `Conflicto: el objeto está bloqueado por otro participante (${current.actorId}).`,
    );
  }
  state.visit.locks[input.objectId] = { actorId: actor.id, since: nowIso() };
  pushTimeline(state, {
    placeId: state.visit.placeId,
    objectId: input.objectId,
    kind: "bloqueo_objeto",
    title: "Bloqueo de edición",
    detail: `Objeto bloqueado por ${actor.displayName}`,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return state.visit.locks;
}

export async function releaseObjectLock(
  input: { actorId: string; objectId: string },
  dataRoot?: string,
) {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  const current = state.visit.locks[input.objectId];
  if (current && current.actorId !== actor.id && actor.role !== "administrador") {
    throw new Error("Solo quien bloqueó (o un administrador) puede liberar el bloqueo.");
  }
  delete state.visit.locks[input.objectId];
  await saveSpaceState(state, dataRoot);
  return state.visit.locks;
}

export async function installExtension(
  input: { actorId: string; manifest: ExtensionManifest; placeId?: string },
  dataRoot?: string,
) {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!canManageExtensions(actor.role)) {
    throw new Error("Solo un administrador puede instalar extensiones.");
  }
  if (input.manifest.networkAccess && !input.manifest.permissions.includes("red")) {
    throw new Error("El manifiesto declara red pero no solicita el permiso «red».");
  }
  const placeId = input.placeId ?? DEMO_PLACE_ID;
  if (state.extensions.some((e) => e.manifest.id === input.manifest.id && e.scopedPlaceId === placeId)) {
    throw new Error("La extensión ya está instalada en este lugar.");
  }
  const installed = {
    manifest: input.manifest,
    installedAt: nowIso(),
    installedBy: actor.id,
    scopedPlaceId: placeId,
    enabled: true,
  };
  state.extensions.push(installed);
  pushTimeline(state, {
    placeId,
    kind: "extension_instalada",
    title: "Extensión instalada (aislada al lugar)",
    detail: `${input.manifest.name} @ ${input.manifest.version}`,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return installed;
}

export async function uninstallExtension(
  input: { actorId: string; extensionId: string; placeId?: string },
  dataRoot?: string,
) {
  const state = await loadSpaceState(dataRoot);
  const actor = requireActor(state, input.actorId);
  if (!canManageExtensions(actor.role)) {
    throw new Error("Solo un administrador puede desinstalar extensiones.");
  }
  const placeId = input.placeId ?? DEMO_PLACE_ID;
  const before = state.extensions.length;
  state.extensions = state.extensions.filter(
    (e) => !(e.manifest.id === input.extensionId && e.scopedPlaceId === placeId),
  );
  if (state.extensions.length === before) throw new Error("Extensión no encontrada en este lugar.");
  pushTimeline(state, {
    placeId,
    kind: "extension_desinstalada",
    title: "Extensión desinstalada",
    detail: input.extensionId,
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return state.extensions;
}

export function askAssistant(input: { object?: SpaceObject | null; question: string }): AssistantReply {
  const q = input.question.trim().toLowerCase();
  if (!input.object) {
    return {
      mode: "no_disponible",
      observed: [],
      inferred: [],
      unavailable: ["objeto_seleccionado"],
      suggestedActions: ["Selecciona un objeto en la lista o en el plano"],
      text: "Información no disponible: no hay objeto seleccionado.",
    };
  }
  const obj = input.object;
  const observed = [
    `nombre: ${obj.name}`,
    `ubicacion: ${obj.locationLabel}`,
    `fuente: ${obj.source}`,
    `info_a_fecha: ${obj.infoAsOf}`,
    ...Object.entries(obj.knownFacts).map(([k, v]) => `${k}: ${v}`),
  ];
  const unavailable = [...obj.unknownFields];
  const inferred: string[] = [];
  const suggestedActions = [...obj.availableActions];

  if (q.includes("precio") || q.includes("coste") || q.includes("costo")) {
    return {
      mode: "no_disponible",
      observed,
      inferred,
      unavailable: [...unavailable, "precio"],
      suggestedActions,
      text: "Información no disponible: no hay precio registrado para este objeto. No se inventan tarifas.",
    };
  }
  if (q.includes("diagn") || q.includes("rota") || q.includes("fuga")) {
    inferred.push("Cualquier hipótesis de fallo es inferencia; requiere inspección humana/técnica.");
    return {
      mode: "propuesta",
      observed,
      inferred,
      unavailable,
      suggestedActions: ["crear_incidencia", "ver_ficha", "anexar_evidencia"],
      text: `Observado: ${obj.name} en ${obj.locationLabel}. No hay diagnóstico técnico verificado en el inventario. Puedes abrir una incidencia para que un técnico autorizado inspeccione.`,
    };
  }
  if (q.includes("documento") || q.includes("plano") || q.includes("manual")) {
    if (!obj.documents.length) {
      return {
        mode: "no_disponible",
        observed,
        inferred,
        unavailable: [...unavailable, "documentos"],
        suggestedActions,
        text: "Información no disponible: este objeto no tiene documentos autorizados cargados.",
      };
    }
    return {
      mode: "explicacion",
      observed: [
        ...observed,
        ...obj.documents.map((d) => `doc:${d.title} (${d.issuedAt}, ${d.source})`),
      ],
      inferred,
      unavailable,
      suggestedActions,
      text: `Documentos autorizados: ${obj.documents.map((d) => d.title).join("; ")}.`,
    };
  }
  return {
    mode: "explicacion",
    observed,
    inferred,
    unavailable,
    suggestedActions,
    text: `${obj.description} Fuente: ${obj.source} (información a ${obj.infoAsOf}). Campos sin dato: ${unavailable.join(", ") || "ninguno declarado"}.`,
  };
}

export async function recordDemoReset(actorId: string, dataRoot?: string): Promise<SpaceState> {
  const state = createInitialSpaceState();
  const actor = state.actors.find((a) => a.id === actorId) ?? state.actors[0];
  pushTimeline(state, {
    placeId: DEMO_PLACE_ID,
    kind: "demo_reiniciada",
    title: "Demo reiniciada",
    detail: "Estado restaurado a la semilla ficticia.",
    actorId: actor.id,
    actorName: actor.displayName,
  });
  await saveSpaceState(state, dataRoot);
  return state;
}

export { resetSpaceDemo, DEMO_PLACE_ID, DEMO_PIPE_ID };
