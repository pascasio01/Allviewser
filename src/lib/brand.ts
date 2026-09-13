/**
 * Marca centralizada. El nombre comercial está pendiente de verificación.
 * Cambiar aquí actualiza la identidad visible de la aplicación.
 */
export const brand = {
  provisionalName: "Compañero Digital — Proyecto Independiente",
  shortName: "Compañero Digital",
  productCode: "companero-digital",
  tagline: "Un compañero con herramientas, memoria y taller — sin promesas imposibles.",
  founder: {
    name: "Pascasio Emmanuel Reynoso Reyes",
    role: "Creador, fundador y CEO",
  },
  version: "0.2.0",
  status: "primera-version-funcional",
} as const;

export type Brand = typeof brand;
