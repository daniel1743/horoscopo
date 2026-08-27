import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotSpreadExperience } from "@/components/tarot/TarotSpreadExperience";

export function TarotDecisionPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Decisión", href: routes.tarotDecision },
      ]}
    >
      <PageHeader
        eyebrow="Tarot"
        title="Tarot para una decisión"
        description="Una lectura de dos cartas para ordenar lo que necesitas valorar y convertirlo en un siguiente paso posible, sin prometer una respuesta absoluta."
      />
      <TarotSpreadExperience mode="decision" />
    </PageShell>
  );
}
