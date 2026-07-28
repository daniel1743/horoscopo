/**
 * Implementacion server-only de PlanetaryEngine basada en astronomy-engine.
 *
 * Coordenadas: longitud ecliptica geocentrica aparente calculada con
 * Astronomy.GeoVector + Astronomy.Ecliptic. Astronomy Engine interpreta Date
 * como instante absoluto UTC; no depende del timezone local para el calculo.
 */
import * as Astronomy from "astronomy-engine";
import type { PlanetaryBody, PlanetaryEngine, PlanetaryPosition } from "./planetary-engine";
import { PLANETARY_BODIES, PlanetaryEngineError } from "./planetary-engine";
import { longitudeToZodiac, normalizeLongitude, signedLongitudeDelta } from "./zodiac-math";

const ENGINE_VERSION = "astronomy-engine@2.1.19:planetary@2a";
const RETROGRADE_SAMPLE_MS = 12 * 60 * 60 * 1000;

const BODY_TO_ASTRONOMY_BODY: Record<PlanetaryBody, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

function assertValidDate(date: Date): void {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new PlanetaryEngineError("planetary-engine: fecha invalida", "INVALID_DATE");
  }
}

export function isPlanetaryBody(value: unknown): value is PlanetaryBody {
  return typeof value === "string" && PLANETARY_BODIES.includes(value as PlanetaryBody);
}

function assertPlanetaryBody(body: unknown): asserts body is PlanetaryBody {
  if (!isPlanetaryBody(body)) {
    throw new PlanetaryEngineError(
      `planetary-engine: cuerpo no soportado: ${String(body)}`,
      "UNSUPPORTED_BODY",
    );
  }
}

function calculateLongitude(body: PlanetaryBody, date: Date): number {
  try {
    const vector = Astronomy.GeoVector(BODY_TO_ASTRONOMY_BODY[body], date, true);
    const value = Astronomy.Ecliptic(vector).elon;
    if (!Number.isFinite(value)) {
      throw new PlanetaryEngineError(
        `planetary-engine: longitud no finita para ${body}`,
        "NON_FINITE_RESULT",
      );
    }
    return normalizeLongitude(value);
  } catch (error) {
    if (error instanceof PlanetaryEngineError) throw error;
    throw new PlanetaryEngineError(
      `planetary-engine: fallo de astronomy-engine calculando ${body}`,
      "ASTRONOMY_ENGINE_FAILURE",
    );
  }
}

function calculateSpeedDegreesPerDay(body: PlanetaryBody, date: Date): number {
  const before = new Date(date.getTime() - RETROGRADE_SAMPLE_MS);
  const after = new Date(date.getTime() + RETROGRADE_SAMPLE_MS);
  const delta = signedLongitudeDelta(
    calculateLongitude(body, before),
    calculateLongitude(body, after),
  );
  const days = (after.getTime() - before.getTime()) / 86_400_000;
  return delta / days;
}

function position(body: PlanetaryBody, date: Date): PlanetaryPosition {
  assertPlanetaryBody(body);
  assertValidDate(date);

  const absoluteLongitude = calculateLongitude(body, date);
  const { sign, degreeInSign } = longitudeToZodiac(absoluteLongitude);
  const speedDegreesPerDay = calculateSpeedDegreesPerDay(body, date);

  if (!Number.isFinite(speedDegreesPerDay)) {
    throw new PlanetaryEngineError(
      `planetary-engine: velocidad no finita para ${body}`,
      "NON_FINITE_RESULT",
    );
  }

  return {
    body,
    absoluteLongitude,
    sign,
    degreeInSign,
    isRetrograde: speedDegreesPerDay < 0,
    speedDegreesPerDay,
    calculatedAt: date.toISOString(),
  };
}

export const astronomyPlanetaryEngine: PlanetaryEngine = {
  version: ENGINE_VERSION,
  calculatePosition: position,
  calculateSnapshot(date, bodies = PLANETARY_BODIES) {
    assertValidDate(date);
    const seen = new Set<PlanetaryBody>();
    const positions = bodies.map((body) => {
      assertPlanetaryBody(body);
      if (seen.has(body)) {
        throw new PlanetaryEngineError(
          `planetary-engine: cuerpo duplicado en snapshot: ${body}`,
          "CONTRACT_VIOLATION",
        );
      }
      seen.add(body);
      return position(body, date);
    });

    return {
      calculatedAt: date.toISOString(),
      positions,
    };
  },
};

export { ENGINE_VERSION };
