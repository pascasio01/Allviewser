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
    reason: `Requiere rol «${required}» (o administrador). Actor actual: «${current}». Cambia el actor activo arriba.`,
    suggestActorId: ROLE_ACTOR[required],
  };
}

export function availabilityCreateIncident(role: SpaceRole): ActionAvailability {
  if (canCreateIncident(role)) return { enabled: true };
  return {
    enabled: false,
    reason: "Solo residente, técnico o administrador pueden crear incidencias.",
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
    reason: "El observador no puede anexar evidencias.",
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
      label: "Selecciona la tubería demo y crea una incidencia",
      tabHint: "directo",
      availability: availabilityCreateIncident(role),
    };
  }
  switch (incident.status) {
    case "abierta":
      return {
        label: "Asigna la incidencia a un técnico autorizado",
        tabHint: "incidencias",
        availability: availabilityAssign(role),
      };
    case "asignada":
      return {
        label: "Marca en progreso (técnico)",
        tabHint: "incidencias",
        availability: availabilityTransition(role, "en_progreso"),
      };
    case "en_progreso":
      return {
        label: "Anexa evidencia y solicita revisión",
        tabHint: "incidencias",
        availability: availabilityAttach(role),
      };
    case "pendiente_revision":
      return {
        label: "Verifica y cierra con rol revisor",
        tabHint: "incidencias",
        availability: availabilityTransition(role, "cerrada"),
      };
    case "cerrada":
      return {
        label: "Consulta la línea de tiempo y reinicia para comprobar persistencia",
        tabHint: "timeline",
        availability: { enabled: true },
      };
    default:
      return {
        label: "Revisa el historial o reinicia la demo",
        tabHint: "timeline",
        availability: { enabled: true },
      };
  }
}
