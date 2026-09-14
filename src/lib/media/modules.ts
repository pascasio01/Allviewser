/**
 * Módulos independientes de voz, imagen y búsqueda visual.
 * Solo se activan cuando la integración está realmente disponible.
 */

export type MediaAvailability = {
  id: string;
  label: string;
  available: boolean;
  reason: string;
  contentLabels: Array<"en_vivo" | "periodico" | "grabado" | "reconstruccion_3d" | "generado">;
};

export function probeMediaModules(): MediaAvailability[] {
  return [
    {
      id: "transcription",
      label: "Transcripción",
      available: false,
      reason: "Sin motor de transcripción configurado. Requiere integración explícita y permiso de micrófono.",
      contentLabels: ["generado"],
    },
    {
      id: "tts",
      label: "Síntesis de voz",
      available: false,
      reason: "Sin motor TTS configurado.",
      contentLabels: ["generado"],
    },
    {
      id: "image_analysis",
      label: "Análisis de imágenes",
      available: false,
      reason: "Sin modelo de visión configurado.",
      contentLabels: ["generado"],
    },
    {
      id: "maps",
      label: "Mapas",
      available: false,
      reason: "Sin proveedor de mapas autorizado.",
      contentLabels: ["periodico"],
    },
    {
      id: "models_3d",
      label: "Modelos 3D",
      available: false,
      reason: "Módulo preparado; no activado en v0.1 para no perjudicar accesibilidad.",
      contentLabels: ["reconstruccion_3d", "generado"],
    },
    {
      id: "av_sources",
      label: "Fuentes audiovisuales",
      available: false,
      reason: "No se incorporan transmisiones solo por ser accesibles; requiere verificación de condiciones.",
      contentLabels: ["en_vivo", "grabado"],
    },
  ];
}

export type ContentLabel = {
  kind: MediaAvailability["contentLabels"][number];
  source?: string;
  date?: string;
};
