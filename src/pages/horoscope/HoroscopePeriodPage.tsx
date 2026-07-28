import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { HoroscopePeriodTabs } from "@/components/horoscope/HoroscopePeriodTabs";
import { HoroscopeCard } from "@/components/horoscope/HoroscopeCard";
import { routes } from "@/config/routes";
import { formatPeriodLabel, getPeriodByKey, referenceDateFor } from "@/config/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import type { HoroscopeEntry, HoroscopePeriod } from "@/types/horoscope";

interface Props {
  period: HoroscopePeriod;
  entries: HoroscopeEntry[];
}

/** /horoscopo/hoy | /semana | /mes — vista global con las 12 tarjetas. */
export function HoroscopePeriodPage({ period, entries }: Props) {
  const def = getPeriodByKey(period);
  const dateKey = referenceDateFor(period);
  const byId = new Map(entries.map((e) => [e.signSlug, e]));
  const anyPublished = entries.length > 0;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Horóscopo", href: routes.horoscope },
        { label: def.shortLabel, href: def.path },
      ]}
    >
      <PageHeader
        eyebrow={formatPeriodLabel(period, dateKey)}
        title={def.label}
        description={def.description}
      />

      <div className="mb-8">
        <HoroscopePeriodTabs active={period} />
      </div>

      {anyPublished ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={def.label}>
          {zodiacSigns.map((sign) => (
            <li key={sign.id}>
              <HoroscopeCard
                sign={sign}
                entry={byId.get(sign.slug) ?? null}
                periodLinkLabel={`Ver ${sign.name}`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-8 text-center">
          <p className="font-body text-[15px] text-ink-soft">
            Todavía no publicamos {def.shortLabel.toLowerCase()} para este periodo. Vuelve en unas
            horas.
          </p>
        </div>
      )}
    </PageShell>
  );
}
