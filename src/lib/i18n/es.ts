export const es = {
  nav: {
    home: "Inicio",
    chat: "Conversación",
    projects: "Proyectos",
    tasks: "Tareas",
    files: "Archivos",
    memory: "Memoria",
    tools: "Herramientas",
    commerce: "Comercio",
    space: "Espacio",
    settings: "Configuración",
    world: "Mundo visual",
  },
  states: {
    loading: "Un momento…",
    empty: "Aquí todavía no hay nada. Cuando crees el primero, quedará guardado.",
    error: "Algo no salió bien. Puedes reintentar sin perder el contexto local.",
    offline: "No alcanzo la API local. Tus datos en disco siguen ahí.",
    recovery: "Reintentar con calma",
  },
  home: {
    title: "Presencia del compañero",
    subtitle: "Trabaja por proyectos, con memoria aprobada y límites visibles.",
  },
  chat: {
    placeholder: "Escribe con claridad… si no hay modelo, te diré cómo configurarlo.",
    send: "Enviar",
    stop: "Detener",
    noModel: "Sin modelo configurado — no inventaré respuestas",
    empty: "Aún no hay mensajes. Escribe con claridad; yo guardaré el hilo en este proyecto.",
    providerError: "El proveedor no respondió. Puedes reintentar sin perder el hilo local.",
  },
  project: {
    select: "Elige un proyecto para empezar",
    active: "Proyecto activo",
  },
  world: {
    control: "Centro de control",
    workshop: "Taller",
    library: "Biblioteca de memoria",
    observatory: "Observatorio",
    activity: "Sala de actividad",
    directMode: "Modo directo (sin navegación 3D)",
  },
} as const;

export type Messages = typeof es;

export function t(): Messages {
  return es;
}
