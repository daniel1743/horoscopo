/**
 * Normalización canónica de parejas zodiacales.
 * Fuente única del orden: `src/data/zodiac-signs.ts`.
 *
 * Regla: dos signos definen una única combinación. El orden de selección
 * no genera combinaciones distintas. Aries–Tauro y Tauro–Aries producen
 * el mismo `pair_key` y la misma URL canónica.
 */
import { zodiacSigns } from "@/data/zodiac-signs";
import type {
  CompatibilityPairKey,
  NormalizedSignPair,
  ZodiacSignKey,
} from "@/types/compatibility";

/** Orden zodiacal centralizado, derivado del registro central. */
export const ZODIAC_ORDER: readonly ZodiacSignKey[] = zodiacSigns.map(
  (s) => s.slug as ZodiacSignKey,
);

const POSITION: Record<string, number> = Object.freeze(
  ZODIAC_ORDER.reduce<Record<string, number>>((acc, key, idx) => {
    acc[key] = idx + 1;
    return acc;
  }, {}),
);

export class InvalidZodiacSignError extends Error {
  constructor(sign: unknown) {
    super(`Signo zodiacal inválido: ${String(sign)}`);
    this.name = "InvalidZodiacSignError";
  }
}

export function isZodiacSign(value: unknown): value is ZodiacSignKey {
  return typeof value === "string" && value in POSITION;
}

export function zodiacPosition(sign: ZodiacSignKey): number {
  return POSITION[sign];
}

/** Devuelve el par normalizado en orden canónico. */
export function normalizeSignPair(signOne: unknown, signTwo: unknown): NormalizedSignPair {
  if (!isZodiacSign(signOne)) throw new InvalidZodiacSignError(signOne);
  if (!isZodiacSign(signTwo)) throw new InvalidZodiacSignError(signTwo);

  const [sign_a, sign_b] =
    zodiacPosition(signOne) <= zodiacPosition(signTwo)
      ? [signOne, signTwo]
      : [signTwo, signOne];

  const pair_key = createPairKey(sign_a, sign_b);
  return {
    sign_a,
    sign_b,
    pair_key,
    canonical_path: `/compatibilidad/${sign_a}/${sign_b}`,
  };
}

export function createPairKey(
  sign_a: ZodiacSignKey,
  sign_b: ZodiacSignKey,
): CompatibilityPairKey {
  return `${sign_a}__${sign_b}` as CompatibilityPairKey;
}

/** Parsea `pair_key` validando ambos signos y el orden canónico. */
export function parsePairKey(pairKey: string): NormalizedSignPair {
  const [a, b, ...rest] = pairKey.split("__");
  if (rest.length > 0) throw new InvalidZodiacSignError(pairKey);
  return normalizeSignPair(a, b);
}

/** True si la pareja recibida ya está en orden canónico. */
export function isCanonicalPair(signOne: unknown, signTwo: unknown): boolean {
  if (!isZodiacSign(signOne) || !isZodiacSign(signTwo)) return false;
  const normalized = normalizeSignPair(signOne, signTwo);
  return normalized.sign_a === signOne && normalized.sign_b === signTwo;
}
