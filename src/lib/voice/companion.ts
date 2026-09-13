/**
 * Voz psicológica del producto.
 *
 * Lo único de Compañero Digital no es “más IA”, sino:
 * - Honestidad radical (nunca finge sensores, modelos o permisos).
 * - Presencia guiada (siempre hay un siguiente paso claro).
 * - Cambio de rol consciente (empatía operativa, no teatro).
 * - Memoria y evidencia como ritual de confianza.
 */

export type IntentionId = "explorar" | "crear" | "resolver" | "revisar";

export type Intention = {
  id: IntentionId;
  label: string;
  need: string;
  offer: string;
  boundary: string;
};

export const INTENTIONS: Intention[] = [
  {
    id: "explorar",
    label: "Explorar",
    need: "Orientarme sin miedo a romper nada.",
    offer: "Fichas, plano y documentos con procedencia visible.",
    boundary: "No convierte un modelo 2D en cámara en vivo.",
  },
  {
    id: "crear",
    label: "Crear",
    need: "Probar una idea antes de comprometerla.",
    offer: "Borradores y taller con criterios de aceptación.",
    boundary: "No ejecuta obra física ni pagos reales.",
  },
  {
    id: "resolver",
    label: "Resolver",
    need: "Actuar con el rol correcto y dejar rastro.",
    offer: "Incidencias, evidencias y cierres verificables.",
    boundary: "No inventa permisos ni salta revisiones.",
  },
  {
    id: "revisar",
    label: "Revisar",
    need: "Confiar en lo ocurrido y poder recuperarlo.",
    offer: "Línea de tiempo, pasaporte y persistencia real.",
    boundary: "No reconstruye un pasado que no existió.",
  },
];

export const COMPANION_CONTRACT = {
  title: "Cómo te acompaña",
  calmCue:
    "Respira: esto es un espacio demo. Puedes explorar, equivocarte y reiniciar sin consecuencias reales.",
  pledges: [
    "Te dice qué puede hacer ahora y qué le falta configurar.",
    "No simula sensores, modelos ni conexiones inexistentes.",
    "Te guía al siguiente paso según tu rol activo.",
    "Guarda evidencias y decisiones para que puedas revisarlas.",
    "Te deja cambiar de rol a propósito: para entender, no para saltarte reglas.",
  ],
} as const;

export const SPACE_VOICE = {
  placeIntro:
    "Estás en un edificio inventado para practicar mantenimiento con calma. Cada objeto tiene ficha, límites y procedencia.",
  roleCue:
    "El actor activo no es un disfraz: define qué puedes firmar. Si un botón no responde, el compañero te dice qué rol hace falta.",
  provenanceCue:
    "La etiqueta de procedencia es un pacto de confianza: simulado no es en vivo; estimado no es medición.",
  emptyIncidents:
    "Todavía no hay incidencias. Cuando notes algo en una ficha, créala: dejar rastro es parte del cuidado.",
  emptyObjectIncidents:
    "Este objeto aún no tiene incidencias. Si ves algo, créala desde su ficha: el rastro es el cuidado.",
  emptyPassports:
    "Aún no hay pasaporte de resultados. Completa el recorrido de mantenimiento y podrás revisar qué se verificó.",
  afterClose:
    "Cierre verificado. Revisa la línea de tiempo: la confianza nace de poder volver a mirar lo ocurrido.",
  loading: "Un momento: estoy abriendo el edificio demo…",
  noState: "Todavía no puedo mostrar el espacio. Reintenta con calma; tus datos locales siguen ahí.",
  assistantTitle: "Pregúntame con límites",
  assistantCue:
    "Respondo solo con lo observado en fichas y documentos. No invento medidas, precios ni diagnósticos.",
  runFullFlow: "Recorrer el cuidado de punta a punta",
  resetDemo: "Empezar de nuevo sin miedo",
  updatePresence: "Marcar que estoy aquí",
  observedLabel: "Lo que sí vi",
  inferredLabel: "Lo que infiero (con duda)",
  shadowTitle: "Modo sombra de rol",
  contractTitle: "Contrato de esta acción",
  replayTitle: "Relato del cuidado",
  playReplay: "Contar el recorrido",
  honestMissingPrefix: "Falta para avanzar:",
  unavailableLabel: "Lo que no tengo",
} as const;

export const MODULE_VOICE = {
  projectGate:
    "Elige o crea un proyecto para empezar. Cada proyecto guarda su propio rastro — conversaciones, memoria y archivos separados.",
  projectsIntro:
    "Cada proyecto es un espacio de trabajo con su propio rastro. Separar no es burocracia: es cuidar el contexto.",
  projectsEmpty:
    "Todavía no hay proyectos. Crea el primero y tendrás un lugar donde dejar huella sin mezclar contextos.",
  chatIntro:
    "Hablo solo con el modelo que configures. Si no hay proveedor, te diré cómo activarlo — no inventaré respuestas.",
  chatEmpty: "Aún no hay mensajes. Escribe con claridad; yo guardaré el hilo en este proyecto.",
  chatNoProject: "Elige o crea un proyecto para conversar. Sin proyecto no hay memoria compartida.",
  memoryIntro:
    "Aquí guardas hechos, decisiones y propuestas que quieres poder revisar. Dejar rastro es parte del cuidado.",
  memoryEmpty:
    "Aún no hay hechos aprobados para confiar en ellos. Añade el primero cuando quieras recordarlo después.",
  filesIntro:
    "Solo dentro del espacio autorizado del proyecto. Fuera de ese perímetro no escribo ni leo.",
  filesEmpty: "Todavía no hay archivos. Escribe la primera nota y quedará en el espacio del proyecto.",
  tasksIntro:
    "Intención Crear: prueba una idea con criterios antes de comprometerla. El taller no ejecuta obra física ni pagos reales.",
  tasksEmpty: "Aún no hay ensayos guardados. Plantea un objetivo y el taller dejará rastro de lo intentado.",
  toolsIntro:
    "Te digo qué puede hacer cada herramienta y qué no: permisos, red, cancelación y si se puede deshacer.",
  worldIntro:
    "Mapa calmado de funciones reales. No es un producto 3D fingido: cada sala lleva a algo que ya existe.",
  worldEmpty: "Todavía no hay actividad registrada. Cuando actúes, el rastro aparecerá aquí.",
  commerceIntro:
    "Negocio ficticio para practicar pedido y seguimiento. No hay cobros ni repartos reales — puedes explorar sin miedo.",
  commerceCartEmpty: "El carrito está vacío. Elige algo del menú cuando quieras ensayar el pedido.",
  commerceOrdersEmpty: "Aún no hay pedidos. Cuando crees uno, podrás seguirlo paso a paso.",
  commerceLost:
    "Se perdió la conexión. Puedes seguir con el último estado conocido; restaura cuando quieras.",
  settingsIntro:
    "Aquí decides cómo te acompaño. Sin modelo no inventaré respuestas; sin remoto todo permanece en tu disco.",
  settingsLoading: "Un momento: abriendo tu configuración local…",
  capabilityTitle: "Qué sí puede hacer hoy",
  modelNone: "sin modelo configurado",
  modelLocal: "modelo local",
  modelCompatible: "proveedor compatible",
  remoteLocal: "solo en este equipo",
  trustIntro:
    "El diario de confianza es el ritual que nadie finge: qué ocurrió, qué no se afirma y qué queda pendiente.",
  trustEmpty:
    "Todavía no hay entradas. Cuando cierres un recorrido o apruebes un recuerdo, el rastro aparecerá aquí.",
  memoryRitualIntro:
    "Un recuerdo solo se vuelve confiable cuando lo apruebas. Sugerido → propuesto → aprobado.",
  commerceEthicalTitle: "Ticket ético de la demo",
  commerceEthicalBody:
    "Impuestos simulados, propina no cobrada, entrega no real. El módulo existe para practicar flujo — no para fingir un negocio vivo.",
  shadowModeCue:
    "Modo sombra: ves el mundo como lo vería otro rol, sin firmar en su nombre.",
  replayCue:
    "Replay del cuidado: un relato breve de lo que sí quedó registrado. Si no hay eventos, el silencio es honesto.",
  honestSilence:
    "Sin dato no hay relleno. Te digo qué falta (foto, medida, firma) y qué rol puede aportarlo.",
  remoteDeclared: "continuidad remota declarada (no implica sincronización activa)",
} as const;

const ROLE_WORDS: Record<string, string> = {
  administrador: "administrador",
  tecnico: "técnico",
  revisor: "revisor",
  residente: "residente",
  observador: "observador",
};

/** Motivo cálido cuando falta un rol para firmar una acción. */
export function roleNeedReason(required: string, current: string): string {
  const need = ROLE_WORDS[required] ?? required;
  const have = ROLE_WORDS[current] ?? current;
  return `Con el rol «${have}» no puedo firmar eso. Cambia a «${need}» (o administrador) y te guío.`;
}

export function intentionById(id: IntentionId): Intention {
  return INTENTIONS.find((i) => i.id === id) ?? INTENTIONS[0];
}

export function humanModelLabel(provider: string | undefined): string {
  if (!provider || provider === "none") return MODULE_VOICE.modelNone;
  if (provider === "local") return MODULE_VOICE.modelLocal;
  if (provider === "openai-compatible") return MODULE_VOICE.modelCompatible;
  return provider;
}
