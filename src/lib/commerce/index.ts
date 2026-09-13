/**
 * Módulo de comercio inmersivo y seguimiento visual.
 * Separado del núcleo del agente (conversación, tareas, memoria, taller).
 */
export { commerceFeatureFlags, COMMERCE_MODULE } from "./flags";
export * from "./types";
export {
  DEMO_BUSINESS_ID,
  DEMO_CUSTOMER_ID,
  demoBusiness,
  demoProducts,
  demoStaff,
} from "./seed";
export { resetCommerceDemo, loadCommerceState } from "./store";
export {
  getCommerceModuleInfo,
  listBusinesses,
  getBusiness,
  listProducts,
  listStaff,
  getOrCreateCart,
  addToCart,
  updateCartItem,
  clearCart,
  previewCart,
  placeOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  setConnectionLost,
  setProductAvailability,
  updateProductPrice,
  proposeSubstitution,
  resolveSubstitution,
  listAudit,
  processWebhookEvent,
} from "./service";
export {
  authorizePaymentSandbox,
  sendNotificationSandbox,
  getCourierLocationSandbox,
  signWebhookEvent,
  verifyWebhookSignature,
} from "./integrations";
