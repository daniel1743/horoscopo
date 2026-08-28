import {
  indexableCompatibilityPairs,
  isIndexableCompatibilityPair,
} from "@/config/compatibility-indexability";
import { zodiacSigns } from "@/data/zodiac-signs";
import type { CompatibilityProfile, ZodiacSignKey } from "@/types/compatibility";

export function filterIndexableAlternativePairs(
  alternativePairs: CompatibilityProfile[],
): CompatibilityProfile[] {
  return alternativePairs.filter((p) => isIndexableCompatibilityPair(p.signA, p.signB));
}

export function getIndexableCompatibilityPairForSign(signSlug: string): {
  signA: ZodiacSignKey;
  signB: ZodiacSignKey;
  signAName: string;
  signBName: string;
} | null {
  const pair = indexableCompatibilityPairs().find(
    (candidate) => candidate.signA === signSlug || candidate.signB === signSlug,
  );

  if (!pair) return null;

  const signA = zodiacSigns.find((s) => s.slug === pair.signA);
  const signB = zodiacSigns.find((s) => s.slug === pair.signB);

  if (!signA || !signB) return null;

  return {
    signA: pair.signA,
    signB: pair.signB,
    signAName: signA.name,
    signBName: signB.name,
  };
}
