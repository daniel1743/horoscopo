/**
 * Contrato server-only del motor de aspectos.
 *
 * AspectEngine consume posiciones planetarias ya calculadas. No recalcula
 * astronomia, no interpreta astrologia y no depende de UI, IA ni persistencia.
 */
import type {
  PlanetaryBody,
  PlanetaryPosition,
  PlanetarySnapshot,
} from "../planetary/planetary-engine";
import { isPlanetaryBody } from "../planetary/astronomy-planetary-engine";
import { normalizeLongitude, signedLongitudeDelta } from "../planetary/zodiac-math";

export const ASPECT_TYPES = ["conjunction", "sextile", "square", "trine", "opposition"] as const;

export type AspectType = (typeof ASPECT_TYPES)[number];

export const ASPECT_EXACT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

export type AspectOrbPolicy = Record<AspectType, number>;
export type AspectPhase = "applying" | "exact" | "separating" | "stationary";

export const DEFAULT_ASPECT_ORB_POLICY: Readonly<AspectOrbPolicy> = Object.freeze({
  conjunction: 8,
  sextile: 4,
  square: 6,
  trine: 6,
  opposition: 8,
});

export const EXACT_ASPECT_PHASE_TOLERANCE_DEGREES = 0.1;
export const ASPECT_PHASE_EPSILON_DEGREES = 1e-9;

export interface AspectInputPosition {
  body: PlanetaryBody;
  absoluteLongitude: number;
  speedDegreesPerDay: number;
}

export interface PlanetaryAspect {
  bodyA: PlanetaryBody;
  bodyB: PlanetaryBody;
  type: AspectType;
  exactAngle: number;
  actualAngle: number;
  orb: number;
  allowedOrb: number;
  phase: AspectPhase;
}

export interface AspectEngine {
  readonly version: string;
  calculateAspects(
    positions: readonly AspectInputPosition[],
    orbPolicy?: AspectOrbPolicy,
  ): PlanetaryAspect[];
  calculateSnapshotAspects(
    snapshot: PlanetarySnapshot,
    orbPolicy?: AspectOrbPolicy,
  ): PlanetaryAspect[];
  countPotentialPairs(positions: readonly AspectInputPosition[]): number;
}

export class AspectEngineError extends Error {
  constructor(
    message: string,
    readonly code:
      "INVALID_POSITION" | "INVALID_ORB_POLICY" | "DUPLICATE_BODY" | "CONTRACT_VIOLATION",
  ) {
    super(message);
    this.name = "AspectEngineError";
  }
}

function assertValidBody(body: unknown): asserts body is PlanetaryBody {
  if (!isPlanetaryBody(body)) {
    throw new AspectEngineError(
      `aspect-engine: cuerpo no soportado: ${String(body)}`,
      "INVALID_POSITION",
    );
  }
}

function assertValidLongitude(longitude: number, body: PlanetaryBody): void {
  if (!Number.isFinite(longitude)) {
    throw new AspectEngineError(
      `aspect-engine: longitud no finita para ${body}`,
      "INVALID_POSITION",
    );
  }
}

function assertValidSpeed(speedDegreesPerDay: number, body: PlanetaryBody): void {
  if (!Number.isFinite(speedDegreesPerDay)) {
    throw new AspectEngineError(
      `aspect-engine: velocidad no finita para ${body}`,
      "INVALID_POSITION",
    );
  }
}

function assertValidOrbPolicy(
  orbPolicy: AspectOrbPolicy | undefined,
): asserts orbPolicy is AspectOrbPolicy {
  if (!orbPolicy || typeof orbPolicy !== "object") {
    throw new AspectEngineError("aspect-engine: politica de orbes invalida", "INVALID_ORB_POLICY");
  }
  for (const aspectType of ASPECT_TYPES) {
    const allowedOrb = orbPolicy[aspectType];
    if (!Number.isFinite(allowedOrb) || allowedOrb < 0) {
      throw new AspectEngineError(
        `aspect-engine: orbe invalido para ${aspectType}`,
        "INVALID_ORB_POLICY",
      );
    }
  }
}

function resolveOrbPolicy(orbPolicy?: AspectOrbPolicy): AspectOrbPolicy {
  if (!orbPolicy) return DEFAULT_ASPECT_ORB_POLICY;
  assertValidOrbPolicy(orbPolicy);
  return orbPolicy;
}

function assertUniqueBodies(positions: readonly AspectInputPosition[]): void {
  const seen = new Set<PlanetaryBody>();
  for (const position of positions) {
    if (!position) {
      throw new AspectEngineError("aspect-engine: posicion invalida", "INVALID_POSITION");
    }
    assertValidBody(position.body);
    assertValidLongitude(position.absoluteLongitude, position.body);
    assertValidSpeed(position.speedDegreesPerDay, position.body);
    if (seen.has(position.body)) {
      throw new AspectEngineError(
        `aspect-engine: cuerpo duplicado: ${position.body}`,
        "DUPLICATE_BODY",
      );
    }
    seen.add(position.body);
  }
}

function calculateAspectPhase(
  left: AspectInputPosition,
  right: AspectInputPosition,
  exactAngle: number,
  currentDeviation: number,
): AspectPhase {
  if (currentDeviation <= EXACT_ASPECT_PHASE_TOLERANCE_DEGREES + ASPECT_PHASE_EPSILON_DEGREES) {
    return "exact";
  }

  const relativeLongitude = signedLongitudeDelta(right.absoluteLongitude, left.absoluteLongitude);
  const relativeSpeed = left.speedDegreesPerDay - right.speedDegreesPerDay;

  if (Math.abs(relativeSpeed) <= ASPECT_PHASE_EPSILON_DEGREES) return "stationary";

  const targetAngles =
    exactAngle === 0 || exactAngle === 180 ? [exactAngle] : [exactAngle, -exactAngle];
  const signedError = targetAngles
    .map((targetAngle) => signedLongitudeDelta(relativeLongitude, targetAngle))
    .sort((leftError, rightError) => Math.abs(leftError) - Math.abs(rightError))[0];

  if (signedError === undefined) {
    throw new AspectEngineError("aspect-engine: aspecto invalido", "CONTRACT_VIOLATION");
  }

  const direction = signedError * relativeSpeed;
  if (Math.abs(direction) <= ASPECT_PHASE_EPSILON_DEGREES) return "stationary";
  return direction < 0 ? "applying" : "separating";
}

export function angularSeparation(longitudeA: number, longitudeB: number): number {
  if (!Number.isFinite(longitudeA) || !Number.isFinite(longitudeB)) {
    throw new AspectEngineError("aspect-engine: longitud no finita", "INVALID_POSITION");
  }
  const delta = Math.abs(normalizeLongitude(longitudeA) - normalizeLongitude(longitudeB));
  return Math.min(delta, 360 - delta);
}

function compareAspectCandidate(left: PlanetaryAspect, right: PlanetaryAspect): number {
  const orbDelta = left.orb - right.orb;
  if (Math.abs(orbDelta) > Number.EPSILON) return orbDelta;
  return ASPECT_TYPES.indexOf(left.type) - ASPECT_TYPES.indexOf(right.type);
}

function findBestAspect(
  left: AspectInputPosition,
  right: AspectInputPosition,
  actualAngle: number,
  orbPolicy: AspectOrbPolicy,
): PlanetaryAspect | null {
  const matches = ASPECT_TYPES.flatMap((type) => {
    const exactAngle = ASPECT_EXACT_ANGLES[type];
    const orb = Math.abs(actualAngle - exactAngle);
    const allowedOrb = orbPolicy[type];
    if (orb > allowedOrb) return [];
    return [
      {
        bodyA: left.body,
        bodyB: right.body,
        type,
        exactAngle,
        actualAngle,
        orb,
        allowedOrb,
        phase: calculateAspectPhase(left, right, exactAngle, orb),
      },
    ];
  });

  if (matches.length === 0) return null;
  return matches.sort(compareAspectCandidate)[0] ?? null;
}

function countPotentialPairs(positions: readonly AspectInputPosition[]): number {
  assertUniqueBodies(positions);
  return (positions.length * (positions.length - 1)) / 2;
}

function calculateAspects(
  positions: readonly AspectInputPosition[],
  orbPolicy?: AspectOrbPolicy,
): PlanetaryAspect[] {
  const resolvedOrbPolicy = resolveOrbPolicy(orbPolicy);
  assertUniqueBodies(positions);

  const aspects: PlanetaryAspect[] = [];
  for (let leftIndex = 0; leftIndex < positions.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < positions.length; rightIndex += 1) {
      const left = positions[leftIndex];
      const right = positions[rightIndex];
      if (!left || !right) {
        throw new AspectEngineError("aspect-engine: posicion invalida", "CONTRACT_VIOLATION");
      }
      const actualAngle = angularSeparation(left.absoluteLongitude, right.absoluteLongitude);
      const aspect = findBestAspect(left, right, actualAngle, resolvedOrbPolicy);
      if (aspect) aspects.push(aspect);
    }
  }
  return aspects;
}

function calculateSnapshotAspects(
  snapshot: PlanetarySnapshot,
  orbPolicy?: AspectOrbPolicy,
): PlanetaryAspect[] {
  if (!snapshot || !Array.isArray(snapshot.positions)) {
    throw new AspectEngineError("aspect-engine: snapshot invalido", "CONTRACT_VIOLATION");
  }
  return calculateAspects(snapshot.positions satisfies readonly PlanetaryPosition[], orbPolicy);
}

export const deterministicAspectEngine: AspectEngine = {
  version: "aspect-engine@2b:injectable-orbs",
  calculateAspects,
  calculateSnapshotAspects,
  countPotentialPairs,
};
