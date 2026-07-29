/**
 * GeneralTransitEngine construye un reporte server-only de clima astral general.
 *
 * Consume datos ya calculados por PlanetaryEngine y AspectEngine. No recalcula
 * astronomia, aspectos, orbes, fases, reglas editoriales ni textos.
 */
import type { PlanetaryAspect } from "../aspects/aspect-engine";
import type {
  PlanetaryBody,
  PlanetaryPosition,
  PlanetarySnapshot,
} from "../planetary/planetary-engine";
import { PLANETARY_BODIES } from "../planetary/planetary-engine";

export interface TransitAspectSet {
  calculatedAt: string;
  aspectEngineVersion: string;
  aspects: readonly PlanetaryAspect[];
}

export interface GeneralTransitInput {
  snapshot: PlanetarySnapshot;
  aspectSet: TransitAspectSet;
  planetaryEngineVersion: string;
}

export interface GeneralTransitPosition {
  id: string;
  body: PlanetaryBody;
  absoluteLongitude: number;
  sign: PlanetaryPosition["sign"];
  degreeInSign: number;
  isRetrograde: boolean;
  speedDegreesPerDay: number;
}

export interface GeneralTransitAspect {
  id: string;
  bodyA: PlanetaryBody;
  bodyB: PlanetaryBody;
  type: PlanetaryAspect["type"];
  exactAngle: number;
  actualAngle: number;
  orb: number;
  allowedOrb: number;
  phase: PlanetaryAspect["phase"];
}

export interface GeneralTransitReport {
  id: string;
  kind: "general_transit_report";
  calculatedAt: string;
  planetaryEngineVersion: string;
  aspectEngineVersion: string;
  positions: readonly GeneralTransitPosition[];
  aspects: readonly GeneralTransitAspect[];
  invariants: {
    snapshotAndAspectsSameInstant: true;
    noNatalChartData: true;
    noEditorialInterpretation: true;
    noGeneratedText: true;
  };
}

export interface GeneralTransitEngine {
  readonly version: string;
  buildGeneralTransitReport(input: GeneralTransitInput): GeneralTransitReport;
}

export class GeneralTransitEngineError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_SNAPSHOT"
      | "INVALID_ASPECT_SET"
      | "TIMESTAMP_MISMATCH"
      | "ASPECT_BODY_NOT_IN_SNAPSHOT"
      | "DUPLICATE_BODY"
      | "DUPLICATE_ASPECT"
      | "CONTRACT_VIOLATION",
  ) {
    super(message);
    this.name = "GeneralTransitEngineError";
  }
}

const ASPECT_TYPE_ORDER: readonly PlanetaryAspect["type"][] = [
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
] as const;

function isPlanetaryBody(value: unknown): value is PlanetaryBody {
  return typeof value === "string" && PLANETARY_BODIES.includes(value as PlanetaryBody);
}

function assertCanonicalIsoUtc(
  value: unknown,
  label: string,
  code: GeneralTransitEngineError["code"],
): string {
  if (typeof value !== "string") {
    throw new GeneralTransitEngineError(
      `general-transit-engine: ${label} debe ser string ISO UTC`,
      code,
    );
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed) || new Date(parsed).toISOString() !== value) {
    throw new GeneralTransitEngineError(
      `general-transit-engine: ${label} debe ser ISO UTC canonico`,
      code,
    );
  }

  return value;
}

function assertFiniteNumber(
  value: unknown,
  label: string,
  code: GeneralTransitEngineError["code"],
): asserts value is number {
  if (!Number.isFinite(value)) {
    throw new GeneralTransitEngineError(
      `general-transit-engine: ${label} debe ser numero finito`,
      code,
    );
  }
}

function assertBody(
  value: unknown,
  label: string,
  code: GeneralTransitEngineError["code"],
): PlanetaryBody {
  if (!isPlanetaryBody(value)) {
    throw new GeneralTransitEngineError(
      `general-transit-engine: ${label} no es cuerpo planetario soportado`,
      code,
    );
  }
  return value;
}

function assertSnapshot(snapshot: PlanetarySnapshot): string {
  if (!snapshot || !Array.isArray(snapshot.positions)) {
    throw new GeneralTransitEngineError(
      "general-transit-engine: snapshot invalido",
      "INVALID_SNAPSHOT",
    );
  }

  const calculatedAt = assertCanonicalIsoUtc(
    snapshot.calculatedAt,
    "snapshot.calculatedAt",
    "INVALID_SNAPSHOT",
  );
  const seen = new Set<PlanetaryBody>();

  for (const position of snapshot.positions) {
    if (!position) {
      throw new GeneralTransitEngineError(
        "general-transit-engine: posicion invalida",
        "INVALID_SNAPSHOT",
      );
    }

    const body = assertBody(position.body, "position.body", "INVALID_SNAPSHOT");
    if (seen.has(body)) {
      throw new GeneralTransitEngineError(
        `general-transit-engine: cuerpo duplicado en snapshot: ${body}`,
        "DUPLICATE_BODY",
      );
    }
    seen.add(body);

    const positionCalculatedAt = assertCanonicalIsoUtc(
      position.calculatedAt,
      `position.${body}.calculatedAt`,
      "INVALID_SNAPSHOT",
    );
    if (positionCalculatedAt !== calculatedAt) {
      throw new GeneralTransitEngineError(
        `general-transit-engine: timestamp de posicion no coincide: ${body}`,
        "INVALID_SNAPSHOT",
      );
    }

    assertFiniteNumber(
      position.absoluteLongitude,
      `position.${body}.absoluteLongitude`,
      "INVALID_SNAPSHOT",
    );
    assertFiniteNumber(position.degreeInSign, `position.${body}.degreeInSign`, "INVALID_SNAPSHOT");
    assertFiniteNumber(
      position.speedDegreesPerDay,
      `position.${body}.speedDegreesPerDay`,
      "INVALID_SNAPSHOT",
    );
    if (typeof position.isRetrograde !== "boolean") {
      throw new GeneralTransitEngineError(
        `general-transit-engine: position.${body}.isRetrograde invalido`,
        "INVALID_SNAPSHOT",
      );
    }
  }

  return calculatedAt;
}

function assertAspectSet(aspectSet: TransitAspectSet): string {
  if (!aspectSet || !Array.isArray(aspectSet.aspects)) {
    throw new GeneralTransitEngineError(
      "general-transit-engine: aspectSet invalido",
      "INVALID_ASPECT_SET",
    );
  }

  if (
    typeof aspectSet.aspectEngineVersion !== "string" ||
    aspectSet.aspectEngineVersion.length === 0
  ) {
    throw new GeneralTransitEngineError(
      "general-transit-engine: aspectEngineVersion invalida",
      "INVALID_ASPECT_SET",
    );
  }

  return assertCanonicalIsoUtc(
    aspectSet.calculatedAt,
    "aspectSet.calculatedAt",
    "INVALID_ASPECT_SET",
  );
}

function bodyOrder(body: PlanetaryBody): number {
  return PLANETARY_BODIES.indexOf(body);
}

function aspectTypeOrder(type: PlanetaryAspect["type"]): number {
  return ASPECT_TYPE_ORDER.indexOf(type);
}

function normalizeAspectBodies(
  bodyA: PlanetaryBody,
  bodyB: PlanetaryBody,
): readonly [PlanetaryBody, PlanetaryBody] {
  return bodyA.localeCompare(bodyB) <= 0 ? [bodyA, bodyB] : [bodyB, bodyA];
}

function aspectKey(aspect: PlanetaryAspect): string {
  const [bodyA, bodyB] = normalizeAspectBodies(aspect.bodyA, aspect.bodyB);
  return `${bodyA}:${bodyB}:${aspect.type}`;
}

function assertAspects(
  aspectSet: TransitAspectSet,
  snapshotBodies: ReadonlySet<PlanetaryBody>,
): void {
  const seenAspects = new Set<string>();

  for (const aspect of aspectSet.aspects) {
    if (!aspect) {
      throw new GeneralTransitEngineError(
        "general-transit-engine: aspecto invalido",
        "INVALID_ASPECT_SET",
      );
    }

    const bodyA = assertBody(aspect.bodyA, "aspect.bodyA", "INVALID_ASPECT_SET");
    const bodyB = assertBody(aspect.bodyB, "aspect.bodyB", "INVALID_ASPECT_SET");
    if (!snapshotBodies.has(bodyA) || !snapshotBodies.has(bodyB)) {
      throw new GeneralTransitEngineError(
        `general-transit-engine: aspecto referencia cuerpo fuera del snapshot: ${bodyA}/${bodyB}`,
        "ASPECT_BODY_NOT_IN_SNAPSHOT",
      );
    }

    if (!ASPECT_TYPE_ORDER.includes(aspect.type)) {
      throw new GeneralTransitEngineError(
        `general-transit-engine: tipo de aspecto invalido: ${String(aspect.type)}`,
        "INVALID_ASPECT_SET",
      );
    }

    assertFiniteNumber(aspect.exactAngle, "aspect.exactAngle", "INVALID_ASPECT_SET");
    assertFiniteNumber(aspect.actualAngle, "aspect.actualAngle", "INVALID_ASPECT_SET");
    assertFiniteNumber(aspect.orb, "aspect.orb", "INVALID_ASPECT_SET");
    assertFiniteNumber(aspect.allowedOrb, "aspect.allowedOrb", "INVALID_ASPECT_SET");

    const key = aspectKey(aspect);
    if (seenAspects.has(key)) {
      throw new GeneralTransitEngineError(
        `general-transit-engine: aspecto duplicado: ${key}`,
        "DUPLICATE_ASPECT",
      );
    }
    seenAspects.add(key);
  }
}

function comparePositions(left: PlanetaryPosition, right: PlanetaryPosition): number {
  return bodyOrder(left.body) - bodyOrder(right.body);
}

function compareAspects(left: PlanetaryAspect, right: PlanetaryAspect): number {
  const [leftBodyA, leftBodyB] = normalizeAspectBodies(left.bodyA, left.bodyB);
  const [rightBodyA, rightBodyB] = normalizeAspectBodies(right.bodyA, right.bodyB);
  const bodyADelta = bodyOrder(leftBodyA) - bodyOrder(rightBodyA);
  if (bodyADelta !== 0) return bodyADelta;

  const bodyBDelta = bodyOrder(leftBodyB) - bodyOrder(rightBodyB);
  if (bodyBDelta !== 0) return bodyBDelta;

  return aspectTypeOrder(left.type) - aspectTypeOrder(right.type);
}

function toReportPosition(
  position: PlanetaryPosition,
  calculatedAt: string,
): GeneralTransitPosition {
  return {
    id: `position:${calculatedAt}:${position.body}`,
    body: position.body,
    absoluteLongitude: position.absoluteLongitude,
    sign: position.sign,
    degreeInSign: position.degreeInSign,
    isRetrograde: position.isRetrograde,
    speedDegreesPerDay: position.speedDegreesPerDay,
  };
}

function toReportAspect(aspect: PlanetaryAspect, calculatedAt: string): GeneralTransitAspect {
  const [bodyA, bodyB] = normalizeAspectBodies(aspect.bodyA, aspect.bodyB);
  return {
    id: `aspect:${calculatedAt}:${bodyA}:${bodyB}:${aspect.type}`,
    bodyA,
    bodyB,
    type: aspect.type,
    exactAngle: aspect.exactAngle,
    actualAngle: aspect.actualAngle,
    orb: aspect.orb,
    allowedOrb: aspect.allowedOrb,
    phase: aspect.phase,
  };
}

function buildGeneralTransitReport(input: GeneralTransitInput): GeneralTransitReport {
  if (!input || typeof input !== "object") {
    throw new GeneralTransitEngineError(
      "general-transit-engine: input invalido",
      "CONTRACT_VIOLATION",
    );
  }

  if (
    typeof input.planetaryEngineVersion !== "string" ||
    input.planetaryEngineVersion.length === 0
  ) {
    throw new GeneralTransitEngineError(
      "general-transit-engine: planetaryEngineVersion invalida",
      "CONTRACT_VIOLATION",
    );
  }

  const snapshotCalculatedAt = assertSnapshot(input.snapshot);
  const aspectSetCalculatedAt = assertAspectSet(input.aspectSet);
  if (snapshotCalculatedAt !== aspectSetCalculatedAt) {
    throw new GeneralTransitEngineError(
      "general-transit-engine: snapshot y aspectSet no pertenecen al mismo instante",
      "TIMESTAMP_MISMATCH",
    );
  }

  const snapshotBodies = new Set(input.snapshot.positions.map((position) => position.body));
  assertAspects(input.aspectSet, snapshotBodies);

  return {
    id: `general-transit:${snapshotCalculatedAt}`,
    kind: "general_transit_report",
    calculatedAt: snapshotCalculatedAt,
    planetaryEngineVersion: input.planetaryEngineVersion,
    aspectEngineVersion: input.aspectSet.aspectEngineVersion,
    positions: [...input.snapshot.positions]
      .sort(comparePositions)
      .map((position) => toReportPosition(position, snapshotCalculatedAt)),
    aspects: [...input.aspectSet.aspects]
      .sort(compareAspects)
      .map((aspect) => toReportAspect(aspect, snapshotCalculatedAt)),
    invariants: {
      snapshotAndAspectsSameInstant: true,
      noNatalChartData: true,
      noEditorialInterpretation: true,
      noGeneratedText: true,
    },
  };
}

export const deterministicGeneralTransitEngine: GeneralTransitEngine = {
  version: "general-transit-engine@2c",
  buildGeneralTransitReport,
};
