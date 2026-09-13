import type { Business, Product, StaffUser } from "./types";

export const DEMO_BUSINESS_ID = "biz-ficticio-sabores-del-patio";
export const DEMO_CUSTOMER_ID = "customer-demo";

const ALLERGEN_DISCLAIMER =
  "Esta información es aportada por el negocio. No confirma ausencia de alérgenos ni seguridad alimentaria. Consulte directamente al establecimiento si tiene dudas.";

export const demoBusiness: Business = {
  id: DEMO_BUSINESS_ID,
  name: "Sabores del Patio (FICTICIO)",
  slug: "sabores-del-patio-demo",
  kind: "restaurante",
  fictional: true,
  fictionalBanner:
    "NEGOCIO FICTICIO — Solo demostración. No hay cocina real, cobros reales ni reparto real.",
  description:
    "Restaurante de demostración del módulo de comercio inmersivo. Menú reducido con datos de ejemplo.",
  address: "Calle Demo 100, Ciudad Ejemplo (dirección ficticia)",
  timezone: "America/Mexico_City",
  hours: [
    { day: 1, open: "09:00", close: "21:00" },
    { day: 2, open: "09:00", close: "21:00" },
    { day: 3, open: "09:00", close: "21:00" },
    { day: 4, open: "09:00", close: "21:00" },
    { day: 5, open: "09:00", close: "22:00" },
    { day: 6, open: "10:00", close: "22:00" },
    { day: 0, open: "10:00", close: "20:00" },
  ],
  media: [
    {
      id: "biz-media-1",
      kind: "reconstruccion",
      url: "/commerce/demo/patio.svg",
      caption: "Fachada ilustrada (reconstrucción — no es fotografía real del local)",
      authorized: true,
      source: "ilustración de demostración",
    },
  ],
  virtualTourAvailable: false,
  deliveryFeeCents: 3500,
  minOrderCents: 8000,
  supportContact: "soporte-demo@sabores-del-patio.example (ficticio)",
};

export const demoProducts: Product[] = [
  {
    id: "prod-torta-milanesa",
    businessId: DEMO_BUSINESS_ID,
    name: "Torta de milanesa",
    description: "Bolillo, milanesa de res, aguacate y frijoles. Datos de menú ficticio.",
    priceCents: 8900,
    currency: "MXN",
    available: true,
    ingredients: ["bolillo", "milanesa de res", "aguacate", "frijoles", "lechuga"],
    allergenNotesFromBusiness:
      "El negocio indica posible contacto con gluten y lácteos. No es certificación de ausencia de alérgenos.",
    allergenDisclaimer: ALLERGEN_DISCLAIMER,
    quantityUnit: "pieza",
    category: "tortas",
    options: [
      { id: "opt-queso", label: "Con queso", priceDeltaCents: 1500, available: true },
      { id: "opt-sin-cebolla", label: "Sin cebolla", priceDeltaCents: 0, available: true },
    ],
    media: [
      {
        id: "media-torta",
        kind: "reconstruccion",
        url: "/commerce/demo/torta.svg",
        caption: "Ilustración / reconstrucción — no es fotografía del platillo real",
        authorized: true,
        source: "demo",
      },
    ],
  },
  {
    id: "prod-agua-horchata",
    businessId: DEMO_BUSINESS_ID,
    name: "Agua de horchata",
    description: "Vaso 500 ml. Escenario de demostración.",
    priceCents: 3500,
    currency: "MXN",
    available: true,
    ingredients: ["arroz", "canela", "leche", "azúcar"],
    allergenNotesFromBusiness: "Contiene lácteos según ficha del negocio ficticio.",
    allergenDisclaimer: ALLERGEN_DISCLAIMER,
    quantityUnit: "vaso",
    category: "bebidas",
    options: [],
    media: [
      {
        id: "media-horchata",
        kind: "fotografia",
        url: "/commerce/demo/horchata.svg",
        caption: "Imagen de demostración etiquetada como fotografía de ejemplo",
        authorized: true,
        source: "demo",
      },
    ],
  },
  {
    id: "prod-ensalada",
    businessId: DEMO_BUSINESS_ID,
    name: "Ensalada del patio",
    description: "Mix de hojas, jitomate cherry y aderezo de limón.",
    priceCents: 7500,
    currency: "MXN",
    available: true,
    ingredients: ["lechuga", "espinaca", "jitomate", "limón", "aceite de oliva"],
    allergenNotesFromBusiness: "Pregunte al negocio por trazas. No se afirma ausencia de alérgenos.",
    allergenDisclaimer: ALLERGEN_DISCLAIMER,
    quantityUnit: "plato",
    category: "ensaladas",
    options: [{ id: "opt-pollo", label: "Con pollo", priceDeltaCents: 2500, available: true }],
    media: [
      {
        id: "media-ensalada",
        kind: "modelo_3d",
        url: "/commerce/demo/ensalada.svg",
        caption: "Marcador de modelo 3D (vista ligera 2D; 3D opcional desactivado)",
        authorized: true,
        source: "demo",
      },
    ],
  },
  {
    id: "prod-flan",
    businessId: DEMO_BUSINESS_ID,
    name: "Flan casero",
    description: "Porción individual. Puede marcarse como agotado en el panel del negocio.",
    priceCents: 4500,
    currency: "MXN",
    available: true,
    ingredients: ["huevo", "leche", "azúcar", "vainilla"],
    allergenNotesFromBusiness: "Contiene huevo y lácteos (dato del negocio).",
    allergenDisclaimer: ALLERGEN_DISCLAIMER,
    quantityUnit: "porción",
    category: "postres",
    options: [],
    media: [
      {
        id: "media-flan",
        kind: "video",
        url: "/commerce/demo/flan.svg",
        caption: "Sustituto visual de video autorizado (demo estática)",
        authorized: true,
        source: "demo",
      },
    ],
  },
];

export const demoStaff: StaffUser[] = [
  { id: "staff-admin", name: "Ana Admin (demo)", role: "administrador", businessId: DEMO_BUSINESS_ID },
  { id: "staff-kitchen", name: "Carlos Cocina (demo)", role: "preparacion", businessId: DEMO_BUSINESS_ID },
  { id: "staff-delivery", name: "Diana Reparto (demo)", role: "reparto", businessId: DEMO_BUSINESS_ID },
  { id: DEMO_CUSTOMER_ID, name: "Cliente Demo", role: "cliente", businessId: DEMO_BUSINESS_ID },
];
