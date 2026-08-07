import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Icon } from "@/components/ui/icon";
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

  // Arquitectura de navegación principal
  const mainGroups = [
    {
      id: "explore",
      title: "Explorar",
      items: [
        { label: "Inicio", route: routes.home, icon: "home" as const },
        { label: "Horóscopo", route: routes.horoscope, icon: "sun" as const },
        { label: "Tarot", route: routes.tarot, icon: "tarot" as const },
        { label: "Luna", route: routes.moon, icon: "moon" as const },
        { label: "Guías", route: routes.guides, icon: "article" as const },
      ],
    },
    isAuthed
      ? {
          id: "personal",
          title: "Tu espacio",
          items: [
            { label: "Favoritos", route: routes.favorites, icon: "favorite" as const },
            { label: "Historial", route: routes.history, icon: "history" as const },
          ],
        }
      : {
          id: "personal",
          title: "Tu espacio",
          items: [
            { label: "Iniciar sesión", route: routes.signIn, icon: "user" as const },
            { label: "Crear cuenta", route: (routes as any).signUp || routes.signIn, icon: "user" as const },
          ],
        },
    isAuthed
      ? {
          id: "account",
          title: "Cuenta",
          items: [
            { label: "Configuración", route: routes.settings, icon: "settings" as const },
          ],
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    title: string;
    items: Array<{ label: string; route: string; icon?: any }>;
  }>;

  // Navegación secundaria
  const secondaryLinks = [
    { label: "Cómo funciona Creovision", route: routes.method },
    { label: "Información y legal", route: routes.privacy }, // Fallback agrupado a privacidad
  ];

  return (
    <div
      className="fixed inset-y-0 left-0 z-0 flex h-full w-[82vw] max-w-[340px] flex-col bg-ivory outline-none lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
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
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Grupos principales */}
        {mainGroups.map((group, idx) => (
          <div key={group.id} className={idx > 0 ? "mt-8" : ""}>
            <p className="mb-3 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.route}
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

        <hr className="my-6 border-line-subtle" />

        {/* Navegación secundaria */}
        <ul className="space-y-1 pb-4">
          {secondaryLinks.map((item) => (
            <li key={item.label}>
              <Link
                to={item.route}
                onClick={onClose}
                className="flex min-h-[40px] items-center rounded-[var(--radius-control)] px-3 py-2 font-body text-[15px] text-ink-soft hover:bg-brand-soft hover:text-ink"
              >
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Perfil */}
      <div className="flex-shrink-0 px-6 pb-8 pt-4">
        {isAuthed && (
          <Link
            to={routes.account}
            onClick={onClose}
            className="group mb-6 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-brand-soft"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-brand-soft text-brand">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="truncate font-display text-[15px] font-semibold text-ink group-hover:text-brand">
                {user?.user_metadata?.name || user?.email?.split("@")[0] || "Explorador"}
              </p>
              <p className="font-body text-[13px] text-ink-soft group-hover:text-ink">
                Ver mi espacio
              </p>
            </div>
          </Link>
        )}
        <p className="font-body text-[11px] text-ink-muted px-2">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </div>
  );
}
