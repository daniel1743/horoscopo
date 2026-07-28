import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { tarotHowToUsePoints } from "@/config/tarot";
import { TarotSpreadChooser } from "@/components/tarot/TarotSpreadChooser";
import { TarotReadingDisclaimer } from "@/components/tarot/TarotReadingDisclaimer";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";

export function TarotHubPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
      ]}
    >
      <PageHeader
        eyebrow="Tarot"
        title="Lecturas simbólicas para pensar con calma"
        description="Utiliza las cartas como una herramienta de reflexión. No sustituyen decisiones profesionales ni consejos personales."
      />

      <section aria-labelledby="spreads-title" className="mb-12">
        <h2 id="spreads-title" className="mb-4 font-display text-[22px] text-ink">
          Elige una lectura
        </h2>
        <TarotSpreadChooser />
      </section>

      <section
        aria-labelledby="how-to-use-title"
        className="mb-12 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6 md:p-8"
      >
        <h2 id="how-to-use-title" className="font-display text-[22px] text-ink">
          Cómo aprovechar el tarot
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {tarotHowToUsePoints.map((p) => (
            <li key={p} className="flex items-start gap-2 font-body text-[15px] text-ink-soft">
              <span
                aria-hidden
                className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full bg-cosmic"
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <Link
          to={routes.tarotLibrary}
          className="mt-6 inline-flex items-center gap-2 font-body text-[14px] font-medium text-cosmic hover:underline"
        >
          Explorar la biblioteca de cartas
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      </section>

      <TarotReadingDisclaimer />
    </PageShell>
  );
}
