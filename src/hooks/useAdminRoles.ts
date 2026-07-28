import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAdminRoles, type AdminIdentity } from "@/lib/admin/admin.functions";
import { useSession } from "./useSession";
import { hasAnyRole, type AdminRole } from "@/lib/admin/roles";

/**
 * Devuelve los roles admin del usuario actual.
 * NO usar el resultado como única barrera: ocultar UI está bien,
 * pero cada acción debe verificarse también en el servidor.
 */
export function useAdminRoles() {
  const { user, loading } = useSession();
  const fetchRoles = useServerFn(getMyAdminRoles);

  const query = useQuery<AdminIdentity>({
    queryKey: ["admin", "my-roles", user?.id ?? "anon"],
    queryFn: () => fetchRoles({ data: undefined }),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    retry: false,
  });

  const roles = query.data?.roles ?? [];
  return {
    roles,
    isAdminMember: roles.length > 0,
    hasAny: (allowed: readonly AdminRole[]) => hasAnyRole(roles, allowed),
    isLoading: loading || query.isLoading,
  };
}
