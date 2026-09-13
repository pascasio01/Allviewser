import { demoInventoryProvenance } from "../media/provenance";
import type { Actor, Place, SharedVisit, SpaceObject, SpaceState, TimelineEvent } from "./types";
import { spaceDemoCopy } from "./copy";

const demoProv = () => demoInventoryProvenance(spaceDemoCopy.inventorySource, "2026-09-01");

export const DEMO_PLACE_ID = "place-edificio-demo-allviewser";
export const DEMO_PIPE_ID = "obj-tuberia-planta1-aseo";

export const ACTOR_OBSERVADOR = "actor-observador";
export const ACTOR_RESIDENTE = "actor-residente";
export const ACTOR_TECNICO = "actor-tecnico";
export const ACTOR_REVISOR = "actor-revisor";
export const ACTOR_ADMIN = "actor-admin";

const CREATED = "2026-09-01T10:00:00.000Z";

export const demoActors: Actor[] = [
  { id: ACTOR_OBSERVADOR, displayName: "Olivia Observadora", role: "observador" },
  { id: ACTOR_RESIDENTE, displayName: "René Residente", role: "residente" },
  { id: ACTOR_TECNICO, displayName: "Tania Técnica", role: "tecnico" },
  { id: ACTOR_REVISOR, displayName: "Ricardo Revisor", role: "revisor" },
  { id: ACTOR_ADMIN, displayName: "Ana Administradora", role: "administrador" },
];

export const demoPlace: Place = {
  id: DEMO_PLACE_ID,
  name: spaceDemoCopy.placeName,
  slug: spaceDemoCopy.placeSlug,
  fictional: true,
  fictionalBanner: "Espacio ficticio de demostración. Ningún dato corresponde a un inmueble real.",
  description:
    "Planta baja y planta 1 de un edificio de oficinas inventado para probar selección de objetos, fichas, incidencias y línea de tiempo.",
  addressLabel: "Calle Imaginaria 100, Ciudad Demo (FICTICIO)",
  revision: 1,
  createdAt: CREATED,
};

function hist(objectId: string, name: string): SpaceObject["history"] {
  return [
    {
      id: `hist-${objectId}-seed`,
      at: CREATED,
      actorId: "system",
      actorName: "Sistema (semilla demo)",
      action: "alta_inicial",
      detail: `Objeto «${name}» cargado en la semilla de demostración.`,
      kind: "semilla",
    },
  ];
}

export const demoObjects: SpaceObject[] = [
  {
    id: DEMO_PIPE_ID,
    placeId: DEMO_PLACE_ID,
    kind: "tuberia",
    name: "Tubería de agua fría — aseo planta 1",
    description:
      "Tramo de suministro de agua fría en el falso techo del aseo de planta 1. Elemento principal del recorrido de mantenimiento demo.",
    locationLabel: "Planta 1 · Aseo principal · Falso techo norte",
    floor: "1",
    x: 72,
    y: 28,
    source: spaceDemoCopy.inventorySource,
    infoAsOf: "2026-09-01",
    provenance: demoProv(),
    documents: [
      {
        id: "doc-plano-planta1",
        title: "Plano hidráulico planta 1 (extracto demo)",
        source: "Paquete semilla",
        issuedAt: "2026-08-15",
        kind: "plano",
        summary: "Localiza el tramo de agua fría del aseo principal.",
      },
      {
        id: "doc-manual-valvulas",
        title: "Manual de válvulas de corte (extracto)",
        source: "Paquete semilla",
        issuedAt: "2025-11-02",
        kind: "manual",
        summary: "Procedimiento genérico de corte; no sustituye inspección real.",
      },
    ],
    history: hist(DEMO_PIPE_ID, "Tubería de agua fría"),
    tags: ["agua", "mantenimiento", "demo-recorrido"],
    knownFacts: {
      diametro_declarado: "20 mm (dato de inventario demo)",
      material_declarado: "Cobre (dato de inventario demo)",
      ultimo_mantenimiento_registrado: "Ninguno en la semilla",
    },
    unknownFields: ["presion_actual", "estado_corrosion_inspeccionado", "precio_repuesto"],
    availableActions: ["ver_ficha", "crear_incidencia", "ver_historial", "preguntar_asistente"],
    mutableProps: { color: "#4a7c9b", material: "cobre", x: 72, y: 28 },
  },
  {
    id: "obj-valvula-sotano",
    placeId: DEMO_PLACE_ID,
    kind: "valvula",
    name: "Válvula de corte general — sótano",
    description: "Válvula de corte del ramal de agua del edificio (demo).",
    locationLabel: "Sótano · Cuarto de instalaciones",
    floor: "S",
    x: 22,
    y: 78,
    source: spaceDemoCopy.inventorySource,
    infoAsOf: "2026-09-01",
    provenance: demoProv(),
    documents: [
      {
        id: "doc-valvula",
        title: "Ficha de válvula de corte",
        source: "Paquete semilla",
        issuedAt: "2026-01-10",
        kind: "manual",
        summary: "Identificación y sentido de cierre (demo).",
      },
    ],
    history: hist("obj-valvula-sotano", "Válvula de corte"),
    tags: ["agua", "corte"],
    knownFacts: { acceso: "Cuarto con llave de instalaciones (demo)" },
    unknownFields: ["torque_maximo", "fecha_sustitucion"],
    availableActions: ["ver_ficha", "crear_incidencia", "ver_historial"],
    mutableProps: { color: "#8b4513", material: "laton", x: 22, y: 78 },
  },
  {
    id: "obj-panel-electrico",
    placeId: DEMO_PLACE_ID,
    kind: "panel_electrico",
    name: "Cuadro eléctrico planta baja",
    description: "Cuadro de distribución de planta baja (demo). Sin telemetría real.",
    locationLabel: "Planta baja · Hall técnico",
    floor: "0",
    x: 18,
    y: 42,
    source: spaceDemoCopy.inventorySource,
    infoAsOf: "2026-09-01",
    provenance: demoProv(),
    documents: [],
    history: hist("obj-panel-electrico", "Cuadro eléctrico"),
    tags: ["electricidad"],
    knownFacts: { circuitos_etiquetados: "Parcial (demo)" },
    unknownFields: ["carga_actual", "temperatura"],
    availableActions: ["ver_ficha", "crear_incidencia", "ver_historial"],
    mutableProps: { color: "#333333", x: 18, y: 42 },
  },
  {
    id: "obj-puerta-acceso",
    placeId: DEMO_PLACE_ID,
    kind: "puerta",
    name: "Puerta de acceso principal",
    description: "Acceso peatonal al lobby (demo).",
    locationLabel: "Planta baja · Lobby",
    floor: "0",
    x: 50,
    y: 88,
    source: spaceDemoCopy.inventorySource,
    infoAsOf: "2026-09-01",
    provenance: demoProv(),
    documents: [],
    history: hist("obj-puerta-acceso", "Puerta de acceso"),
    tags: ["acceso"],
    knownFacts: { sentido_apertura: "Hacia el exterior (demo)" },
    unknownFields: ["codigo_cerradura"],
    availableActions: ["ver_ficha", "crear_incidencia"],
    mutableProps: { color: "#5c4033", material: "madera", x: 50, y: 88 },
  },
  {
    id: "obj-sala-reuniones",
    placeId: DEMO_PLACE_ID,
    kind: "espacio",
    name: "Sala de reuniones A",
    description:
      "Sala ficticia. «Solicitar visita» es un registro demo, no una reserva real.",
    locationLabel: "Planta 1 · Ala este",
    floor: "1",
    x: 40,
    y: 30,
    source: spaceDemoCopy.inventorySource,
    infoAsOf: "2026-09-01",
    provenance: demoProv(),
    documents: [],
    history: hist("obj-sala-reuniones", "Sala de reuniones A"),
    tags: ["espacio", "visita-demo"],
    knownFacts: { aforo_declarado: "8 personas (dato demo)" },
    unknownFields: ["disponibilidad_real", "equipamiento_av_verificado"],
    availableActions: ["ver_ficha", "solicitar_visita_demo", "ver_historial"],
    mutableProps: { color: "#c4b59a", x: 40, y: 30 },
  },
  {
    id: "obj-mesa-recepcion",
    placeId: DEMO_PLACE_ID,
    kind: "mobiliario",
    name: "Mesa de recepción",
    description: "Mobiliario editable en borradores «probar antes de cambiar».",
    locationLabel: "Planta baja · Lobby",
    floor: "0",
    x: 48,
    y: 70,
    source: spaceDemoCopy.inventorySource,
    infoAsOf: "2026-09-01",
    provenance: demoProv(),
    documents: [],
    history: hist("obj-mesa-recepcion", "Mesa de recepción"),
    tags: ["mobiliario", "borrador"],
    knownFacts: { material_declarado: "Roble laminado (demo)" },
    unknownFields: ["precio", "proveedor"],
    availableActions: ["ver_ficha", "probar_cambio", "ver_historial"],
    mutableProps: {
      label: "Mesa de recepción",
      color: "#c2a878",
      material: "roble laminado",
      x: 48,
      y: 70,
    },
  },
];

export function createInitialVisit(): SharedVisit {
  return {
    id: "visit-demo-1",
    placeId: DEMO_PLACE_ID,
    active: true,
    participants: [],
    comments: [],
    locks: {},
    voiceEnabled: false,
    recordingEnabled: false,
  };
}

function seedTimeline(): TimelineEvent[] {
  return [
    {
      id: "tl-seed-place",
      placeId: DEMO_PLACE_ID,
      kind: "semilla",
      title: "Edificio demo cargado",
      detail: spaceDemoCopy.seedTimelineDetail,
      actorId: "system",
      actorName: "Sistema",
      dates: { uploadedAt: CREATED, eventAt: CREATED },
      isSystemRecord: true,
      provenance: {
        kind: "simulado",
        source: "Semilla demo",
        updatedAt: CREATED,
        caveat: "Registro de sistema; no es telemetría en vivo.",
      },
    },
  ];
}

export function createInitialSpaceState(): SpaceState {
  return {
    places: [structuredClone(demoPlace)],
    objects: structuredClone(demoObjects),
    actors: structuredClone(demoActors),
    incidents: [],
    evidence: [],
    timeline: seedTimeline(),
    drafts: [],
    decisions: [],
    passports: [],
    visit: createInitialVisit(),
    extensions: [],
    processedIdempotencyKeys: [],
  };
}
