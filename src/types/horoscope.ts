/**
 * Tipos del sistema de horóscopos.
 * Coinciden con la tabla `public.horoscopes` y el enum `horoscope_period`.
 * Los signos NO se almacenan en Supabase: se leen de `src/data/zodiac-signs.ts`.
 */

export type HoroscopePeriod = "daily" | "weekly" | "monthly";

export interface HoroscopeEntry {
  id: string;
  signSlug: string;
  period: HoroscopePeriod;
  /** Fecha ISO (YYYY-MM-DD) de referencia del periodo. */
  dateFor: string;
  /** ID de variante (1-4) para sistema de personalización. */
  variantId?: 1 | 2 | 3 | 4;
  summary: string;
  focus: string;
  mood: string;
  energy: 1 | 2 | 3 | 4 | 5;
  love: string | null;
  work: string | null;
  wellbeing: string | null;
  luckyNumber: number | null;
  luckyColor: string | null;
  isDemo: boolean;
  publishedAt: string | null;
  updatedAt: string;
  /** Metadata de generación IA (modelo, tokens, calidad, etc.) */
  generationMetadata?: Record<string, unknown>;
}
