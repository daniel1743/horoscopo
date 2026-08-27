import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { MoonPhaseVisual } from "@/components/moon/MoonPhaseVisual";
import { MoonDisclaimer } from "@/components/moon/MoonDisclaimer";
import { MoonScientificFacts } from "@/components/moon/MoonScientificFacts";
import { MoonUnavailableState } from "@/components/moon/MoonUnavailableState";
import { NextMoonPhases } from "@/components/moon/NextMoonPhases";
import { ContextualAiButton } from "@/components/ai/ContextualAiButton";
import { moonQueries } from "@/services/moon.service";
import { MOON_PHASE_ORDER, MOON_PHASE_REGISTRY, phaseBySlug } from "@/config/moon";
import { routes, moonPhaseRoute } from "@/config/routes";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import type { MoonPhaseKey } from "@/types/moon";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/luna/fases/$slug")({
  parseParams: (raw) => {
    const meta = phaseBySlug(raw.slug);
    if (!meta) throw notFound();
    return { slug: raw.slug, phaseKey: meta.key };
  },
  head: ({ params }) => {
    const meta = params?.phaseKey ? MOON_PHASE_REGISTRY[params.phaseKey] : null;
    const title = meta ? `${meta.label} — Creovision` : "Fase lunar";
    const desc = meta
      ? `${meta.label}: astronomía y lectura simbólica en Creovision.`
      : "Fase lunar en Creovision.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: moonPhaseRoute(params.slug) }],
    };
  },
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(moonQueries.contentByPhase(params.phaseKey)),
      context.queryClient.ensureQueryData(moonQueries.upcoming()),
    ]);
  },
  notFoundComponent: () => (
    <PageShell breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Fase" }]}>
      <PageHeader
        title="Fase no encontrada"
        description="La fase lunar que buscas no existe o cambió de dirección."
      />
      <Button asChild variant="outline">
        <Link to={routes.moonPhases}>Ver las 8 fases</Link>
      </Button>
    </PageShell>
  ),
  errorComponent: () => (
    <PageShell breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Fase" }]}>
      <MoonUnavailableState />
    </PageShell>
  ),
  component: MoonPhasePage,
});

function MoonPhasePage() {
  const params = Route.useParams() as { slug: string; phaseKey: MoonPhaseKey };
  const phaseKey = params.phaseKey;
  const meta = MOON_PHASE_REGISTRY[phaseKey];
  const orderIndex = MOON_PHASE_ORDER.indexOf(phaseKey);
  const prevKey =
    MOON_PHASE_ORDER[(orderIndex - 1 + MOON_PHASE_ORDER.length) % MOON_PHASE_ORDER.length];
  const nextKey = MOON_PHASE_ORDER[(orderIndex + 1) % MOON_PHASE_ORDER.length];

  return (
    <PageShell
      breadcrumbs={[
        { label: "Luna", href: routes.moon },
        { label: "Fases", href: routes.moonPhases },
        { label: meta.label },
      ]}
      width="narrow"
    >
      <div className="mb-8 flex items-start gap-6">
        <div className="hidden shrink-0 sm:block">
          <MoonPhaseVisual
            fraction={sampleFractionForPhase(phaseKey)}
            waxing={isWaxingPhase(phaseKey)}
            size={140}
            title={meta.label}
          />
        </div>
        <div className="flex-1">
          <PageHeader
            eyebrow="Fase lunar"
            title={meta.label}
            description="Astronomía y lectura simbólica. Ninguna afirmación causal sobre las personas."
            className="mb-0"
          />
        </div>
      </div>

      <SectionErrorBoundary fallback={<MoonUnavailableState />}>
        <Suspense fallback={<PhaseContentSkeleton />}>
          <PhaseContentDynamic phaseKey={phaseKey} />
        </Suspense>
      </SectionErrorBoundary>

      <nav
        aria-label="Navegación entre fases"
        className="mt-12 flex items-center justify-between gap-4 border-t border-ink/10 pt-6"
      >
        <Link
          to={moonPhaseRoute(MOON_PHASE_REGISTRY[prevKey].slug)}
          className="inline-flex items-center gap-2 font-body text-[14px] text-cosmic hover:underline"
        >
          <Icon name="back" size="sm" /> {MOON_PHASE_REGISTRY[prevKey].label}
        </Link>
        <Link
          to={moonPhaseRoute(MOON_PHASE_REGISTRY[nextKey].slug)}
          className="inline-flex items-center gap-2 font-body text-[14px] text-cosmic hover:underline"
        >
          {MOON_PHASE_REGISTRY[nextKey].label} <Icon name="forward" size="sm" />
        </Link>
      </nav>

      <MoonScientificFacts />
    </PageShell>
  );
}

function PhaseContentSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

function PhaseContentDynamic({ phaseKey }: { phaseKey: MoonPhaseKey }) {
  const { data: content } = useSuspenseQuery(moonQueries.contentByPhase(phaseKey));
  const { data: upcoming } = useSuspenseQuery(moonQueries.upcoming());
  const meta = MOON_PHASE_REGISTRY[phaseKey];

  if (!content) {
    return (
      <Card className="p-6">
        <h2 className="font-display text-[20px] text-ink">Ficha en preparación</h2>
        <p className="mt-2 font-body text-[15px] text-ink-soft">
          El equipo editorial aún no ha publicado el contenido para {meta.label.toLowerCase()}.
        </p>
      </Card>
    );
  }

  return (
    <article className="space-y-10">
      <section aria-labelledby="phase-summary">
        <h2
          id="phase-summary"
          className="font-display text-[22px] font-semibold text-ink md:text-[26px]"
        >
          Qué es esta fase
        </h2>
        <p className="mt-3 font-body text-[16px] leading-[1.75] text-ink">{content.summary}</p>
      </section>

      <section aria-labelledby="phase-meaning">
        <h2
          id="phase-meaning"
          className="font-display text-[22px] font-semibold text-ink md:text-[26px]"
        >
          Lectura simbólica
        </h2>
        <p className="mt-3 font-body text-[16px] leading-[1.75] text-ink">{content.meaning}</p>

        <ContextualAiButton
          mode="reflection"
          label="Ampliar con el asistente"
          context={{ kind: "none" }}
        />
      </section>

      {content.reflection_questions.length > 0 && (
        <section aria-labelledby="phase-questions">
          <h2 id="phase-questions" className="font-display text-[20px] font-semibold text-ink">
            Preguntas para reflexionar
          </h2>
          <ul className="mt-3 space-y-2 font-body text-[15px] text-ink">
            {content.reflection_questions.map((q) => (
              <li key={q} className="flex gap-3">
                <span aria-hidden className="mt-1 text-cosmic">
                  •
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {content.practical_suggestions.length > 0 && (
        <section aria-labelledby="phase-practical">
          <h2 id="phase-practical" className="font-display text-[20px] font-semibold text-ink">
            Sugerencias prácticas
          </h2>
          <ul className="mt-3 space-y-2 font-body text-[15px] text-ink">
            {content.practical_suggestions.map((s) => (
              <li key={s} className="flex gap-3">
                <span aria-hidden className="mt-1 text-cosmic">
                  ·
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {content.misconceptions.length > 0 && (
        <section aria-labelledby="phase-myths">
          <h2 id="phase-myths" className="font-display text-[20px] font-semibold text-ink">
            Malentendidos frecuentes
          </h2>
          <ul className="mt-3 space-y-2 font-body text-[15px] text-ink-soft">
            {content.misconceptions.map((m) => (
              <li key={m} className="rounded-[var(--radius-card)] bg-parchment px-4 py-3">
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="phase-upcoming">
        <h2 id="phase-upcoming" className="font-display text-[20px] font-semibold text-ink">
          Próximas fases mayores
        </h2>
        <div className="mt-4">
          <NextMoonPhases events={upcoming} limit={4} />
        </div>
      </section>

      <MoonDisclaimer isDemo={content.is_demo} />
    </article>
  );
}

/** Fracción representativa para el diagrama del encabezado (constante por fase). */
function sampleFractionForPhase(key: MoonPhaseKey): number {
  const table: Record<MoonPhaseKey, number> = {
    new_moon: 0,
    waxing_crescent: 0.25,
    first_quarter: 0.5,
    waxing_gibbous: 0.75,
    full_moon: 1,
    waning_gibbous: 0.75,
    last_quarter: 0.5,
    waning_crescent: 0.2,
  };
  return table[key];
}
function isWaxingPhase(key: MoonPhaseKey): boolean {
  return (
    key === "waxing_crescent" ||
    key === "first_quarter" ||
    key === "waxing_gibbous" ||
    key === "new_moon"
  );
}
