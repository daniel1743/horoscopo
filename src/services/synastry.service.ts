import { calculateNatalChart } from "@/services/astrology.service";
import type { BirthData, CelestialPlacement, NatalAspect, NatalAspectKey } from "@/types/astrology";
import type { SynastrySnapshot } from "@/types/synastry";

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

function calculateCrossAspects(
  firstPlacements: readonly CelestialPlacement[],
  secondPlacements: readonly CelestialPlacement[],
): NatalAspect[] {
  const aspects: NatalAspect[] = [];
  for (const first of firstPlacements) {
    for (const second of secondPlacements) {
      const separation = Math.abs(normalize180(second.longitude - first.longitude));
      const best = ASPECT_DEFINITIONS.map((definition) => ({
        ...definition,
        orb: Math.abs(separation - definition.angle),
      })).sort((a, b) => a.orb - b.orb)[0];
      if (!best || best.orb > best.maxOrb) continue;
      aspects.push({
        key: best.key,
        label: best.label,
        firstBody: first.body,
        firstLabel: `Persona A · ${first.label}`,
        secondBody: second.body,
        secondLabel: `Persona B · ${second.label}`,
        separation,
        exactAngle: best.angle,
        orb: best.orb,
      });
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb);
}

export function calculateSynastry(first: BirthData, second: BirthData): SynastrySnapshot {
  const firstChart = calculateNatalChart(first);
  const secondChart = calculateNatalChart(second);
  return {
    first: firstChart,
    second: secondChart,
    aspects: calculateCrossAspects(firstChart.placements, secondChart.placements),
    limitations: [
      "La comparación se calcula localmente y no guarda los datos de nacimiento de ninguna persona.",
      "Se muestran aspectos mayores entre los diez cuerpos calculados; no incluye casas compuestas ni carta Davison.",
      "La lectura es simbólica y no determina la calidad, duración ni resultado de una relación.",
    ],
  };
}
