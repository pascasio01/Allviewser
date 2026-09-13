/**
 * Etiquetas de procedencia de datos / vistas.
 * Un modelo 3D no es cámara en vivo; un filtro térmico no es medición real.
 */

export const PROVENANCE_KINDS = [
  "en_vivo",
  "periodico",
  "grabado",
  "estimado",
  "simulado",
  "generado",
] as const;

export type ProvenanceKind = (typeof PROVENANCE_KINDS)[number];

export type ProvenanceLabel = {
  kind: ProvenanceKind;
  /** Origen humano-legible (inventario, semilla, proveedor, etc.). */
  source?: string;
  /** Última actualización conocida (ISO o fecha corta). */
  updatedAt?: string;
  /** Nota breve cuando el dato no equivale a medición física. */
  caveat?: string;
};

export const PROVENANCE_LABELS_ES: Record<ProvenanceKind, string> = {
  en_vivo: "En vivo",
  periodico: "Actualización periódica",
  grabado: "Grabado",
  estimado: "Estimado",
  simulado: "Simulado",
  generado: "Generado",
};

export const PROVENANCE_LABELS_EN: Record<ProvenanceKind, string> = {
  en_vivo: "Live",
  periodico: "Periodic update",
  grabado: "Recorded",
  estimado: "Estimated",
  simulado: "Simulated",
  generado: "Generated",
};

/** Semilla / inventario demo: nunca «en vivo». */
export function demoInventoryProvenance(source: string, asOf: string): ProvenanceLabel {
  return {
    kind: "simulado",
    source,
    updatedAt: asOf,
    caveat: "Inventario de demostración. No representa sensores ni actividad operativa real.",
  };
}

export function formatProvenance(label: ProvenanceLabel, locale: "es" | "en" = "es"): string {
  const map = locale === "en" ? PROVENANCE_LABELS_EN : PROVENANCE_LABELS_ES;
  const parts = [map[label.kind]];
  if (label.source) parts.push(label.source);
  if (label.updatedAt) parts.push(label.updatedAt);
  return parts.join(" · ");
}
