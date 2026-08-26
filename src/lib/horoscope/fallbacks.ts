import type { HoroscopeEntry, HoroscopePeriod } from "@/types/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import { referenceDateFor } from "@/config/horoscope";
import { getHoroscopeEditorial } from "@/config/horoscope-editorial";

/**
 * Genera una entrada de horóscopo estática basada en los metadatos del signo.
 * Se utiliza cuando no hay datos en Supabase para evitar estados vacíos.
 */
export function createHoroscopeFallback(
  signSlug: string,
  period: HoroscopePeriod,
  dateFor?: string,
): HoroscopeEntry {
  const sign = zodiacSigns.find((s) => s.slug === signSlug);
  const actualDate = dateFor ?? referenceDateFor(period);

  if (!sign) {
    throw new Error(`Sign not found: ${signSlug}`);
  }

  const guide = getHoroscopeEditorial(signSlug, period);

  return {
    id: `fallback-${signSlug}-${period}-${actualDate}`,
    signSlug,
    period,
    dateFor: actualDate,
    summary: guide.opening,
    context: guide.context,
    whyItMatters: guide.whyItMatters,
    observe: guide.observe,
    reflectionQuestion: guide.reflectionQuestion,
    focus: sign.keyword,
    mood: "Reflexivo",
    energy: 3,
    love: "Observa tus vínculos con curiosidad y sin juicios.",
    work: "Prioriza la organización y el orden en tus tareas.",
    wellbeing: "Busca un momento de silencio para reconectar contigo.",
    luckyNumber: 7,
    luckyColor: "Dorado",
    isDemo: true,
    isFallback: true,
    publishedAt: null,
    updatedAt: actualDate,
  };
}

/**
 * Asegura que una lista de entradas tenga los 12 signos, completando con fallbacks.
 */
export function ensureFullCoverage(
  entries: HoroscopeEntry[],
  period: HoroscopePeriod,
  dateFor?: string,
): HoroscopeEntry[] {
  const bySlug = new Map(entries.map((e) => [e.signSlug, e]));
  return zodiacSigns.map((sign) => {
    return bySlug.get(sign.slug) ?? createHoroscopeFallback(sign.slug, period, dateFor);
  });
}
