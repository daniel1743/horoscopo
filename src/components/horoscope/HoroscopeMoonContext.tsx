import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import type { MoonPhaseKey, MoonSnapshot } from "@/types/moon";

const PHASE_LABELS: Record<MoonPhaseKey, string> = {
  new_moon: "Luna nueva",
  waxing_crescent: "Creciente inicial",
  first_quarter: "Cuarto creciente",
  waxing_gibbous: "Gibosa creciente",
  full_moon: "Luna llena",
  waning_gibbous: "Gibosa menguante",
  last_quarter: "Cuarto menguante",
  waning_crescent: "Menguante final",
};

interface Props {
  snapshot: MoonSnapshot | null;
}

/** Contexto lunar ligero para conectar el horóscopo con el sistema lunar existente. */
export function HoroscopeMoonContext({ snapshot }: Props) {
  return (
    <section
      aria-labelledby="horoscope-moon-context"
      className="rounded-[var(--radius-card-lg)] bg-night p-6 text-ink-inverse md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-[26px] text-gold">
            <Icon name="moon" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-gold">
              Contexto lunar
            </p>
            <h2
              id="horoscope-moon-context"
              className="mt-1 font-display text-[23px] font-semibold text-ink-inverse"
            >
              La luna también forma parte de tu momento
            </h2>
            {snapshot ? (
              <p className="mt-2 max-w-[54ch] font-body text-[14px] leading-[1.65] text-ink-inverse-soft">
                Hoy transita una{" "}
                <strong className="font-semibold text-ink-inverse">
                  {PHASE_LABELS[snapshot.phase_key]}
                </strong>{" "}
                con {snapshot.illumination_percentage}% de iluminación. Úsala como contexto para
                leer tu signo con más calma.
              </p>
            ) : (
              <p className="mt-2 max-w-[54ch] font-body text-[14px] leading-[1.65] text-ink-inverse-soft">
                Consulta la fase lunar actual y descubre el contexto astronómico que acompaña tu
                lectura.
              </p>
            )}
          </div>
        </div>
        <Link
          to={routes.moonToday}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-white/20 px-4 font-body text-[13px] font-semibold text-ink-inverse transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
        >
          Ver luna de hoy
          <Icon name="chevronRight" className="ml-1 h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
