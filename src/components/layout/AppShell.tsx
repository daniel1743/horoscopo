import { useState, useEffect, useLayoutEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SkipLink } from "./SkipLink";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";
import { cn } from "@/lib/utils";

/**
 * Shell global reutilizable. Envuelve todas las páginas.
 * Reserva espacio inferior en móvil para la bottom navigation.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedScrollY, setSavedScrollY] = useState(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Cerrar drawer al cambiar de ruta
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Bloquear scroll de la página y mantener la posición visual
  useLayoutEffect(() => {
    if (drawerOpen) {
      const currentScroll = window.scrollY;
      setSavedScrollY(currentScroll);
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      if (savedScrollY > 0) {
        window.scrollTo(0, savedScrollY);
      }
    }
  }, [drawerOpen]); // Solo dependemos de drawerOpen para no sobreescribir el scroll


  return (
    <>
      <div className="fixed inset-y-0 left-0 z-0 bg-background lg:hidden">
        <MobileNavigationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>

      <div 
        className={cn(
          "bg-background text-ink z-10 w-full",
          "transition-[transform,border-radius,box-shadow] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          drawerOpen 
            ? "fixed inset-0 translate-x-[82vw] rounded-l-[28px] shadow-[-14px_0_34px_rgba(20,16,30,0.16)] overflow-hidden isolate border-l-0 outline-none ring-0 touch-none lg:relative lg:translate-x-0 lg:rounded-none lg:shadow-none lg:h-auto lg:min-h-screen" 
            : "relative min-h-screen translate-x-0 rounded-none shadow-none"
        )}
      >
        <div
          className="flex flex-col min-h-screen w-full bg-background"
          style={{
            transform: drawerOpen ? `translateY(-${savedScrollY}px)` : "none",
            transition: "none", // Prevent animating the scroll restoration to avoid jumping
          }}
        >
        <div 
          className={cn(
            "absolute inset-0 z-50 lg:hidden transition-colors duration-[280ms]",
            drawerOpen ? "bg-transparent cursor-pointer" : "bg-transparent pointer-events-none"
          )}
          onClick={() => setDrawerOpen(false)} 
          aria-hidden="true"
        />
        <SkipLink />
        <SiteHeader drawerOpen={drawerOpen} onToggleDrawer={() => setDrawerOpen(v => !v)} />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom)+16px)] outline-none lg:pb-0"
        >
          {children}
        </main>
        <SiteFooter />
        <MobileBottomNavigation />
        </div>
      </div>
    </>
  );
}
