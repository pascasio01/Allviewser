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
    loading: "Cargando…",
    empty: "No hay elementos todavía.",
    error: "Algo falló.",
    offline: "Sin conexión a la API local.",
    recovery: "Reintentar",
  },
  home: {
    title: "Centro de control",
    subtitle: "Trabaja por proyectos, con memoria aprobada y herramientas acotadas.",
  },
  chat: {
    placeholder: "Escribe un mensaje…",
    send: "Enviar",
    stop: "Detener",
    noModel: "Sin modelo configurado",
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
