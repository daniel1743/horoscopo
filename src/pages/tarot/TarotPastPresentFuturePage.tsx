import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/config/routes";
import { TarotSpreadExperience } from "@/components/tarot/TarotSpreadExperience";

export function TarotPastPresentFuturePage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Pasado, presente y futuro", href: routes.tarotPastPresentFuture },
      ]}
    >
      <PageHeader
        eyebrow="Tarot"
        title="Pasado, presente y futuro"
        description="Una secuencia de tres cartas para ordenar antecedentes, observar el momento actual y explorar una posibilidad abierta. No es una predicción inevitable."
      />
      <TarotSpreadExperience mode="past_present_future" />
    </PageShell>
  );
}
