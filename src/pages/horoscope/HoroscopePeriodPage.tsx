import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { HoroscopePeriodTabs } from "@/components/horoscope/HoroscopePeriodTabs";
import { HoroscopeCard } from "@/components/horoscope/HoroscopeCard";
import { HoroscopeMoonContext } from "@/components/horoscope/HoroscopeMoonContext";
import { routes } from "@/config/routes";
import { formatPeriodLabel, getPeriodByKey, referenceDateFor } from "@/config/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import { Icon } from "@/components/ui/icon";
import type { HoroscopeEntry, HoroscopePeriod } from "@/types/horoscope";
import type { MoonSnapshot } from "@/types/moon";

interface Props {
  period: HoroscopePeriod;
  entries: HoroscopeEntry[];
  moon?: MoonSnapshot | null;
}

/** /horoscopo/hoy | /semana | /mes — vista global con las 12 tarjetas. */
export function HoroscopePeriodPage({ period, entries, moon = null }: Props) {
  const def = getPeriodByKey(period);
  const dateKey = referenceDateFor(period);
  const byId = new Map(entries.map((entry) => [entry.signSlug, entry]));
  const fallbackCount = zodiacSigns.filter((sign) => byId.get(sign.slug)?.isFallback).length;
  const publishedCount = zodiacSigns.length - fallbackCount;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Horóscopo", href: routes.horoscope },
        { label: def.shortLabel, href: def.path },
      ]}
    >
      <PageHeader
        variant="soft"
        eyebrow={formatPeriodLabel(period, dateKey)}
        title={def.label}
        description={`${def.description} Elige un signo para leer su orientación y explorar una perspectiva más personal.`}
        className="mb-8 md:px-10 md:py-12"
      />

      <section
        aria-labelledby="period-navigation-title"
        className="mb-10 flex flex-col gap-5 rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-5 shadow-card md:flex-row md:items-center md:justify-between md:p-6"
      >
        <div>
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            Cambiar periodo
          </p>
          <h2
            id="period-navigation-title"
            className="mt-1 font-display text-[19px] font-semibold text-ink"
          >
            ¿Cuánto quieres mirar?
          </h2>
        </div>
        <HoroscopePeriodTabs active={period} />
      </section>

      <div
        className="mb-8 flex flex-col gap-3 rounded-[var(--radius-card)] border border-line-subtle bg-ivory px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        role="status"
        aria-live="polite"
      >
        <p className="font-body text-[14px] text-ink-soft">
          <strong className="font-semibold text-ink">
            {publishedCount} de {zodiacSigns.length}
          </strong>{" "}
          lecturas publicadas para este periodo.
        </p>
        {fallbackCount > 0 && (
          <p className="font-body text-[12px] text-ink-muted">
            Las restantes muestran una lectura editorial de respaldo.
          </p>
        )}
      </div>

      <section aria-labelledby="sign-grid-title">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
              Tu punto de partida
            </p>
            <h2
              id="sign-grid-title"
              className="mt-2 font-display text-[26px] font-semibold text-ink md:text-[30px]"
            >
              Elige tu signo
            </h2>
          </div>
          <p className="max-w-[38ch] font-body text-[13px] leading-[1.6] text-ink-soft sm:text-right">
            Cada lectura es una invitación a observar, no una predicción absoluta.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={def.label}>
          {zodiacSigns.map((sign) => (
            <li key={sign.id}>
              <HoroscopeCard
                sign={sign}
                entry={byId.get(sign.slug) ?? null}
                period={period}
                periodLinkLabel={`Leer ${sign.name}`}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <HoroscopeMoonContext snapshot={moon} />
      </div>

      <section
        aria-labelledby="continue-reading-title"
        className="mt-12 grid gap-4 border-t border-line-subtle pt-10 md:grid-cols-3"
      >
        <div className="md:col-span-3">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            Después de tu lectura
          </p>
          <h2
            id="continue-reading-title"
            className="mt-2 font-display text-[24px] font-semibold text-ink"
          >
            Sigue explorando tu contexto
          </h2>
        </div>
        <ContextCard
          to={routes.moonToday}
          symbol="☾"
          title="La luna de hoy"
          description="Observa el ciclo lunar que acompaña este momento."
        />
        <ContextCard
          to={routes.tarotDaily}
          symbol="✦"
          title="Una carta simbólica"
          description="Abre otra pregunta para continuar tu reflexión."
        />
        <ContextCard
          to={routes.compatibility}
          symbol="∞"
          title="Compatibilidad"
          description="Explora cómo se encuentran dos formas de mirar el mundo."
        />
      </section>
    </PageShell>
  );
}

function ContextCard({
  to,
  symbol,
  title,
  description,
}: {
  to: string;
  symbol: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-[150px] flex-col rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,75,217,0.18)]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft font-display text-[22px] text-brand">
        <span aria-hidden>{symbol}</span>
      </span>
      <h3 className="mt-4 font-display text-[18px] font-semibold text-ink">{title}</h3>
      <p className="mt-2 font-body text-[13px] leading-[1.55] text-ink-soft">{description}</p>
      <span className="mt-auto inline-flex items-center pt-4 font-body text-[13px] font-semibold text-brand">
        Explorar
        <Icon
          name="chevronRight"
          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
