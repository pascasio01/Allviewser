import type { Actor, SpaceRole } from "./types";
import {
  availabilityAssign,
  availabilityAttach,
  availabilityConfirmDraft,
  availabilityCreateIncident,
  availabilityExtensions,
  availabilityTransition,
  type ActionAvailability,
} from "./ui-actions";

export type ShadowActionId =
  | "create_incident"
  | "assign_incident"
  | "attach_evidence"
  | "mark_progress"
  | "request_review"
  | "close_incident"
  | "confirm_draft"
  | "manage_extensions";

export type ShadowActionView = {
  id: ShadowActionId;
  label: string;
  availability: ActionAvailability;
  ghost: boolean;
};

const LABELS: Record<ShadowActionId, string> = {
  create_incident: "Abrir incidencia",
  assign_incident: "Asignar",
  attach_evidence: "Anexar evidencia",
  mark_progress: "Marcar en progreso",
  request_review: "Pedir revisión",
  close_incident: "Cerrar",
  confirm_draft: "Confirmar borrador",
  manage_extensions: "Gestionar extensiones",
};

function forRole(role: SpaceRole): ShadowActionView[] {
  const specs: Array<[ShadowActionId, ActionAvailability]> = [
    ["create_incident", availabilityCreateIncident(role)],
    ["assign_incident", availabilityAssign(role)],
    ["attach_evidence", availabilityAttach(role)],
    ["mark_progress", availabilityTransition(role, "en_progreso")],
    ["request_review", availabilityTransition(role, "pendiente_revision")],
    ["close_incident", availabilityTransition(role, "cerrada")],
    ["confirm_draft", availabilityConfirmDraft(role)],
    ["manage_extensions", availabilityExtensions(role)],
  ];
  return specs.map(([id, availability]) => ({
    id,
    label: LABELS[id],
    availability,
    ghost: !availability.enabled,
  }));
}

/** Vista sombra: qué podría firmar otro rol, sin cambiar el actor activo. */
export function shadowRoleView(
  shadowRole: SpaceRole,
  active: Actor | undefined,
): {
  shadowRole: SpaceRole;
  activeRole: SpaceRole;
  actions: ShadowActionView[];
  note: string;
} {
  const activeRole = active?.role ?? "observador";
  return {
    shadowRole,
    activeRole,
    actions: forRole(shadowRole),
    note:
      shadowRole === activeRole
        ? "Estás viendo tu propio rol: los botones fantasma son los que no puedes firmar ahora."
        : `Modo sombra: miras como «${shadowRole}» sin abandonar tu rol «${activeRole}». No puedes firmar en su nombre desde aquí.`,
  };
}
