/**
 * Tipos de dominio del sistema lunar (YAML 10).
 *
 * Contrato inmutable: cualquier reemplazo del motor astronómico debe
 * respetar exactamente esta forma. Los componentes consumen únicamente
 * estos tipos; no importan clientes Supabase ni el motor.
 *
 * Unidades:
 * - phase_angle_degrees: [0, 360)   (0 = Luna nueva, 90 = cuarto creciente,
 *   180 = Luna llena, 270 = cuarto menguante)
 * - illumination_fraction: [0, 1]
 * - illumination_percentage: [0, 100] (redondeado al entero)
 * - lunar_age_days: [0, 29.53...] (un decimal)
 * - timestamps: ISO UTC (`toISOString()`)
 */

export const MOON_PHASE_KEYS = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
] as const;
export type MoonPhaseKey = (typeof MOON_PHASE_KEYS)[number];

export const MAJOR_MOON_PHASE_KEYS = [
  "new_moon",
  "first_quarter",
  "full_moon",
  "last_quarter",
] as const;
export type MajorMoonPhaseKey = (typeof MAJOR_MOON_PHASE_KEYS)[number];

export interface MoonPhaseEvent {
  phase_key: MajorMoonPhaseKey;
  /** ISO UTC. Instante exacto del evento astronómico. */
  timestamp: string;
  /** YYYY-MM-DD según el timezone central del sitio. */
  date_key: string;
}

export interface MoonSnapshot {
  /** Instante ISO UTC de cálculo. */
  timestamp: string;
  phase_key: MoonPhaseKey;
  phase_angle_degrees: number;
  illumination_fraction: number;
  illumination_percentage: number;
  lunar_age_days: number;
  waxing: boolean;
  next_major_phase: MoonPhaseEvent;
}

export interface MoonCalendarDay {
  /** YYYY-MM-DD en timezone central del sitio. */
  date_key: string;
  phase_key: MoonPhaseKey;
  illumination_percentage: number;
  lunar_age_days: number;
  major_event: MoonPhaseEvent | null;
}

export interface MoonEditorialContent {
  phase_key: MoonPhaseKey;
  title: string;
  summary: string;
  meaning: string;
  reflection_questions: string[];
  practical_suggestions: string[];
  misconceptions: string[];
  disclaimer_key: string;
  image_key: string;
  seo_title: string | null;
  seo_description: string | null;
  status: "draft" | "published" | "archived";
  is_demo: boolean;
  published_at: string | null;
}

export interface MoonCacheEntry {
  cache_key: string;
  calculation_type: "daily_snapshot" | "monthly_calendar" | "phase_events";
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  timezone: string;
  engine_version: string;
  result: unknown;
  calculated_at: string;
  expires_at: string;
}
