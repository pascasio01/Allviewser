import type { IncidentStatus, SpaceRole } from "./types";

const TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  borrador: ["abierta", "cancelada"],
  abierta: ["asignada", "cancelada"],
  asignada: ["en_progreso", "cancelada"],
  en_progreso: ["pendiente_revision", "cancelada"],
  pendiente_revision: ["cerrada", "en_progreso", "cancelada"],
  cerrada: [],
  cancelada: [],
};

const ROLE_TO_STATUS: Partial<Record<IncidentStatus, SpaceRole[]>> = {
  abierta: ["residente", "administrador", "tecnico"],
  asignada: ["administrador", "revisor"],
  en_progreso: ["tecnico", "administrador"],
  pendiente_revision: ["tecnico", "administrador"],
  cerrada: ["revisor", "administrador"],
  cancelada: ["residente", "administrador", "revisor"],
};

export function canTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function roleCanSetStatus(role: SpaceRole, to: IncidentStatus): boolean {
  if (role === "administrador") return true;
  return ROLE_TO_STATUS[to]?.includes(role) ?? false;
}

export function canCreateIncident(role: SpaceRole): boolean {
  return role === "residente" || role === "tecnico" || role === "administrador";
}

export function canAssign(role: SpaceRole): boolean {
  return role === "administrador" || role === "revisor";
}

export function canAttachEvidence(role: SpaceRole): boolean {
  return role === "residente" || role === "tecnico" || role === "administrador" || role === "revisor";
}

export function canConfirmDraft(role: SpaceRole): boolean {
  return role === "administrador" || role === "revisor";
}

export function canManageExtensions(role: SpaceRole): boolean {
  return role === "administrador";
}

export function canEditVisit(role: SpaceRole): boolean {
  return role !== "observador";
}

export function roleCanEdit(role: SpaceRole): boolean {
  return role === "tecnico" || role === "administrador" || role === "revisor" || role === "residente";
}
