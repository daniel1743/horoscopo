import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { HoroscopePeriodTabs } from "@/components/horoscope/HoroscopePeriodTabs";
import { SignQuickSelector } from "@/components/horoscope/SignQuickSelector";
import { routes, zodiacRoute } from "@/config/routes";
import { formatPeriodLabel, getPeriodByKey, referenceDateFor } from "@/config/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import type { HoroscopeEntry, HoroscopePeriod } from "@/types/horoscope";
import { Icon } from "@/components/ui/icon";

interface Props {
  signSlug: string;
  period: HoroscopePeriod;
  entry: HoroscopeEntry | null;
}

const notFound = (
  <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-8 text-center">
    <p className="font-body text-[15px] text-ink-soft">
      Aún no hay publicación para este signo y periodo. Estamos preparándola.
    </p>
  </div>
);

export function SignHoroscopePage({ signSlug, period, entry }: Props) {
  const sign = zodiacSigns.find((s) => s.slug === signSlug);
  if (!sign) return null;
  const def = getPeriodByKey(period);
  const idx = zodiacSigns.findIndex((s) => s.slug === signSlug);
  const prev = zodiacSigns[(idx - 1 + zodiacSigns.length) % zodiacSigns.length];
  const next = zodiacSigns[(idx + 1) % zodiacSigns.length];
  const dateKey = entry?.dateFor ?? referenceDateFor(period);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Horóscopo", href: routes.horoscope },
        { label: sign.name, href: zodiacRoute(sign.slug) },
      ]}
    >
      <PageHeader
        eyebrow={`${sign.symbol} ${sign.dateRange}`}
        title={`${sign.name} — ${def.label.toLowerCase()}`}
        description={`Elemento ${sign.element} · Modalidad ${sign.modality} · Regente ${sign.rulingPlanet}`}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <HoroscopePeriodTabs active={period} signSlug={sign.slug} linkMode="sign" />
        <p className="font-body text-[13px] text-ink-muted">{formatPeriodLabel(period, dateKey)}</p>
      </div>

      {entry ? (
        <article className="rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 md:p-10">
          <p className="font-body text-[16px] leading-[1.75] text-ink md:text-[18px]">
            {entry.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[0.06em] text-brand">
              Foco · {entry.focus}
            </span>
            <span className="inline-flex items-center rounded-full bg-ivory px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[0.06em] text-ink-soft">
              Ánimo · {entry.mood}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full bg-ivory px-3 py-1 font-body text-[12px] text-ink-soft"
              aria-label={`Nivel de energía ${entry.energy} de 5`}
            >
              <span aria-hidden>{"●".repeat(entry.energy)}</span>
              <span aria-hidden className="text-ink-muted">
                {"○".repeat(5 - entry.energy)}
              </span>
            </span>
          </div>

          {(entry.love || entry.work || entry.wellbeing) && (
            <dl className="mt-8 grid gap-6 md:grid-cols-3">
              {entry.love && (
                <div>
                  <dt className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
                    Amor
                  </dt>
                  <dd className="mt-2 font-body text-[14px] leading-[1.7] text-ink">
                    {entry.love}
                  </dd>
                </div>
              )}
              {entry.work && (
                <div>
                  <dt className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
                    Trabajo
                  </dt>
                  <dd className="mt-2 font-body text-[14px] leading-[1.7] text-ink">
                    {entry.work}
                  </dd>
                </div>
              )}
              {entry.wellbeing && (
                <div>
                  <dt className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
                    Bienestar
                  </dt>
                  <dd className="mt-2 font-body text-[14px] leading-[1.7] text-ink">
                    {entry.wellbeing}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {(entry.luckyNumber !== null || entry.luckyColor) && (
            <div className="mt-8 flex flex-wrap gap-4 border-t border-line pt-6 font-body text-[13px] text-ink-soft">
              {entry.luckyNumber !== null && (
                <span>
                  Número · <strong className="text-ink">{entry.luckyNumber}</strong>
                </span>
              )}
              {entry.luckyColor && (
                <span>
                  Color · <strong className="text-ink">{entry.luckyColor}</strong>
                </span>
              )}
            </div>
          )}

          {entry.isDemo && (
            <p className="mt-8 rounded-[var(--radius-control)] bg-ivory px-4 py-3 font-body text-[12px] text-ink-muted">
              Contenido de demostración. Reemplázalo desde Supabase.
            </p>
          )}
        </article>
      ) : (
        notFound
      )}

      <nav
        aria-label="Otros signos"
        className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Link
          to={zodiacRoute(prev.slug) as string}
          className="inline-flex items-center gap-2 font-body text-[14px] text-ink-soft hover:text-brand"
        >
          <Icon name="chevronRight" className="h-4 w-4 rotate-180" aria-hidden />
          <span>
            {prev.symbol} {prev.name}
          </span>
        </Link>
        <Link
          to={zodiacRoute(next.slug) as string}
          className="inline-flex items-center gap-2 font-body text-[14px] text-ink-soft hover:text-brand"
        >
          <span>
            {next.symbol} {next.name}
          </span>
          <Icon name="chevronRight" className="h-4 w-4" aria-hidden />
        </Link>
      </nav>

      <section className="mt-12" aria-labelledby="all-signs-title">
        <h2 id="all-signs-title" className="mb-4 font-display text-[20px] font-semibold text-ink">
          Cambiar de signo
        </h2>
        <SignQuickSelector activeSlug={sign.slug} />
      </section>
    </PageShell>
  );
}
