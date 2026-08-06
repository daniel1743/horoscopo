import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { drawerGroups } from "@/config/navigation";
import { routes } from "@/config/routes";
import { copy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { isPublicFeatureEnabled } from "@/config/public-features";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Drawer secundario móvil. Estado controlado por SiteHeader (single source).
 * Cierra sincrónicamente al navegar con onClick={onClose}.
 */
export function MobileNavigationDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Body scroll lock + Escape + focus management
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Focus panel para el trap básico
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      id="mobile-navigation-drawer"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className="absolute inset-0 bg-[color:rgba(23,21,38,0.5)] backdrop-blur-sm"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-[min(92vw,390px)] flex-col bg-warm-white shadow-floating outline-none"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
          <span className="font-display text-[18px] font-semibold text-ink">Menú</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink"
          >
            <Icon name="close" size="md" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6">
          {showAccountAccess && (
            <div className="mb-6 rounded-[var(--radius-card)] border border-line-subtle bg-ivory p-4">
              <p className="font-display text-[16px] font-semibold text-ink">Tu espacio personal</p>
              <p className="mt-1 font-body text-[13px] text-ink-soft">
                Guarda lecturas y contenido para consultarlos después.
              </p>
              <Button asChild variant="default" className="mt-3 w-full">
                <Link to={routes.account} onClick={onClose}>
                  {copy.actions.createAccount}
                </Link>
              </Button>
            </div>
          )}

          {drawerGroups.map((group, idx) => (
            <div key={group.id} className={idx > 0 ? "mt-6 border-t border-line-subtle pt-6" : ""}>
              <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.routeKey}>
                    <Link
                      to={routes[item.routeKey]}
                      onClick={onClose}
                      className="flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 font-body text-[15px] text-ink hover:bg-brand-soft"
                    >
                      {item.icon && <Icon name={item.icon} size="sm" className="text-ink-soft" />}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-line-subtle px-5 py-4">
          <p className="font-body text-[11px] text-ink-muted">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </div>
  );
}
const showAccountAccess = isPublicFeatureEnabled("account");
