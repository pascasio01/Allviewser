import { z } from "zod";

export const PermissionActionSchema = z.enum([
  "fs.read",
  "fs.write",
  "fs.list",
  "fs.delete",
  "net.fetch",
  "shell.run",
  "memory.write",
  "project.write",
  "sensitive.external",
]);

export type PermissionAction = z.infer<typeof PermissionActionSchema>;

export type PermissionGrant = {
  actions: PermissionAction[];
  network: boolean;
  confirmedSensitive: boolean;
};

export const defaultToolGrant = (): PermissionGrant => ({
  actions: ["fs.read", "fs.list", "fs.write", "shell.run"],
  network: false,
  confirmedSensitive: false,
});

export function assertPermission(
  grant: PermissionGrant,
  action: PermissionAction,
  opts?: { network?: boolean; sensitive?: boolean },
): void {
  if (!grant.actions.includes(action)) {
    throw new Error(`Permiso denegado: ${action}`);
  }
  if (opts?.network && !grant.network) {
    throw new Error("Acceso a red denegado por defecto.");
  }
  if (opts?.sensitive && !grant.confirmedSensitive) {
    throw new Error("Acción sensible requiere confirmación explícita.");
  }
}

/** El agente no puede ampliar sus propios permisos. */
export function cannotSelfEscalate(): never {
  throw new Error("El agente no puede ampliar sus propios permisos ni desactivar controles.");
}
