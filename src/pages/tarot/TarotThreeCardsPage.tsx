import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { ThreeCardExperienceShell } from "@/components/tarot/experience/ThreeCardExperienceShell";
import { threeCardReadings } from "@/config/three-card-readings";

export const tarotThreeCardsGeneralCopy = {
  h1: "Tarot de tres cartas",
  description:
    "Baraja, elige tres cartas y mira qué influencia, qué pide atención y cuál puede ser tu próximo paso.",
  positionSummary: "Influencia · Qué mirar · Próximo paso",
} as const;

export function TarotThreeCardsPage() {
  const config = threeCardReadings.general;

  return (
    <PageShell
      hideBreadcrumbs
      width="full"
      spacing="compact"
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Tres cartas", href: routes.tarotThreeCards },
      ]}
    >
      <PageHeader
        eyebrow="Tarot"
        title={tarotThreeCardsGeneralCopy.h1}
        description={tarotThreeCardsGeneralCopy.description}
        alignment="center"
        className="mx-auto mb-0 max-w-[920px] px-4 md:px-6"
      />

      <p
        aria-label={tarotThreeCardsGeneralCopy.positionSummary}
        className="mx-auto mt-3 flex max-w-[920px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-center font-body text-[13px] font-medium text-ink-soft md:px-6"
      >
        {tarotThreeCardsGeneralCopy.positionSummary.split(" · ").map((position, index) => (
          <span key={position} className="inline-flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="text-line-strong">·</span>}
            <span>{position}</span>
          </span>
        ))}
      </p>

      <div className="mt-3 md:mt-5">
        <ThreeCardExperienceShell readingSlug={config.slug} />
      </div>
    </PageShell>
  );
}
