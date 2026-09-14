/**
 * Marca centralizada. El nombre comercial está pendiente de verificación.
 * Cambiar aquí actualiza la identidad visible de la aplicación.
 */
export const brand = {
  provisionalName: "Allviewser — Compañero Digital",
  shortName: "Allviewser",
  productCode: "allviewser",
  tagline:
    "Compañero digital local-first con IA real: memoria, taller y herramientas — útil hoy, evolutivo mañana.",
  founder: {
    name: "Pascasio Emmanuel Reynoso Reyes",
    role: "Creador, fundador y CEO",
  },
  version: "0.1.4",
  status: "ia-real-futurista",
} as const;

export type Brand = typeof brand;
