import { createHmac, randomUUID } from "node:crypto";
import { commerceFeatureFlags } from "./flags";

export type SandboxPaymentResult = {
  mode: "sandbox";
  charged: false;
  authorizationId: string;
  message: string;
};

export function authorizePaymentSandbox(
  amountCents: number,
  idempotencyKey: string,
): SandboxPaymentResult {
  if (commerceFeatureFlags.realPayments) {
    throw new Error("Pagos reales no están habilitados en esta versión.");
  }
  return {
    mode: "sandbox",
    charged: false,
    authorizationId: `sandbox_auth_${idempotencyKey.slice(0, 8)}_${amountCents}`,
    message: "Autorización simulada. No se cobró ningún importe real.",
  };
}

export type NotificationPayload = {
  channel: "in_app" | "email_sandbox" | "push_sandbox";
  to: string;
  title: string;
  body: string;
  at: string;
};

const notificationLog: NotificationPayload[] = [];

export function sendNotificationSandbox(
  input: Omit<NotificationPayload, "at">,
): NotificationPayload {
  const note: NotificationPayload = { ...input, at: new Date().toISOString() };
  notificationLog.push(note);
  return note;
}

export function listSandboxNotifications(): NotificationPayload[] {
  return [...notificationLog];
}

export function getCourierLocationSandbox(): {
  available: false;
  reason: string;
} {
  if (commerceFeatureFlags.realDelivery) {
    throw new Error("Reparto real no habilitado.");
  }
  return {
    available: false,
    reason:
      "La ubicación del repartidor solo estará disponible con permiso autorizado y durante el servicio. En demo permanece desactivada.",
  };
}

const WEBHOOK_SECRET =
  process.env.COMMERCE_WEBHOOK_SECRET ?? "demo-webhook-secret-not-for-production";

export function signWebhookEvent(body: string): string {
  return createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  return signWebhookEvent(body) === signature;
}

export function newEventId(): string {
  return `evt_${randomUUID()}`;
}
