import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { horoscopePeriods } from "@/config/horoscope";
import type { HoroscopePeriod } from "@/types/horoscope";

interface Props {
  active: HoroscopePeriod;
  signSlug?: string;
  /** Si se define, cada tab enlaza a las páginas globales por periodo. */
  linkMode?: "global" | "sign";
  onChange?: (p: HoroscopePeriod) => void;
}

/** Selector de periodo (diario / semanal / mensual). Enlaces o botones. */
export function HoroscopePeriodTabs({ active, signSlug, linkMode = "global", onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Periodo del horóscopo"
      className="inline-flex rounded-[var(--radius-control)] border border-line bg-warm-white p-1"
    >
      {horoscopePeriods.map((p) => {
        const isActive = p.key === active;
        const base = cn(
          "min-h-[40px] rounded-[var(--radius-control)] px-4 font-body text-[14px] font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2",
          isActive ? "bg-brand text-ink-inverse" : "text-ink-soft hover:text-ink",
        );

        if (linkMode === "sign" && signSlug) {
          return (
            <Link
              key={p.key}
              to={`/horoscopo/${signSlug}` as string}
              search={{ periodo: p.slug }}
              role="tab"
              aria-selected={isActive}
              className={base}
            >
              {p.shortLabel}
            </Link>
          );
        }
        if (onChange) {
          return (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={base}
              onClick={() => onChange(p.key)}
            >
              {p.shortLabel}
            </button>
          );
        }
        return (
          <Link
            key={p.key}
            to={p.path as string}
            role="tab"
            aria-selected={isActive}
            className={base}
          >
            {p.shortLabel}
          </Link>
        );
      })}
    </div>
  );
}
