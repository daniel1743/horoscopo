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
      <Link
        to={routes.home}
        aria-label="Ir al inicio de Creovision"
        className="inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-cosmic rounded-md"
      >
        <img src="/favicon-48x48.png" alt="" className="h-8 w-8 object-contain" />
        <span className="font-display text-[20px] font-bold text-ink">Creovision</span>
      </Link>

      <div className="flex items-center gap-1">
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
