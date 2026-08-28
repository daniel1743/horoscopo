import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MoonTodayCard } from "@/components/moon/MoonTodayCard";
import { NextMoonPhases } from "@/components/moon/NextMoonPhases";
import { MoonScientificFacts } from "@/components/moon/MoonScientificFacts";
import { MoonDisclaimer } from "@/components/moon/MoonDisclaimer";
import { MoonTodaySkeleton } from "@/components/moon/MoonSkeleton";
import { MoonUnavailableState } from "@/components/moon/MoonUnavailableState";
import { moonQueries } from "@/services/moon.service";
import { routes } from "@/config/routes";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/luna/hoy")({
  head: () => {
    const m = buildMeta({
      title: "Luna de hoy — Creovision",
      description:
        "Fase, iluminación, edad lunar y próxima fase mayor calculadas para hoy con un motor astronómico validado.",
      canonical: routes.moonToday,
      type: "article",
      structuredData: "WebPage",
    });
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(moonQueries.today()),
      context.queryClient.ensureQueryData(moonQueries.upcoming()),
    ]);
  },
  component: MoonTodayPage,
});

function MoonTodayPage() {
  return (
    <PageShell breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Luna de hoy" }]}>
      <PageHeader
        eyebrow="Cálculo astronómico"
        title="Luna de hoy"
        description="Los datos siguientes se calculan con astronomy-engine y no son opinión editorial."
      />
      <SectionErrorBoundary fallback={<MoonUnavailableState />}>
        <Suspense fallback={<MoonTodaySkeleton />}>
          <MoonTodayDynamic />
        </Suspense>
      </SectionErrorBoundary>
      <MoonScientificFacts />
      <MoonDisclaimer />
    </PageShell>
  );
}

function MoonTodayDynamic() {
  const { data: snapshot } = useSuspenseQuery(moonQueries.today());
  const { data: upcoming } = useSuspenseQuery(moonQueries.upcoming());
  return (
    <div className="space-y-10">
      <MoonTodayCard snapshot={snapshot} />
      <section aria-labelledby="next-phases-heading">
        <h2
          id="next-phases-heading"
          className="mb-4 font-display text-[22px] font-semibold text-ink md:text-[26px]"
        >
          Próximas fases mayores
        </h2>
        <NextMoonPhases events={upcoming} limit={8} />
      </section>
    </div>
  );
}
