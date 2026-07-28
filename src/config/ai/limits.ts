/** Límites y control de consumo. Los valores concretos viven en variables de entorno. */
export const aiLimits = {
  maxInputCharacters: 4000,
  maxOutputCharacters: 12000,
  maxRecentMessages: 10,
  maxSources: 4,
  defaultMaxOutputTokens: 900,
  guestDailyDefault: 5,
  userDailyDefault: 30,
  requestTimeoutMsDefault: 45000,
  idempotencyWindowSeconds: 60,
} as const;

export function readIntEnv(name: string, fallback: number): number {
  const raw = typeof process !== "undefined" ? process.env?.[name] : undefined;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
