import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { MoonTodayCard } from "@/components/moon/MoonTodayCard";
import { MoonTodaySkeleton } from "@/components/moon/MoonSkeleton";
import { MoonUnavailableState } from "@/components/moon/MoonUnavailableState";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { moonQueries } from "@/services/moon.service";
import { homeConfig } from "@/config/home";
import { routes } from "@/config/routes";

/**
 * Bloque "Luna de hoy" en Home (YAML 10 §22).
 * Reemplaza los datos mock por el servicio real. No añade lógica
 * astronómica local — todo pasa por `moonQueries.today()`.
 */
export function MoonTodaySection() {
  const { moonToday: cfg } = homeConfig;

  return (
    <section
      aria-labelledby="moon-today-title"
      className="relative overflow-hidden bg-night text-ink-inverse"
    >
      <Container className="relative py-14 md:py-20">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[62ch]">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.16em] text-gold">
              {cfg.eyebrow}
            </p>
            <h2
              id="moon-today-title"
              className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-ink-inverse md:text-[40px]"
            >
              {cfg.title}
            </h2>
            <p className="mt-3 font-body text-[16px] leading-[1.7] text-ink-inverse/78">
              {cfg.description}
            </p>
          </div>
          <Button asChild variant="dark">
            <Link to={routes[cfg.action.routeKey!]}>{cfg.action.label}</Link>
          </Button>
        </div>
        <SectionErrorBoundary fallback={<MoonUnavailableState />}>
          <Suspense fallback={<MoonTodaySkeleton />}>
            <MoonTodayLive />
          </Suspense>
        </SectionErrorBoundary>
      </Container>
    </section>
  );
}

function MoonTodayLive() {
  const { data: snapshot } = useSuspenseQuery(moonQueries.today());
  return <MoonTodayCard snapshot={snapshot} compact />;
}
