import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { Card } from "@/components/ui/card";
import { Icon, type IconProps } from "@/components/ui/icon";
import { Suspense } from "react";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";

export const Route = createFileRoute("/luna/")({
  head: () => {
    const m = buildMeta({
      title: "Luna hoy, calendario y fases — Creovision",
      description:
        "Fase lunar de hoy, calendario mensual y las ocho fases del ciclo, calculadas con un motor astronómico validado.",
      canonical: routes.moon,
      structuredData: "CollectionPage",
    });
    return { meta: m.meta, links: m.links, scripts: m.scripts };
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
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link to={routes.moonPersonalToday} className="gap-2">
                <Icon name="sparkles" size="sm" />
                <span>Conocer Tu Luna de Hoy</span>
              </Link>
            </Button>
            <Button asChild variant="outline">
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

      <MoonHubPathways />

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

const moonHubPathways: Array<{
  title: string;
  description: string;
  href: string;
  icon: IconProps["name"];
  action: string;
}> = [
  {
    title: "Tu Luna de Hoy",
    description: "Conecta la fase actual con una lectura personal.",
    href: routes.moonPersonalToday,
    icon: "sparkles",
    action: "Abrir lectura",
  },
  {
    title: "Calendario lunar",
    description: "Revisa las fechas del mes y las próximas fases.",
    href: routes.moonCalendar,
    icon: "calendar",
    action: "Ver calendario",
  },
  {
    title: "Fases lunares",
    description: "Explora el significado de cada etapa del ciclo.",
    href: routes.moonPhases,
    icon: "moon",
    action: "Explorar fases",
  },
];

function MoonHubPathways() {
  return (
    <section
      aria-labelledby="moon-pathways-heading"
      className="mt-10 rounded-[var(--radius-card-lg)] border border-ink/10 bg-ivory/60 p-5 md:mt-12 md:p-6"
    >
      <div className="max-w-[68ch]">
        <h2
          id="moon-pathways-heading"
          className="font-display text-[22px] font-semibold text-ink md:text-[26px]"
        >
          Explora el ciclo lunar
        </h2>
        <p className="mt-2 font-body text-[14px] leading-[1.65] text-ink-soft md:text-[15px]">
          Usa la fase actual como punto de partida: puedes leerla en clave personal, revisar las
          fechas del mes o explorar el significado de cada fase.
        </p>
      </div>
      <ul className="mt-5 grid gap-3 md:grid-cols-3 md:gap-4">
        {moonHubPathways.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className="group block h-full rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic focus-visible:ring-offset-2"
            >
              <Card className="flex h-full flex-col gap-3 border-ink/10 bg-background p-4 shadow-none transition-colors group-hover:border-cosmic group-hover:bg-parchment/70 md:p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-parchment text-cosmic">
                    <Icon name={item.icon} />
                  </span>
                  <h3 className="font-display text-[17px] leading-tight text-ink">{item.title}</h3>
                </div>
                <p className="font-body text-[14px] leading-[1.55] text-ink-soft">
                  {item.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 font-body text-[13px] font-medium text-cosmic">
                  {item.action} <Icon name="forward" size="sm" />
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
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
