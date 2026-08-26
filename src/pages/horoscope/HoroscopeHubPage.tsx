import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { HoroscopePeriodTabs } from "@/components/horoscope/HoroscopePeriodTabs";
import { SignQuickSelector } from "@/components/horoscope/SignQuickSelector";
import { routes, zodiacRoute } from "@/config/routes";
import { horoscopePeriods } from "@/config/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import { Icon } from "@/components/ui/icon";

/** /horoscopo — Hub principal, organizado por intención y no solo por listado. */
export function HoroscopeHubPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Horóscopo", href: routes.horoscope },
      ]}
    >
      <PageHeader
        variant="dark"
        eyebrow="Horóscopo · Lecturas simbólicas"
        title="Una pausa para mirar tu día con más claridad"
        description="Elige tu signo y el periodo que quieres explorar. Lecturas generales, conscientes y pensadas para acompañarte sin promesas absolutas."
        actions={
          <Link
            to={routes.horoscopeToday}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-warm-white px-5 font-body text-[14px] font-semibold text-brand transition-transform active:scale-[0.98]"
          >
            Ver horóscopo de hoy
            <Icon name="chevronRight" className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        }
        className="relative overflow-hidden bg-night md:px-10 md:py-12"
      />

      <section
        aria-labelledby="start-reading-title"
        className="-mt-2 mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]"
      >
        <div className="rounded-[var(--radius-card-lg)] border border-line-subtle bg-warm-white p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
                Empieza aquí
              </p>
              <h2
                id="start-reading-title"
                className="mt-2 font-display text-[26px] font-semibold text-ink md:text-[30px]"
              >
                Elige cuánto quieres mirar
              </h2>
              <p className="mt-2 max-w-[52ch] font-body text-[15px] leading-[1.65] text-ink-soft">
                Una lectura breve para hoy, una perspectiva para la semana o un mapa más amplio para
                el mes.
              </p>
            </div>
            <HoroscopePeriodTabs active="daily" />
          </div>

          <ul className="mt-7 grid gap-3 md:grid-cols-3" role="list">
            {horoscopePeriods.map((period) => (
              <li key={period.key}>
                <Link
                  to={period.path as string}
                  className="group flex h-full min-h-[148px] flex-col rounded-[var(--radius-card)] border border-line-subtle bg-ivory p-4 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,75,217,0.18)]"
                >
                  <span className="font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">
                    {period.shortLabel}
                  </span>
                  <h3 className="mt-2 font-display text-[19px] font-semibold text-ink">
                    {period.label}
                  </h3>
                  <p className="mt-2 font-body text-[13px] leading-[1.55] text-ink-soft">
                    {period.description}
                  </p>
                  <span className="mt-auto inline-flex items-center pt-4 font-body text-[13px] font-semibold text-brand">
                    Explorar
                    <Icon
                      name="chevronRight"
                      className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <aside
          className="rounded-[var(--radius-card-lg)] bg-brand-soft p-6 md:p-8"
          aria-labelledby="today-tools-title"
        >
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            También puedes explorar
          </p>
          <h2
            id="today-tools-title"
            className="mt-2 font-display text-[24px] font-semibold text-ink"
          >
            Tu contexto de hoy
          </h2>
          <p className="mt-3 font-body text-[14px] leading-[1.65] text-ink-soft">
            Conecta tu lectura con los ciclos lunares, una carta simbólica o la dinámica de dos
            signos.
          </p>
          <div className="mt-6 space-y-2">
            <ContextLink to={routes.moonToday} icon="moon" label="Descubrir la luna de hoy" />
            <ContextLink to={routes.tarotDaily} label="Sacar una carta" symbol="✦" />
            <ContextLink
              to={routes.compatibility}
              icon="compatibility"
              label="Explorar compatibilidad"
            />
          </div>
        </aside>
      </section>

      <section aria-labelledby="signs-title" className="mb-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
              12 signos · 12 puertas de entrada
            </p>
            <h2
              id="signs-title"
              className="mt-2 font-display text-[26px] font-semibold text-ink md:text-[30px]"
            >
              Encuentra tu signo
            </h2>
          </div>
          <p className="max-w-[36ch] font-body text-[13px] leading-[1.6] text-ink-soft sm:text-right">
            Guarda esta ruta para volver a tu lectura diaria con un solo gesto.
          </p>
        </div>

        <ul
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          role="list"
        >
          {zodiacSigns.map((sign) => (
            <li key={sign.id}>
              <Link
                to={zodiacRoute(sign.slug) as string}
                className="group flex min-h-[150px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-4 text-center shadow-card transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,75,217,0.18)]"
              >
                <span aria-hidden className="font-display text-[34px] leading-none text-brand">
                  {sign.symbol}
                </span>
                <span className="mt-3 font-display text-[16px] font-semibold text-ink">
                  {sign.name}
                </span>
                <span className="mt-1 font-body text-[11px] text-ink-muted">{sign.dateRange}</span>
                <span className="mt-3 inline-flex items-center font-body text-[12px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Leer ahora
                  <Icon name="chevronRight" className="ml-0.5 h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="quick-explore-title" className="border-t border-line-subtle pt-10">
        <div className="mb-5">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            Sigue explorando
          </p>
          <h2
            id="quick-explore-title"
            className="mt-2 font-display text-[24px] font-semibold text-ink"
          >
            Una lectura puede abrir otra pregunta
          </h2>
        </div>
        <SignQuickSelector />
      </section>
    </PageShell>
  );
}

function ContextLink({
  to,
  label,
  icon,
  symbol,
}: {
  to: string;
  label: string;
  icon?: "moon" | "compatibility";
  symbol?: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] bg-warm-white/70 px-3.5 py-2.5 font-body text-[14px] font-medium text-ink transition-colors hover:bg-warm-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,75,217,0.18)]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        {icon ? (
          <Icon name={icon} className="h-4 w-4" aria-hidden />
        ) : (
          <span aria-hidden>{symbol}</span>
        )}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      <Icon
        name="chevronRight"
        className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
