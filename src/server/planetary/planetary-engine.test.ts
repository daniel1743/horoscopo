import { PLANETARY_BODIES, PlanetaryEngineError } from "./planetary-engine";
import { astronomyPlanetaryEngine } from "./astronomy-planetary-engine";
import { longitudeToZodiac, normalizeLongitude } from "./zodiac-math";

interface CheckReport {
  name: string;
  passed: boolean;
  detail: string;
}

function check(name: string, condition: boolean, detail: string): CheckReport {
  return { name, passed: condition, detail };
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
        before.degreeInSign >= 0 && before.degreeInSign < 30,
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
