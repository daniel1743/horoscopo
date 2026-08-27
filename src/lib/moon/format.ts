import { MOON_PHASE_REGISTRY, MOON_SITE_LOCALE, MOON_SITE_TIMEZONE } from "@/config/moon";
import type { MoonPhaseKey } from "@/types/moon";

/** Formateo consistente de fechas lunares. Fuente única. */
const cache = new Map<string, Intl.DateTimeFormat>();
function fmt(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options);
  let f = cache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(MOON_SITE_LOCALE, {
      timeZone: MOON_SITE_TIMEZONE,
      ...options,
    });
    cache.set(key, f);
  }
  return f;
}

export function formatLongDate(iso: string): string {
  return fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}
export function formatShortDate(iso: string): string {
  return fmt({ day: "numeric", month: "long" }).format(new Date(iso));
}
export function formatMonthYear(year: number, month: number): string {
  return fmt({ month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 15)));
}
export function formatTimeShort(iso: string): string {
  return fmt({ hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

export function moonPhaseLabel(key: MoonPhaseKey): string {
  return MOON_PHASE_REGISTRY[key].label;
}

/** Convierte "2026-01" a {year, month}. */
export function parseYearMonth(input: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(input);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return null;
  return { year, month };
}
