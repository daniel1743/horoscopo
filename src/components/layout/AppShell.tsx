import { useState, useEffect, type ReactNode } from "react";
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Cerrar drawer al cambiar de ruta
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Bloquear scroll de la página
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-0 bg-background lg:hidden">
        <MobileNavigationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>

      <div 
        className={cn(
          "flex min-h-screen flex-col bg-background text-ink relative z-10",
          "transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          drawerOpen && "translate-x-[82vw] rounded-l-[28px] shadow-[-14px_0_34px_rgba(20,16,30,0.16)] overflow-hidden isolate border-l-0 outline-none ring-0 touch-none motion-reduce:transition-none motion-reduce:transform-none lg:translate-x-0 lg:rounded-none lg:shadow-none"
        )}
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
    </>
  );
}
