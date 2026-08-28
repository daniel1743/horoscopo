import type { CompatibilityPairKey, ZodiacSignKey } from "@/types/compatibility";
import { createPairKey, normalizeSignPair } from "@/lib/compatibility/normalize-sign-pair";

export const INDEXABLE_COMPATIBILITY_PAIR_KEYS = [
  "aries__libra",
  "cancer__capricornio",
  "geminis__sagitario",
] as const satisfies readonly CompatibilityPairKey[];

const INDEXABLE_COMPATIBILITY_PAIR_KEY_SET = new Set<CompatibilityPairKey>(
  INDEXABLE_COMPATIBILITY_PAIR_KEYS,
);

export function isIndexableCompatibilityPair(signOne: unknown, signTwo: unknown): boolean {
  const { pair_key } = normalizeSignPair(signOne, signTwo);
  return INDEXABLE_COMPATIBILITY_PAIR_KEY_SET.has(pair_key);
}

export function indexableCompatibilityPairs(): Array<{
  pairKey: CompatibilityPairKey;
  signA: ZodiacSignKey;
  signB: ZodiacSignKey;
}> {
  return INDEXABLE_COMPATIBILITY_PAIR_KEYS.map((pairKey) => {
    const [signA, signB] = pairKey.split("__") as [ZodiacSignKey, ZodiacSignKey];
    return {
      pairKey: createPairKey(signA, signB),
      signA,
      signB,
    };
  });
}
