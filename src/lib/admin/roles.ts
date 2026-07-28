/**
 * Registro central de roles administrativos.
 * Fuente única de verdad para nombres de rol y agrupaciones autorizadas.
 * NO exportar valores derivados que no vengan de este archivo.
 */

export const ADMIN_ROLES = ["super_admin", "admin", "editor", "reviewer", "media_manager"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/** Cualquiera de estos roles concede acceso al panel /admin. */
export const ADMIN_PANEL_ROLES: readonly AdminRole[] = ADMIN_ROLES;

/** Roles con capacidad de publicar contenido. */
export const PUBLISHER_ROLES: readonly AdminRole[] = ["super_admin", "admin"];

/** Roles con capacidad de aprobar en revisión (no publican por sí solos). */
export const APPROVER_ROLES: readonly AdminRole[] = ["super_admin", "admin", "reviewer"];

/** Roles con capacidad de editar contenido editorial (crear/modificar borradores). */
export const EDITOR_ROLES: readonly AdminRole[] = ["super_admin", "admin", "editor"];

/** Roles con capacidad de subir/gestionar medios en la biblioteca. */
export const MEDIA_ROLES: readonly AdminRole[] = ["super_admin", "admin", "media_manager"];

/** Roles que pueden leer la auditoría administrativa. */
export const AUDIT_READER_ROLES: readonly AdminRole[] = ["super_admin", "admin"];

/** Roles que pueden asignar/revocar roles a otros usuarios. */
export const ROLE_MANAGER_ROLES: readonly AdminRole[] = ["super_admin"];

/** Descripción amigable de cada rol (etiquetas y responsabilidad). */
export const ADMIN_ROLE_META: Record<AdminRole, { label: string; description: string }> = {
  super_admin: {
    label: "Super Admin",
    description:
      "Control total: gestiona roles, configuración global, auditoría y todos los módulos.",
  },
  admin: {
    label: "Admin",
    description:
      "Publica y modera todos los módulos, gestiona medios y aprueba en revisión. No puede otorgar roles.",
  },
  editor: {
    label: "Editor",
    description:
      "Crea y edita borradores editoriales. No puede publicar ni aprobar por sí solo.",
  },
  reviewer: {
    label: "Revisor",
    description:
      "Aprueba o solicita cambios en contenido enviado a revisión. No publica.",
  },
  media_manager: {
    label: "Gestor de medios",
    description:
      "Sube y organiza recursos en la biblioteca de medios. No edita ni publica contenido.",
  },
};

export function isAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

export function hasAnyRole(userRoles: readonly AdminRole[], allowed: readonly AdminRole[]): boolean {
  return userRoles.some((r) => allowed.includes(r));
}
