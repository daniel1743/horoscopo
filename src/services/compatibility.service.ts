/**
 * Servicio de compatibilidad. Los componentes usan estos hooks/funciones
 * y nunca acceden al repositorio ni a Supabase directamente.
 */
import { queryOptions } from "@tanstack/react-query";
import { supabaseCompatibilityRepository } from "@/repositories/supabase-compatibility.repository";
import { getZodiacBySlug } from "@/data/zodiac-signs";
import {
  createPairKey,
  normalizeSignPair,
  parsePairKey,
} from "@/lib/compatibility/normalize-sign-pair";
import {
  createCompatibilityFallback,
  getFallbackFeaturedPairs,
  getFallbackPairsForSign,
} from "@/lib/compatibility/fallbacks";
import type {
  CompatibilityPageData,
  CompatibilityProfile,
  ZodiacSignKey,
} from "@/types/compatibility";

const STALE_MS = 6 * 60 * 60 * 1000; // 6h

const repo = supabaseCompatibilityRepository;

export class CompatibilityNotFoundError extends Error {
  constructor(pairKey: string) {
    super(`Compatibility not found for ${pairKey}`);
    this.name = "CompatibilityNotFoundError";
  }
}

export function createCompatibilityRoute(signOne: unknown, signTwo: unknown): string {
  return normalizeSignPair(signOne, signTwo).canonical_path;
}

async function loadPairPage(
  signOne: ZodiacSignKey,
  signTwo: ZodiacSignKey,
): Promise<CompatibilityPageData> {
  const normalized = normalizeSignPair(signOne, signTwo);
  const signA = getZodiacBySlug(normalized.sign_a);
  const signB = getZodiacBySlug(normalized.sign_b);
  if (!signA || !signB) throw new Error("Zodiac metadata missing");

  const [profile, altA, altB] = await Promise.all([
    repo.getByPairKey(normalized.pair_key),
    repo.getPublishedForSign(normalized.sign_a, 6),
    normalized.sign_a === normalized.sign_b
      ? Promise.resolve<CompatibilityProfile[]>([])
      : repo.getPublishedForSign(normalized.sign_b, 6),
  ]);

  const seen = new Set<string>([normalized.pair_key]);
  const alternativePairs: CompatibilityProfile[] = [];
  for (const p of [...altA, ...altB]) {
    if (seen.has(p.pairKey)) continue;
    seen.add(p.pairKey);
    alternativePairs.push(p);
    if (alternativePairs.length >= 4) break;
  }

  // Si no hay suficientes alternativas publicadas, completar con fallbacks
  if (alternativePairs.length < 4) {
    const fallbacks = getFallbackPairsForSign(normalized.sign_a, 4);
    for (const [fa, fb] of fallbacks) {
      const fKey = createPairKey(fa, fb);
      if (seen.has(fKey)) continue;
      seen.add(fKey);
      alternativePairs.push(createCompatibilityFallback(fa, fb));
      if (alternativePairs.length >= 4) break;
    }
  }

  const finalProfile = profile ?? createCompatibilityFallback(normalized.sign_a, normalized.sign_b);

  return { normalized, signA, signB, profile: finalProfile, alternativePairs };
}

export const compatibilityQueries = {
  pair: (signOne: ZodiacSignKey, signTwo: ZodiacSignKey) =>
    queryOptions({
      queryKey: ["compatibility", "pair", ...normalizeAsTuple(signOne, signTwo)] as const,
      queryFn: () => loadPairPage(signOne, signTwo),
      staleTime: STALE_MS,
    }),
  featured: (limit = 6) =>
    queryOptions({
      queryKey: ["compatibility", "featured", limit] as const,
      queryFn: async () => {
        const published = await repo.getPublishedPairs(limit);
        if (published.length > 0) return published;
        return getFallbackFeaturedPairs().map(([a, b]) => createCompatibilityFallback(a, b));
      },
      staleTime: STALE_MS,
    }),
};

function normalizeAsTuple(a: ZodiacSignKey, b: ZodiacSignKey) {
  const n = normalizeSignPair(a, b);
  return [n.sign_a, n.sign_b] as const;
}

export const compatibilityService = {
  getPairPage: loadPairPage,
  getFeaturedPairs: (limit = 6) => repo.getPublishedPairs(limit),
  getByPairKey: (pairKey: string) => {
    const parsed = parsePairKey(pairKey);
    return repo.getByPairKey(parsed.pair_key);
  },
};
