import { Link, useRouterState } from "@tanstack/react-router";
import { mobileBottomPrimary } from "@/config/navigation";
import { routes } from "@/config/routes";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Barra inferior fija móvil. Cinco destinos máximo. */
export function MobileBottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-warm-white lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-between px-2">
        {mobileBottomPrimary.slice(0, 5).map((item) => {
          const path = routes[item.routeKey];
          const isActive =
            path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");
          return (
            <li key={item.routeKey} className="flex-1">
              <Link
                to={path}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-full min-h-12 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] px-2 transition-colors",
                  isActive ? "text-brand" : "text-ink-muted hover:text-ink",
                )}
              >
                {item.icon && (
                  <Icon name={item.icon} size={20} className={cn(isActive && "text-brand")} />
                )}
                <span className="font-body text-[11px] font-medium leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
