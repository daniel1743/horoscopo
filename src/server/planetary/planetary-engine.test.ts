import type { PlanetaryBody } from "./planetary-engine";
import { PLANETARY_BODIES, PlanetaryEngineError } from "./planetary-engine";
import { astronomyPlanetaryEngine } from "./astronomy-planetary-engine";
import { longitudeToZodiac, normalizeLongitude, signedLongitudeDelta } from "./zodiac-math";

interface CheckReport {
  name: string;
  passed: boolean;
  detail: string;
}

function check(name: string, condition: boolean, detail: string): CheckReport {
  return { name, passed: condition, detail };
}

function isClose(actual: number, expected: number, tolerance = 1e-9): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

export function runPlanetaryEngineChecks(): CheckReport[] {
  const reports: CheckReport[] = [];

  reports.push(check("normaliza 0", normalizeLongitude(0) === 0, `${normalizeLongitude(0)}`));
  reports.push(check("normaliza 360", normalizeLongitude(360) === 0, `${normalizeLongitude(360)}`));
  reports.push(check("normaliza -1", normalizeLongitude(-1) === 359, `${normalizeLongitude(-1)}`));
  reports.push(
    check("normaliza >720", normalizeLongitude(725) === 5, `${normalizeLongitude(725)}`),
  );
  reports.push(
    check(
      "normaliza negativo multivuelta",
      normalizeLongitude(-725) === 355,
      `${normalizeLongitude(-725)}`,
    ),
  );
  reports.push(
    check(
      "delta directo 359 a 1",
      signedLongitudeDelta(359, 1) === 2,
      `${signedLongitudeDelta(359, 1)}`,
    ),
  );
  reports.push(
    check(
      "delta retrogrado 1 a 359",
      signedLongitudeDelta(1, 359) === -2,
      `${signedLongitudeDelta(1, 359)}`,
    ),
  );
  reports.push(
    check(
      "delta sin cruce positivo",
      signedLongitudeDelta(10, 15) === 5,
      `${signedLongitudeDelta(10, 15)}`,
    ),
  );
  reports.push(
    check(
      "delta sin cruce negativo",
      signedLongitudeDelta(15, 10) === -5,
      `${signedLongitudeDelta(15, 10)}`,
    ),
  );

  const expectedSigns = [
    "aries",
    "tauro",
    "geminis",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "escorpio",
    "sagitario",
    "capricornio",
    "acuario",
    "piscis",
  ] as const;

  for (let index = 0; index < expectedSigns.length; index += 1) {
    const boundary = index * 30;
    const exact = longitudeToZodiac(boundary);
    const before = longitudeToZodiac(boundary === 0 ? 359.999999 : boundary - 0.000001);
    reports.push(
      check(
        `signo limite ${boundary}`,
        exact.sign === expectedSigns[index] && exact.degreeInSign === 0,
        JSON.stringify(exact),
      ),
    );
    reports.push(
      check(
        `signo previo ${boundary}`,
        before.sign === expectedSigns[(index + expectedSigns.length - 1) % expectedSigns.length] &&
          before.degreeInSign > 29.999 &&
          before.degreeInSign < 30,
        JSON.stringify(before),
      ),
    );
  }

  const at360 = longitudeToZodiac(360);
  reports.push(
    check(
      "signo 360 vuelve a aries",
      at360.sign === "aries" && at360.degreeInSign === 0,
      JSON.stringify(at360),
    ),
  );

  const date = new Date("2024-06-21T12:00:00.000Z");
  const first = astronomyPlanetaryEngine.calculatePosition("mars", date);
  const second = astronomyPlanetaryEngine.calculatePosition("mars", date);
  reports.push(
    check(
      "determinismo fecha+cuerpo",
      JSON.stringify(first) === JSON.stringify(second),
      JSON.stringify(first),
    ),
  );

  const snapshot = astronomyPlanetaryEngine.calculateSnapshot(date);
  const uniqueBodies = new Set(snapshot.positions.map((p) => p.body));
  const snapshotOk =
    snapshot.calculatedAt === date.toISOString() &&
    snapshot.positions.length === PLANETARY_BODIES.length &&
    uniqueBodies.size === PLANETARY_BODIES.length &&
    snapshot.positions.every(
      (p, index) =>
        p.body === PLANETARY_BODIES[index] &&
        p.calculatedAt === snapshot.calculatedAt &&
        p.absoluteLongitude >= 0 &&
        p.absoluteLongitude < 360 &&
        p.degreeInSign >= 0 &&
        p.degreeInSign < 30 &&
        Number.isFinite(p.speedDegreesPerDay),
    );
  reports.push(check("snapshot completo estable", snapshotOk, JSON.stringify(snapshot)));

  const snapshotMars = snapshot.positions.find((p) => p.body === "mars");
  reports.push(
    check(
      "posicion puntual coincide con snapshot",
      Boolean(snapshotMars) && JSON.stringify(first) === JSON.stringify(snapshotMars),
      JSON.stringify({ position: first, snapshotMars }),
    ),
  );

  const absoluteReferenceSnapshot = astronomyPlanetaryEngine.calculateSnapshot(date);
  const absoluteReferences: Record<string, number> = {
    sun: 90.60209009934113,
    moon: 263.7444333426423,
    mercury: 98.8232275608488,
    venus: 95.20364813031392,
    mars: 39.07137378311819,
    jupiter: 66.12156312886327,
    saturn: 349.3686761674396,
    uranus: 55.267092115685955,
    neptune: 359.90266361387705,
    pluto: 301.5756110904715,
  };
  const absoluteLongitudesUnchanged = absoluteReferenceSnapshot.positions.every((position) =>
    isClose(position.absoluteLongitude, absoluteReferences[position.body]),
  );
  reports.push(
    check(
      "absoluteLongitude referencia 2024-06-21 sin cambios",
      absoluteLongitudesUnchanged,
      JSON.stringify(
        absoluteReferenceSnapshot.positions.map((position) => ({
          body: position.body,
          absoluteLongitude: position.absoluteLongitude,
        })),
      ),
    ),
  );

  const mercuryStation = astronomyPlanetaryEngine.calculatePosition(
    "mercury",
    new Date("2024-12-15T21:00:00.000Z"),
  );
  reports.push(
    check(
      "mercurio estacion critica queda directo",
      mercuryStation.speedDegreesPerDay > 0 && mercuryStation.isRetrograde === false,
      JSON.stringify(mercuryStation),
    ),
  );

  const mercuryRetrograde = astronomyPlanetaryEngine.calculatePosition(
    "mercury",
    new Date("2024-12-06T12:00:00.000Z"),
  );
  reports.push(
    check(
      "mercurio retrogrado estable velocidad negativa",
      mercuryRetrograde.speedDegreesPerDay < 0 && mercuryRetrograde.isRetrograde === true,
      JSON.stringify(mercuryRetrograde),
    ),
  );

  const mercuryDirect = astronomyPlanetaryEngine.calculatePosition(
    "mercury",
    new Date("2024-12-25T12:00:00.000Z"),
  );
  reports.push(
    check(
      "mercurio directo estable velocidad positiva",
      mercuryDirect.speedDegreesPerDay > 0 && mercuryDirect.isRetrograde === false,
      JSON.stringify(mercuryDirect),
    ),
  );

  const directLuminaryDates = Array.from({ length: 30 }, (_, index) => {
    const month = index % 12;
    const day = 1 + (index % 27);
    return new Date(Date.UTC(2024 + Math.floor(index / 12), month, day, 12, 0, 0));
  });
  const luminaryChecks = directLuminaryDates.flatMap((sampleDate) => [
    astronomyPlanetaryEngine.calculatePosition("sun", sampleDate),
    astronomyPlanetaryEngine.calculatePosition("moon", sampleDate),
  ]);
  reports.push(
    check(
      "sol y luna directos en 30 fechas distribuidas",
      luminaryChecks.every(
        (position) => position.speedDegreesPerDay > 0 && position.isRetrograde === false,
      ),
      JSON.stringify(
        luminaryChecks.map((position) => ({
          body: position.body,
          calculatedAt: position.calculatedAt,
          speedDegreesPerDay: position.speedDegreesPerDay,
          isRetrograde: position.isRetrograde,
        })),
      ),
    ),
  );

  const internalRetrogradeSamples = [
    { body: "mars" as const, date: new Date("2025-01-15T12:00:00.000Z") },
    { body: "jupiter" as const, date: new Date("2024-12-07T12:00:00.000Z") },
    { body: "saturn" as const, date: new Date("2024-09-08T12:00:00.000Z") },
  ].map((sample) => astronomyPlanetaryEngine.calculatePosition(sample.body, sample.date));
  reports.push(
    check(
      "casos internos no JPL detectan retrogradacion marte/jupiter/saturno",
      internalRetrogradeSamples.every(
        (position) => position.speedDegreesPerDay < 0 && position.isRetrograde === true,
      ),
      JSON.stringify(internalRetrogradeSamples),
    ),
  );

  const outerBodies: PlanetaryBody[] = ["uranus", "neptune", "pluto"];
  const outerBodiesFirst = outerBodies.map((body) =>
    astronomyPlanetaryEngine.calculatePosition(body, date),
  );
  const outerBodiesSecond = outerBodies.map((body) =>
    astronomyPlanetaryEngine.calculatePosition(body, date),
  );
  reports.push(
    check(
      "urano neptuno pluton velocidades finitas y deterministas",
      outerBodiesFirst.every(
        (position, index) =>
          Number.isFinite(position.speedDegreesPerDay) &&
          JSON.stringify(position) === JSON.stringify(outerBodiesSecond[index]),
      ),
      JSON.stringify(outerBodiesFirst),
    ),
  );

  try {
    astronomyPlanetaryEngine.calculatePosition("sun", new Date("invalid"));
    reports.push(check("fecha invalida lanza error", false, "no lanzo error"));
  } catch (error) {
    reports.push(
      check(
        "fecha invalida lanza error",
        error instanceof PlanetaryEngineError && error.code === "INVALID_DATE",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  try {
    astronomyPlanetaryEngine.calculatePosition("earth" as never, date);
    reports.push(check("cuerpo no soportado lanza error", false, "no lanzo error"));
  } catch (error) {
    reports.push(
      check(
        "cuerpo no soportado lanza error",
        error instanceof PlanetaryEngineError && error.code === "UNSUPPORTED_BODY",
        error instanceof Error ? error.message : String(error),
      ),
    );
  }

  return reports;
}
