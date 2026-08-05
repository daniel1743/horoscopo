import { Link } from "@tanstack/react-router";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { isPublicFeatureEnabled } from "@/config/public-features";
import { Icon } from "@/components/ui/icon";

interface Props {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}

/** Topbar móvil. El estado del drawer se controla desde el padre (SiteHeader). */
export function MobileTopbar({ drawerOpen, onToggleDrawer }: Props) {
  const showAccountAccess = isPublicFeatureEnabled("account");

  return (
    <div className="flex h-[60px] items-center justify-between gap-2 px-4">
      <Link to={routes.home} aria-label="Ir al inicio" className="inline-flex items-center gap-2">
        <span className="font-display text-[18px] font-semibold text-ink">
          {siteConfig.shortName}
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <Link
          to={routes.search}
          aria-label="Buscar"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink"
        >
          <Icon name="search" size="md" />
        </Link>
        {showAccountAccess && (
          <Link
            to={routes.account}
            aria-label="Abrir mi espacio"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink"
          >
            <Icon name="account" size="md" />
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleDrawer}
          aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation-drawer"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink"
        >
          <Icon name={drawerOpen ? "close" : "menu"} size="md" />
        </button>
      </div>
    </div>
  );
}
