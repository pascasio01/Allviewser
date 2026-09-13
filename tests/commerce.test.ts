import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEMO_BUSINESS_ID,
  DEMO_CUSTOMER_ID,
  addToCart,
  listProducts,
  placeOrder,
  previewCart,
  processWebhookEvent,
  proposeSubstitution,
  resetCommerceDemo,
  resolveSubstitution,
  setConnectionLost,
  setProductAvailability,
  signWebhookEvent,
  updateOrderStatus,
} from "@/lib/commerce";

describe("módulo comercio inmersivo", () => {
  let root: string;

  beforeEach(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "commerce-"));
    await resetCommerceDemo(root);
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("calcula importes con personalización", async () => {
    const products = await listProducts(DEMO_BUSINESS_ID, root);
    const torta = products[0];
    const opt = torta.options[0];
    await addToCart(
      {
        businessId: DEMO_BUSINESS_ID,
        productId: torta.id,
        quantity: 2,
        optionIds: opt ? [opt.id] : [],
      },
      root,
    );
    const preview = await previewCart(DEMO_BUSINESS_ID, DEMO_CUSTOMER_ID, root);
    expect(preview.cart.items).toHaveLength(1);
    expect(preview.breakdown.totalCents).toBeGreaterThan(preview.breakdown.subtotalCents);
  });

  it("idempotencia al crear pedidos", async () => {
    const products = await listProducts(DEMO_BUSINESS_ID, root);
    await addToCart({ businessId: DEMO_BUSINESS_ID, productId: products[0].id, quantity: 1 }, root);
    await addToCart({ businessId: DEMO_BUSINESS_ID, productId: products[1].id, quantity: 1 }, root);
    const key = "same-key";
    const a = await placeOrder(
      { businessId: DEMO_BUSINESS_ID, deliveryAddress: "Calle 1", idempotencyKey: key },
      root,
    );
    const b = await placeOrder(
      { businessId: DEMO_BUSINESS_ID, deliveryAddress: "Calle 1", idempotencyKey: key },
      root,
    );
    expect(a.id).toBe(b.id);
  });

  it("flujo de estados y permisos por rol", async () => {
    const products = await listProducts(DEMO_BUSINESS_ID, root);
    await addToCart({ businessId: DEMO_BUSINESS_ID, productId: products[0].id, quantity: 2 }, root);
    await addToCart({ businessId: DEMO_BUSINESS_ID, productId: products[1].id, quantity: 1 }, root);
    const order = await placeOrder(
      { businessId: DEMO_BUSINESS_ID, deliveryAddress: "Calle 2", idempotencyKey: "flow-1" },
      root,
    );
    await updateOrderStatus({ orderId: order.id, status: "aceptado", actorId: "staff-admin" }, root);
    await expect(
      updateOrderStatus({ orderId: order.id, status: "preparando", actorId: "staff-delivery" }, root),
    ).rejects.toThrow(/rol/i);
    const preparing = await updateOrderStatus(
      { orderId: order.id, status: "preparando", actorId: "staff-kitchen" },
      root,
    );
    expect(preparing.status).toBe("preparando");
  });

  it("sustitución, desconexión y cancelación", async () => {
    const products = await listProducts(DEMO_BUSINESS_ID, root);
    await addToCart({ businessId: DEMO_BUSINESS_ID, productId: products[0].id, quantity: 1 }, root);
    await addToCart({ businessId: DEMO_BUSINESS_ID, productId: products[1].id, quantity: 1 }, root);
    const order = await placeOrder(
      { businessId: DEMO_BUSINESS_ID, deliveryAddress: "Calle 3", idempotencyKey: "sub-1" },
      root,
    );
    await updateOrderStatus({ orderId: order.id, status: "aceptado", actorId: "staff-kitchen" }, root);
    const withSub = await proposeSubstitution(
      {
        orderId: order.id,
        orderItemId: order.items[0].id,
        proposedProductId: products[2].id,
        actorId: "staff-kitchen",
      },
      root,
    );
    expect(withSub.substitutions[0].status).toBe("pendiente_cliente");
    const resolved = await resolveSubstitution(
      { orderId: order.id, substitutionId: withSub.substitutions[0].id, accept: true },
      root,
    );
    expect(resolved.substitutions[0].status).toBe("aceptada");

    const lost = await setConnectionLost(order.id, true, root);
    expect(lost.connectionLost).toBe(true);
    expect(lost.lastKnownStatusAt).toBeTruthy();

    await addToCart({ businessId: DEMO_BUSINESS_ID, productId: products[0].id, quantity: 2 }, root);
    const cancelable = await placeOrder(
      { businessId: DEMO_BUSINESS_ID, deliveryAddress: "Calle 4", idempotencyKey: "cancel-1" },
      root,
    );
    const cancelled = await updateOrderStatus(
      {
        orderId: cancelable.id,
        status: "cancelado",
        actorId: DEMO_CUSTOMER_ID,
        message: "Cancelado por el cliente",
      },
      root,
    );
    expect(cancelled.status).toBe("cancelado");
  });

  it("disponibilidad y webhooks firmados sin duplicados", async () => {
    const products = await listProducts(DEMO_BUSINESS_ID, root);
    const last = products[products.length - 1];
    await setProductAvailability({ productId: last.id, available: false, actorId: "staff-admin" }, root);
    await expect(
      addToCart({ businessId: DEMO_BUSINESS_ID, productId: last.id, quantity: 1 }, root),
    ).rejects.toThrow(/disponible|agotado/i);

    const body = JSON.stringify({ type: "ping" });
    const signature = signWebhookEvent(body);
    const first = await processWebhookEvent(
      { eventId: "evt-1", signature, body, occurredAt: new Date().toISOString() },
      root,
    );
    const second = await processWebhookEvent(
      { eventId: "evt-1", signature, body, occurredAt: new Date().toISOString() },
      root,
    );
    expect(first.accepted).toBe(true);
    expect(first.duplicate).toBeFalsy();
    expect(second.duplicate).toBe(true);
    const bad = await processWebhookEvent(
      { eventId: "evt-2", signature: "bad", body, occurredAt: new Date().toISOString() },
      root,
    );
    expect(bad.accepted).toBe(false);
  });
});
