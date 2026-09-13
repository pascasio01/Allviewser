import { NextResponse } from "next/server";
import {
  COMMERCE_MODULE,
  DEMO_BUSINESS_ID,
  DEMO_CUSTOMER_ID,
  addToCart,
  clearCart,
  commerceFeatureFlags,
  getBusiness,
  getCommerceModuleInfo,
  getCourierLocationSandbox,
  getOrder,
  getOrCreateCart,
  listAudit,
  listBusinesses,
  listOrders,
  listProducts,
  listStaff,
  placeOrder,
  previewCart,
  processWebhookEvent,
  proposeSubstitution,
  resetCommerceDemo,
  resolveSubstitution,
  setConnectionLost,
  setProductAvailability,
  signWebhookEvent,
  updateCartItem,
  updateOrderStatus,
  updateProductPrice,
} from "@/lib/commerce";

export const runtime = "nodejs";

function err(e: unknown, status = 400) {
  return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status });
}

export async function GET(req: Request) {
  try {
    if (!commerceFeatureFlags.enabled) {
      return NextResponse.json({ error: "Módulo de comercio desactivado." }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") ?? "info";

    switch (action) {
      case "info":
        return NextResponse.json({ module: getCommerceModuleInfo() });
      case "businesses":
        return NextResponse.json({ businesses: await listBusinesses() });
      case "business": {
        const id = searchParams.get("id") ?? DEMO_BUSINESS_ID;
        return NextResponse.json({ business: await getBusiness(id) });
      }
      case "products": {
        const businessId = searchParams.get("businessId") ?? DEMO_BUSINESS_ID;
        return NextResponse.json({ products: await listProducts(businessId) });
      }
      case "staff": {
        const businessId = searchParams.get("businessId") ?? DEMO_BUSINESS_ID;
        return NextResponse.json({ staff: await listStaff(businessId) });
      }
      case "cart": {
        const businessId = searchParams.get("businessId") ?? DEMO_BUSINESS_ID;
        const customerId = searchParams.get("customerId") ?? DEMO_CUSTOMER_ID;
        return NextResponse.json(await previewCart(businessId, customerId));
      }
      case "orders": {
        return NextResponse.json({
          orders: await listOrders({
            businessId: searchParams.get("businessId") ?? undefined,
            customerId: searchParams.get("customerId") ?? undefined,
          }),
        });
      }
      case "order": {
        const id = searchParams.get("id");
        if (!id) return err("id requerido");
        return NextResponse.json({
          order: await getOrder(id),
          courier: getCourierLocationSandbox(),
        });
      }
      case "audit": {
        const businessId = searchParams.get("businessId") ?? DEMO_BUSINESS_ID;
        return NextResponse.json({ audit: await listAudit(businessId) });
      }
      default:
        return err(`Acción GET desconocida: ${action}`);
    }
  } catch (e) {
    return err(e, 500);
  }
}

export async function POST(req: Request) {
  try {
    if (!commerceFeatureFlags.enabled) {
      return NextResponse.json({ error: "Módulo de comercio desactivado." }, { status: 503 });
    }
    const body = await req.json();
    const action = body.action as string;

    switch (action) {
      case "reset_demo":
        return NextResponse.json({ state: await resetCommerceDemo(), module: COMMERCE_MODULE });
      case "add_to_cart":
        return NextResponse.json({
          cart: await addToCart({
            businessId: body.businessId ?? DEMO_BUSINESS_ID,
            customerId: body.customerId,
            productId: body.productId,
            quantity: body.quantity ?? 1,
            optionIds: body.optionIds,
            notes: body.notes,
          }),
        });
      case "update_cart_item":
        return NextResponse.json({
          cart: await updateCartItem({
            cartId: body.cartId,
            itemId: body.itemId,
            quantity: body.quantity,
          }),
        });
      case "clear_cart":
        return NextResponse.json({ cart: await clearCart(body.cartId) });
      case "ensure_cart":
        return NextResponse.json({
          cart: await getOrCreateCart(body.businessId ?? DEMO_BUSINESS_ID, body.customerId),
        });
      case "place_order":
        return NextResponse.json({
          order: await placeOrder({
            businessId: body.businessId ?? DEMO_BUSINESS_ID,
            customerId: body.customerId,
            deliveryAddress: body.deliveryAddress,
            deliveryNotes: body.deliveryNotes,
            idempotencyKey: body.idempotencyKey,
          }),
        });
      case "update_status":
        return NextResponse.json({
          order: await updateOrderStatus({
            orderId: body.orderId,
            status: body.status,
            actorId: body.actorId,
            message: body.message,
            isEstimate: body.isEstimate,
          }),
        });
      case "set_connection_lost":
        return NextResponse.json({
          order: await setConnectionLost(body.orderId, Boolean(body.lost)),
        });
      case "set_availability":
        return NextResponse.json({
          product: await setProductAvailability({
            productId: body.productId,
            available: Boolean(body.available),
            actorId: body.actorId,
          }),
        });
      case "update_price":
        return NextResponse.json({
          product: await updateProductPrice({
            productId: body.productId,
            priceCents: body.priceCents,
            actorId: body.actorId,
          }),
        });
      case "propose_substitution":
        return NextResponse.json({
          order: await proposeSubstitution({
            orderId: body.orderId,
            orderItemId: body.orderItemId,
            proposedProductId: body.proposedProductId,
            actorId: body.actorId,
          }),
        });
      case "resolve_substitution":
        return NextResponse.json({
          order: await resolveSubstitution({
            orderId: body.orderId,
            substitutionId: body.substitutionId,
            accept: Boolean(body.accept),
            customerId: body.customerId,
          }),
        });
      case "webhook": {
        const payload = JSON.stringify(body.payload ?? {});
        const signature = body.signature ?? signWebhookEvent(payload);
        return NextResponse.json(
          await processWebhookEvent({
            eventId: body.eventId,
            signature,
            body: payload,
            occurredAt: body.occurredAt ?? new Date().toISOString(),
          }),
        );
      }
      default:
        return err(`Acción POST desconocida: ${action}`);
    }
  } catch (e) {
    return err(e);
  }
}
