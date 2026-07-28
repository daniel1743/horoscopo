import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotSpreadExperience } from "@/components/tarot/TarotSpreadExperience";

export function TarotYesNoPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Sí o no", href: routes.tarotYesNo },
      ]}
    >
      <PageHeader
        eyebrow="Tarot"
        title="Consulta sí o no"
        description="Una lectura orientativa. No entrega respuestas absolutas; sugiere avance, cautela o la necesidad de observar más."
      />
      <TarotSpreadExperience mode="yes_no" />
    </PageShell>
  );
}
