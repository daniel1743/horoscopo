import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { ThreeCardLoveExperienceShell } from "@/components/tarot/experience/ThreeCardLoveExperienceShell";
import { threeCardReadings } from "@/config/three-card-readings";

export function TarotThreeCardsAmorPage() {
  const config = threeCardReadings.amor;

  return (
    <PageShell
      hideBreadcrumbs
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Tres cartas", href: routes.tarotThreeCards },
        { label: config.shortTitle, href: `/tarot/tres-cartas/${config.slug}` },
      ]}
    >
      <PageHeader eyebrow="Tarot" title={config.title} description={config.description} />

      <div className="mt-8">
        <ThreeCardLoveExperienceShell config={config} />
      </div>
    </PageShell>
  );
}
