export type MediaKind =
  | "fotografia"
  | "video"
  | "modelo_3d"
  | "grabacion"
  | "reconstruccion"
  | "transmision_en_vivo"
  | "animacion_estado";

export type MediaAsset = {
  id: string;
  kind: MediaKind;
  url: string;
  caption: string;
  authorized: boolean;
  source?: string;
  capturedAt?: string;
};

export type BusinessRole = "administrador" | "preparacion" | "reparto" | "cliente";

export type OrderStatus =
  | "pendiente_aceptacion"
  | "aceptado"
  | "preparando"
  | "listo_para_recoger"
  | "en_reparto"
  | "entregado"
  | "rechazado"
  | "cancelado"
  | "retrasado"
  | "entrega_fallida";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente_aceptacion: "Pendiente de aceptación",
  aceptado: "Aceptado",
  preparando: "Preparando",
  listo_para_recoger: "Listo para recoger",
  en_reparto: "En reparto",
  entregado: "Entregado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  retrasado: "Retrasado",
  entrega_fallida: "Entrega fallida",
};

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  fotografia: "Fotografía",
  video: "Video",
  modelo_3d: "Modelo 3D",
  grabacion: "Grabación",
  reconstruccion: "Reconstrucción",
  transmision_en_vivo: "Transmisión en vivo",
  animacion_estado: "Animación de estado (no es imagen real)",
};

export type ProductOption = {
  id: string;
  label: string;
  priceDeltaCents: number;
  available: boolean;
};

export type Product = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  priceCents: number;
  currency: "MXN";
  available: boolean;
  ingredients: string[];
  allergenNotesFromBusiness?: string;
  allergenDisclaimer: string;
  quantityUnit: string;
  category: string;
  options: ProductOption[];
  media: MediaAsset[];
};

export type BusinessHours = { day: number; open: string; close: string };

export type Business = {
  id: string;
  name: string;
  slug: string;
  kind: "restaurante" | "tienda";
  fictional: boolean;
  fictionalBanner: string;
  description: string;
  address: string;
  timezone: string;
  hours: BusinessHours[];
  media: MediaAsset[];
  virtualTourAvailable: boolean;
  deliveryFeeCents: number;
  minOrderCents: number;
  supportContact?: string;
};

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  optionIds: string[];
  optionLabels: string[];
  optionsDeltaCents: number;
  notes?: string;
};

export type Cart = {
  id: string;
  businessId: string;
  customerId: string;
  items: CartLine[];
  updatedAt: string;
};

export type MoneyBreakdown = {
  subtotalCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  totalCents: number;
  currency: "MXN";
};

export type StatusEvent = {
  id: string;
  status: OrderStatus;
  at: string;
  isEstimate: boolean;
  message: string;
  actorRole?: BusinessRole;
  actorId?: string;
};

export type SubstitutionProposal = {
  id: string;
  orderItemId: string;
  originalProductId: string;
  proposedProductId: string;
  proposedName: string;
  priceDeltaCents: number;
  status: "pendiente_cliente" | "aceptada" | "rechazada";
  requiresPaymentConfirmation: boolean;
  createdAt: string;
  resolvedAt?: string;
};

export type Order = {
  id: string;
  businessId: string;
  customerId: string;
  items: CartLine[];
  breakdown: MoneyBreakdown;
  status: OrderStatus;
  timeline: StatusEvent[];
  deliveryAddress: string;
  deliveryNotes?: string;
  deliveryTerms: string;
  idempotencyKey: string;
  paymentMode: "sandbox_demo";
  paymentStatus: "no_cobrado" | "autorizacion_simulada" | "reembolsado_simulado";
  substitutions: SubstitutionProposal[];
  receiptId?: string;
  createdAt: string;
  updatedAt: string;
  lastKnownStatusAt: string;
  connectionLost: boolean;
};

export type AuditEntry = {
  id: string;
  at: string;
  actorRole: BusinessRole;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string;
};

export type StaffUser = {
  id: string;
  name: string;
  role: BusinessRole;
  businessId: string;
};

export type CommerceState = {
  businesses: Business[];
  products: Product[];
  staff: StaffUser[];
  carts: Cart[];
  orders: Order[];
  audit: AuditEntry[];
  processedIdempotencyKeys: string[];
  processedWebhookEvents: { id: string; signature: string; at: string }[];
};

export function formatMoney(cents: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(cents / 100);
}
