import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { ThreeCardExperienceShell } from "@/components/tarot/experience/ThreeCardExperienceShell";
import { threeCardReadings } from "@/config/three-card-readings";

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
        title="Tira tus cartas"
        description="Baraja, elige tres cartas y mira qué influencia, qué pide atención y cuál puede ser tu próximo paso."
        className="mx-auto max-w-[920px] px-4 md:px-6"
      />

      <div className="mt-2 md:mt-6">
        <ThreeCardExperienceShell readingSlug={config.slug} />
      </div>
    </PageShell>
  );
}
