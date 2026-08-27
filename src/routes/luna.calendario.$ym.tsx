import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MoonMonthNavigation } from "@/components/moon/MoonMonthNavigation";
import { MoonCalendar } from "@/components/moon/MoonCalendar";
import { MoonCalendarSkeleton } from "@/components/moon/MoonSkeleton";
import { MoonUnavailableState } from "@/components/moon/MoonUnavailableState";
import { MoonScientificFacts } from "@/components/moon/MoonScientificFacts";
import { MoonDisclaimer } from "@/components/moon/MoonDisclaimer";
import { moonQueries } from "@/services/moon.service";
import { moonCalendarMonthRoute, routes } from "@/config/routes";
import { MOON_SITE_TIMEZONE, MOON_CALENDAR_RANGE_YEARS } from "@/config/moon";
import { getZonedParts } from "@/lib/moon/timezone";
import { parseYearMonth, formatMonthYear } from "@/lib/moon/format";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/luna/calendario/$ym")({
  parseParams: (raw) => {
    const parsed = parseYearMonth(raw.ym);
    if (!parsed) throw notFound();
    const nowYear = new Date().getUTCFullYear();
    if (
      parsed.year < nowYear - MOON_CALENDAR_RANGE_YEARS.past ||
      parsed.year > nowYear + MOON_CALENDAR_RANGE_YEARS.future
    ) {
      throw notFound();
    }
    return { ym: raw.ym, year: parsed.year, month: parsed.month };
  },
  head: ({ params }) => {
    const label = params ? formatMonthYear(params.year, params.month) : "Calendario";
    const m = buildMeta({
      title: `Calendario lunar · ${label} — Creovision`,
      description: `Fases lunares y eventos mayores en ${label}. Cálculos astronómicos validados.`,
      canonical: params ? moonCalendarMonthRoute(params.year, params.month) : "/luna/calendario",
    });
    return { meta: m.meta, links: m.links };
  },
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(moonQueries.calendar(params.year, params.month));
  },
  notFoundComponent: () => (
    <PageShell breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Calendario" }]}>
      <PageHeader
        title="Mes no disponible"
        description="Elige un mes dentro del rango soportado."
      />
    </PageShell>
  ),
  errorComponent: () => (
    <PageShell breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Calendario" }]}>
      <MoonUnavailableState />
    </PageShell>
  ),
  component: MoonCalendarMonthPage,
});

function MoonCalendarMonthPage() {
  const { year, month } = Route.useParams();
  return (
    <PageShell breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Calendario" }]}>
      <PageHeader
        eyebrow="Ciclo lunar"
        title="Calendario lunar"
        description="Cada día muestra su fase e iluminación aproximada. Los días marcados en color coinciden con una fase mayor."
      />
      <MoonMonthNavigation year={year} month={month} />
      <SectionErrorBoundary fallback={<MoonUnavailableState />}>
        <Suspense fallback={<MoonCalendarSkeleton />}>
          <MoonCalendarDynamic year={year} month={month} />
        </Suspense>
      </SectionErrorBoundary>
      <MoonScientificFacts />
      <MoonDisclaimer />
    </PageShell>
  );
}

function MoonCalendarDynamic({ year, month }: { year: number; month: number }) {
  const { data: days } = useSuspenseQuery(moonQueries.calendar(year, month));
  const { year: nowY, month: nowM, day: nowD } = getZonedParts(new Date(), MOON_SITE_TIMEZONE);
  const todayKey = `${nowY}-${String(nowM).padStart(2, "0")}-${String(nowD).padStart(2, "0")}`;
  return <MoonCalendar year={year} month={month} days={days} todayKey={todayKey} />;
}
