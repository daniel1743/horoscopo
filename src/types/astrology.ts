export type ZodiacSignKey =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface ZodiacSign {
  key: ZodiacSignKey;
  label: string;
  symbol: string;
  startDegree: number;
}

export interface BirthData {
  birthDate: string;
  birthTime?: string;
  timezone: string;
  latitude: number;
  longitude: number;
  locationLabel?: string;
}

export interface CelestialPlacement {
  body: string;
  label: string;
  longitude: number;
  latitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
}

export interface HouseCusp {
  house: number;
  longitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
}

export interface AstrologyCalculationMeta {
  dateTimeIso: string;
  timezone: string;
  locationLabel?: string;
  latitude: number;
  longitude: number;
  coordinateSystem: "geocentric-ecliptic";
  zodiac: "tropical-approximation";
  houseSystem: "equal-houses";
  limitations: string[];
}

export interface NatalChart {
  meta: AstrologyCalculationMeta;
  placements: CelestialPlacement[];
  ascendant: CelestialPlacement;
  houses: HouseCusp[];
}

export interface LunarSignResult {
  meta: AstrologyCalculationMeta;
  moon: CelestialPlacement;
  approximateTime: boolean;
}

export interface AscendantResult {
  meta: AstrologyCalculationMeta;
  ascendant: CelestialPlacement;
}

export const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  { key: "aries", label: "Aries", symbol: "♈", startDegree: 0 },
  { key: "taurus", label: "Tauro", symbol: "♉", startDegree: 30 },
  { key: "gemini", label: "Géminis", symbol: "♊", startDegree: 60 },
  { key: "cancer", label: "Cáncer", symbol: "♋", startDegree: 90 },
  { key: "leo", label: "Leo", symbol: "♌", startDegree: 120 },
  { key: "virgo", label: "Virgo", symbol: "♍", startDegree: 150 },
  { key: "libra", label: "Libra", symbol: "♎", startDegree: 180 },
  { key: "scorpio", label: "Escorpio", symbol: "♏", startDegree: 210 },
  { key: "sagittarius", label: "Sagitario", symbol: "♐", startDegree: 240 },
  { key: "capricorn", label: "Capricornio", symbol: "♑", startDegree: 270 },
  { key: "aquarius", label: "Acuario", symbol: "♒", startDegree: 300 },
  { key: "pisces", label: "Piscis", symbol: "♓", startDegree: 330 },
] as const;
