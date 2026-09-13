import {
  canAssign,
  canAttachEvidence,
  canConfirmDraft,
  canCreateIncident,
  canManageExtensions,
  roleCanSetStatus
} from "./roles";
import type { Actor, Incident, IncidentStatus, SpaceRole } from "./types";
import {
  ACTOR_ADMIN,
  ACTOR_RESIDENTE,
  ACTOR_REVISOR,
  ACTOR_TECNICO,
} from "./seed";
import { roleNeedReason, SPACE_VOICE } from "../voice/companion";

export type ActionAvailability = {
  enabled: boolean;
  reason?: string;
  suggestActorId?: string;
};

const ROLE_ACTOR: Partial<Record<SpaceRole, string>> = {
  administrador: ACTOR_ADMIN,
  tecnico: ACTOR_TECNICO,
  revisor: ACTOR_REVISOR,
  residente: ACTOR_RESIDENTE,
};

function needRole(required: SpaceRole, current: SpaceRole): ActionAvailability {
  if (current === required || current === "administrador") {
    return { enabled: true };
  }
  return {
    enabled: false,
    reason: roleNeedReason(required, current),
    suggestActorId: ROLE_ACTOR[required],
  };
}

export function availabilityCreateIncident(role: SpaceRole): ActionAvailability {
  if (canCreateIncident(role)) return { enabled: true };
  return {
    enabled: false,
    reason:
      "Con este rol no puedo abrir una incidencia. Cambia a residente, técnico o administrador y te guío.",
    suggestActorId: ACTOR_RESIDENTE,
  };
}

export function availabilityAssign(role: SpaceRole): ActionAvailability {
  if (canAssign(role)) return { enabled: true };
  return needRole("administrador", role);
}

export function availabilityAttach(role: SpaceRole): ActionAvailability {
  if (canAttachEvidence(role)) return { enabled: true };
  return {
    enabled: false,
    reason:
      "El observador no puede anexar evidencias. Cambia a técnico (o administrador) para dejar prueba.",
    suggestActorId: ACTOR_TECNICO,
  };
}

export function availabilityTransition(
  role: SpaceRole,
  to: IncidentStatus,
): ActionAvailability {
  if (roleCanSetStatus(role, to)) return { enabled: true };
  const preferred: SpaceRole =
    to === "asignada"
      ? "administrador"
      : to === "cerrada"
        ? "revisor"
        : to === "en_progreso" || to === "pendiente_revision"
          ? "tecnico"
          : "administrador";
  return needRole(preferred, role);
}

export function availabilityConfirmDraft(role: SpaceRole): ActionAvailability {
  if (canConfirmDraft(role)) return { enabled: true };
  return needRole("administrador", role);
}

export function availabilityExtensions(role: SpaceRole): ActionAvailability {
  if (canManageExtensions(role)) return { enabled: true };
  return needRole("administrador", role);
}

/** Siguiente paso del recorrido guiado según incidencia y actor. */
export function nextGuidedStep(
  incident: Incident | undefined,
  actor: Actor | undefined,
): { label: string; tabHint: string; availability: ActionAvailability } {
  const role = actor?.role ?? "observador";
  if (!incident) {
    return {
      label: "Selecciona la tubería demo y crea una incidencia — dejar rastro es el primer cuidado.",
      tabHint: "directo",
      availability: availabilityCreateIncident(role),
    };
  }
  switch (incident.status) {
    case "abierta":
      return {
        label: "Asigna la incidencia a un técnico autorizado para que alguien pueda actuar.",
        tabHint: "incidencias",
        availability: availabilityAssign(role),
      };
    case "asignada":
      return {
        label: "Marca en progreso con rol técnico: así queda claro que alguien ya está cuidando.",
        tabHint: "incidencias",
        availability: availabilityTransition(role, "en_progreso"),
      };
    case "en_progreso":
      return {
        label: "Anexa evidencia y solicita revisión — la prueba es el pacto de confianza.",
        tabHint: "incidencias",
        availability: availabilityAttach(role),
      };
    case "pendiente_revision":
      return {
        label: "Verifica y cierra con rol revisor: no se salta la mirada de otro.",
        tabHint: "incidencias",
        availability: availabilityTransition(role, "cerrada"),
      };
    case "cerrada":
      return {
        label: SPACE_VOICE.afterClose,
        tabHint: "timeline",
        availability: { enabled: true },
      };
    default:
      return {
        label: "Revisa el historial o reinicia la demo sin miedo.",
        tabHint: "timeline",
        availability: { enabled: true },
      };
  }
}
