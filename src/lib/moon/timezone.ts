/**
 * Utilidades de timezone reutilizables (YAML 10 §5, §9).
 *
 * Los cálculos astronómicos usan `Date` UTC. Estas funciones convierten
 * entre "instante UTC" y "fecha civil en un timezone IANA" usando
 * Intl.DateTimeFormat — disponible en el runtime del navegador y en
 * Cloudflare Workers/Vercel Edge sin dependencias adicionales.
 *
 * No dependen del timezone del servidor.
 */

const ZONED_PARTS_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timezone: string): Intl.DateTimeFormat {
  let f = ZONED_PARTS_FORMATTER_CACHE.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    ZONED_PARTS_FORMATTER_CACHE.set(timezone, f);
  }
  return f;
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getZonedParts(date: Date, timezone: string): ZonedParts {
  const parts = partsFormatter(timezone).formatToParts(date);
  const out: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") out[p.type] = p.value;
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour),
    minute: Number(out.minute),
    second: Number(out.second),
  };
}

/** YYYY-MM-DD del instante UTC, evaluado en `timezone`. */
export function toDateKey(instantUtc: Date, timezone: string): string {
  const { year, month, day } = getZonedParts(instantUtc, timezone);
  return `${year.toString().padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Instante UTC que corresponde a un `wallTime` civil (YYYY-MM-DD HH:mm:ss)
 * interpretado en el `timezone` dado. Usa una aproximación de doble paso
 * suficiente para resolver DST correctamente (precisión < 1 s).
 */
export function zonedWallTimeToUtc(
  year: number,
  month: number, // 1..12
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  timezone: string,
): Date {
  // Primera aproximación: interpretamos los componentes como si fueran UTC.
  const guessUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const guessOffset = tzOffsetMinutes(new Date(guessUtc), timezone);
  const firstPass = new Date(guessUtc - guessOffset * 60_000);
  // Segunda pasada por si el offset cambió (DST).
  const secondOffset = tzOffsetMinutes(firstPass, timezone);
  if (secondOffset === guessOffset) return firstPass;
  return new Date(guessUtc - secondOffset * 60_000);
}

/** Offset en minutos entre `date` y su representación local en `timezone`. */
export function tzOffsetMinutes(date: Date, timezone: string): number {
  const { year, month, day, hour, minute, second } = getZonedParts(date, timezone);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

/** Número de días del mes local (respetando febrero y bisiestos). */
export function daysInLocalMonth(year: number, month: number, timezone: string): number {
  // Truco portable: primer día del mes siguiente menos un día.
  const nextMonthFirstUtc = zonedWallTimeToUtc(
    month === 12 ? year + 1 : year,
    month === 12 ? 1 : month + 1,
    1,
    0,
    0,
    0,
    timezone,
  );
  const lastDayUtc = new Date(nextMonthFirstUtc.getTime() - 24 * 60 * 60 * 1000);
  return getZonedParts(lastDayUtc, timezone).day;
}
