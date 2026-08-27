import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { getMyAdminRoles } from "@/lib/admin/admin.functions";
import { ADMIN_PANEL_ROLES, ADMIN_ROLE_META, hasAnyRole, type AdminRole } from "@/lib/admin/roles";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * Layout del panel administrativo.
 *
 * Autorización en 4 capas:
 *  1) UI: enlace "Administración" en Mi espacio sólo aparece si el usuario tiene rol.
 *  2) Ruta: beforeLoad ejecuta getMyAdminRoles (server fn) y redirige si no autorizado.
 *  3) Servidor: cada server fn admin llama a assertRole().
 *  4) RLS: policies en Supabase (admin_audit_log, futuras tablas admin) usan has_admin_role().
 *
 * Herencia: _authenticated ya es ssr:false; esta ruta también.
 */
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    try {
      const identity = await getMyAdminRoles({ data: undefined });
      if (!hasAnyRole(identity.roles, ADMIN_PANEL_ROLES)) {
        throw redirect({ to: routes.account });
      }
      return { adminIdentity: identity };
    } catch (err) {
      // Si el server responde 401/403, mandar a Mi espacio (o auth si no hay sesión).
      throw redirect({ to: routes.account });
    }
  },
  component: AdminLayout,
});

const ADMIN_NAV = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "articles", label: "Artículos", href: "/admin/articulos" },
  { key: "audit", label: "Auditoría", href: "/admin/auditoria" },
  { key: "community", label: "Moderación", href: "/admin/comunidad" },
] as const;

function AdminLayout() {
  const { adminIdentity } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-8 lg:px-6">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-[var(--radius-card)] border border-line bg-warm-white p-4">
            <p className="text-caption uppercase tracking-wide text-ink-soft">
              Panel administrativo
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {adminIdentity.roles.map((r: AdminRole) => ADMIN_ROLE_META[r].label).join(" · ") ||
                "Sin roles"}
            </p>
          </div>

          <nav
            aria-label="Navegación administrativa"
            className="mt-4 rounded-[var(--radius-card)] border border-line bg-warm-white p-2"
          >
            <ul className="flex flex-col gap-1">
              {ADMIN_NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.key}>
                    <Link
                      to={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-brand-soft text-ink"
                          : "text-ink-soft hover:bg-brand-soft/60 hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-2 border-t border-line pt-2">
                <Link
                  to={routes.account}
                  className="block rounded-[var(--radius-control)] px-3 py-2 text-sm text-ink-soft hover:bg-brand-soft/60 hover:text-ink"
                >
                  ← Volver a Mi espacio
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
