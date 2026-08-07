import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { copy } from "@/config/copy";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileTopbar } from "./MobileTopbar";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { useSession } from "@/hooks/useSession";
import { isPublicFeatureEnabled } from "@/config/public-features";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  drawerOpen?: boolean;
  onToggleDrawer?: () => void;
}

/** Header global. El estado del drawer móvil ahora es manejado por AppShell. */
export function SiteHeader({ drawerOpen = false, onToggleDrawer = () => {} }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSession();
  const isAuthed = !!user;
  const showAccountAccess = isPublicFeatureEnabled("account");
  const accountHref = isAuthed ? routes.account : routes.signIn;
  const accountLabel = isAuthed ? "Mi espacio" : copy.actions.account;

  // Un solo listener pasivo
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow,border-color] duration-200",
          scrolled
            ? "border-line bg-[color:rgba(255,255,255,0.92)] shadow-card backdrop-blur"
            : "border-line-subtle bg-background",
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Desktop */}
        <div
          className={cn(
            "mx-auto hidden max-w-[1280px] items-center justify-between gap-6 px-6 transition-[height] duration-200 lg:flex",
            scrolled ? "h-[68px]" : "h-[76px]",
          )}
        >
          <Link
            to={routes.home}
            aria-label="Ir al inicio de Creovision"
            className="inline-flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-cosmic rounded-md"
          >
            <img
              src="/brand/creovision-logo.png"
              alt="Creovision"
              className="h-[40px] w-auto max-w-[180px] object-contain block"
            />
          </Link>

          <DesktopNavigation />

          <div className="flex items-center gap-2">
            <SearchTrigger className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink" />

            {showAccountAccess && (
              <Button asChild variant="default">
                <Link to={accountHref}>
                  <Icon name="account" size="sm" className="mr-2" />
                  {accountLabel}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <MobileTopbar drawerOpen={drawerOpen} onToggleDrawer={onToggleDrawer} />
        </div>
      </header>
    </>
  );
}
