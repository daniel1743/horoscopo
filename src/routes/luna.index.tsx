import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/layout/Container";
import { MoonTodayCard } from "@/components/moon/MoonTodayCard";
import { NextMoonPhases } from "@/components/moon/NextMoonPhases";
import { MoonPhaseGrid } from "@/components/moon/MoonPhaseGrid";
import { MoonScientificFacts } from "@/components/moon/MoonScientificFacts";
import { MoonDisclaimer } from "@/components/moon/MoonDisclaimer";
import { MoonTodaySkeleton } from "@/components/moon/MoonSkeleton";
import { MoonUnavailableState } from "@/components/moon/MoonUnavailableState";
import { moonQueries } from "@/services/moon.service";
import { routes } from "@/config/routes";
import { buildMeta } from "@/config/seo";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";

export const Route = createFileRoute("/luna/")({
  head: () => {
    const m = buildMeta({
      title: "Luna hoy, calendario y fases — Creovision",
      description:
        "Fase lunar de hoy, calendario mensual y las ocho fases del ciclo, calculadas con un motor astronómico validado.",
      canonical: routes.moon,
    });
    return { meta: m.meta, links: m.links };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(moonQueries.today()),
      context.queryClient.ensureQueryData(moonQueries.upcoming()),
    ]);
  },
  component: MoonHubPage,
});

function MoonHubPage() {
  return (
    <PageShell breadcrumbs={[{ label: "Luna" }]}>
      <PageHeader
        eyebrow="Ciclo lunar"
        title="La Luna, día a día"
        description="Datos astronómicos calculados y lecturas simbólicas cuidadas. Sin causalidades, sin inventos."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link to={routes.moonToday}>Luna de hoy</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={routes.moonCalendar}>Calendario del mes</Link>
            </Button>
          </div>
        }
      />

      <SectionErrorBoundary fallback={<MoonUnavailableState />}>
        <Suspense fallback={<MoonTodaySkeleton />}>
          <MoonHubDynamic />
        </Suspense>
      </SectionErrorBoundary>

      <section aria-labelledby="moon-phases-heading" className="mt-14">
        <h2
          id="moon-phases-heading"
          className="font-display text-[24px] font-semibold text-ink md:text-[28px]"
        >
          Las ocho fases
        </h2>
        <p className="mt-2 max-w-[60ch] font-body text-[15px] text-ink-soft">
          Cada fase del ciclo sinódico tiene su ficha. Los datos astronómicos son verificables; la
          lectura simbólica es interpretativa.
        </p>
        <MoonPhaseGrid />
      </section>

      <MoonScientificFacts />
      <MoonDisclaimer />
    </PageShell>
  );
}

function MoonHubDynamic() {
  const { data: snapshot } = useSuspenseQuery(moonQueries.today());
  const { data: upcoming } = useSuspenseQuery(moonQueries.upcoming());
  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <MoonTodayCard snapshot={snapshot} compact />
      <section aria-labelledby="upcoming-phases-heading">
        <h2
          id="upcoming-phases-heading"
          className="mb-4 font-display text-[20px] font-semibold text-ink"
        >
          Próximas fases
        </h2>
        <NextMoonPhases events={upcoming} />
        <Link
          to={routes.moonCalendar}
          className="mt-4 inline-flex font-body text-[14px] text-cosmic hover:underline"
        >
          Ver todas en el calendario →
        </Link>
      </section>
    </div>
  );
}
