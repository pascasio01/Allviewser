/**
 * Continuidad remota: servicio separado (interfaz).
 * Una máquina apagada no ejecuta tareas.
 */
export type RemoteContinuityConfig = {
  enabled: boolean;
  endpoint?: string;
  auth: "mutual-tls" | "bearer-env" | "none";
  encryptInTransit: true;
  syncSecrets: false;
  conflictPolicy: "last-write-wins-with-manual-review" | "manual-only";
};

export const remoteServiceContract = {
  name: "companero-remote-continuity",
  version: "0.1.0-interface",
  requirements: [
    "Servidor o dispositivo autorizado activo",
    "Autenticación y TLS",
    "Cola de trabajos con idempotencia para evitar duplicados entre dispositivos",
    "No sincronizar secretos ni datos privados indiscriminadamente",
  ],
  limitations: [
    "Sin servidor activo no hay continuidad",
    "Conflictos requieren revisión cuando ambos lados modifican el mismo recurso",
  ],
} as const;

export function remoteStatus(enabled: boolean, endpoint?: string) {
  if (!enabled || !endpoint) {
    return {
      available: false as const,
      message:
        "Continuidad remota no configurada. Solo promete continuidad si existe un servidor autorizado activo.",
    };
  }
  return {
    available: false as const,
    message:
      "Interfaz definida; el servicio remoto aún no está desplegado en esta versión. Endpoint declarado pero no verificado.",
    endpoint,
  };
}
