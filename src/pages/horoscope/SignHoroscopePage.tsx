import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { HoroscopePeriodTabs } from "@/components/horoscope/HoroscopePeriodTabs";
import { SignQuickSelector } from "@/components/horoscope/SignQuickSelector";
import { routes, zodiacRoute } from "@/config/routes";
import { formatPeriodLabel, getPeriodByKey, referenceDateFor } from "@/config/horoscope";
import { getHoroscopeEditorial } from "@/config/horoscope-editorial";
import { zodiacSigns } from "@/data/zodiac-signs";
import type { HoroscopeEntry, HoroscopePeriod } from "@/types/horoscope";
import { Icon } from "@/components/ui/icon";
import { HoroscopeMoonContext } from "@/components/horoscope/HoroscopeMoonContext";
import { HoroscopeEditorialMeta } from "@/components/horoscope/HoroscopeEditorialMeta";
import { FavoriteButton } from "@/components/account/FavoriteButton";
import { useSession } from "@/hooks/useSession";
import { logActivity } from "@/lib/account/repository";
import type { MoonSnapshot } from "@/types/moon";

interface Props {
  signSlug: string;
  period: HoroscopePeriod;
  entry: HoroscopeEntry | null;
  moon?: MoonSnapshot | null;
}

const notFound = (
  <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-8 text-center">
    <p className="font-body text-[15px] text-ink-soft">
      Aún no hay publicación para este signo y periodo. Estamos preparándola.
    </p>
  </div>
);

export function SignHoroscopePage({ signSlug, period, entry, moon = null }: Props) {
  const sign = zodiacSigns.find((s) => s.slug === signSlug);
  const { user } = useSession();

  useEffect(() => {
    if (!user || !sign) return;
    void logActivity({
      userId: user.id,
      type: "view_horoscope",
      refType: "horoscope",
      refId: sign.slug,
      metadata: { period },
    });
  }, [period, sign, user]);

  if (!sign) return null;
  const def = getPeriodByKey(period);
  const idx = zodiacSigns.findIndex((s) => s.slug === signSlug);
  const prev = zodiacSigns[(idx - 1 + zodiacSigns.length) % zodiacSigns.length];
  const next = zodiacSigns[(idx + 1) % zodiacSigns.length];
  const dateKey = entry?.dateFor ?? referenceDateFor(period);
  const editorial = getHoroscopeEditorial(sign.slug, period);

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
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-body text-[13px] text-ink-muted">
            {formatPeriodLabel(period, dateKey)}
          </p>
          <FavoriteButton
            itemType="horoscope"
            itemRef={`${sign.slug}:${period}`}
            itemTitle={`Horóscopo de ${sign.name} — ${def.label}`}
            metadata={{ sign: sign.slug, period }}
          />
        </div>
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

          {entry.isFallback ? (
            <p className="mt-8 rounded-[var(--radius-control)] bg-ivory px-4 py-3 font-body text-[12px] text-ink-muted">
              Lectura editorial de respaldo. La actualización publicada aparecerá aquí cuando esté
              disponible.
            </p>
          ) : (
            entry.isDemo && (
              <p className="mt-8 rounded-[var(--radius-control)] bg-ivory px-4 py-3 font-body text-[12px] text-ink-muted">
                Contenido de demostración. Reemplázalo desde Supabase.
              </p>
            )
          )}

          <HoroscopeEditorialMeta updatedAt={entry.updatedAt} isFallback={entry.isFallback} />
        </article>
      ) : (
        notFound
      )}

      <section className="mt-10" aria-labelledby="horoscope-meaning-title">
        <div className="rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 md:p-8">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            Cómo leer este resultado
          </p>
          <h2
            id="horoscope-meaning-title"
            className="mt-2 font-display text-[24px] font-semibold text-ink"
          >
            La idea central no es una predicción: es un punto de observación
          </h2>
          <p className="mt-3 font-body text-[15px] leading-[1.75] text-ink">
            Una lectura simbólica puede ayudarte a poner nombre a una tensión, una oportunidad o un
            patrón. Tómala como una invitación a mirar tu experiencia con más claridad.
          </p>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            <EditorialBlock
              title={editorial.contextTitle}
              text={entry?.context ?? editorial.context}
            />
            <EditorialBlock
              title={editorial.whyTitle}
              text={entry?.whyItMatters ?? editorial.whyItMatters}
            />
            <EditorialBlock
              title={editorial.observeTitle}
              text={entry?.observe ?? editorial.observe}
            />
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="horoscope-question-title">
        <div className="rounded-[var(--radius-card-lg)] border border-brand/20 bg-brand-soft/40 p-6 md:p-8">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            Para llevar la lectura a tu día
          </p>
          <h2
            id="horoscope-question-title"
            className="mt-2 font-display text-[23px] font-semibold text-ink"
          >
            Pregunta para reflexionar {editorial.periodLabel}
          </h2>
          <p className="mt-2 font-body text-[14px] leading-[1.65] text-ink-soft">
            Esta es una pregunta para hacértela a ti, no una pregunta que debas responderle al
            sistema. Puedes escribir tu respuesta o simplemente observar qué te despierta.
          </p>
          <blockquote className="mt-5 border-l-2 border-brand pl-4 font-display text-[20px] italic leading-[1.45] text-ink">
            {entry?.reflectionQuestion ?? editorial.reflectionQuestion}
          </blockquote>
        </div>
      </section>

      <div className="mt-12">
        <HoroscopeMoonContext snapshot={moon} />
      </div>

      <section className="mt-12" aria-labelledby="horoscope-related-title">
        <div className="rounded-[var(--radius-card-lg)] border border-line bg-ivory/60 p-6 md:p-8">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            Explora según tu momento
          </p>
          <h2
            id="horoscope-related-title"
            className="mt-2 font-display text-[24px] font-semibold text-ink"
          >
            Continúa tu lectura
          </h2>
          <p className="mt-2 max-w-[58ch] font-body text-[14px] leading-[1.7] text-ink-soft">
            El horóscopo es una puerta de entrada. Puedes contrastar tu momento con el ciclo lunar,
            una lectura de tarot o una guía para comprender mejor el tema que te ocupa.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <RelatedLink
              to={routes.moonToday}
              title="La luna de hoy"
              description="Observa el clima simbólico del día."
            />
            <RelatedLink
              to={routes.tarotDaily}
              title="Carta del día"
              description="Abre una pregunta para reflexionar."
            />
            <RelatedLink
              to={routes.compatibility}
              title="Compatibilidad"
              description="Explora la dinámica entre dos signos."
            />
          </div>
          <Link
            to={routes.guides}
            className="mt-5 inline-flex font-body text-[14px] font-medium text-brand underline underline-offset-4"
          >
            Ver guías de astrología y tarot
          </Link>
        </div>
      </section>

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

function RelatedLink({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-[var(--radius-card)] border border-line bg-warm-white p-4 transition-colors hover:border-brand/40 hover:bg-brand-soft/40"
    >
      <span className="font-display text-[16px] font-semibold text-ink group-hover:text-brand">
        {title}
      </span>
      <span className="mt-1 block font-body text-[13px] leading-[1.5] text-ink-soft">
        {description}
      </span>
    </Link>
  );
}

function EditorialBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-display text-[17px] font-semibold text-ink">{title}</h3>
      <p className="mt-2 font-body text-[14px] leading-[1.7] text-ink-soft">{text}</p>
    </div>
  );
}
