import { brand } from "../brand";

/** Textos de demo del módulo Espacio — textos desde brand, sin hardcodear marca en lógica. */
export const spaceDemoCopy = {
  placeName: `Edificio Demo (${brand.shortName})`,
  placeSlug: "edificio-demo",
  inventorySource: `Inventario semilla (${brand.internalProductId})`,
  extensionAuthor: `${brand.shortName} Demo`,
  seedTimelineDetail: `Semilla inicial del edificio demo de ${brand.shortName}.`,
} as const;
