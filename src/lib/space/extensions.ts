import type { ExtensionManifest } from "./types";

export const SAMPLE_CHECKLIST_EXTENSION: ExtensionManifest = {
  id: "ext-checklist-inspeccion",
  name: "Lista de verificación de inspección",
  author: "Allviewser Demo",
  version: "0.1.0",
  license: "UNLICENSED (demo interno)",
  capabilities: ["mostrar_checklist_inspeccion"],
  permissions: ["leer_objetos", "leer_incidencias", "proponer_acciones"],
  networkAccess: false,
  dataAccess: ["objetos del lugar instalado", "incidencias del lugar instalado"],
  costsOrDependencies: "Ninguno. Sin llamadas de red.",
  uninstallProcedure:
    "Administrador → Extensiones → Desinstalar. Elimina el registro del lugar; no borra incidencias históricas.",
};
