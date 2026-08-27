import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { moonCalendarMonthRoute } from "@/config/routes";
import { formatMonthYear } from "@/lib/moon/format";
import { MOON_CALENDAR_RANGE_YEARS } from "@/config/moon";

interface Props {
  year: number;
  month: number;
}

function shift(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return { year: y, month: m };
}

/** Barra de navegación mes anterior / mes siguiente. Respeta rango permitido. */
export function MoonMonthNavigation({ year, month }: Props) {
  const nowYear = new Date().getUTCFullYear();
  const minYear = nowYear - MOON_CALENDAR_RANGE_YEARS.past;
  const maxYear = nowYear + MOON_CALENDAR_RANGE_YEARS.future;

  const prev = shift(year, month, -1);
  const next = shift(year, month, 1);

  const canPrev = prev.year >= minYear;
  const canNext = next.year <= maxYear;

  return (
    <nav
      aria-label="Navegación del calendario lunar"
      className="mb-6 flex items-center justify-between gap-4"
    >
      {canPrev ? (
        <Link
          to={moonCalendarMonthRoute(prev.year, prev.month) as never}
          className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-4 py-2 font-body text-[14px] text-ink hover:border-cosmic hover:text-cosmic"
        >
          <Icon name="back" size="sm" /> {formatMonthYear(prev.year, prev.month)}
        </Link>
      ) : (
        <span aria-hidden />
      )}
      <h2 className="font-display text-[22px] capitalize text-ink md:text-[26px]">
        {formatMonthYear(year, month)}
      </h2>
      {canNext ? (
        <Link
          to={moonCalendarMonthRoute(next.year, next.month) as never}
          className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-4 py-2 font-body text-[14px] text-ink hover:border-cosmic hover:text-cosmic"
        >
          {formatMonthYear(next.year, next.month)} <Icon name="forward" size="sm" />
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}
