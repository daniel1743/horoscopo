import type { ZodiacSignKey } from "@/types/compatibility";

export const ZODIAC_SIGN_ORDER: readonly ZodiacSignKey[] = [
  "aries",
  "tauro",
  "geminis",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "escorpio",
  "sagitario",
  "capricornio",
  "acuario",
  "piscis",
] as const;

export function normalizeLongitude(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360;
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function longitudeToZodiac(longitude: number): {
  sign: ZodiacSignKey;
  degreeInSign: number;
} {
  const absoluteLongitude = normalizeLongitude(longitude);
  const signIndex = Math.floor(absoluteLongitude / 30);
  const sign = ZODIAC_SIGN_ORDER[signIndex];

  if (!sign) {
    throw new Error(`zodiac-math: indice de signo fuera de rango: ${signIndex}`);
  }

  return {
    sign,
    degreeInSign: absoluteLongitude - signIndex * 30,
  };
}

export function signedLongitudeDelta(from: number, to: number): number {
  const delta = normalizeLongitude(to) - normalizeLongitude(from);
  if (delta > 180) return delta - 360;
  if (delta < -180) return delta + 360;
  return delta;
}
