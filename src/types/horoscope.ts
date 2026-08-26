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
  summary: string;
  /** Bloques editoriales opcionales para lecturas enriquecidas. */
  context?: string;
  whyItMatters?: string;
  observe?: string;
  reflectionQuestion?: string;
  focus: string;
  mood: string;
  energy: 1 | 2 | 3 | 4 | 5;
  love: string | null;
  work: string | null;
  wellbeing: string | null;
  luckyNumber: number | null;
  luckyColor: string | null;
  isDemo: boolean;
  /** true cuando la vista usa contenido editorial de respaldo por falta de publicación remota. */
  isFallback?: boolean;
  publishedAt: string | null;
  updatedAt: string;
}
