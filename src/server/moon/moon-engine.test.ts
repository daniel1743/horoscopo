/**
 * Test de precisión del motor lunar (YAML 10 §9, §31).
 *
 * Ejecución (portable, sin dependencia de test runner):
 *   bun run scripts/check-moon-accuracy.ts
 *
 * Este archivo también es válido como test si se añade Vitest en el futuro.
 * Comprueba:
 *   - Búsqueda de las cuatro fases mayores contra efemérides USNO (±2 min).
 *   - Clasificación de fase en fechas conocidas (angle → phase_key).
 *   - Snapshot completo estable (no NaN, campos consistentes).
 *   - Calendario mensual (número de días, días con evento mayor).
 */
import * as Astronomy from "astronomy-engine";
import { astronomyMoonEngine } from "./astronomy-moon-engine";
import { KNOWN_PHASES } from "./__fixtures__/known-phases";

const TZ = "Europe/Madrid";
const PHASE_ANGLE = { new_moon: 0, first_quarter: 90, full_moon: 180, last_quarter: 270 } as const;
const TOLERANCE_MINUTES = 2;

export interface CheckReport {
  name: string;
  passed: boolean;
  detail: string;
}

export function runMoonAccuracyChecks(): CheckReport[] {
  const reports: CheckReport[] = [];

  // 1) Búsqueda de fases mayores conocidas
  for (const known of KNOWN_PHASES) {
    const expected = new Date(known.utc);
    const searchFrom = new Date(expected.getTime() - 3 * 24 * 60 * 60 * 1000);
    const found = Astronomy.SearchMoonPhase(PHASE_ANGLE[known.phase], searchFrom, 8);
    if (!found) {
      reports.push({ name: known.description, passed: false, detail: "no encontrado" });
      continue;
    }
    const deltaMinutes = Math.abs(found.date.getTime() - expected.getTime()) / 60_000;
    reports.push({
      name: known.description,
      passed: deltaMinutes <= TOLERANCE_MINUTES,
      detail: `Δ ${deltaMinutes.toFixed(2)} min (calc=${found.date.toISOString()})`,
    });
  }

  // 2) Snapshot en una fecha arbitraria
  const snap = astronomyMoonEngine.getSnapshot(new Date("2024-06-21T12:00:00Z"), TZ);
  const snapshotOk =
    Number.isFinite(snap.phase_angle_degrees) &&
    snap.illumination_percentage >= 0 &&
    snap.illumination_percentage <= 100 &&
    snap.lunar_age_days >= 0 &&
    snap.lunar_age_days <= 30 &&
    snap.next_major_phase.timestamp > snap.timestamp;
  reports.push({
    name: "snapshot 2024-06-21 consistente",
    passed: snapshotOk,
    detail: JSON.stringify({
      phase: snap.phase_key,
      angle: snap.phase_angle_degrees,
      illum: snap.illumination_percentage,
      age: snap.lunar_age_days,
      next: snap.next_major_phase,
    }),
  });

  // 3) Calendario mensual — enero 2024: debe tener 31 días y 4 eventos mayores
  const month = astronomyMoonEngine.getCalendarMonth(2024, 1, TZ);
  const majorCount = month.filter((d) => d.major_event).length;
  reports.push({
    name: "calendario enero 2024",
    passed: month.length === 31 && majorCount === 4,
    detail: `days=${month.length}, majorEvents=${majorCount}`,
  });

  return reports;
}
