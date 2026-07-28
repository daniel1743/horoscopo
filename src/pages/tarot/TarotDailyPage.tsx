import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotDailyExperience } from "@/components/tarot/TarotDailyExperience";

export function TarotDailyPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Carta del día", href: routes.tarotDaily },
      ]}
    >
      <PageHeader
        eyebrow="Tarot"
        title="Carta del día"
        description="Una carta simbólica para acompañar tu día. La misma carta permanece contigo hasta mañana."
      />
      <TarotDailyExperience />
    </PageShell>
  );
}
