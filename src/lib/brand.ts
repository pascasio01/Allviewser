/**
 * Identidad de marca centralizada.
 *
 * Separación deliberada:
 * - Identidad pública (publicName, shortName, logoPath, tagline) → cambia sin migrar datos.
 * - Identificadores internos estables (internalProductId / productCode) → anclan persistencia.
 * - repositoryName → nombre provisional del repo; no renombrar remotos sin autorización.
 *
 * No usar ®/™ ni afirmar exclusividad legal sin evidencia.
 * Investigación: docs/brand-review.md
 */

export type BrandLegalStatus =
  | "provisional_unverified"
  | "under_review"
  | "cleared_for_use"
  | "do_not_use";

const INTERNAL_PRODUCT_ID = "companero-digital";
const PUBLIC_NAME = "Compañero Digital — Proyecto Independiente";

export const brand = {
  publicName: PUBLIC_NAME,
  /** Alias legado (Shell, layout). */
  provisionalName: PUBLIC_NAME,
  shortName: "Compañero Digital",
  description:
    "Aplicación web local-first: conversación, proyectos, memoria, tareas, taller, comercio demo y espacio de mantenimiento.",
  tagline:
    "Un compañero que te guía con honestidad: explora, crea, resuelve y revisa — sin fingir lo que no hay.",
  internalProductId: INTERNAL_PRODUCT_ID,
  /** Alias legado (paths, marker). */
  productCode: INTERNAL_PRODUCT_ID,
  repositoryName: "Allviewser",
  repositoryOwner: "pascasio01",
  logoPath: "/brand/logo.svg",
  legalStatus: "provisional_unverified" as BrandLegalStatus,
  provisionalNotice:
    "Nombre comercial e identidad visual provisionales. No se afirma registro de marca ni exclusividad legal. Ver docs/brand-review.md.",
  founder: {
    name: "Pascasio Emmanuel Reynoso Reyes",
    role: "Creador, fundador y CEO",
    github: "pascasio01",
  },
  version: "0.2.4",
  status: "primera-version-funcional" as const,
  alternateCandidates: ["Brainluk"] as const,
};

export type Brand = typeof brand;

export function repositoryUrl(): string {
  return `https://github.com/${brand.repositoryOwner}/${brand.repositoryName}`;
}

export function displayAttribution(): string {
  return `${brand.founder.role}: ${brand.founder.name}`;
}
