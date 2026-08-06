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
  variant_id?: number;
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
  generation_metadata?: Record<string, unknown>;
}

const COLUMNS =
  "id,sign_slug,period,date_for,variant_id,summary,focus,mood,energy,love,work,wellbeing,lucky_number,lucky_color,is_demo,published_at,updated_at,generation_metadata";

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
    variantId: (r.variant_id as 1 | 2 | 3 | 4) || undefined,
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
    generationMetadata: r.generation_metadata,
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

// =====================================================================
// Funciones con soporte de variantes
// =====================================================================

/** Obtiene un horóscopo específico por variante. */
export async function getHoroscopeVariant(
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string,
  variantId: 1 | 2 | 3 | 4,
): Promise<HoroscopeEntry | null> {
  const { data, error } = await cli()
    .from("horoscopes")
    .select(COLUMNS)
    .eq("sign_slug", signSlug)
    .eq("period", period)
    .eq("date_for", dateFor)
    .eq("variant_id", variantId)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as HoroscopeRow) : null;
}

/** Obtiene todas las variantes de un horóscopo (para comparación/admin). */
export async function getAllVariants(
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string,
): Promise<HoroscopeEntry[]> {
  const { data, error } = await cli()
    .from("horoscopes")
    .select(COLUMNS)
    .eq("sign_slug", signSlug)
    .eq("period", period)
    .eq("date_for", dateFor)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("variant_id", { ascending: true });
  if (error) throw error;
  return (data as HoroscopeRow[]).map(mapRow);
}

// =====================================================================
// Asignaciones de variantes para usuarios
// =====================================================================

interface UserAssignmentRow {
  id: string;
  user_id: string;
  sign_slug: string;
  period: string;
  date_for: string;
  variant_id: number;
  assigned_at: string;
}

/** Obtiene o crea una asignación de variante para un usuario. */
export async function getOrAssignUserVariant(
  userId: string,
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string,
): Promise<1 | 2 | 3 | 4> {
  // Usar función de base de datos que hace hash consistente
  const { data, error } = await cli().rpc("get_or_assign_variant", {
    p_user_id: userId,
    p_sign_slug: signSlug,
    p_period: period,
    p_date_for: dateFor,
  });

  if (error) {
    console.error("Error al asignar variante:", error);
    // Fallback a variante 1 si falla
    return 1;
  }

  const variantId = data as number;
  return (variantId >= 1 && variantId <= 4 ? variantId : 1) as 1 | 2 | 3 | 4;
}

/** Obtiene la variante asignada a un usuario (sin crear nueva). */
export async function getUserAssignedVariant(
  userId: string,
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string,
): Promise<(1 | 2 | 3 | 4) | null> {
  const { data, error } = await cli()
    .from("user_horoscope_assignments")
    .select("variant_id")
    .eq("user_id", userId)
    .eq("sign_slug", signSlug)
    .eq("period", period)
    .eq("date_for", dateFor)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener variante asignada:", error);
    return null;
  }

  if (!data) return null;

  const variantId = (data as UserAssignmentRow).variant_id;
  return (variantId >= 1 && variantId <= 4 ? variantId : null) as (1 | 2 | 3 | 4) | null;
}

/** Lista todas las asignaciones de un usuario (para historial/profile). */
export async function listUserAssignments(
  userId: string,
  limit = 30,
): Promise<Array<{ signSlug: string; period: HoroscopePeriod; dateFor: string; variantId: 1 | 2 | 3 | 4 }>> {
  const { data, error } = await cli()
    .from("user_horoscope_assignments")
    .select("sign_slug,period,date_for,variant_id")
    .eq("user_id", userId)
    .order("date_for", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as UserAssignmentRow[]).map((row) => ({
    signSlug: row.sign_slug,
    period: row.period as HoroscopePeriod,
    dateFor: row.date_for,
    variantId: row.variant_id as 1 | 2 | 3 | 4,
  }));
}
