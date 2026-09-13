import type { TimelineEvent } from "./types";

export type NarrativeBeat = {
  order: number;
  title: string;
  line: string;
  at?: string;
  kind: string;
};

function lineFor(ev: TimelineEvent): string {
  const detail = "detail" in ev ? String((ev as { detail?: string }).detail ?? "") : "";
  const title = ev.title;
  switch (ev.kind) {
    case "semilla":
      return `El lugar nace en silencio demo: ${detail || title}`;
    case "incidencia_creada":
      return `Alguien dejó rastro: ${title}. ${detail}`.trim();
    case "incidencia_asignada":
      return `Se nombró un cuidador: ${detail || title}`;
    case "evidencia_anexada":
      return `Se anexó prueba con procedencia: ${detail || title}`;
    case "incidencia_estado":
      return `El estado cambió con firma: ${detail || title}`;
    case "pasaporte_emitido":
      return `Quedó un pasaporte revisable: ${detail || title}`;
    case "demo_reiniciada":
      return "La demo volvió a la semilla — sin borrar el diario de confianza.";
    case "decision_registrada":
      return `Se registró una decisión humana: ${detail || title}`;
    default:
      return `${title}${detail ? ` — ${detail}` : ""}`;
  }
}

/** Convierte la línea de tiempo en un relato breve para replay. */
export function buildCareNarrative(timeline: TimelineEvent[]): NarrativeBeat[] {
  const chronological = [...timeline].reverse();
  return chronological.map((ev, i) => ({
    order: i + 1,
    title: ev.title,
    line: lineFor(ev),
    at: ev.dates?.uploadedAt,
    kind: ev.kind,
  }));
}

export function narrativeScript(beats: NarrativeBeat[]): string {
  if (!beats.length) {
    return "Todavía no hay historia que contar. Cuando actúes con un rol, el relato aparecerá aquí — sin inventar un pasado. El silencio es honesto.";
  }
  const body = beats.map((b) => `${b.order}. ${b.line}`).join("\n");
  return `Recorrido del cuidado (${beats.length} momentos):\n${body}\n\nFin del relato. Nada de esto es obra física; es rastro local revisable.`;
}
