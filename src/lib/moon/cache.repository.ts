/**
 * Repositorio de caché server-only para cálculos lunares (YAML 10 §14).
 * Usa el cliente admin (service_role). Nunca importar desde componentes ni
 * desde loaders isomórficos. Se carga dinámicamente dentro del handler.
 *
 * Ver `moon.functions.ts` para el punto de entrada.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CacheReadResult<T> {
  hit: boolean;
  value: T | null;
  expiresAt: string | null;
}

export async function readCache<T>(
  supabaseAdmin: SupabaseClient,
  cacheKey: string,
): Promise<CacheReadResult<T>> {
  const { data, error } = await supabaseAdmin
    .from("moon_calculation_cache")
    .select("result,expires_at")
    .eq("cache_key", cacheKey)
    .maybeSingle();
  if (error) return { hit: false, value: null, expiresAt: null };
  if (!data) return { hit: false, value: null, expiresAt: null };
  const row = data as { result: unknown; expires_at: string };
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return { hit: false, value: null, expiresAt: row.expires_at };
  }
  return { hit: true, value: row.result as T, expiresAt: row.expires_at };
}

export async function writeCache(
  supabaseAdmin: SupabaseClient,
  entry: {
    cacheKey: string;
    calculationType: "daily_snapshot" | "monthly_calendar" | "phase_events";
    periodStart: string;
    periodEnd: string;
    timezone: string;
    engineVersion: string;
    result: unknown;
    expiresAt: Date;
  },
): Promise<void> {
  await supabaseAdmin.from("moon_calculation_cache").upsert(
    {
      cache_key: entry.cacheKey,
      calculation_type: entry.calculationType,
      period_start: entry.periodStart,
      period_end: entry.periodEnd,
      timezone: entry.timezone,
      engine_version: entry.engineVersion,
      result: entry.result,
      expires_at: entry.expiresAt.toISOString(),
    },
    { onConflict: "cache_key" },
  );
}
