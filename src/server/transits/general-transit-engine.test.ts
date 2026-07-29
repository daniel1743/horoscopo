import { deterministicAspectEngine, type PlanetaryAspect } from "../aspects/aspect-engine";
import { astronomyPlanetaryEngine } from "../planetary/astronomy-planetary-engine";
import type {
  PlanetaryBody,
  PlanetaryPosition,
  PlanetarySnapshot,
} from "../planetary/planetary-engine";
import type { ZodiacSignKey } from "@/types/compatibility";
import {
  deterministicGeneralTransitEngine,
  GeneralTransitEngineError,
  type GeneralTransitInput,
  type TransitAspectSet,
} from "./general-transit-engine";

interface CheckReport {
  name: string;
  passed: boolean;
  detail: string;
}

function check(name: string, passed: boolean, detail: string): CheckReport {
  return { name, passed, detail };
}

function position(
  body: PlanetaryBody,
  absoluteLongitude: number,
  sign: ZodiacSignKey,
  speedDegreesPerDay: number,
  calculatedAt = "2026-08-05T12:00:00.000Z",
): PlanetaryPosition {
  return {
    body,
    absoluteLongitude,
    sign,
    degreeInSign: absoluteLongitude % 30,
    isRetrograde: speedDegreesPerDay < 0,
    speedDegreesPerDay,
    calculatedAt,
  };
}

function snapshot(positions: readonly PlanetaryPosition[]): PlanetarySnapshot {
  return {
    calculatedAt: "2026-08-05T12:00:00.000Z",
    positions: [...positions],
  };
}

function aspect(
  bodyA: PlanetaryBody,
  bodyB: PlanetaryBody,
  type: PlanetaryAspect["type"],
  phase: PlanetaryAspect["phase"],
  orb: number,
): PlanetaryAspect {
  const exactAngles: Record<PlanetaryAspect["type"], number> = {
    conjunction: 0,
    sextile: 60,
    square: 90,
    trine: 120,
    opposition: 180,
  };

  return {
    bodyA,
    bodyB,
    type,
    exactAngle: exactAngles[type],
    actualAngle: exactAngles[type] + orb,
    orb,
    allowedOrb: 8,
    phase,
  };
}

const BASE_POSITIONS = [
  position("venus", 160, "virgo", 1.2),
  position("sun", 133, "leo", 0.95),
  position("moon", 193, "libra", 13.2),
  position("mercury", 124, "leo", -0.25),
] as const;

const BASE_ASPECTS = [
  aspect("moon", "sun", "sextile", "applying", 1.25),
  aspect("venus", "mercury", "square", "separating", 2.5),
] as const;

function aspectSet(aspects: readonly PlanetaryAspect[] = BASE_ASPECTS): TransitAspectSet {
  return {
    calculatedAt: "2026-08-05T12:00:00.000Z",
    aspectEngineVersion: "aspect-engine@test",
    aspects: [...aspects],
  };
}

function input(
  positions: readonly PlanetaryPosition[] = BASE_POSITIONS,
  aspects: readonly PlanetaryAspect[] = BASE_ASPECTS,
): GeneralTransitInput {
  return {
    snapshot: snapshot(positions),
    aspectSet: aspectSet(aspects),
    planetaryEngineVersion: "planetary-engine@test",
  };
}

function expectEngineError(
  name: string,
  action: () => unknown,
  code: GeneralTransitEngineError["code"],
): CheckReport {
  try {
    action();
    return check(name, false, "no lanzo error");
  } catch (error) {
    return check(
      name,
      error instanceof GeneralTransitEngineError && error.code === code,
      error instanceof Error ? error.message : String(error),
    );
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function runGeneralTransitEngineChecks(): CheckReport[] {
  const reports: CheckReport[] = [];
  const validInput = input();
  const validReport = deterministicGeneralTransitEngine.buildGeneralTransitReport(validInput);

  reports.push(
    check(
      "input valido genera reporte valido",
      validReport.id === "general-transit:2026-08-05T12:00:00.000Z" &&
        validReport.kind === "general_transit_report" &&
        validReport.calculatedAt === validInput.snapshot.calculatedAt &&
        validReport.positions.length === validInput.snapshot.positions.length &&
        validReport.aspects.length === validInput.aspectSet.aspects.length &&
        validReport.invariants.snapshotAndAspectsSameInstant &&
        validReport.invariants.noNatalChartData &&
        validReport.invariants.noEditorialInterpretation &&
        validReport.invariants.noGeneratedText,
      JSON.stringify(validReport),
    ),
  );

  reports.push(
    expectEngineError(
      "timestamp distinto snapshot/aspectSet lanza TIMESTAMP_MISMATCH",
      () =>
        deterministicGeneralTransitEngine.buildGeneralTransitReport({
          ...validInput,
          aspectSet: { ...validInput.aspectSet, calculatedAt: "2026-08-05T13:00:00.000Z" },
        }),
      "TIMESTAMP_MISMATCH",
    ),
  );

  reports.push(
    expectEngineError(
      "timestamp de posicion distinto al snapshot lanza INVALID_SNAPSHOT",
      () =>
        deterministicGeneralTransitEngine.buildGeneralTransitReport(
          input([
            position("sun", 133, "leo", 0.95, "2026-08-05T12:00:00.000Z"),
            position("moon", 193, "libra", 13.2, "2026-08-05T13:00:00.000Z"),
          ]),
        ),
      "INVALID_SNAPSHOT",
    ),
  );

  reports.push(
    expectEngineError(
      "cuerpo duplicado lanza DUPLICATE_BODY",
      () =>
        deterministicGeneralTransitEngine.buildGeneralTransitReport(
          input([position("sun", 133, "leo", 0.95), position("sun", 134, "leo", 0.95)]),
        ),
      "DUPLICATE_BODY",
    ),
  );

  reports.push(
    expectEngineError(
      "aspecto referencia cuerpo inexistente lanza ASPECT_BODY_NOT_IN_SNAPSHOT",
      () =>
        deterministicGeneralTransitEngine.buildGeneralTransitReport(
          input(BASE_POSITIONS, [aspect("sun", "mars", "square", "applying", 1)]),
        ),
      "ASPECT_BODY_NOT_IN_SNAPSHOT",
    ),
  );

  reports.push(
    expectEngineError(
      "aspecto duplicado por par normalizado y tipo lanza DUPLICATE_ASPECT",
      () =>
        deterministicGeneralTransitEngine.buildGeneralTransitReport(
          input(BASE_POSITIONS, [
            aspect("sun", "moon", "sextile", "applying", 1),
            aspect("moon", "sun", "sextile", "separating", 2),
          ]),
        ),
      "DUPLICATE_ASPECT",
    ),
  );

  reports.push(
    check(
      "misma entrada produce exactamente misma salida",
      JSON.stringify(validReport) ===
        JSON.stringify(deterministicGeneralTransitEngine.buildGeneralTransitReport(validInput)),
      JSON.stringify(validReport),
    ),
  );

  reports.push(
    check(
      "reordenar posiciones mantiene salida e IDs",
      JSON.stringify(validReport) ===
        JSON.stringify(
          deterministicGeneralTransitEngine.buildGeneralTransitReport(
            input([...BASE_POSITIONS].reverse(), BASE_ASPECTS),
          ),
        ),
      JSON.stringify(validReport.positions.map((item) => item.id)),
    ),
  );

  reports.push(
    check(
      "reordenar aspectos mantiene salida e IDs",
      JSON.stringify(validReport) ===
        JSON.stringify(
          deterministicGeneralTransitEngine.buildGeneralTransitReport(
            input(BASE_POSITIONS, [...BASE_ASPECTS].reverse()),
          ),
        ),
      JSON.stringify(validReport.aspects.map((item) => item.id)),
    ),
  );

  const originalAspect = BASE_ASPECTS[0];
  const outputAspect = validReport.aspects.find((item) => item.type === originalAspect.type);
  reports.push(
    check(
      "conserva type orb allowedOrb actualAngle y phase sin recalcular",
      outputAspect?.type === originalAspect.type &&
        outputAspect.orb === originalAspect.orb &&
        outputAspect.allowedOrb === originalAspect.allowedOrb &&
        outputAspect.actualAngle === originalAspect.actualAngle &&
        outputAspect.phase === originalAspect.phase,
      JSON.stringify({ originalAspect, outputAspect }),
    ),
  );

  const inputBefore = cloneJson(validInput);
  deterministicGeneralTransitEngine.buildGeneralTransitReport(validInput);
  reports.push(
    check(
      "no muta snapshot ni aspectos",
      JSON.stringify(validInput) === JSON.stringify(inputBefore),
      JSON.stringify({ before: inputBefore, after: validInput }),
    ),
  );

  const roundTripReport = JSON.parse(JSON.stringify(validReport)) as typeof validReport;
  reports.push(
    check(
      "reporte serializa y deserializa JSON sin perder datos",
      JSON.stringify(roundTripReport) === JSON.stringify(validReport),
      JSON.stringify(roundTripReport),
    ),
  );

  const realSnapshot = astronomyPlanetaryEngine.calculateSnapshot(
    new Date("2026-08-05T12:00:00.000Z"),
    ["sun", "moon", "mercury", "venus"],
  );
  const realAspects = deterministicAspectEngine.calculateSnapshotAspects(realSnapshot);
  const realReport = deterministicGeneralTransitEngine.buildGeneralTransitReport({
    snapshot: realSnapshot,
    aspectSet: {
      calculatedAt: realSnapshot.calculatedAt,
      aspectEngineVersion: deterministicAspectEngine.version,
      aspects: realAspects,
    },
    planetaryEngineVersion: astronomyPlanetaryEngine.version,
  });
  reports.push(
    check(
      "integracion con snapshot real y aspectos calculados previamente",
      realReport.calculatedAt === realSnapshot.calculatedAt &&
        realReport.positions.length === realSnapshot.positions.length &&
        realReport.aspects.length === realAspects.length,
      JSON.stringify(realReport),
    ),
  );

  return reports;
}
