import type { BusinessRole, OrderStatus } from "./types";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente_aceptacion: ["aceptado", "rechazado", "cancelado"],
  aceptado: ["preparando", "cancelado", "retrasado"],
  preparando: ["listo_para_recoger", "cancelado", "retrasado"],
  listo_para_recoger: ["en_reparto", "entregado", "cancelado", "retrasado"],
  en_reparto: ["entregado", "entrega_fallida", "retrasado"],
  retrasado: [
    "aceptado",
    "preparando",
    "listo_para_recoger",
    "en_reparto",
    "entregado",
    "cancelado",
    "entrega_fallida",
  ],
  entregado: [],
  rechazado: [],
  cancelado: [],
  entrega_fallida: [],
};

const ROLE_FOR_STATUS: Partial<Record<OrderStatus, BusinessRole[]>> = {
  aceptado: ["administrador", "preparacion"],
  rechazado: ["administrador", "preparacion"],
  preparando: ["administrador", "preparacion"],
  listo_para_recoger: ["administrador", "preparacion"],
  en_reparto: ["administrador", "reparto"],
  entregado: ["administrador", "reparto"],
  entrega_fallida: ["administrador", "reparto"],
  retrasado: ["administrador", "preparacion", "reparto"],
  cancelado: ["administrador", "cliente", "preparacion"],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function roleCanSetStatus(role: BusinessRole, to: OrderStatus): boolean {
  if (role === "administrador") return true;
  const allowed = ROLE_FOR_STATUS[to];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function assertPermission(role: BusinessRole, action: string, allowed: BusinessRole[]): void {
  if (role === "administrador") return;
  if (!allowed.includes(role)) {
    throw new Error(`Permiso denegado para rol «${role}» en acción «${action}».`);
  }
}
