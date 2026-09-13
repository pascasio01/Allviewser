import { randomUUID } from "node:crypto";
import { loadCommerceState, saveCommerceState } from "./store";
import { computeBreakdown, lineTotalCents } from "./pricing";
import { assertPermission, canTransition, roleCanSetStatus } from "./roles";
import {
  authorizePaymentSandbox,
  sendNotificationSandbox,
  verifyWebhookSignature,
} from "./integrations";
import { DEMO_CUSTOMER_ID } from "./seed";
import { commerceFeatureFlags, COMMERCE_MODULE } from "./flags";
import type {
  AuditEntry,
  Business,
  BusinessRole,
  Cart,
  CartLine,
  Order,
  OrderStatus,
  Product,
  StaffUser,
  StatusEvent,
  SubstitutionProposal,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function pushAudit(
  list: AuditEntry[],
  actorRole: BusinessRole,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  detail: string,
): void {
  list.unshift({
    id: randomUUID(),
    at: nowIso(),
    actorRole,
    actorId,
    action,
    entityType,
    entityId,
    detail,
  });
  if (list.length > 500) list.length = 500;
}

export function getCommerceModuleInfo() {
  return { ...COMMERCE_MODULE, flags: commerceFeatureFlags };
}

export async function listBusinesses(dataRoot?: string): Promise<Business[]> {
  return (await loadCommerceState(dataRoot)).businesses;
}

export async function getBusiness(id: string, dataRoot?: string): Promise<Business | null> {
  return (await loadCommerceState(dataRoot)).businesses.find((b) => b.id === id) ?? null;
}

export async function listProducts(businessId: string, dataRoot?: string): Promise<Product[]> {
  return (await loadCommerceState(dataRoot)).products.filter((p) => p.businessId === businessId);
}

export async function listStaff(businessId: string, dataRoot?: string): Promise<StaffUser[]> {
  return (await loadCommerceState(dataRoot)).staff.filter((s) => s.businessId === businessId);
}

export async function getOrCreateCart(
  businessId: string,
  customerId = DEMO_CUSTOMER_ID,
  dataRoot?: string,
): Promise<Cart> {
  const state = await loadCommerceState(dataRoot);
  let cart = state.carts.find((c) => c.businessId === businessId && c.customerId === customerId);
  if (!cart) {
    cart = { id: randomUUID(), businessId, customerId, items: [], updatedAt: nowIso() };
    state.carts.push(cart);
    await saveCommerceState(state, dataRoot);
  }
  return cart;
}

export async function addToCart(
  input: {
    businessId: string;
    customerId?: string;
    productId: string;
    quantity: number;
    optionIds?: string[];
    notes?: string;
  },
  dataRoot?: string,
): Promise<Cart> {
  const state = await loadCommerceState(dataRoot);
  const customerId = input.customerId ?? DEMO_CUSTOMER_ID;
  const product = state.products.find(
    (p) => p.id === input.productId && p.businessId === input.businessId,
  );
  if (!product) throw new Error("Producto no encontrado.");
  if (!product.available) throw new Error("Producto no disponible.");
  if (input.quantity < 1) throw new Error("La cantidad debe ser al menos 1.");

  const optionIds = input.optionIds ?? [];
  const optionLabels: string[] = [];
  let optionsDeltaCents = 0;
  for (const optId of optionIds) {
    const opt = product.options.find((o) => o.id === optId);
    if (!opt || !opt.available) throw new Error(`Opción no disponible: ${optId}`);
    optionLabels.push(opt.label);
    optionsDeltaCents += opt.priceDeltaCents;
  }

  let cart = state.carts.find((c) => c.businessId === input.businessId && c.customerId === customerId);
  if (!cart) {
    cart = {
      id: randomUUID(),
      businessId: input.businessId,
      customerId,
      items: [],
      updatedAt: nowIso(),
    };
    state.carts.push(cart);
  }

  const key = (ids: string[]) => JSON.stringify([...ids].sort());
  const same = cart.items.find(
    (i) =>
      i.productId === product.id &&
      key(i.optionIds) === key(optionIds) &&
      (i.notes ?? "") === (input.notes ?? ""),
  );
  if (same) same.quantity += input.quantity;
  else {
    const line: CartLine = {
      id: randomUUID(),
      productId: product.id,
      name: product.name,
      quantity: input.quantity,
      unitPriceCents: product.priceCents,
      optionIds,
      optionLabels,
      optionsDeltaCents,
      notes: input.notes,
    };
    cart.items.push(line);
  }
  cart.updatedAt = nowIso();
  pushAudit(state.audit, "cliente", customerId, "cart.add", "cart", cart.id, product.name);
  await saveCommerceState(state, dataRoot);
  return cart;
}

export async function updateCartItem(
  input: { cartId: string; itemId: string; quantity: number },
  dataRoot?: string,
): Promise<Cart> {
  const state = await loadCommerceState(dataRoot);
  const cart = state.carts.find((c) => c.id === input.cartId);
  if (!cart) throw new Error("Carrito no encontrado.");
  const item = cart.items.find((i) => i.id === input.itemId);
  if (!item) throw new Error("Ítem no encontrado.");
  if (input.quantity <= 0) cart.items = cart.items.filter((i) => i.id !== input.itemId);
  else item.quantity = input.quantity;
  cart.updatedAt = nowIso();
  await saveCommerceState(state, dataRoot);
  return cart;
}

export async function clearCart(cartId: string, dataRoot?: string): Promise<Cart> {
  const state = await loadCommerceState(dataRoot);
  const cart = state.carts.find((c) => c.id === cartId);
  if (!cart) throw new Error("Carrito no encontrado.");
  cart.items = [];
  cart.updatedAt = nowIso();
  await saveCommerceState(state, dataRoot);
  return cart;
}

export async function previewCart(
  businessId: string,
  customerId = DEMO_CUSTOMER_ID,
  dataRoot?: string,
) {
  const state = await loadCommerceState(dataRoot);
  const business = state.businesses.find((b) => b.id === businessId);
  if (!business) throw new Error("Negocio no encontrado.");
  const cart =
    state.carts.find((c) => c.businessId === businessId && c.customerId === customerId) ??
    ({ id: "empty", businessId, customerId, items: [], updatedAt: nowIso() } satisfies Cart);
  const breakdown = cart.items.length
    ? computeBreakdown(cart, business, state.products)
    : {
        subtotalCents: 0,
        deliveryFeeCents: 0,
        taxCents: 0,
        totalCents: 0,
        currency: "MXN" as const,
      };
  return {
    cart,
    business,
    breakdown,
    lineTotals: cart.items.map((i) => ({ id: i.id, total: lineTotalCents(i) })),
  };
}

export async function placeOrder(
  input: {
    businessId: string;
    customerId?: string;
    deliveryAddress: string;
    deliveryNotes?: string;
    idempotencyKey: string;
  },
  dataRoot?: string,
): Promise<Order> {
  const state = await loadCommerceState(dataRoot);
  if (state.processedIdempotencyKeys.includes(input.idempotencyKey)) {
    const existing = state.orders.find((o) => o.idempotencyKey === input.idempotencyKey);
    if (existing) return existing;
  }

  const customerId = input.customerId ?? DEMO_CUSTOMER_ID;
  const business = state.businesses.find((b) => b.id === input.businessId);
  if (!business) throw new Error("Negocio no encontrado.");
  const cart = state.carts.find(
    (c) => c.businessId === input.businessId && c.customerId === customerId,
  );
  if (!cart || cart.items.length === 0) throw new Error("El carrito está vacío.");

  const breakdown = computeBreakdown(cart, business, state.products);
  const payment = authorizePaymentSandbox(breakdown.totalCents, input.idempotencyKey);
  const at = nowIso();
  const firstEvent: StatusEvent = {
    id: randomUUID(),
    status: "pendiente_aceptacion",
    at,
    isEstimate: false,
    message: "Pedido recibido. Pendiente de aceptación por el negocio.",
    actorRole: "cliente",
    actorId: customerId,
  };

  const order: Order = {
    id: randomUUID(),
    businessId: business.id,
    customerId,
    items: structuredClone(cart.items),
    breakdown,
    status: "pendiente_aceptacion",
    timeline: [firstEvent],
    deliveryAddress: input.deliveryAddress.trim(),
    deliveryNotes: input.deliveryNotes,
    deliveryTerms:
      "Condiciones de entrega de demostración: tiempo estimado (no garantizado) 35–50 min. No hay reparto real.",
    idempotencyKey: input.idempotencyKey,
    paymentMode: "sandbox_demo",
    paymentStatus: "autorizacion_simulada",
    substitutions: [],
    receiptId: `rcpt_${randomUUID().slice(0, 8)}`,
    createdAt: at,
    updatedAt: at,
    lastKnownStatusAt: at,
    connectionLost: false,
  };

  state.orders.unshift(order);
  state.processedIdempotencyKeys.push(input.idempotencyKey);
  cart.items = [];
  cart.updatedAt = at;
  pushAudit(state.audit, "cliente", customerId, "order.place", "order", order.id, payment.message);
  sendNotificationSandbox({
    channel: "in_app",
    to: customerId,
    title: "Pedido creado (demo)",
    body: `Pedido ${order.id.slice(0, 8)} pendiente de aceptación. No se cobró dinero real.`,
  });
  await saveCommerceState(state, dataRoot);
  return order;
}

export async function getOrder(orderId: string, dataRoot?: string): Promise<Order | null> {
  return (await loadCommerceState(dataRoot)).orders.find((o) => o.id === orderId) ?? null;
}

export async function listOrders(
  filter: { businessId?: string; customerId?: string },
  dataRoot?: string,
): Promise<Order[]> {
  return (await loadCommerceState(dataRoot)).orders.filter((o) => {
    if (filter.businessId && o.businessId !== filter.businessId) return false;
    if (filter.customerId && o.customerId !== filter.customerId) return false;
    return true;
  });
}

export async function updateOrderStatus(
  input: {
    orderId: string;
    status: OrderStatus;
    actorId: string;
    message?: string;
    isEstimate?: boolean;
  },
  dataRoot?: string,
): Promise<Order> {
  const state = await loadCommerceState(dataRoot);
  const order = state.orders.find((o) => o.id === input.orderId);
  if (!order) throw new Error("Pedido no encontrado.");
  const actor = state.staff.find((s) => s.id === input.actorId);
  if (!actor) throw new Error("Usuario no encontrado.");
  if (!canTransition(order.status, input.status)) {
    throw new Error(`Transición inválida: ${order.status} → ${input.status}`);
  }
  if (!roleCanSetStatus(actor.role, input.status)) {
    throw new Error(`El rol «${actor.role}» no puede establecer el estado «${input.status}».`);
  }
  if (input.status === "cancelado" && actor.role === "cliente" && order.customerId !== actor.id) {
    throw new Error("Solo el cliente del pedido puede cancelarlo.");
  }

  const at = nowIso();
  order.status = input.status;
  order.updatedAt = at;
  order.lastKnownStatusAt = at;
  order.connectionLost = false;
  order.timeline.push({
    id: randomUUID(),
    status: input.status,
    at,
    isEstimate: Boolean(input.isEstimate),
    message: input.message ?? `Estado actualizado a ${input.status}`,
    actorRole: actor.role,
    actorId: actor.id,
  });
  if (input.status === "cancelado" || input.status === "rechazado") {
    order.paymentStatus = "reembolsado_simulado";
  }
  pushAudit(state.audit, actor.role, actor.id, "order.status", "order", order.id, input.status);
  sendNotificationSandbox({
    channel: "in_app",
    to: order.customerId,
    title: "Actualización de pedido",
    body: input.message ?? `Nuevo estado: ${input.status}`,
  });
  await saveCommerceState(state, dataRoot);
  return order;
}

export async function setConnectionLost(
  orderId: string,
  lost: boolean,
  dataRoot?: string,
): Promise<Order> {
  const state = await loadCommerceState(dataRoot);
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) throw new Error("Pedido no encontrado.");
  order.connectionLost = lost;
  order.updatedAt = nowIso();
  await saveCommerceState(state, dataRoot);
  return order;
}

export async function setProductAvailability(
  input: { productId: string; available: boolean; actorId: string },
  dataRoot?: string,
): Promise<Product> {
  const state = await loadCommerceState(dataRoot);
  const actor = state.staff.find((s) => s.id === input.actorId);
  if (!actor) throw new Error("Usuario no encontrado.");
  assertPermission(actor.role, "product.availability", ["administrador", "preparacion"]);
  const product = state.products.find((p) => p.id === input.productId);
  if (!product) throw new Error("Producto no encontrado.");
  product.available = input.available;
  pushAudit(
    state.audit,
    actor.role,
    actor.id,
    "product.availability",
    "product",
    product.id,
    input.available ? "disponible" : "agotado",
  );
  await saveCommerceState(state, dataRoot);
  return product;
}

export async function updateProductPrice(
  input: { productId: string; priceCents: number; actorId: string },
  dataRoot?: string,
): Promise<Product> {
  const state = await loadCommerceState(dataRoot);
  const actor = state.staff.find((s) => s.id === input.actorId);
  if (!actor) throw new Error("Usuario no encontrado.");
  assertPermission(actor.role, "product.price", ["administrador"]);
  const product = state.products.find((p) => p.id === input.productId);
  if (!product) throw new Error("Producto no encontrado.");
  if (input.priceCents < 0) throw new Error("Precio inválido.");
  product.priceCents = input.priceCents;
  pushAudit(
    state.audit,
    actor.role,
    actor.id,
    "product.price",
    "product",
    product.id,
    String(input.priceCents),
  );
  await saveCommerceState(state, dataRoot);
  return product;
}

export async function proposeSubstitution(
  input: {
    orderId: string;
    orderItemId: string;
    proposedProductId: string;
    actorId: string;
  },
  dataRoot?: string,
): Promise<Order> {
  const state = await loadCommerceState(dataRoot);
  const actor = state.staff.find((s) => s.id === input.actorId);
  if (!actor) throw new Error("Usuario no encontrado.");
  assertPermission(actor.role, "order.substitute", ["administrador", "preparacion"]);
  const order = state.orders.find((o) => o.id === input.orderId);
  if (!order) throw new Error("Pedido no encontrado.");
  const item = order.items.find((i) => i.id === input.orderItemId);
  if (!item) throw new Error("Ítem del pedido no encontrado.");
  const proposed = state.products.find((p) => p.id === input.proposedProductId);
  if (!proposed || !proposed.available) throw new Error("Producto propuesto no disponible.");

  const priceDeltaCents = proposed.priceCents - item.unitPriceCents;
  const proposal: SubstitutionProposal = {
    id: randomUUID(),
    orderItemId: item.id,
    originalProductId: item.productId,
    proposedProductId: proposed.id,
    proposedName: proposed.name,
    priceDeltaCents,
    status: "pendiente_cliente",
    requiresPaymentConfirmation: priceDeltaCents !== 0,
    createdAt: nowIso(),
  };
  order.substitutions.push(proposal);
  order.updatedAt = nowIso();
  pushAudit(
    state.audit,
    actor.role,
    actor.id,
    "order.substitute.propose",
    "order",
    order.id,
    proposed.name,
  );
  await saveCommerceState(state, dataRoot);
  return order;
}

export async function resolveSubstitution(
  input: {
    orderId: string;
    substitutionId: string;
    accept: boolean;
    customerId?: string;
  },
  dataRoot?: string,
): Promise<Order> {
  const state = await loadCommerceState(dataRoot);
  const order = state.orders.find((o) => o.id === input.orderId);
  if (!order) throw new Error("Pedido no encontrado.");
  const customerId = input.customerId ?? DEMO_CUSTOMER_ID;
  if (order.customerId !== customerId) {
    throw new Error("Solo el cliente puede confirmar la sustitución.");
  }
  const sub = order.substitutions.find((s) => s.id === input.substitutionId);
  if (!sub || sub.status !== "pendiente_cliente") throw new Error("Sustitución no pendiente.");

  if (!input.accept) {
    sub.status = "rechazada";
    sub.resolvedAt = nowIso();
    order.updatedAt = nowIso();
    await saveCommerceState(state, dataRoot);
    return order;
  }

  const proposed = state.products.find((p) => p.id === sub.proposedProductId);
  if (!proposed) throw new Error("Producto propuesto desapareció.");
  const item = order.items.find((i) => i.id === sub.orderItemId);
  if (!item) throw new Error("Ítem no encontrado.");

  item.productId = proposed.id;
  item.name = proposed.name;
  item.unitPriceCents = proposed.priceCents;
  item.optionIds = [];
  item.optionLabels = [];
  item.optionsDeltaCents = 0;

  const business = state.businesses.find((b) => b.id === order.businessId)!;
  const pseudoCart: Cart = {
    id: "recalc",
    businessId: order.businessId,
    customerId: order.customerId,
    items: order.items,
    updatedAt: nowIso(),
  };
  order.breakdown = computeBreakdown(pseudoCart, business, state.products);
  sub.status = "aceptada";
  sub.resolvedAt = nowIso();
  order.updatedAt = nowIso();
  pushAudit(
    state.audit,
    "cliente",
    customerId,
    "order.substitute.accept",
    "order",
    order.id,
    proposed.name,
  );
  await saveCommerceState(state, dataRoot);
  return order;
}

export async function listAudit(businessId: string, dataRoot?: string): Promise<AuditEntry[]> {
  const state = await loadCommerceState(dataRoot);
  const productIds = new Set(
    state.products.filter((p) => p.businessId === businessId).map((p) => p.id),
  );
  const orderIds = new Set(state.orders.filter((o) => o.businessId === businessId).map((o) => o.id));
  return state.audit.filter(
    (a) =>
      (a.entityType === "order" && orderIds.has(a.entityId)) ||
      (a.entityType === "product" && productIds.has(a.entityId)) ||
      (a.entityType === "cart" &&
        state.carts.some((c) => c.id === a.entityId && c.businessId === businessId)),
  );
}

export async function processWebhookEvent(
  input: { eventId: string; signature: string; body: string; occurredAt: string },
  dataRoot?: string,
): Promise<{ accepted: boolean; duplicate: boolean; reason?: string }> {
  if (!verifyWebhookSignature(input.body, input.signature)) {
    return { accepted: false, duplicate: false, reason: "Firma inválida" };
  }
  const state = await loadCommerceState(dataRoot);
  if (state.processedWebhookEvents.some((e) => e.id === input.eventId)) {
    return { accepted: true, duplicate: true, reason: "Evento ya procesado (idempotente)" };
  }
  state.processedWebhookEvents.push({
    id: input.eventId,
    signature: input.signature,
    at: input.occurredAt,
  });
  await saveCommerceState(state, dataRoot);
  return { accepted: true, duplicate: false };
}
