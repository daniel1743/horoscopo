import { useEffect, useMemo, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { routes } from "@/config/routes";
import { Icon } from "@/components/ui/icon";
import { useSession } from "@/hooks/useSession";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { IconName } from "@/config/icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface DrawerItem {
  label: string;
  route: string;
  icon: IconName;
}

/**
 * Drawer secundario móvil. Estado controlado por SiteHeader/AppShell.
 * La física reveal/drag vive en AppShell; este componente solo organiza contenido.
 */
export function MobileNavigationDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();
  const isAuthed = !!user;

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Explorador";
  const username =
    user?.user_metadata?.username ||
    user?.email
      ?.split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9._]/g, "");

  const groups = useMemo(
    () => [
      {
        id: "home",
        title: null,
        items: [{ label: "Inicio", route: routes.home, icon: "home" as const }],
      },
      {
        id: "explore",
        title: "EXPLORAR",
        items: [
          { label: "Horóscopo", route: routes.horoscope, icon: "sun" as const },
          { label: "Tarot", route: routes.tarot, icon: "tarot" as const },
          { label: "Luna", route: routes.moon, icon: "moon" as const },
          { label: "Compatibilidad", route: routes.compatibility, icon: "compatibility" as const },
          { label: "Guías", route: routes.guides, icon: "article" as const },
        ],
      },
      ...(isAuthed
        ? [
            {
              id: "personal",
              title: "MI ESPACIO",
              items: [
                { label: "Favoritos", route: routes.favorites, icon: "favorite" as const },
                { label: "Historial", route: routes.history, icon: "history" as const },
                { label: "Mis lecturas", route: routes.savedReadings, icon: "tarot" as const },
              ],
            },
          ]
        : []),
    ],
    [isAuthed],
  );

  return (
    <div
      className="fixed inset-y-0 left-0 z-[60] flex h-[100dvh] w-[85vw] max-w-[360px] flex-col overflow-hidden bg-ivory text-ink outline-none lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label="Menú principal"
      id="mobile-navigation-drawer"
      ref={panelRef}
      tabIndex={-1}
    >
      <DrawerHeader
        isAuthed={isAuthed}
        displayName={displayName}
        username={username}
        avatarUrl={user?.user_metadata?.avatar_url}
      />

      <nav
        aria-label="Navegación principal móvil"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {groups.map((group) => (
          <div key={group.id} className="mb-5 last:mb-0">
            {group.title && (
              <p className="mb-2 px-2 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.route}>
                  <DrawerLink item={item} pathname={pathname} onClose={onClose} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <DrawerFooter isAuthed={isAuthed} onClose={onClose} />
    </div>
  );
}

function DrawerHeader({
  isAuthed,
  displayName,
  username,
  avatarUrl,
}: {
  isAuthed: boolean;
  displayName: string;
  username?: string;
  avatarUrl?: string;
}) {
  return (
    <div className="flex-none border-b border-line-subtle bg-ivory">
      <div
        className={cn("relative h-[160px] overflow-visible bg-brand-soft/50", isAuthed && "mb-12")}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          backgroundImage: "url('/fodo menu.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[rgba(24,20,18,0.12)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[56px] bg-gradient-to-b from-transparent to-ivory" />
        <svg
          viewBox="0 0 100 24"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 z-10 h-[32px] w-full text-ivory"
          aria-hidden="true"
        >
          <path d="M0,24 L0,18 C40,18 60,0 100,0 L100,24 Z" fill="currentColor" />
        </svg>

        {isAuthed && (
          <Avatar
            className="absolute left-12 z-20 h-[96px] w-[96px] rounded-full bg-warm-white shadow-[0_8px_22px_rgba(20,16,20,0.12)] ring-[4px] ring-brand ring-offset-[2px] ring-offset-warm-white"
            style={{ bottom: "-48px" }}
          >
            <AvatarImage src={avatarUrl} className="object-cover" />
            <AvatarFallback className="bg-brand-soft text-2xl font-semibold text-brand">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {isAuthed ? (
        <div className="relative z-20 px-12 pb-5 pt-3">
          <div className="min-w-0">
            <p className="truncate font-display text-[22px] font-semibold leading-tight tracking-tight text-ink">
              {displayName}
            </p>
            {username && (
              <p className="mt-0.5 truncate font-body text-[14px] text-ink-muted">@{username}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-20 -mt-8 flex min-h-[76px] items-center gap-3 px-12 pb-5">
          <img
            src="/favicon-48x48.png"
            alt=""
            className="h-14 w-14 rounded-[14px] shadow-[0_8px_22px_rgba(20,16,20,0.12)] ring-2 ring-brand/70 ring-offset-2 ring-offset-ivory"
          />
          <div className="min-w-0 pt-3">
            <p className="font-display text-[22px] font-semibold leading-tight text-ink">
              Creovision
            </p>
            <p className="mt-0.5 font-body text-[13px] text-ink-muted">Tarot, luna y astrología</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawerLink({
  item,
  pathname,
  onClose,
}: {
  item: DrawerItem;
  pathname: string;
  onClose: () => void;
}) {
  const active =
    item.route === routes.home ? pathname === routes.home : pathname.startsWith(item.route);

  return (
    <Link
      to={item.route}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-[50px] items-center gap-3 rounded-[12px] px-3 font-body text-[15px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand",
        active
          ? "bg-brand-soft/55 font-medium text-brand [&>svg]:text-brand"
          : "text-ink hover:bg-brand-soft/35 [&>svg]:text-ink-soft",
      )}
    >
      <Icon name={item.icon} size="sm" className="shrink-0 transition-colors" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function DrawerFooter({ isAuthed, onClose }: { isAuthed: boolean; onClose: () => void }) {
  return (
    <div
      className="flex-none border-t border-line-subtle bg-ivory px-5 pt-3"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {isAuthed ? (
        <div className="flex flex-col gap-2">
          <Link
            to={routes.settings}
            onClick={onClose}
            className="flex min-h-[46px] items-center gap-3 rounded-[12px] px-3 font-body text-[14px] text-ink outline-none transition-colors hover:bg-brand-soft/35 focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Icon name="settings" size="sm" className="text-ink-soft" />
            Configuración
          </Link>
          <Link
            to={routes.profile}
            onClick={onClose}
            className="flex min-h-[48px] items-center justify-center rounded-[12px] bg-brand px-4 font-body text-[14px] font-semibold text-ink-inverse shadow-sm outline-none transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Ver mi perfil
          </Link>
        </div>
      ) : (
        <Link
          to={routes.signIn}
          onClick={onClose}
          className="flex min-h-[48px] items-center justify-center rounded-[12px] bg-brand px-4 font-body text-[14px] font-semibold text-ink-inverse shadow-sm outline-none transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Iniciar sesión
        </Link>
      )}
    </div>
  );
}
