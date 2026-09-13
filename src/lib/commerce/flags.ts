/**
 * Módulo de comercio inmersivo — independiente del núcleo del agente.
 * Activación por etapas. Sin cobros ni repartos reales en demo.
 */
export const commerceFeatureFlags = {
  enabled: true,
  demoMode: true,
  virtualTour3d: false,
  arPreview: false,
  liveKitchen: false,
  virtualHost: false,
  realPayments: false,
  realDelivery: false,
} as const;

export type CommerceFeatureFlags = typeof commerceFeatureFlags;

export const COMMERCE_MODULE = {
  id: "immersive-commerce",
  version: "0.1.0-demo",
  phase: "roadmap-commerce-v1",
  isolatedFromAgentCore: true,
  demoDisclaimer:
    "Demostración con negocio ficticio. No se realizan cobros ni repartos reales.",
} as const;
