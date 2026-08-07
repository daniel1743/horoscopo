import { useState, useEffect, useLayoutEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, useDragControls, animate } from "motion/react";
import { SkipLink } from "./SkipLink";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";
import { cn } from "@/lib/utils";

/**
 * Shell global reutilizable. Envuelve todas las páginas.
 * Implementa un menú lateral (drawer) con físicas controladas por Framer Motion.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedScrollY, setSavedScrollY] = useState(0);
  const [drawerWidth, setDrawerWidth] = useState(300);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const x = useMotionValue(0);
  const dragControls = useDragControls();

  // Setup drawer width based on window size
  useLayoutEffect(() => {
    const calcWidth = () => {
      setDrawerWidth(Math.min(window.innerWidth * 0.82, 340));
    };
    calcWidth();
    window.addEventListener("resize", calcWidth);
    return () => window.removeEventListener("resize", calcWidth);
  }, []);

  // Snapping logic
  const springConfig = { type: "spring", stiffness: 420, damping: 38 } as const;

  const snapOpen = () => {
    animate(x, drawerWidth, springConfig).then(() => setIsMenuOpen(true));
    setIsMenuOpen(true);
  };

  const snapClosed = () => {
    animate(x, 0, springConfig).then(() => setIsMenuOpen(false));
    setIsMenuOpen(false);
  };

  // Close when routing
  useEffect(() => {
    if (isMenuOpen || x.get() > 0) {
      snapClosed();
    }
  }, [pathname]);

  // Body scroll lock
  useLayoutEffect(() => {
    if (isMenuOpen) {
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
  }, [isMenuOpen]);

  const handleDragEnd = (e: any, info: any) => {
    const position = x.get();
    const progress = position / drawerWidth;
    const velocity = info.velocity.x;

    const VELOCITY_THRESHOLD = 500;
    const POSITION_THRESHOLD = 0.35;

    if (velocity > VELOCITY_THRESHOLD) {
      snapOpen();
    } else if (velocity < -VELOCITY_THRESHOLD) {
      snapClosed();
    } else if (progress >= POSITION_THRESHOLD) {
      snapOpen();
    } else {
      snapClosed();
    }
  };

  const appShellOpacity = useTransform(x, [0, drawerWidth], [1, 0.5]);
  const appShellBorderRadius = useTransform(x, [0, drawerWidth], ["0px", "28px"]);

  return (
    <div className="relative w-full bg-background overflow-hidden">
      {/* Edge trigger for opening */}
      <div 
        className="fixed inset-y-0 left-0 w-6 z-50 lg:hidden" 
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => {
          if (!isMenuOpen && window.innerWidth < 1024) {
            dragControls.start(e);
          }
        }}
      />

      <div className="fixed inset-y-0 left-0 z-0 bg-background lg:hidden">
        <MobileNavigationDrawer open={isMenuOpen} onClose={snapClosed} />
      </div>

      <motion.div
        className={cn(
          "bg-background text-ink z-10 w-full min-h-screen relative origin-left overflow-hidden isolate",
          "shadow-[-14px_0_34px_rgba(20,16,30,0.16)] border-l-0 outline-none ring-0 lg:rounded-none lg:shadow-none lg:h-auto lg:min-h-screen lg:opacity-100"
        )}
        style={{ 
          x, 
          touchAction: "pan-y",
          opacity: appShellOpacity,
          borderTopLeftRadius: appShellBorderRadius,
          borderBottomLeftRadius: appShellBorderRadius
        }}
        drag="x"
        dragControls={dragControls}
        dragMomentum={false}
        dragConstraints={{ left: 0, right: drawerWidth }}
        dragElastic={0.05}
        dragListener={isMenuOpen} // only listen to whole app shell drag when open to close it
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex flex-col min-h-screen w-full bg-background relative"
          style={{
            transform: isMenuOpen ? `translateY(-${savedScrollY}px)` : "none",
            transition: "none",
          }}
        >
          {/* Clickable area when menu is open to close it without dragging */}
          {isMenuOpen && (
            <div
              className="absolute inset-0 z-50 lg:hidden bg-transparent cursor-pointer"
              onClick={snapClosed}
              aria-hidden="true"
            />
          )}

          <SkipLink />
          <SiteHeader 
            drawerOpen={isMenuOpen} 
            onToggleDrawer={() => (isMenuOpen ? snapClosed() : snapOpen())} 
          />
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
      </motion.div>
    </div>
  );
}
