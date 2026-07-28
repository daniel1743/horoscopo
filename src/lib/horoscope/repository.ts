/**
 * Repositorio de horóscopos. ÚNICA capa que habla con Supabase.
 * Los componentes NUNCA consultan supabase directamente.
 * Portable: usa `@supabase/supabase-js` estándar a través del cliente generado.
 */
import { supabase } from "@/integrations/supabase/client";
import type { HoroscopeEntry, HoroscopePeriod } from "@/types/horoscope";
import { referenceDateFor } from "@/config/horoscope";

interface HoroscopeRow {
  id: string;
  sign_slug: string;
  period: HoroscopePeriod;
  date_for: string;
  summary: string;
  focus: string;
  mood: string;
  energy: number;
  love: string | null;
  work: string | null;
  wellbeing: string | null;
  lucky_number: number | null;
  lucky_color: string | null;
  is_demo: boolean;
  published_at: string | null;
  updated_at: string;
}

const COLUMNS =
  "id,sign_slug,period,date_for,summary,focus,mood,energy,love,work,wellbeing,lucky_number,lucky_color,is_demo,published_at,updated_at";

const cli = () => supabase as unknown as import("@supabase/supabase-js").SupabaseClient;

const clampEnergy = (n: number): HoroscopeEntry["energy"] => {
  const v = Math.max(1, Math.min(5, Math.round(n))) as HoroscopeEntry["energy"];
  return v;
};

function mapRow(r: HoroscopeRow): HoroscopeEntry {
  return {
    id: r.id,
    signSlug: r.sign_slug,
    period: r.period,
    dateFor: r.date_for,
    summary: r.summary,
    focus: r.focus,
    mood: r.mood,
    energy: clampEnergy(r.energy),
    love: r.love,
    work: r.work,
    wellbeing: r.wellbeing,
    luckyNumber: r.lucky_number,
    luckyColor: r.lucky_color,
    isDemo: r.is_demo,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
  };
}

/** Última entrada publicada para un signo/periodo (más reciente `date_for`). */
export async function getLatestHoroscope(
  signSlug: string,
  period: HoroscopePeriod,
): Promise<HoroscopeEntry | null> {
  const { data, error } = await cli()
    .from("horoscopes")
    .select(COLUMNS)
    .eq("sign_slug", signSlug)
    .eq("period", period)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("date_for", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as HoroscopeRow) : null;
}

/** Entrada exacta para un signo/periodo/fecha (o null). */
export async function getHoroscopeForDate(
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string,
): Promise<HoroscopeEntry | null> {
  const { data, error } = await cli()
    .from("horoscopes")
    .select(COLUMNS)
    .eq("sign_slug", signSlug)
    .eq("period", period)
    .eq("date_for", dateFor)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as HoroscopeRow) : null;
}

/** Todas las entradas publicadas del periodo en su fecha de referencia (para vistas globales). */
export async function listHoroscopesForCurrentPeriod(
  period: HoroscopePeriod,
): Promise<HoroscopeEntry[]> {
  const dateFor = referenceDateFor(period);
  const { data, error } = await cli()
    .from("horoscopes")
    .select(COLUMNS)
    .eq("period", period)
    .eq("date_for", dateFor)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString());
  if (error) throw error;
  return (data as HoroscopeRow[]).map(mapRow);
}

/** Historial reciente de un signo para navegación anterior/siguiente. */
export async function listRecentHoroscopes(
  signSlug: string,
  period: HoroscopePeriod,
  limit = 10,
): Promise<HoroscopeEntry[]> {
  const { data, error } = await cli()
    .from("horoscopes")
    .select(COLUMNS)
    .eq("sign_slug", signSlug)
    .eq("period", period)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("date_for", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as HoroscopeRow[]).map(mapRow);
}
