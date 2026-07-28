/**
 * Contrato del motor planetario.
 *
 * SERVER-ONLY: no importar desde componentes ni desde loaders isomorficos.
 * Los calculos reciben siempre un instante absoluto y devuelven datos puros,
 * sin interpretacion astrologica ni persistencia.
 */
import type { ZodiacSignKey } from "@/types/compatibility";

export const PLANETARY_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

export type PlanetaryBody = (typeof PLANETARY_BODIES)[number];

export interface PlanetaryPosition {
  body: PlanetaryBody;
  absoluteLongitude: number;
  sign: ZodiacSignKey;
  degreeInSign: number;
  isRetrograde: boolean;
  speedDegreesPerDay: number;
  calculatedAt: string;
}

export interface PlanetarySnapshot {
  calculatedAt: string;
  positions: PlanetaryPosition[];
}

export interface PlanetaryEngine {
  readonly version: string;
  calculatePosition(body: PlanetaryBody, date: Date): PlanetaryPosition;
  calculateSnapshot(date: Date, bodies?: readonly PlanetaryBody[]): PlanetarySnapshot;
}

export class PlanetaryEngineError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_DATE"
      | "UNSUPPORTED_BODY"
      | "NON_FINITE_RESULT"
      | "ASTRONOMY_ENGINE_FAILURE"
      | "CONTRACT_VIOLATION",
  ) {
    super(message);
    this.name = "PlanetaryEngineError";
  }
}
