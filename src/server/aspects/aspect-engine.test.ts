import type { PlanetaryBody } from "../planetary/planetary-engine";
import { astronomyPlanetaryEngine } from "../planetary/astronomy-planetary-engine";
import {
  angularSeparation,
  AspectEngineError,
  DEFAULT_ASPECT_ORB_POLICY,
  type AspectInputPosition,
  type AspectOrbPolicy,
  deterministicAspectEngine,
} from "./aspect-engine";

interface CheckReport {
  name: string;
  passed: boolean;
  detail: string;
}

function check(name: string, condition: boolean, detail: string): CheckReport {
  return { name, passed: condition, detail };
}

function position(
  body: PlanetaryBody,
  absoluteLongitude: number,
  speedDegreesPerDay = 0,
): AspectInputPosition {
  return { body, absoluteLongitude, speedDegreesPerDay };
}

function isClose(actual: number, expected: number, tolerance = 1e-12): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

const TEST_ORB_POLICY: AspectOrbPolicy = {
  conjunction: 2,
  sextile: 4,
  square: 4,
  trine: 4,
  opposition: 4,
};

export function runAspectEngineChecks(): CheckReport[] {
  const reports: CheckReport[] = [];

  reports.push(
    check(
      "politica oficial contiene orbes aprobados",
      DEFAULT_ASPECT_ORB_POLICY.conjunction === 8 &&
        DEFAULT_ASPECT_ORB_POLICY.sextile === 4 &&
        DEFAULT_ASPECT_ORB_POLICY.square === 6 &&
        DEFAULT_ASPECT_ORB_POLICY.trine === 6 &&
        DEFAULT_ASPECT_ORB_POLICY.opposition === 8,
      JSON.stringify(DEFAULT_ASPECT_ORB_POLICY),
    ),
  );
  reports.push(
    check(
      "politica oficial congelada",
      Object.isFrozen(DEFAULT_ASPECT_ORB_POLICY),
      `${Object.isFrozen(DEFAULT_ASPECT_ORB_POLICY)}`,
    ),
  );

  try {
    (DEFAULT_ASPECT_ORB_POLICY as AspectOrbPolicy).conjunction = 99;
    reports.push(check("politica oficial no puede mutarse", false, "mutacion aceptada"));
  } catch (error) {
    reports.push(
      check(
        "politica oficial no puede mutarse",
        DEFAULT_ASPECT_ORB_POLICY.conjunction === 8,
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  reports.push(
    check(
      "separacion 359 y 1 = 2",
      angularSeparation(359, 1) === 2,
      `${angularSeparation(359, 1)}`,
    ),
  );
  reports.push(
    check(
      "separacion 1 y 359 = 2",
      angularSeparation(1, 359) === 2,
      `${angularSeparation(1, 359)}`,
    ),
  );
  reports.push(
    check(
      "separacion maxima 0 y 180 = 180",
      angularSeparation(0, 180) === 180,
      `${angularSeparation(0, 180)}`,
    ),
  );
  reports.push(
    check(
      "simetria separacion angular",
      angularSeparation(12.5, 349.25) === angularSeparation(349.25, 12.5),
      JSON.stringify({ ab: angularSeparation(12.5, 349.25), ba: angularSeparation(349.25, 12.5) }),
    ),
  );

  const exactCases = [
    {
      name: "conjuncion exacta",
      bodyA: "sun" as const,
      bodyB: "moon" as const,
      angle: 0,
      type: "conjunction",
    },
    {
      name: "sextil exacto",
      bodyA: "sun" as const,
      bodyB: "mercury" as const,
      angle: 60,
      type: "sextile",
    },
    {
      name: "cuadratura exacta",
      bodyA: "sun" as const,
      bodyB: "venus" as const,
      angle: 90,
      type: "square",
    },
    {
      name: "trigono exacto",
      bodyA: "sun" as const,
      bodyB: "mars" as const,
      angle: 120,
      type: "trine",
    },
    {
      name: "oposicion exacta",
      bodyA: "sun" as const,
      bodyB: "jupiter" as const,
      angle: 180,
      type: "opposition",
    },
  ];

  for (const exactCase of exactCases) {
    const aspects = deterministicAspectEngine.calculateAspects(
      [position(exactCase.bodyA, 10), position(exactCase.bodyB, 10 + exactCase.angle)],
      TEST_ORB_POLICY,
    );
    const aspect = aspects[0];
    reports.push(
      check(
        exactCase.name,
        aspects.length === 1 &&
          aspect?.type === exactCase.type &&
          aspect.exactAngle === exactCase.angle &&
          isClose(aspect.actualAngle, exactCase.angle) &&
          aspect.orb === 0 &&
          aspect.phase === "exact",
        JSON.stringify(aspects),
      ),
    );
  }

  const defaultPolicyAspect = deterministicAspectEngine.calculateAspects([
    position("sun", 0),
    position("moon", 7.5),
  ]);
  reports.push(
    check(
      "llamada sin politica usa DEFAULT_ASPECT_ORB_POLICY",
      defaultPolicyAspect.length === 1 &&
        defaultPolicyAspect[0]?.type === "conjunction" &&
        defaultPolicyAspect[0].allowedOrb === DEFAULT_ASPECT_ORB_POLICY.conjunction,
      JSON.stringify(defaultPolicyAspect),
    ),
  );

  const customPolicyAspect = deterministicAspectEngine.calculateAspects(
    [position("sun", 0), position("moon", 7.5)],
    { ...DEFAULT_ASPECT_ORB_POLICY, conjunction: 1 },
  );
  reports.push(
    check(
      "politica personalizada reemplaza la predeterminada",
      customPolicyAspect.length === 0,
      JSON.stringify(customPolicyAspect),
    ),
  );

  const withinOrb = deterministicAspectEngine.calculateAspects(
    [position("sun", 0), position("moon", 61.5)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "dentro del orbe por debajo del limite",
      withinOrb.length === 1 && withinOrb[0]?.type === "sextile" && withinOrb[0].orb === 1.5,
      JSON.stringify(withinOrb),
    ),
  );

  const atOrbLimit = deterministicAspectEngine.calculateAspects(
    [position("sun", 0), position("moon", 64)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "exactamente en el limite del orbe",
      atOrbLimit.length === 1 && atOrbLimit[0]?.type === "sextile" && atOrbLimit[0].orb === 4,
      JSON.stringify(atOrbLimit),
    ),
  );

  const outsideOrb = deterministicAspectEngine.calculateAspects(
    [position("sun", 0), position("moon", 64.000001)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "fuera del orbe por diferencia pequena",
      outsideOrb.length === 0,
      JSON.stringify(outsideOrb),
    ),
  );

  const applying = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 62, -1)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "aspecto aproximandose applying",
      applying.length === 1 && applying[0]?.phase === "applying",
      JSON.stringify(applying),
    ),
  );

  const auditCrossingCase = deterministicAspectEngine.calculateAspects(
    [position("moon", 359.85, 14.4), position("sun", 0, 0)],
    { ...TEST_ORB_POLICY, conjunction: 1 },
  );
  reports.push(
    check(
      "BLOCKER-2B luna 359.85 conjuncion applying",
      auditCrossingCase.length === 1 &&
        auditCrossingCase[0]?.type === "conjunction" &&
        auditCrossingCase[0].phase === "applying",
      JSON.stringify(auditCrossingCase),
    ),
  );

  const auditMirrorCase = deterministicAspectEngine.calculateAspects(
    [position("moon", 0.15, 14.4), position("sun", 0, 0)],
    { ...TEST_ORB_POLICY, conjunction: 1 },
  );
  reports.push(
    check(
      "BLOCKER-2B espejo luna 0.15 conjuncion separating",
      auditMirrorCase.length === 1 &&
        auditMirrorCase[0]?.type === "conjunction" &&
        auditMirrorCase[0].phase === "separating",
      JSON.stringify(auditMirrorCase),
    ),
  );

  const separating = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 62, 1)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "aspecto alejandose separating",
      separating.length === 1 && separating[0]?.phase === "separating",
      JSON.stringify(separating),
    ),
  );

  const exactWithinTolerance = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 60.1, 1)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "desviacion menor o igual a 0.1 exact",
      exactWithinTolerance.length === 1 && exactWithinTolerance[0]?.phase === "exact",
      JSON.stringify(exactWithinTolerance),
    ),
  );

  const stationary = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 62, 0)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "movimiento relativo insignificante stationary",
      stationary.length === 1 && stationary[0]?.phase === "stationary",
      JSON.stringify(stationary),
    ),
  );

  const applyingAcrossZero = deterministicAspectEngine.calculateAspects(
    [position("sun", 359, 1), position("moon", 2, -1)],
    { ...TEST_ORB_POLICY, conjunction: 4 },
  );
  reports.push(
    check(
      "aplicacion cruzando 359 a 0",
      applyingAcrossZero.length === 1 &&
        applyingAcrossZero[0]?.type === "conjunction" &&
        applyingAcrossZero[0].phase === "applying",
      JSON.stringify(applyingAcrossZero),
    ),
  );

  const applyingFromNegative = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 359.85, 14.4)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "aplicacion desde negativo (bug 359->0 Luna rapida)",
      applyingFromNegative.length === 1 &&
        applyingFromNegative[0]?.type === "conjunction" &&
        applyingFromNegative[0].phase === "applying",
      JSON.stringify(applyingFromNegative),
    ),
  );

  const separatingAcrossZero = deterministicAspectEngine.calculateAspects(
    [position("sun", 359, -1), position("moon", 2, 1)],
    { ...TEST_ORB_POLICY, conjunction: 4 },
  );

  const inverseCrossing = deterministicAspectEngine.calculateAspects(
    [position("moon", 0.2, -2), position("sun", 359.9, 0)],
    { ...TEST_ORB_POLICY, conjunction: 1 },
  );
  reports.push(
    check(
      "cruce inverso 0 a 359 applying",
      inverseCrossing.length === 1 &&
        inverseCrossing[0]?.type === "conjunction" &&
        inverseCrossing[0].phase === "applying",
      JSON.stringify(inverseCrossing),
    ),
  );
  reports.push(
    check(
      "separacion cruzando 0 a 359",
      separatingAcrossZero.length === 1 &&
        separatingAcrossZero[0]?.type === "conjunction" &&
        separatingAcrossZero[0].phase === "separating",
      JSON.stringify(separatingAcrossZero),
    ),
  );

  const applyingToOpposition = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 178, 1)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "aplicacion hacia oposicion",
      applyingToOpposition.length === 1 &&
        applyingToOpposition[0]?.type === "opposition" &&
        applyingToOpposition[0].phase === "applying",
      JSON.stringify(applyingToOpposition),
    ),
  );

  const separatingFromOpposition = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 178, -1)],
    TEST_ORB_POLICY,
  );

  const applyingToOppositionOtherSide = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 182, -1)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "aplicacion hacia oposicion desde el otro lado",
      applyingToOppositionOtherSide.length === 1 &&
        applyingToOppositionOtherSide[0]?.type === "opposition" &&
        applyingToOppositionOtherSide[0].phase === "applying",
      JSON.stringify(applyingToOppositionOtherSide),
    ),
  );

  const separatingFromOppositionOtherSide = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 182, 1)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "separacion desde oposicion por el otro lado",
      separatingFromOppositionOtherSide.length === 1 &&
        separatingFromOppositionOtherSide[0]?.type === "opposition" &&
        separatingFromOppositionOtherSide[0].phase === "separating",
      JSON.stringify(separatingFromOppositionOtherSide),
    ),
  );

  const symmetricAspectCases = [
    { type: "sextile", angle: 62, speed: -1, expected: "applying" },
    { type: "sextile", angle: 62, speed: 1, expected: "separating" },
    { type: "square", angle: 92, speed: -1, expected: "applying" },
    { type: "square", angle: 92, speed: 1, expected: "separating" },
    { type: "trine", angle: 122, speed: -1, expected: "applying" },
    { type: "trine", angle: 122, speed: 1, expected: "separating" },
  ] as const;
  for (const sample of symmetricAspectCases) {
    const aspects = deterministicAspectEngine.calculateAspects(
      [position("sun", 0, 0), position("moon", sample.angle, sample.speed)],
      TEST_ORB_POLICY,
    );
    reports.push(
      check(
        `${sample.type} ${sample.expected}`,
        aspects.length === 1 &&
          aspects[0]?.type === sample.type &&
          aspects[0].phase === sample.expected,
        JSON.stringify(aspects),
      ),
    );
  }
  reports.push(
    check(
      "separacion desde oposicion",
      separatingFromOpposition.length === 1 &&
        separatingFromOpposition[0]?.type === "opposition" &&
        separatingFromOpposition[0].phase === "separating",
      JSON.stringify(separatingFromOpposition),
    ),
  );

  const retrogradeCase = deterministicAspectEngine.calculateAspects(
    [position("mercury", 63, -1), position("sun", 0, 0)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "caso con planeta retrogrado",
      retrogradeCase.length === 1 && retrogradeCase[0]?.phase === "applying",
      JSON.stringify(retrogradeCase),
    ),
  );

  const bothDirectCase = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 1), position("moon", 62, 2)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "caso ambos planetas directos",
      bothDirectCase.length === 1 && bothDirectCase[0]?.phase === "separating",
      JSON.stringify(bothDirectCase),
    ),
  );

  const phaseFirst = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 62, -1)],
    TEST_ORB_POLICY,
  );
  const phaseSecond = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 62, -1)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "misma entrada produce misma fase",
      phaseFirst[0]?.phase === phaseSecond[0]?.phase,
      JSON.stringify({ phaseFirst, phaseSecond }),
    ),
  );

  const phaseAB = deterministicAspectEngine.calculateAspects(
    [position("sun", 0, 0), position("moon", 62, -1)],
    TEST_ORB_POLICY,
  );
  const phaseBA = deterministicAspectEngine.calculateAspects(
    [position("moon", 62, -1), position("sun", 0, 0)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check(
      "intercambiar A B no cambia fase matematica",
      phaseAB[0]?.phase === phaseBA[0]?.phase &&
        phaseAB[0]?.actualAngle === phaseBA[0]?.actualAngle &&
        phaseAB[0]?.orb === phaseBA[0]?.orb &&
        phaseAB[0]?.type === phaseBA[0]?.type,
      JSON.stringify({ phaseAB, phaseBA }),
    ),
  );

  const overlappingPolicy: AspectOrbPolicy = {
    conjunction: 100,
    sextile: 100,
    square: 1,
    trine: 1,
    opposition: 1,
  };
  const overlapping = deterministicAspectEngine.calculateAspects(
    [position("sun", 0), position("moon", 58)],
    overlappingPolicy,
  );
  reports.push(
    check(
      "no clasifica simultaneamente dos aspectos",
      overlapping.length === 1 && overlapping[0]?.type === "sextile",
      JSON.stringify(overlapping),
    ),
  );

  const emptySnapshot = deterministicAspectEngine.calculateAspects([], TEST_ORB_POLICY);
  reports.push(
    check("snapshot vacio sin aspectos", emptySnapshot.length === 0, JSON.stringify(emptySnapshot)),
  );

  const singleBody = deterministicAspectEngine.calculateAspects(
    [position("sun", 0)],
    TEST_ORB_POLICY,
  );
  reports.push(
    check("snapshot un cuerpo sin aspectos", singleBody.length === 0, JSON.stringify(singleBody)),
  );

  const pairInputs = [
    position("sun", 0),
    position("moon", 10),
    position("mercury", 20),
    position("venus", 30),
  ];
  reports.push(
    check(
      "cantidad de pares n cuerpos n*(n-1)/2",
      deterministicAspectEngine.countPotentialPairs(pairInputs) === 6,
      `${deterministicAspectEngine.countPotentialPairs(pairInputs)}`,
    ),
  );

  const noDuplicatePairs = deterministicAspectEngine.calculateAspects(
    [position("sun", 0), position("moon", 0), position("mercury", 60)],
    TEST_ORB_POLICY,
  );
  const pairKeys = noDuplicatePairs.map((aspect) => `${aspect.bodyA}-${aspect.bodyB}`);
  reports.push(
    check(
      "sin pares duplicados A-B y B-A",
      pairKeys.length === new Set(pairKeys).size &&
        !pairKeys.some((key) => pairKeys.includes(key.split("-").reverse().join("-"))),
      JSON.stringify(noDuplicatePairs),
    ),
  );

  const deterministicInput = [position("sun", 0), position("moon", 60), position("mercury", 90)];
  const first = deterministicAspectEngine.calculateAspects(deterministicInput, TEST_ORB_POLICY);
  const second = deterministicAspectEngine.calculateAspects(deterministicInput, TEST_ORB_POLICY);
  reports.push(
    check(
      "misma entrada produce salida identica",
      JSON.stringify(first) === JSON.stringify(second),
      JSON.stringify(first),
    ),
  );
  reports.push(
    check(
      "orden estable de resultados",
      first.map((aspect) => `${aspect.bodyA}-${aspect.bodyB}-${aspect.type}`).join("|") ===
        "sun-moon-sextile|sun-mercury-square",
      JSON.stringify(first),
    ),
  );

  const realSnapshot = astronomyPlanetaryEngine.calculateSnapshot(
    new Date("2024-06-21T12:00:00.000Z"),
  );
  const beforeLongitudes = realSnapshot.positions.map(
    (p) => [p.body, p.absoluteLongitude] as const,
  );
  const realAspects = deterministicAspectEngine.calculateSnapshotAspects(
    realSnapshot,
    TEST_ORB_POLICY,
  );
  const afterLongitudes = realSnapshot.positions.map((p) => [p.body, p.absoluteLongitude] as const);
  reports.push(
    check(
      "consume PlanetarySnapshot real sin modificarlo",
      realAspects.length > 0 &&
        JSON.stringify(beforeLongitudes) === JSON.stringify(afterLongitudes),
      JSON.stringify({ aspects: realAspects, beforeLongitudes, afterLongitudes }),
    ),
  );

  try {
    deterministicAspectEngine.calculateAspects([position("sun", Number.NaN)], TEST_ORB_POLICY);
    reports.push(check("longitud no finita lanza error", false, "no lanzo error"));
  } catch (error) {
    reports.push(
      check(
        "longitud no finita lanza error",
        error instanceof AspectEngineError && error.code === "INVALID_POSITION",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  try {
    deterministicAspectEngine.calculateAspects(
      [{ body: "earth", absoluteLongitude: 0, speedDegreesPerDay: 1 } as never],
      TEST_ORB_POLICY,
    );
    reports.push(check("cuerpo invalido runtime lanza AspectEngineError", false, "no lanzo error"));
  } catch (error) {
    reports.push(
      check(
        "cuerpo invalido runtime lanza AspectEngineError",
        error instanceof AspectEngineError && error.code === "INVALID_POSITION",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  try {
    deterministicAspectEngine.calculateAspects(
      [position("sun", 0), position("sun", 60)],
      TEST_ORB_POLICY,
    );
    reports.push(check("cuerpo repetido lanza error", false, "no lanzo error"));
  } catch (error) {
    reports.push(
      check(
        "cuerpo repetido lanza error",
        error instanceof AspectEngineError && error.code === "DUPLICATE_BODY",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  try {
    deterministicAspectEngine.calculateAspects([position("sun", 0)], {
      ...TEST_ORB_POLICY,
      sextile: Number.NaN,
    });
    reports.push(check("politica de orbes invalida lanza error", false, "no lanzo error"));
  } catch (error) {
    reports.push(
      check(
        "politica de orbes invalida lanza error",
        error instanceof AspectEngineError && error.code === "INVALID_ORB_POLICY",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  try {
    deterministicAspectEngine.calculateAspects([position("sun", 0)], { conjunction: 8 } as never);
    reports.push(check("politica incompleta lanza error tipado", false, "no lanzo error"));
  } catch (error) {
    reports.push(
      check(
        "politica incompleta lanza error tipado",
        error instanceof AspectEngineError && error.code === "INVALID_ORB_POLICY",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  for (const invalidOrb of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    try {
      deterministicAspectEngine.calculateAspects([position("sun", 0)], {
        ...TEST_ORB_POLICY,
        sextile: invalidOrb,
      });
      reports.push(check(`orbe invalido ${invalidOrb} lanza error`, false, "no lanzo error"));
    } catch (error) {
      reports.push(
        check(
          `orbe invalido ${invalidOrb} lanza error`,
          error instanceof AspectEngineError && error.code === "INVALID_ORB_POLICY",
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
  }

  return reports;
}
