import * as Astronomy from "astronomy-engine";
import { calculateNatalChart } from "@/services/astrology.service";
import type {
  BirthData,
  CelestialPlacement,
  NatalAspect,
  NatalAspectKey,
  NatalChart,
} from "@/types/astrology";
import type { TransitPosition, TransitSnapshot } from "@/types/transits";
import { ZODIAC_SIGNS } from "@/types/astrology";

const TRANSIT_BODIES = [
  { key: "sun", astronomyBody: Astronomy.Body.Sun, label: "Sol" },
  { key: "moon", astronomyBody: Astronomy.Body.Moon, label: "Luna" },
  { key: "mercury", astronomyBody: Astronomy.Body.Mercury, label: "Mercurio" },
  { key: "venus", astronomyBody: Astronomy.Body.Venus, label: "Venus" },
  { key: "mars", astronomyBody: Astronomy.Body.Mars, label: "Marte" },
  { key: "jupiter", astronomyBody: Astronomy.Body.Jupiter, label: "Júpiter" },
  { key: "saturn", astronomyBody: Astronomy.Body.Saturn, label: "Saturno" },
  { key: "uranus", astronomyBody: Astronomy.Body.Uranus, label: "Urano" },
  { key: "neptune", astronomyBody: Astronomy.Body.Neptune, label: "Neptuno" },
  { key: "pluto", astronomyBody: Astronomy.Body.Pluto, label: "Plutón" },
] as const;

const ASPECT_DEFINITIONS: ReadonlyArray<{
  key: NatalAspectKey;
  label: string;
  angle: number;
  maxOrb: number;
}> = [
  { key: "conjunction", label: "Conjunción", angle: 0, maxOrb: 8 },
  { key: "sextile", label: "Sextil", angle: 60, maxOrb: 5 },
  { key: "square", label: "Cuadratura", angle: 90, maxOrb: 7 },
  { key: "trine", label: "Trígono", angle: 120, maxOrb: 7 },
  { key: "opposition", label: "Oposición", angle: 180, maxOrb: 8 },
];

function normalize360(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function normalize180(degrees: number): number {
  const normalized = normalize360(degrees);
  return normalized > 180 ? normalized - 360 : normalized;
}

function placementFromLongitude(
  body: string,
  label: string,
  longitude: number,
  latitude: number,
): CelestialPlacement {
  const normalized = normalize360(longitude);
  const sign = ZODIAC_SIGNS[Math.floor(normalized / 30)] ?? ZODIAC_SIGNS[0];
  return {
    body,
    label,
    longitude: normalized,
    latitude,
    sign,
    degreeInSign: normalized - sign.startDegree,
  };
}

function signedLongitudeDelta(from: number, to: number): number {
  const delta = normalize360(to - from);
  return delta > 180 ? delta - 360 : delta;
}

function calculateLongitude(
  body: (typeof TRANSIT_BODIES)[number]["astronomyBody"],
  date: Date,
): number {
  if (body === Astronomy.Body.Moon) return Astronomy.EclipticGeoMoon(date).lon;
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon;
}

function calculateSpeedDegreesPerDay(
  body: (typeof TRANSIT_BODIES)[number]["astronomyBody"],
  date: Date,
): number {
  const before = new Date(date.getTime() - 12 * 60 * 60 * 1000);
  const after = new Date(date.getTime() + 12 * 60 * 60 * 1000);
  return signedLongitudeDelta(calculateLongitude(body, before), calculateLongitude(body, after));
}

function calculateCrossAspects(
  natalPlacements: readonly CelestialPlacement[],
  transits: readonly TransitPosition[],
): NatalAspect[] {
  const aspects: NatalAspect[] = [];
  for (const transit of transits) {
    for (const natal of natalPlacements) {
      const separation = Math.abs(normalize180(transit.longitude - natal.longitude));
      const best = ASPECT_DEFINITIONS.map((definition) => ({
        ...definition,
        orb: Math.abs(separation - definition.angle),
      })).sort((a, b) => a.orb - b.orb)[0];
      if (!best || best.orb > best.maxOrb) continue;
      aspects.push({
        key: best.key,
        label: best.label,
        firstBody: transit.body,
        firstLabel: `Tránsito de ${transit.label}`,
        secondBody: natal.body,
        secondLabel: `Natal: ${natal.label}`,
        separation,
        exactAngle: best.angle,
        orb: best.orb,
      });
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb);
}

export function calculateTransitSnapshot(input: {
  birth: BirthData;
  targetDate: Date;
}): TransitSnapshot {
  if (!(input.targetDate instanceof Date) || Number.isNaN(input.targetDate.getTime())) {
    throw new Error("Selecciona una fecha válida para consultar los tránsitos.");
  }
  const natal = calculateNatalChart(input.birth);
  const transits = TRANSIT_BODIES.map(({ key, astronomyBody, label }): TransitPosition => {
    const longitude = calculateLongitude(astronomyBody, input.targetDate);
    const speedDegreesPerDay = calculateSpeedDegreesPerDay(astronomyBody, input.targetDate);
    return {
      ...placementFromLongitude(key, label, longitude, 0),
      isRetrograde: speedDegreesPerDay < 0,
      speedDegreesPerDay,
    };
  });

  return {
    targetDateIso: input.targetDate.toISOString(),
    natal,
    transits,
    aspects: calculateCrossAspects(natal.placements, transits),
    limitations: [
      "Los tránsitos se calculan para el instante seleccionado en UTC y se muestran como una referencia local reproducible.",
      "Los aspectos usan los cinco aspectos mayores y orbes fijos; no incluyen aspectos menores ni técnicas predictivas adicionales.",
      "La lectura es simbólica y no constituye una predicción determinista ni asesoramiento profesional.",
    ],
  };
}
