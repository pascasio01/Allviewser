/** Módulo Espacio — aislado del núcleo y del comercio. Demo sin obras/pagos/reservas reales. */
export const spaceFeatureFlags = {
  enabled: true,
  demoMode: true,
  immersive3d: false,
  realWorkOrders: false,
  realBookings: false,
  realPayments: false,
  recordSharedAudioByDefault: false,
  extensionsEnabled: true,
} as const;

export type SpaceFeatureFlags = typeof spaceFeatureFlags;

export const SPACE_MODULE = {
  id: "space-maintenance",
  version: "0.2.0-demo",
  phase: "roadmap-space-v1",
  isolatedFromAgentCore: true,
  isolatedFromCommerce: true,
  demoDisclaimer:
    "Demostración con edificio ficticio. Incidencias y borradores son de prueba; no autorizan obras ni compras reales.",
  platform:
    "Aplicación web (Next.js) en navegador. No es app nativa iOS/Android/desktop.",
} as const;
