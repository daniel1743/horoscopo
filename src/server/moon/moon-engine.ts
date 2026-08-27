/**
 * Contrato del motor astronómico lunar (YAML 10 §9).
 *
 * Todas las implementaciones DEBEN cumplir esta interfaz. Reemplazar
 * `astronomyMoonEngine` por otra implementación (por ejemplo Meeus,
 * NASA JPL, etc.) requiere respetar exactamente estos métodos y unidades.
 *
 * Los cálculos se realizan siempre con instantes UTC. La conversión al
 * timezone central del sitio se hace únicamente para presentación y
 * agrupación por día (see `date_key`).
 *
 * SERVER-ONLY: no importar desde componentes ni desde loaders isomórficos.
 */
import type { MoonCalendarDay, MoonPhaseEvent, MoonSnapshot } from "@/types/moon";

export interface MoonEngine {
  /** Versión del motor. Se usa como parte de las claves de caché. */
  readonly version: string;

  /** Snapshot puntual para un instante UTC. */
  getSnapshot(instantUtc: Date, timezone: string): MoonSnapshot;

  /**
   * Un día por cada día del mes local (timezone del sitio). El cálculo
   * de fase/iluminación de cada día se hace en un único barrido y se
   * asocia como major_event los eventos principales que caen en ese día.
   */
  getCalendarMonth(year: number, month: number, timezone: string): MoonCalendarDay[];

  /** Eventos de fases principales en un rango cerrado [startUtc, endUtc]. */
  getPhaseEvents(startUtc: Date, endUtc: Date, timezone: string): MoonPhaseEvent[];

  /** Próximo evento de fase principal a partir de un instante UTC. */
  getNextMajorPhase(instantUtc: Date, timezone: string): MoonPhaseEvent;
}
