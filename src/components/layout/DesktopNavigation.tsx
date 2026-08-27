import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { desktopPrimary } from "@/config/navigation";
import { routes } from "@/config/routes";
import { DesktopNavDropdown } from "./DesktopNavDropdown";
import { cn } from "@/lib/utils";

/** Navbar horizontal de escritorio. Un único menú controlado. */
export function DesktopNavigation() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav aria-label="Navegación principal" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {desktopPrimary.map((group) => {
          const parentPath = routes[group.routeKey];
          const isActive =
            pathname === parentPath ||
            (parentPath !== "/" && pathname.startsWith(parentPath + "/"));

          return (
            <li key={group.routeKey}>
              {group.children?.length ? (
                <DesktopNavDropdown
                  group={group}
                  isOpen={openKey === group.routeKey}
                  onOpen={() => setOpenKey(group.routeKey)}
                  onClose={() => setOpenKey((k) => (k === group.routeKey ? null : k))}
                />
              ) : (
                <Link
                  to={parentPath as never}
                  onClick={() => setOpenKey(null)}
                  className={cn(
                    "inline-flex h-11 items-center rounded-[var(--radius-control)] px-3 font-body text-[14px] font-medium transition-colors",
                    isActive
                      ? "bg-brand-soft text-brand"
                      : "text-ink-soft hover:bg-brand-soft hover:text-ink",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {group.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
