import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { MoonPhaseVisual } from "./MoonPhaseVisual";
import { MOON_PHASE_REGISTRY, MOON_SITE_LOCALE } from "@/config/moon";
import { formatLongDate, formatShortDate } from "@/lib/moon/format";
import { routes, moonPhaseRoute } from "@/config/routes";
import type { MoonSnapshot } from "@/types/moon";

interface Props {
  snapshot: MoonSnapshot;
  /** Compacto: para uso en Home. */
  compact?: boolean;
}

/** Tarjeta "Luna de hoy" con datos astronómicos verificables. */
export function MoonTodayCard({ snapshot, compact = false }: Props) {
  const meta = MOON_PHASE_REGISTRY[snapshot.phase_key];
  const next = snapshot.next_major_phase;
  const nextMeta = MOON_PHASE_REGISTRY[next.phase_key];
  const dateLabel = formatLongDate(snapshot.timestamp);
  const showLunarAura = snapshot.illumination_fraction >= 0.88;

  return (
    <article
      aria-labelledby="moon-today-heading"
      className="relative overflow-hidden rounded-[var(--radius-card-lg)] bg-night text-ink-inverse"
    >
      <div
        className={`relative grid gap-8 p-6 md:gap-12 md:p-10 ${compact ? "md:grid-cols-[0.9fr_1.1fr]" : "md:grid-cols-[0.75fr_1.25fr]"}`}
      >
        <div className="relative isolate mx-auto aspect-square w-full max-w-[260px]">
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .moon-star-1 { animation: moon-twinkle 7s ease-in-out infinite; }
              .moon-star-2 { animation: moon-twinkle 11s ease-in-out infinite 3s; }
              .moon-star-inter { animation: moon-appear 15s ease-in-out infinite; }
            }
            @keyframes moon-twinkle {
              0%, 100% { opacity: 0.9; transform: scale(1); }
              50% { opacity: 0.2; transform: scale(0.85); }
            }
            @keyframes moon-appear {
              0%, 100% { opacity: 0; transform: scale(0.8); }
              50% { opacity: 0.7; transform: scale(1.1); }
            }
          `}</style>

          {showLunarAura && <div aria-hidden className="lunar-aura pointer-events-none" />}

          {/* Universo de estrellas (sin recortar bordes) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 200 200"
            style={{ overflow: "visible" }}
            aria-hidden="true"
          >
            <g fill="var(--bg-lunar-ivory)">
              {/* Estrellas permanentes */}
              <circle
                cx="15"
                cy="25"
                r="1.5"
                className="moon-star-1"
                style={{ transformOrigin: "15px 25px" }}
              />
              <circle
                cx="185"
                cy="20"
                r="1.2"
                className="moon-star-2"
                style={{ transformOrigin: "185px 20px" }}
              />
              <circle
                cx="25"
                cy="180"
                r="1.2"
                className="moon-star-1"
                style={{ transformOrigin: "25px 180px", animationDelay: "2s" }}
              />
              <circle
                cx="175"
                cy="175"
                r="1.6"
                className="moon-star-2"
                style={{ transformOrigin: "175px 175px", animationDelay: "5s" }}
              />

              {/* Estrellas intermitentes (aparecen y desaparecen) */}
              <circle
                cx="-10"
                cy="100"
                r="1.4"
                className="moon-star-inter"
                opacity="0"
                style={{ transformOrigin: "-10px 100px" }}
              />
              <circle
                cx="210"
                cy="130"
                r="1.3"
                className="moon-star-inter"
                opacity="0"
                style={{ transformOrigin: "210px 130px", animationDelay: "7s" }}
              />
              <circle
                cx="100"
                cy="-10"
                r="1.2"
                className="moon-star-inter"
                opacity="0"
                style={{ transformOrigin: "100px -10px", animationDelay: "4s" }}
              />
            </g>
          </svg>

          <MoonPhaseVisual
            fraction={snapshot.illumination_fraction}
            waxing={snapshot.waxing}
            title={`${meta.label}, iluminación ${snapshot.illumination_percentage}%`}
            className="relative z-10 h-auto w-full"
          />
        </div>
        <div>
          <p className="font-body text-[12px] uppercase tracking-[0.16em] text-gold">
            Luna de hoy · {dateLabel}
          </p>
          <h2
            id="moon-today-heading"
            className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-ink-inverse md:text-[40px]"
          >
            {meta.label}
          </h2>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 font-body text-[14px] text-ink-inverse-soft md:text-[15px]">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.08em]">Iluminación</dt>
              <dd className="mt-1 font-display text-[22px] text-ink-inverse">
                {snapshot.illumination_percentage}%
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.08em]">Edad lunar</dt>
              <dd className="mt-1 font-display text-[22px] text-ink-inverse">
                {snapshot.lunar_age_days.toLocaleString(MOON_SITE_LOCALE, {
                  maximumFractionDigits: 1,
                })}{" "}
                d
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[11px] uppercase tracking-[0.08em]">Próxima fase mayor</dt>
              <dd className="mt-1 text-ink-inverse">
                {nextMeta.label} · {formatShortDate(next.timestamp)}
              </dd>
            </div>
          </dl>
          {!compact && (
            <p className="mt-6 max-w-[52ch] font-body text-[15px] leading-[1.7] text-ink-inverse-soft">
              Los valores anteriores son cálculos astronómicos. La lectura simbólica se encuentra en
              la ficha editorial de la fase.
            </p>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="dark" size="lg">
              <Link to={moonPhaseRoute(meta.slug)}>Leer sobre {meta.label.toLowerCase()}</Link>
            </Button>
            {compact && (
              <Button asChild variant="link" className="text-gold">
                <Link to={routes.moonToday}>
                  Ver Luna de hoy <Icon name="forward" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
