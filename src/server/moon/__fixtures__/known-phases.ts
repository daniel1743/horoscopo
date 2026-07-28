/**
 * Fechas conocidas de fases mayores publicadas por el USNO (U.S. Naval Observatory)
 * y NASA GSFC — tomadas de tablas de referencia públicas.
 * https://aa.usno.navy.mil/data/MoonPhases  y  https://svs.gsfc.nasa.gov/
 *
 * Formato: ISO UTC.  El motor debe reproducir estas fases con precisión
 * ≤ 2 minutos.  Cualquier reemplazo del motor debe pasar el test.
 */
export interface KnownPhase {
  phase: "new_moon" | "first_quarter" | "full_moon" | "last_quarter";
  utc: string;
  description: string;
}

export const KNOWN_PHASES: readonly KnownPhase[] = [
  { phase: "new_moon",      utc: "2000-01-06T18:14:00Z", description: "Luna nueva enero 2000 (USNO)" },
  { phase: "full_moon",     utc: "2000-01-21T04:40:00Z", description: "Luna llena enero 2000 (USNO)" },
  { phase: "new_moon",      utc: "2024-01-11T11:57:00Z", description: "Luna nueva enero 2024 (USNO)" },
  { phase: "first_quarter", utc: "2024-01-18T03:52:00Z", description: "Cuarto creciente enero 2024 (USNO)" },
  { phase: "full_moon",     utc: "2024-01-25T17:54:00Z", description: "Luna llena enero 2024 (USNO)" },
  { phase: "last_quarter",  utc: "2024-02-02T23:18:00Z", description: "Cuarto menguante febrero 2024 (USNO)" },
  { phase: "full_moon",     utc: "2024-04-23T23:49:00Z", description: "Luna llena Rosa abril 2024 (USNO)" },
  { phase: "new_moon",      utc: "2025-01-29T12:36:00Z", description: "Luna nueva enero 2025 (USNO)" },
  { phase: "full_moon",     utc: "2025-02-12T13:53:00Z", description: "Luna llena febrero 2025 (USNO)" },
] as const;
