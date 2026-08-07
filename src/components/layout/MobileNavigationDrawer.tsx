import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { drawerGroups } from "@/config/navigation";
import { routes } from "@/config/routes";
import { copy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { isPublicFeatureEnabled } from "@/config/public-features";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { user } = useSession();
  const isAuthed = !!user;

  // Body scroll lock + Escape + focus management
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Focus panel para el trap básico
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  // Si no usamos transformación en el propio Drawer porque está siempre en el fondo,
  // podríamos simplemente renderizarlo. Pero para evitar que se pise con contenido
  // del body o que se tabule cuando no debe, podemos usar inert o hidden, 
  // aunque el diseño pide que esté en el fondo. Dejamos que esté presente pero `aria-hidden` cuando esté cerrado.
  // Pero mejor lo renderizamos condicionalmente si el usuario no tiene la animación,
  // o lo renderizamos siempre con tabindex=-1 si está cerrado.
  // Para hacerlo sencillo y mantener la estructura:
  if (!open) return null;

  return (
    <div
      className="fixed inset-y-0 left-0 z-0 flex h-full w-[82vw] max-w-[340px] flex-col bg-ivory outline-none lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      id="mobile-navigation-drawer"
      ref={panelRef}
      tabIndex={-1}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
        <div className="flex items-center justify-between px-6 py-5">
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

        <div className="flex-1 overflow-y-auto px-6 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">


          {drawerGroups.map((group, idx) => (
            <div key={group.id} className={idx > 0 ? "mt-8" : ""}>
              <p className="mb-3 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.routeKey}>
                    <Link
                      to={routes[item.routeKey]}
                      onClick={onClose}
                      className="flex min-h-[48px] items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 font-body text-[16px] text-ink hover:bg-brand-soft"
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

        <div className="flex-shrink-0 px-6 pb-8 pt-6">
          <div className="mb-6">
            {isAuthed ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-brand-soft text-brand">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="truncate font-display text-[15px] font-semibold text-ink">
                    {user?.user_metadata?.name || user?.email?.split("@")[0] || "Explorador"}
                  </p>
                  <Link
                    to={routes.account}
                    onClick={onClose}
                    className="font-body text-[13px] text-ink-soft hover:text-ink hover:underline"
                  >
                    Ver mi espacio
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to={routes.signIn} onClick={onClose} className="font-semibold text-brand hover:underline">
                  Iniciar sesión
                </Link>
                <Link to={routes.signUp} onClick={onClose} className="text-sm text-ink-soft hover:text-ink">
                  ¿No tienes cuenta? Crear cuenta
                </Link>
              </div>
            )}
          </div>
          <p className="font-body text-[11px] text-ink-muted">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
    </div>
  );
}
const showAccountAccess = isPublicFeatureEnabled("account");
