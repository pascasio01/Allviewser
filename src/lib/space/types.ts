export type SpaceRole =
  | "observador"
  | "residente"
  | "tecnico"
  | "revisor"
  | "administrador";

export type ObjectKind =
  | "tuberia"
  | "valvula"
  | "panel_electrico"
  | "puerta"
  | "espacio"
  | "mobiliario";

export type IncidentStatus =
  | "borrador"
  | "abierta"
  | "asignada"
  | "en_progreso"
  | "pendiente_revision"
  | "cerrada"
  | "cancelada";

export type EvidenceKind = "nota" | "fotografia_demo" | "documento_demo" | "medicion_declarada";

export type TimelineKind =
  | "semilla"
  | "incidencia_creada"
  | "incidencia_asignada"
  | "evidencia_anexada"
  | "incidencia_estado"
  | "borrador_creado"
  | "borrador_confirmado"
  | "borrador_descartado"
  | "decision_registrada"
  | "decision_corregida"
  | "decision_eliminada"
  | "pasaporte_emitido"
  | "visita_comentario"
  | "bloqueo_objeto"
  | "extension_instalada"
  | "extension_desinstalada"
  | "demo_reiniciada";

export type DateTriple = {
  uploadedAt: string;
  eventAt?: string;
  capturedAt?: string;
};

export type DocRef = {
  id: string;
  title: string;
  source: string;
  issuedAt: string;
  kind: "plano" | "manual" | "garantia" | "norma" | "otro";
  summary: string;
};

export type HistoryEntry = {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  detail: string;
  kind: TimelineKind;
};

export type MutableProps = {
  label?: string;
  color?: string;
  material?: string;
  x?: number;
  y?: number;
  notes?: string;
};

export type SpaceObject = {
  id: string;
  placeId: string;
  kind: ObjectKind;
  name: string;
  description: string;
  locationLabel: string;
  floor: string;
  x: number;
  y: number;
  source: string;
  infoAsOf: string;
  /** Clasificación honesta: simulado / grabado / estimado / etc. */
  provenance: import("../media/provenance").ProvenanceLabel;
  documents: DocRef[];
  history: HistoryEntry[];
  tags: string[];
  knownFacts: Record<string, string>;
  unknownFields: string[];
  availableActions: string[];
  mutableProps: MutableProps;
};

export type Actor = {
  id: string;
  displayName: string;
  role: SpaceRole;
};

export type Evidence = {
  id: string;
  incidentId: string;
  kind: EvidenceKind;
  title: string;
  body: string;
  dates: DateTriple;
  uploadedBy: string;
  demoAssetLabel?: string;
  provenance?: import("../media/provenance").ProvenanceLabel;
};

export type Incident = {
  id: string;
  placeId: string;
  objectId: string;
  title: string;
  description: string;
  status: IncidentStatus;
  createdBy: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  evidenceIds: string[];
  statusHistory: {
    at: string;
    from: IncidentStatus;
    to: IncidentStatus;
    actorId: string;
    note?: string;
  }[];
  idempotencyKey?: string;
};

export type TimelineEvent = {
  id: string;
  placeId: string;
  objectId?: string;
  incidentId?: string;
  kind: TimelineKind;
  title: string;
  detail: string;
  actorId: string;
  actorName: string;
  dates: DateTriple;
  isSystemRecord: boolean;
  provenance?: import("../media/provenance").ProvenanceLabel;
};

export type SceneDraft = {
  id: string;
  placeId: string;
  name: string;
  basedOnRevision: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: "borrador" | "confirmado" | "descartado";
  objectOverrides: Record<string, MutableProps>;
  disclaimer: string;
};

export type DecisionRecord = {
  id: string;
  placeId: string;
  objectId?: string;
  incidentId?: string;
  decidedAt: string;
  decidedBy: string;
  decision: string;
  rationale: string;
  discardedAlternative?: string;
  observedOutcome?: string;
  source: "humana_aprobada" | "sugerencia_asistente" | "sistema";
  retentionNote?: string;
  deletedAt?: string;
};

export type ResultPassport = {
  id: string;
  placeId: string;
  createdAt: string;
  createdBy: string;
  objective: string;
  modifiedElementIds: string[];
  sourcesUsed: string[];
  testsRun: string[];
  limitations: string[];
  reviewStatus: "pendiente" | "aprobado" | "rechazado";
  previousVersionHint: string;
  acceptanceCriteria: string[];
  criteriaMet: boolean;
  linkedIncidentId?: string;
};

export type PresenceCursor = {
  actorId: string;
  displayName: string;
  role: SpaceRole;
  x: number;
  y: number;
  selectedObjectId?: string;
  updatedAt: string;
  canEdit: boolean;
};

export type AnchoredComment = {
  id: string;
  placeId: string;
  objectId?: string;
  x: number;
  y: number;
  authorId: string;
  body: string;
  createdAt: string;
};

export type SharedVisit = {
  id: string;
  placeId: string;
  active: boolean;
  participants: PresenceCursor[];
  comments: AnchoredComment[];
  locks: Record<string, { actorId: string; since: string }>;
  voiceEnabled: false;
  recordingEnabled: false;
};

export type ExtensionPermission =
  | "leer_objetos"
  | "leer_incidencias"
  | "proponer_acciones"
  | "red"
  | "escribir_borrador";

export type ExtensionManifest = {
  id: string;
  name: string;
  author: string;
  version: string;
  license: string;
  capabilities: string[];
  permissions: ExtensionPermission[];
  networkAccess: boolean;
  dataAccess: string[];
  costsOrDependencies: string;
  uninstallProcedure: string;
};

export type InstalledExtension = {
  manifest: ExtensionManifest;
  installedAt: string;
  installedBy: string;
  scopedPlaceId: string;
  enabled: boolean;
};

export type Place = {
  id: string;
  name: string;
  slug: string;
  fictional: true;
  fictionalBanner: string;
  description: string;
  addressLabel: string;
  revision: number;
  createdAt: string;
};

export type AssistantReply = {
  mode: "explicacion" | "propuesta" | "no_disponible" | "error";
  observed: string[];
  inferred: string[];
  unavailable: string[];
  suggestedActions: string[];
  text: string;
};

export type SpaceState = {
  places: Place[];
  objects: SpaceObject[];
  actors: Actor[];
  incidents: Incident[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
  drafts: SceneDraft[];
  decisions: DecisionRecord[];
  passports: ResultPassport[];
  visit: SharedVisit;
  extensions: InstalledExtension[];
  processedIdempotencyKeys: string[];
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  borrador: "Borrador",
  abierta: "Abierta",
  asignada: "Asignada",
  en_progreso: "En progreso",
  pendiente_revision: "Pendiente de revisión",
  cerrada: "Cerrada",
  cancelada: "Cancelada",
};

export const OBJECT_KIND_LABELS: Record<ObjectKind, string> = {
  tuberia: "Tubería",
  valvula: "Válvula",
  panel_electrico: "Panel eléctrico",
  puerta: "Puerta",
  espacio: "Espacio",
  mobiliario: "Mobiliario",
};

export const DRAFT_DISCLAIMER =
  "Este borrador es una simulación local. Confirmarlo actualiza solo el modelo demo del lugar; no autoriza obra física, compra ni cambios en sistemas externos.";
