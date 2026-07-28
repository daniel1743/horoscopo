import { Link, useRouterState } from "@tanstack/react-router";
import { accountNav } from "@/config/mi-espacio";
import { routes } from "@/config/routes";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { ADMIN_PANEL_ROLES } from "@/lib/admin/roles";

/** Barra lateral persistente de Mi espacio (colapsa a tabs en móvil). */
export function AccountSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { hasAny } = useAdminRoles();
  const showAdminLink = hasAny(ADMIN_PANEL_ROLES);

  return (
    <nav
      aria-label="Secciones de Mi espacio"
      className="rounded-[var(--radius-card)] border border-line bg-warm-white p-2 lg:p-3"
    >
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {accountNav.map((item) => {
          const href = routes[item.routeKey];
          const active =
            href === routes.account
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
          const disabled = Boolean(item.disabled);
          const commonClass = cn(
            "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors whitespace-nowrap lg:whitespace-normal",
            active ? "bg-brand-soft text-ink" : "text-ink-soft hover:bg-brand-soft/60 hover:text-ink",
            disabled && "cursor-not-allowed opacity-50",
          );
          return (
            <li key={item.routeKey} className="lg:w-full">
              {disabled ? (
                <span className={commonClass} aria-disabled="true">
                  <Icon name={item.icon} size="sm" />
                  <span className="font-medium">{item.label}</span>
                </span>
              ) : (
                <Link
                  to={href}
                  aria-current={active ? "page" : undefined}
                  className={commonClass}
                >
                  <Icon name={item.icon} size="sm" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
        {showAdminLink ? (
          <li className="lg:w-full lg:border-t lg:border-line lg:pt-2 lg:mt-2">
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors whitespace-nowrap lg:whitespace-normal",
                pathname.startsWith("/admin")
                  ? "bg-brand-soft text-ink"
                  : "text-ink-soft hover:bg-brand-soft/60 hover:text-ink",
              )}
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            >
              <Icon name="settings" size="sm" />
              <span className="font-medium">Administración</span>
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
