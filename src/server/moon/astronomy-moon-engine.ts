/**
 * Implementación del motor lunar basada en `astronomy-engine`
 * (Don Cross, MIT, v2.x). Fuente: https://github.com/cosinekitty/astronomy
 *
 * Precisión declarada por la librería:
 *  - Longitudes eclípticas de la Luna: mejor que 1 minuto de arco (≈ 0.017°)
 *  - Fase e iluminación: derivadas del ángulo Sol-Tierra-Luna (elongación)
 *  - Búsqueda de fases: precisión < 1 minuto con `SearchMoonPhase`
 *
 * Tolerancias validadas por `moon-engine.test.ts`:
 *  - phase_angle:            ±1°
 *  - illumination_fraction:  ±0.02
 *  - búsqueda de fases:      ±2 minutos vs. efemérides publicadas por USNO
 *
 * Limitaciones conocidas:
 *  - Cálculos geocéntricos: no aplica corrección topocéntrica por
 *    ubicación del observador.
 *  - No calcula orto/ocaso lunar (feature `moonriseMoonset` desactivada).
 *  - No calcula signo lunar zodiacal (feature `moonZodiacSign` desactivada).
 *
 * SERVER-ONLY: cargar únicamente desde server functions/route handlers.
 */
import * as Astronomy from "astronomy-engine";
import type {
  MoonCalendarDay,
  MoonPhaseEvent,
  MoonPhaseKey,
  MoonSnapshot,
  MajorMoonPhaseKey,
} from "@/types/moon";
import type { MoonEngine } from "./moon-engine";
import { daysInLocalMonth, toDateKey, zonedWallTimeToUtc } from "@/lib/moon/timezone";

const ENGINE_VERSION = "astronomy-engine@2.1.19";

/** Duración media del ciclo sinódico (días). */
const SYNODIC_MONTH_DAYS = 29.530588861;

/** Clasifica una fase a partir del ángulo Sol-Luna (grados, 0..360).
 *  Convención de `astronomy-engine`:
 *    0 = nueva, 90 = cuarto creciente, 180 = llena, 270 = cuarto menguante.
 */
function classifyPhase(angle: number): MoonPhaseKey {
  const a = ((angle % 360) + 360) % 360;
  if (a < 22.5) return "new_moon";
  if (a < 67.5) return "waxing_crescent";
  if (a < 112.5) return "first_quarter";
  if (a < 157.5) return "waxing_gibbous";
  if (a < 202.5) return "full_moon";
  if (a < 247.5) return "waning_gibbous";
  if (a < 292.5) return "last_quarter";
  if (a < 337.5) return "waning_crescent";
  return "new_moon";
}

function isWaxing(angle: number): boolean {
  const a = ((angle % 360) + 360) % 360;
  return a < 180;
}

/** Días transcurridos desde la Luna nueva anterior. */
function lunarAgeDays(instantUtc: Date): number {
  // Buscar la nueva anterior en una ventana amplia (>= ciclo sinódico).
  const searchStart = new Date(instantUtc.getTime() - 32 * 24 * 60 * 60 * 1000);
  const prevNew = Astronomy.SearchMoonPhase(0, searchStart, 40);
  if (!prevNew) return 0;
  const ageMs = instantUtc.getTime() - prevNew.date.getTime();
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  // Si por alguna razón la Nueva encontrada es posterior al instante,
  // retrocedemos otro ciclo.
  if (ageDays < 0) return (ageDays + SYNODIC_MONTH_DAYS + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  if (ageDays > SYNODIC_MONTH_DAYS + 0.5) return ageDays % SYNODIC_MONTH_DAYS;
  return Math.round(ageDays * 10) / 10;
}

const MAJOR_TARGETS: readonly { key: MajorMoonPhaseKey; angle: number }[] = [
  { key: "new_moon", angle: 0 },
  { key: "first_quarter", angle: 90 },
  { key: "full_moon", angle: 180 },
  { key: "last_quarter", angle: 270 },
];

function toEvent(key: MajorMoonPhaseKey, date: Date, timezone: string): MoonPhaseEvent {
  return {
    phase_key: key,
    timestamp: date.toISOString(),
    date_key: toDateKey(date, timezone),
  };
}

function findNextMajor(instantUtc: Date, timezone: string): MoonPhaseEvent {
  // Buscamos el próximo de cada uno de los cuatro objetivos y tomamos el más cercano.
  let best: { key: MajorMoonPhaseKey; date: Date } | null = null;
  for (const target of MAJOR_TARGETS) {
    const t = Astronomy.SearchMoonPhase(target.angle, instantUtc, 40);
    if (!t) continue;
    if (!best || t.date.getTime() < best.date.getTime()) {
      best = { key: target.key, date: t.date };
    }
  }
  if (!best) throw new Error("moon-engine: no se pudo localizar próxima fase mayor");
  return toEvent(best.key, best.date, timezone);
}

function snapshot(instantUtc: Date, timezone: string): MoonSnapshot {
  const angle = Astronomy.MoonPhase(instantUtc); // 0..360
  const ill = Astronomy.Illumination(Astronomy.Body.Moon, instantUtc); // .phase_fraction
  const fraction = Math.max(0, Math.min(1, ill.phase_fraction));
  const next = findNextMajor(instantUtc, timezone);
  return {
    timestamp: instantUtc.toISOString(),
    phase_key: classifyPhase(angle),
    phase_angle_degrees: Math.round(angle * 100) / 100,
    illumination_fraction: Math.round(fraction * 10000) / 10000,
    illumination_percentage: Math.round(fraction * 100),
    lunar_age_days: lunarAgeDays(instantUtc),
    waxing: isWaxing(angle),
    next_major_phase: next,
  };
}

function eventsInRange(startUtc: Date, endUtc: Date, timezone: string): MoonPhaseEvent[] {
  const out: MoonPhaseEvent[] = [];
  const rangeDays = Math.ceil((endUtc.getTime() - startUtc.getTime()) / (24 * 60 * 60 * 1000)) + 2;
  for (const target of MAJOR_TARGETS) {
    // Buscamos hacia adelante múltiples ocurrencias.
    let cursor = new Date(startUtc.getTime() - 24 * 60 * 60 * 1000);
    const limit = rangeDays + 40; // margen de un ciclo
    // Máximo ~ 3 eventos por objetivo por trimestre; iteramos hasta salir del rango.
    for (let iter = 0; iter < 12; iter += 1) {
      const found = Astronomy.SearchMoonPhase(target.angle, cursor, limit);
      if (!found) break;
      if (found.date.getTime() > endUtc.getTime()) break;
      if (found.date.getTime() >= startUtc.getTime()) {
        out.push(toEvent(target.key, found.date, timezone));
      }
      cursor = new Date(found.date.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  out.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return out;
}

function calendarMonth(year: number, month: number, timezone: string): MoonCalendarDay[] {
  const days = daysInLocalMonth(year, month, timezone);
  const monthStartUtc = zonedWallTimeToUtc(year, month, 1, 0, 0, 0, timezone);
  const monthEndUtc = zonedWallTimeToUtc(
    month === 12 ? year + 1 : year,
    month === 12 ? 1 : month + 1,
    1,
    0,
    0,
    0,
    timezone,
  );
  const events = eventsInRange(monthStartUtc, monthEndUtc, timezone);
  const eventsByDay = new Map<string, MoonPhaseEvent>();
  for (const ev of events) {
    if (!eventsByDay.has(ev.date_key)) eventsByDay.set(ev.date_key, ev);
  }

  const out: MoonCalendarDay[] = [];
  for (let d = 1; d <= days; d += 1) {
    // Representativo del día: mediodía local.
    const noonUtc = zonedWallTimeToUtc(year, month, d, 12, 0, 0, timezone);
    const angle = Astronomy.MoonPhase(noonUtc);
    const ill = Astronomy.Illumination(Astronomy.Body.Moon, noonUtc);
    const fraction = Math.max(0, Math.min(1, ill.phase_fraction));
    const dateKey = `${year.toString().padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    out.push({
      date_key: dateKey,
      phase_key: classifyPhase(angle),
      illumination_percentage: Math.round(fraction * 100),
      lunar_age_days: Math.round(lunarAgeDays(noonUtc) * 10) / 10,
      major_event: eventsByDay.get(dateKey) ?? null,
    });
  }
  return out;
}

export const astronomyMoonEngine: MoonEngine = {
  version: ENGINE_VERSION,
  getSnapshot: snapshot,
  getCalendarMonth: calendarMonth,
  getPhaseEvents: eventsInRange,
  getNextMajorPhase: findNextMajor,
};

export { ENGINE_VERSION };
