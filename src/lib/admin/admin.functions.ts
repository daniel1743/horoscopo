/**
 * Server functions para el panel administrativo.
 * Se ejecutan siempre en el servidor con el usuario autenticado (requireSupabaseAuth).
 * Nunca exponen SUPABASE_SERVICE_ROLE_KEY al cliente.
 *
 * REGLA CRÍTICA: la autorización se aplica en el servidor. No confiar jamás
 * en roles enviados por el cliente ni en flags de UI para decidir acceso.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ADMIN_ROLES, type AdminRole, hasAnyRole } from "./roles";

export interface AdminIdentity {
  userId: string;
  roles: AdminRole[];
}

/**
 * Devuelve los roles administrativos del usuario autenticado.
 * Fuente: tabla public.user_roles (RLS scoped a auth.uid()).
 */
export const getMyAdminRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminIdentity> => {
    const { supabase, userId } = context;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    const roles = (data ?? [])
      .map((row) => row.role as string)
      .filter((r): r is AdminRole => (ADMIN_ROLES as readonly string[]).includes(r));

    return { userId, roles };
  });

/**
 * Verifica en el servidor que el usuario tiene alguno de los roles indicados.
 * Lanza Error("FORBIDDEN") si no. Usar al inicio de cada server fn admin.
 */
export async function assertRole(
  context: { supabase: any; userId: string },
  allowed: readonly AdminRole[],
): Promise<AdminRole[]> {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);

  if (error) throw new Error(error.message);

  const roles = (data ?? [])
    .map((r: { role: string }) => r.role)
    .filter((r: string): r is AdminRole =>
      (ADMIN_ROLES as readonly string[]).includes(r),
    ) as AdminRole[];

  if (!hasAnyRole(roles, allowed)) {
    throw new Error("FORBIDDEN");
  }
  return roles;
}

/**
 * Registra un evento en admin_audit_log. Append-only vía service_role
 * (RLS bloquea INSERT desde authenticated). Nunca guarda cuerpos completos,
 * contraseñas ni secretos.
 */
export const logAdminAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    action: string;
    resourceType?: string;
    resourceId?: string;
    status?: "success" | "denied" | "error";
    metadata?: Record<string, unknown>;
  }) => input)
  .handler(async ({ data, context }) => {
    // Obtener el rol "más alto" para dejarlo trazado, sin exponerlo al cliente.
    const rolesResp = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roleForAudit =
      rolesResp.data?.[0]?.role ?? null;

    // Cargar cliente admin solo dentro del handler (nunca a nivel módulo).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Sanitizar metadata: profundidad 1, máx 2 KB serializados.
    const safeMeta = sanitizeMetadata(data.metadata ?? {});

    const { error } = await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      actor_role: roleForAudit,
      action: data.action.slice(0, 100),
      resource_type: data.resourceType?.slice(0, 60) ?? null,
      resource_id: data.resourceId?.slice(0, 200) ?? null,
      status: data.status ?? "success",
      metadata: safeMeta as never,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Sanitiza metadata para prevenir fuga de secretos o payloads grandes. */
function sanitizeMetadata(input: Record<string, unknown>): Record<string, unknown> {
  const FORBIDDEN_KEYS = /^(password|token|secret|api_key|authorization|cookie|service_role)/i;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_KEYS.test(key)) continue;
    if (value == null) continue;
    if (typeof value === "string") out[key] = value.slice(0, 200);
    else if (typeof value === "number" || typeof value === "boolean") out[key] = value;
    else continue; // no anidamos objetos ni arrays
  }
  const serialized = JSON.stringify(out);
  if (serialized.length > 2048) return { truncated: true };
  return out;
}
