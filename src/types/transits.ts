import type { CelestialPlacement, NatalAspect, NatalChart, ZodiacSign } from "@/types/astrology";

export interface TransitPosition extends CelestialPlacement {
  isRetrograde: boolean;
  speedDegreesPerDay: number;
}

export interface TransitSnapshot {
  targetDateIso: string;
  natal: NatalChart;
  transits: TransitPosition[];
  aspects: NatalAspect[];
  limitations: string[];
}

export type TransitZodiacValue = {
  sign: ZodiacSign;
  degreeInSign: number;
};
