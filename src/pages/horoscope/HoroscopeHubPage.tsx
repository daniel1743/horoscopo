import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { HoroscopePeriodTabs } from "@/components/horoscope/HoroscopePeriodTabs";
import { SignQuickSelector } from "@/components/horoscope/SignQuickSelector";
import { routes, zodiacRoute } from "@/config/routes";
import { horoscopePeriods } from "@/config/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";

/** /horoscopo — Hub principal. */
export function HoroscopeHubPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Horóscopo", href: routes.horoscope },
      ]}
    >
      <PageHeader
        eyebrow="Horóscopos"
        title="Tendencias astrales para cada signo"
        description="Lecturas diarias, semanales y mensuales pensadas para acompañarte con calma y claridad."
      />

      <section aria-labelledby="periods-title" className="mb-10">
        <h2 id="periods-title" className="sr-only">
          Elegir periodo
        </h2>
        <HoroscopePeriodTabs active="daily" />
        <ul className="mt-6 grid gap-4 md:grid-cols-3" role="list">
          {horoscopePeriods.map((p) => (
            <li key={p.key}>
              <Link
                to={p.path as string}
                className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-warm-white p-5 transition-colors hover:border-brand"
              >
                <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
                  {p.shortLabel}
                </p>
                <h3 className="mt-2 font-display text-[20px] font-semibold text-ink">{p.label}</h3>
                <p className="mt-2 font-body text-[14px] text-ink-soft">{p.description}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 font-body text-[13px] font-medium text-brand">
                  Ver {p.shortLabel.toLowerCase()}
                  <Icon name="chevronRight" className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="signs-title">
        <h2
          id="signs-title"
          className="mb-4 font-display text-[24px] font-semibold text-ink md:text-[28px]"
        >
          Elige tu signo
        </h2>
        <ul
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          role="list"
        >
          {zodiacSigns.map((s) => (
            <li key={s.id}>
              <Link
                to={zodiacRoute(s.slug) as string}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-line bg-warm-white p-4 text-center transition-colors hover:border-brand focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <span aria-hidden className="font-display text-[32px] leading-none text-brand">
                  {s.symbol}
                </span>
                <span className="font-display text-[16px] font-semibold text-ink">{s.name}</span>
                <span className="font-body text-[12px] text-ink-muted">{s.dateRange}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
