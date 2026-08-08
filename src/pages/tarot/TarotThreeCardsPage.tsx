import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { ThreeCardExperienceShell } from "@/components/tarot/experience/ThreeCardExperienceShell";

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
        description="Elige 3 cartas y observa tu situación desde lo que influye, lo que necesitas mirar y un posible próximo paso."
      />
      <section className="mt-2 rounded-[var(--radius-card-lg)] border border-line-subtle bg-warm-white p-4 md:p-8">
        <p className="mb-6 text-center font-body text-[15px] font-medium text-brand">
          Elige 3 cartas
        </p>
        <ThreeCardExperienceShell readingSlug="general" />
      </section>
    </PageShell>
  );
}
