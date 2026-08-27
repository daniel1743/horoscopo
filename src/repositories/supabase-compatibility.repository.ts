/**
 * Implementación Supabase del repositorio de compatibilidad.
 * Portable: usa el cliente estándar. Nunca service_role.
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  CompatibilityPairKey,
  CompatibilityProfile,
  ZodiacSignKey,
} from "@/types/compatibility";
import {
  COMPATIBILITY_PROFILE_COLUMNS,
  mapCompatibilityProfileRow,
  type CompatibilityProfileRow,
} from "@/lib/compatibility/compatibility-mappers";
import { createPairKey, normalizeSignPair } from "@/lib/compatibility/normalize-sign-pair";
import type { CompatibilityRepository } from "./compatibility.repository";

const cli = () => supabase as unknown as import("@supabase/supabase-js").SupabaseClient;

async function fetchByPairKey(pairKey: string): Promise<CompatibilityProfile | null> {
  const { data, error } = await cli()
    .from("compatibility_profiles")
    .select(COMPATIBILITY_PROFILE_COLUMNS)
    .eq("pair_key", pairKey)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCompatibilityProfileRow(data as CompatibilityProfileRow) : null;
}

export const supabaseCompatibilityRepository: CompatibilityRepository = {
  async getByPair(signOne, signTwo) {
    const { pair_key } = normalizeSignPair(signOne, signTwo);
    return fetchByPairKey(pair_key);
  },

  async getByPairKey(pairKey) {
    return fetchByPairKey(pairKey);
  },

  async getPublishedForSign(signKey, limit = 8) {
    const { data, error } = await cli()
      .from("compatibility_profiles")
      .select(COMPATIBILITY_PROFILE_COLUMNS)
      .or(`sign_a.eq.${signKey},sign_b.eq.${signKey}`)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as CompatibilityProfileRow[] | null)?.map(mapCompatibilityProfileRow) ?? [];
  },

  async getPublishedPairs(limit = 6) {
    const { data, error } = await cli()
      .from("compatibility_profiles")
      .select(COMPATIBILITY_PROFILE_COLUMNS)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as CompatibilityProfileRow[] | null)?.map(mapCompatibilityProfileRow) ?? [];
  },

  async existsPublishedPair(signOne, signTwo) {
    const { sign_a, sign_b } = normalizeSignPair(signOne, signTwo);
    const pairKey = createPairKey(sign_a, sign_b) as CompatibilityPairKey;
    const { count, error } = await cli()
      .from("compatibility_profiles")
      .select("id", { count: "exact", head: true })
      .eq("pair_key", pairKey);
    if (error) throw error;
    return (count ?? 0) > 0;
  },
};
