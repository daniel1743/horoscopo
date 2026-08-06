/**
 * Sistema de contexto astronómico para generación de horóscopos.
 * Calcula posiciones planetarias reales usando astronomy-engine.
 */

import * as Astronomy from "astronomy-engine";
import type {
  AstronomicalContext,
  PlanetaryPosition,
  PlanetaryAspect,
} from "@/types/horoscope-automation";

// Planetas principales para tracking
const MAIN_PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
] as const;

// Nombres en español para los planetas
const PLANET_NAMES_ES: Record<string, string> = {
  Sun: "Sol",
  Moon: "Luna",
  Mercury: "Mercurio",
  Venus: "Venus",
  Mars: "Marte",
  Jupiter: "Júpiter",
  Saturn: "Saturno",
  Uranus: "Urano",
  Neptune: "Neptuno",
  Pluto: "Plutón",
};

// Signos zodiacales por rango de grados eclípticos
const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", start: 0, end: 30 },
  { name: "Tauro", symbol: "♉", start: 30, end: 60 },
  { name: "Géminis", symbol: "♊", start: 60, end: 90 },
  { name: "Cáncer", symbol: "♋", start: 90, end: 120 },
  { name: "Leo", symbol: "♌", start: 120, end: 150 },
  { name: "Virgo", symbol: "♍", start: 150, end: 180 },
  { name: "Libra", symbol: "♎", start: 180, end: 210 },
  { name: "Escorpio", symbol: "♏", start: 210, end: 240 },
  { name: "Sagitario", symbol: "♐", start: 240, end: 270 },
  { name: "Capricornio", symbol: "♑", start: 270, end: 300 },
  { name: "Acuario", symbol: "♒", start: 300, end: 330 },
  { name: "Piscis", symbol: "♓", start: 330, end: 360 },
];

// Fases lunares
const MOON_PHASES = [
  { name: "Luna Nueva", start: 0, end: 45 },
  { name: "Luna Creciente", start: 45, end: 135 },
  { name: "Luna Llena", start: 135, end: 225 },
  { name: "Luna Menguante", start: 225, end: 315 },
  { name: "Luna Nueva", start: 315, end: 360 },
];

/**
 * Normaliza longitud eclíptica a 0-360 grados.
 */
function normalizeLongitude(lon: number): number {
  let normalized = lon % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/**
 * Determina el signo zodiacal basado en longitud eclíptica.
 */
function getZodiacSign(eclipticLongitude: number): {
  name: string;
  symbol: string;
  degrees: number;
} {
  const lon = normalizeLongitude(eclipticLongitude);

  for (const sign of ZODIAC_SIGNS) {
    if (lon >= sign.start && lon < sign.end) {
      const degreesInSign = lon - sign.start;
      return {
        name: sign.name,
        symbol: sign.symbol,
        degrees: Math.round(degreesInSign * 10) / 10,
      };
    }
  }

  // Fallback (no debería ocurrir)
  return { name: "Aries", symbol: "♈", degrees: 0 };
}

/**
 * Calcula la posición de un planeta para una fecha dada.
 */
function getPlanetaryPosition(
  planet: string,
  date: Date,
): PlanetaryPosition {
  const body = planet as Astronomy.Body;
  const geoVector = Astronomy.GeoVector(body, date, true);
  const ecliptic = Astronomy.Ecliptic(geoVector);

  // Verificar si está retrógrado (aproximación simple: velocidad negativa)
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const geoVectorTomorrow = Astronomy.GeoVector(body, tomorrow, true);
  const eclipticTomorrow = Astronomy.Ecliptic(geoVectorTomorrow);

  const velocity = eclipticTomorrow.elon - ecliptic.elon;
  const retrograde = velocity < -0.5; // Threshold empírico

  const signInfo = getZodiacSign(ecliptic.elon);

  return {
    planet: PLANET_NAMES_ES[planet] || planet,
    sign: signInfo.name,
    degrees: signInfo.degrees,
    retrograde,
  };
}

/**
 * Calcula el ángulo entre dos longitudes eclípticas.
 */
function calculateAngle(lon1: number, lon2: number): number {
  const diff = Math.abs(normalizeLongitude(lon1) - normalizeLongitude(lon2));
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Detecta el tipo de aspecto basado en ángulo.
 */
function detectAspectType(
  angle: number,
  orb = 8,
): {
  type: PlanetaryAspect["aspectType"];
  nature: PlanetaryAspect["nature"];
  strength: number;
} | null {
  const aspects = [
    {
      angle: 0,
      type: "conjunction" as const,
      nature: "neutral" as const,
      strength: 5,
    },
    {
      angle: 60,
      type: "sextile" as const,
      nature: "harmonious" as const,
      strength: 3,
    },
    {
      angle: 90,
      type: "square" as const,
      nature: "challenging" as const,
      strength: 4,
    },
    {
      angle: 120,
      type: "trine" as const,
      nature: "harmonious" as const,
      strength: 5,
    },
    {
      angle: 180,
      type: "opposition" as const,
      nature: "challenging" as const,
      strength: 4,
    },
  ];

  for (const aspect of aspects) {
    if (Math.abs(angle - aspect.angle) <= orb) {
      const exactness = 1 - Math.abs(angle - aspect.angle) / orb;
      const adjustedStrength = Math.round(aspect.strength * exactness);
      return {
        type: aspect.type,
        nature: aspect.nature,
        strength: Math.max(1, adjustedStrength),
      };
    }
  }

  return null;
}

/**
 * Calcula aspectos entre planetas.
 */
function calculateAspects(
  positions: Array<{ planet: string; lon: number }>,
): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const angle = calculateAngle(positions[i].lon, positions[j].lon);
      const aspectInfo = detectAspectType(angle);

      if (aspectInfo) {
        aspects.push({
          planet1: positions[i].planet,
          planet2: positions[j].planet,
          aspectType: aspectInfo.type,
          angleDegrees: Math.round(angle * 10) / 10,
          orb: Math.round(Math.abs(angle - getExactAspectAngle(aspectInfo.type)) * 10) / 10,
          strength: aspectInfo.strength,
          nature: aspectInfo.nature,
        });
      }
    }
  }

  // Ordenar por fuerza (más fuertes primero)
  return aspects.sort((a, b) => b.strength - a.strength);
}

/**
 * Obtiene el ángulo exacto de un tipo de aspecto.
 */
function getExactAspectAngle(type: PlanetaryAspect["aspectType"]): number {
  const angles: Record<PlanetaryAspect["aspectType"], number> = {
    conjunction: 0,
    sextile: 60,
    square: 90,
    trine: 120,
    opposition: 180,
  };
  return angles[type];
}

/**
 * Calcula la fase lunar.
 */
function calculateMoonPhase(date: Date): {
  name: string;
  illumination: number;
  dayOfCycle: number;
} {
  const moonPhase = Astronomy.MoonPhase(date);
  const illumination = Astronomy.Illumination("Moon" as Astronomy.Body, date);

  // Convertir ángulo de fase a nombre
  const phaseAngle = moonPhase;
  let phaseName = "Luna Nueva";

  for (const phase of MOON_PHASES) {
    if (phaseAngle >= phase.start && phaseAngle < phase.end) {
      phaseName = phase.name;
      break;
    }
  }

  return {
    name: phaseName,
    illumination: Math.round(illumination.phase_fraction * 100),
    dayOfCycle: Math.round((phaseAngle / 360) * 29.5),
  };
}

/**
 * Genera un resumen textual del contexto astronómico.
 */
function generateSummary(
  positions: PlanetaryPosition[],
  aspects: PlanetaryAspect[],
  moonPhase: { name: string; illumination: number },
): string {
  const lines: string[] = [];

  // Posiciones destacadas
  const sun = positions.find((p) => p.planet === "Sol");
  const moon = positions.find((p) => p.planet === "Luna");

  if (sun) {
    lines.push(
      `El Sol transita ${sun.sign} a ${sun.degrees}°, iluminando temas de ${getSignKeyword(sun.sign)}.`,
    );
  }

  if (moon) {
    const retroText = moon.retrograde ? " (retrógrada)" : "";
    lines.push(
      `La Luna en ${moon.sign}${retroText} (${moonPhase.name}, ${moonPhase.illumination}% iluminada) marca el tono emocional.`,
    );
  }

  // Aspectos mayores (top 3)
  const majorAspects = aspects.slice(0, 3);
  if (majorAspects.length > 0) {
    lines.push("\nAspectos destacados:");
    for (const aspect of majorAspects) {
      const natureText =
        aspect.nature === "harmonious"
          ? "favorece"
          : aspect.nature === "challenging"
            ? "desafía"
            : "conecta";
      lines.push(
        `- ${aspect.planet1} ${getAspectSymbol(aspect.aspectType)} ${aspect.planet2} (${aspect.aspectType}): ${natureText} la integración de estas energías.`,
      );
    }
  }

  // Retrogradaciones
  const retrograde = positions.filter((p) => p.retrograde);
  if (retrograde.length > 0) {
    lines.push(
      `\n⚠️ Planetas retrógrados: ${retrograde.map((p) => p.planet).join(", ")} - tiempo de revisión interior.`,
    );
  }

  return lines.join("\n");
}

/**
 * Obtiene keyword de un signo para el resumen.
 */
function getSignKeyword(sign: string): string {
  const keywords: Record<string, string> = {
    Aries: "iniciativa y liderazgo",
    Tauro: "estabilidad y recursos",
    Géminis: "comunicación y aprendizaje",
    Cáncer: "cuidado y hogar",
    Leo: "creatividad y expresión",
    Virgo: "servicio y precisión",
    Libra: "balance y relaciones",
    Escorpio: "transformación profunda",
    Sagitario: "expansión y filosofía",
    Capricornio: "estructura y logro",
    Acuario: "innovación y colectivo",
    Piscis: "intuición y trascendencia",
  };
  return keywords[sign] || "este arquetipo";
}

/**
 * Obtiene símbolo de aspecto.
 */
function getAspectSymbol(type: PlanetaryAspect["aspectType"]): string {
  const symbols: Record<PlanetaryAspect["aspectType"], string> = {
    conjunction: "☌",
    sextile: "⚹",
    square: "□",
    trine: "△",
    opposition: "☍",
  };
  return symbols[type];
}

/**
 * FUNCIÓN PRINCIPAL: Calcula el contexto astronómico completo para una fecha.
 */
export async function calculateAstronomicalContext(
  dateString: string,
): Promise<AstronomicalContext> {
  const date = new Date(dateString);

  // Calcular posiciones planetarias
  const positions: PlanetaryPosition[] = [];
  const rawPositions: Array<{ planet: string; lon: number }> = [];

  for (const planet of MAIN_PLANETS) {
    const position = getPlanetaryPosition(planet, date);
    positions.push(position);

    // Guardar longitud eclíptica para cálculo de aspectos
    const geoVector = Astronomy.GeoVector(planet as Astronomy.Body, date, true);
    const ecliptic = Astronomy.Ecliptic(geoVector);
    rawPositions.push({
      planet: PLANET_NAMES_ES[planet] || planet,
      lon: ecliptic.elon,
    });
  }

  // Calcular aspectos
  const majorAspects = calculateAspects(rawPositions);

  // Calcular fase lunar
  const moonPhase = calculateMoonPhase(date);

  // Generar resumen
  const summary = generateSummary(positions, majorAspects, moonPhase);

  return {
    date: dateString,
    positions,
    majorAspects,
    moonPhase,
    summary,
  };
}

/**
 * Formatea el contexto astronómico para incluir en un prompt de IA.
 */
export function formatAstronomicalContextForPrompt(
  context: AstronomicalContext,
): string {
  const lines: string[] = [
    "═══════════════════════════════════════════════════════════════",
    `CONTEXTO ASTRONÓMICO REAL - ${context.date}`,
    "═══════════════════════════════════════════════════════════════",
    "",
    "POSICIONES PLANETARIAS:",
  ];

  for (const pos of context.positions) {
    const retroText = pos.retrograde ? " ℞ (retrógrado)" : "";
    lines.push(`• ${pos.planet} en ${pos.sign} a ${pos.degrees}°${retroText}`);
  }

  if (context.majorAspects.length > 0) {
    lines.push("");
    lines.push("ASPECTOS MAYORES:");
    for (const aspect of context.majorAspects.slice(0, 5)) {
      const symbol = getAspectSymbol(aspect.aspectType);
      const strength = "★".repeat(aspect.strength);
      lines.push(
        `• ${aspect.planet1} ${symbol} ${aspect.planet2} (${aspect.aspectType}, orbe ${aspect.orb}°) ${strength}`,
      );
    }
  }

  lines.push("");
  lines.push(
    `FASE LUNAR: ${context.moonPhase.name} (${context.moonPhase.illumination}% iluminada, día ${context.moonPhase.dayOfCycle}/29.5)`,
  );

  lines.push("");
  lines.push("INSTRUCCIÓN:");
  lines.push(
    "DEBES mencionar AL MENOS UN tránsito o aspecto planetario específico en tu lectura.",
  );
  lines.push(
    "Usa este contexto astronómico REAL para fundamentar tus interpretaciones.",
  );
  lines.push("═══════════════════════════════════════════════════════════════");

  return lines.join("\n");
}
