import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { zodiacRoute } from "@/config/routes";
import type { HoroscopeEntry } from "@/types/horoscope";
import type { ZodiacSign } from "@/data/zodiac-signs";

interface Props {
  sign: ZodiacSign;
  entry: HoroscopeEntry | null;
  periodLinkLabel?: string;
}

/** Tarjeta compacta de horóscopo por signo. Reutilizable en vistas globales. */
export function HoroscopeCard({ sign, entry, periodLinkLabel = "Ver signo" }: Props) {
  return (
    <article
      aria-labelledby={`horoscope-${sign.slug}`}
      className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-warm-white p-5 shadow-card transition-colors hover:border-brand"
    >
      <header className="flex items-baseline gap-3">
        <span aria-hidden className="font-display text-[32px] leading-none text-brand">
          {sign.symbol}
        </span>
        <div>
          <h3
            id={`horoscope-${sign.slug}`}
            className="font-display text-[20px] font-semibold text-ink"
          >
            {sign.name}
          </h3>
          <p className="font-body text-[12px] text-ink-muted">{sign.dateRange}</p>
        </div>
      </header>

      {entry ? (
        <>
          {entry.isFallback && (
            <p className="mt-4 rounded-[var(--radius-control)] bg-ivory px-3 py-2 font-body text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Lectura editorial de respaldo
            </p>
          )}
          <p className="mt-4 font-body text-[14px] leading-[1.7] text-ink line-clamp-5">
            {entry.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 font-body text-[11px] font-medium uppercase tracking-[0.06em] text-brand">
              {entry.focus}
            </span>
            <span className="inline-flex items-center rounded-full bg-ivory px-3 py-1 font-body text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">
              {entry.mood}
            </span>
          </div>
        </>
      ) : (
        <p className="mt-4 font-body text-[14px] text-ink-muted">
          Todavía no hay publicación para este periodo. Vuelve pronto.
        </p>
      )}

      <div className="mt-auto pt-5">
        <Link
          to={zodiacRoute(sign.slug) as string}
          className="inline-flex items-center gap-1 font-body text-[13px] font-medium text-brand hover:underline focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {periodLinkLabel}
          <Icon name="chevronRight" className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
