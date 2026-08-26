import type { HoroscopeEntry, HoroscopePeriod } from "@/types/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import { referenceDateFor } from "@/config/horoscope";

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

  const periodLabel = period === "daily" ? "hoy" : period === "weekly" ? "esta semana" : "este mes";

  return {
    id: `fallback-${signSlug}-${period}-${actualDate}`,
    signSlug,
    period,
    dateFor: actualDate,
    summary: `Para ${sign.name}, ${periodLabel} el enfoque principal está en la ${sign.keyword.toLowerCase()}. Es un momento para observar cómo tu elemento ${sign.element} influye en tus decisiones cotidianas y buscar el equilibrio en tus acciones.`,
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
