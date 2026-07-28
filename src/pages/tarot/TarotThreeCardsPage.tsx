import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotSpreadExperience } from "@/components/tarot/TarotSpreadExperience";

export function TarotThreeCardsPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Tres cartas", href: routes.tarotThreeCards },
      ]}
    >
      <PageHeader
        eyebrow="Tarot"
        title="Tirada de tres cartas"
        description="Tres perspectivas para observar una situación: lo que influye, lo que conviene mirar y un posible próximo paso."
      />
      <TarotSpreadExperience mode="three_cards" />
    </PageShell>
  );
}
