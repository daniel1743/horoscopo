import type { ReactNode } from "react";
import { SkipLink } from "./SkipLink";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNavigation } from "./MobileBottomNavigation";

/**
 * Shell global reutilizable. Envuelve todas las páginas.
 * Reserva espacio inferior en móvil para la bottom navigation.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <SkipLink />
      <SiteHeader />
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
  );
}
