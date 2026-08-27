import * as Astronomy from "astronomy-engine";
import type {
  AscendantResult,
  AstrologyCalculationMeta,
  BirthData,
  CelestialPlacement,
  HouseCusp,
  LunarSignResult,
  NatalChart,
  NatalAngle,
  NatalAspect,
  NatalAspectKey,
  ZodiacSign,
} from "@/types/astrology";
import { ZODIAC_SIGNS } from "@/types/astrology";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const DEFAULT_BIRTH_TIME = "12:00";
const TROPICAL_OBLIQUITY_DEGREES = 23.4392911;

const BODIES = [
  { body: Astronomy.Body.Sun, label: "Sol" },
  { body: Astronomy.Body.Moon, label: "Luna" },
  { body: Astronomy.Body.Mercury, label: "Mercurio" },
  { body: Astronomy.Body.Venus, label: "Venus" },
  { body: Astronomy.Body.Mars, label: "Marte" },
  { body: Astronomy.Body.Jupiter, label: "Júpiter" },
  { body: Astronomy.Body.Saturn, label: "Saturno" },
  { body: Astronomy.Body.Uranus, label: "Urano" },
  { body: Astronomy.Body.Neptune, label: "Neptuno" },
  { body: Astronomy.Body.Pluto, label: "Plutón" },
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

export const ASTROLOGY_LIMITATIONS = [
  "El cálculo se realiza en el navegador y no guarda los datos de nacimiento por defecto.",
  "Las posiciones se expresan como longitudes eclípticas geocéntricas en una aproximación tropical.",
  "Las casas usan el sistema de casas iguales a partir del ascendente; no se presenta como Placidus ni como una carta profesional.",
  "La calidad del ascendente y de las casas depende de una hora de nacimiento y coordenadas correctas.",
  "La astrología se ofrece como lenguaje simbólico de reflexión, no como evidencia científica ni predicción determinista.",
] as const;

function normalize360(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function normalize180(degrees: number): number {
  const normalized = normalize360(degrees);
  return normalized > 180 ? normalized - 360 : normalized;
}

function radians(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

function degrees(value: number): number {
  return value * RAD_TO_DEG;
}

function parseTimezoneParts(date: Date, timezone: string): Record<string, number> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]),
  );
}

function validateTimezone(timezone: string): void {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
  } catch {
    throw new Error("Selecciona una zona horaria IANA válida, por ejemplo Europe/Madrid.");
  }
}

function wallClockToUtc(birthDate: string, birthTime: string, timezone: string): Date {
  validateTimezone(timezone);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !/^\d{2}:\d{2}$/.test(birthTime)) {
    throw new Error("Introduce una fecha y una hora de nacimiento válidas.");
  }
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error("Introduce una fecha y una hora de nacimiento válidas.");
  }

  const wallClock = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = wallClock;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const local = parseTimezoneParts(new Date(guess), timezone);
    const representedAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    const offset = representedAsUtc - guess;
    guess = wallClock - offset;
  }

  const result = new Date(guess);
  const resolved = parseTimezoneParts(result, timezone);
  if (
    resolved.year !== year ||
    resolved.month !== month ||
    resolved.day !== day ||
    resolved.hour !== hour ||
    resolved.minute !== minute
  ) {
    throw new Error(
      "Esta hora no es representable de forma segura en la zona horaria elegida; revisa el horario de verano.",
    );
  }
  return result;
}

function validateCoordinates(latitude: number, longitude: number): void {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("La latitud debe estar entre -90 y 90 grados.");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("La longitud debe estar entre -180 y 180 grados.");
  }
}

function resolveBirthDate(data: BirthData): Date {
  validateCoordinates(data.latitude, data.longitude);
  return wallClockToUtc(data.birthDate, data.birthTime || DEFAULT_BIRTH_TIME, data.timezone);
}

function signForLongitude(longitude: number): ZodiacSign {
  const normalized = normalize360(longitude);
  const index = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[index] ?? ZODIAC_SIGNS[0];
}

function placementFromLongitude(
  body: string,
  label: string,
  longitude: number,
  latitude: number,
): CelestialPlacement {
  const normalizedLongitude = normalize360(longitude);
  const sign = signForLongitude(normalizedLongitude);
  return {
    body,
    label,
    longitude: normalizedLongitude,
    latitude,
    sign,
    degreeInSign: normalizedLongitude - sign.startDegree,
  };
}

function metaFor(data: BirthData, date: Date): AstrologyCalculationMeta {
  return {
    dateTimeIso: date.toISOString(),
    timezone: data.timezone,
    locationLabel: data.locationLabel,
    latitude: data.latitude,
    longitude: data.longitude,
    coordinateSystem: "geocentric-ecliptic",
    zodiac: "tropical-approximation",
    houseSystem: "equal-houses",
    limitations: [...ASTROLOGY_LIMITATIONS],
  };
}

function eclipticPosition(
  body: Astronomy.Body,
  date: Date,
): { longitude: number; latitude: number } {
  if (body === Astronomy.Body.Moon) {
    const coordinates = Astronomy.EclipticGeoMoon(date);
    return {
      longitude: coordinates.lon,
      latitude: coordinates.lat,
    };
  }

  const coordinates = Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true));
  return {
    longitude: coordinates.elon,
    latitude: coordinates.elat,
  };
}

function calculatePlacements(date: Date): CelestialPlacement[] {
  return BODIES.map(({ body, label }) => {
    const position = eclipticPosition(body, date);
    return placementFromLongitude(body, label, position.longitude, position.latitude);
  });
}

function houseForLongitude(longitude: number, ascendantLongitude: number): number {
  return Math.floor(normalize360(longitude - ascendantLongitude) / 30) + 1;
}

function calculateAngles(ascendantLongitude: number): NatalAngle[] {
  const definitions: ReadonlyArray<{
    key: NatalAngle["key"];
    label: string;
    longitude: number;
  }> = [
    { key: "ascendant", label: "Ascendente", longitude: ascendantLongitude },
    { key: "mc", label: "Medio Cielo (MC)", longitude: normalize360(ascendantLongitude + 90) },
    {
      key: "descendant",
      label: "Descendente (DSC)",
      longitude: normalize360(ascendantLongitude + 180),
    },
    { key: "ic", label: "Fondo del Cielo (IC)", longitude: normalize360(ascendantLongitude + 270) },
  ];
  return definitions.map(({ key, label, longitude }) => {
    const sign = signForLongitude(longitude);
    return {
      key,
      label,
      longitude,
      sign,
      degreeInSign: longitude - sign.startDegree,
    };
  });
}

function calculateAspects(placements: readonly CelestialPlacement[]): NatalAspect[] {
  const aspects: NatalAspect[] = [];
  for (let firstIndex = 0; firstIndex < placements.length; firstIndex += 1) {
    const first = placements[firstIndex];
    if (!first) continue;
    for (let secondIndex = firstIndex + 1; secondIndex < placements.length; secondIndex += 1) {
      const second = placements[secondIndex];
      if (!second) continue;
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
        firstLabel: first.label,
        secondBody: second.body,
        secondLabel: second.label,
        separation,
        exactAngle: best.angle,
        orb: best.orb,
      });
    }
  }
  return aspects;
}

function eclipticLongitudeToEquatorial(longitude: number): {
  rightAscension: number;
  declination: number;
} {
  const lambda = radians(longitude);
  const epsilon = radians(TROPICAL_OBLIQUITY_DEGREES);
  const rightAscension = degrees(
    Math.atan2(Math.sin(lambda) * Math.cos(epsilon), Math.cos(lambda)),
  );
  const declination = degrees(Math.asin(Math.sin(epsilon) * Math.sin(lambda)));
  return { rightAscension: normalize360(rightAscension), declination };
}

function horizonAltitude(longitude: number, latitude: number, siderealDegrees: number): number {
  const equatorial = eclipticLongitudeToEquatorial(longitude);
  const hourAngle = radians(normalize180(siderealDegrees - equatorial.rightAscension));
  const observerLatitude = radians(latitude);
  const declination = radians(equatorial.declination);
  return degrees(
    Math.asin(
      Math.sin(observerLatitude) * Math.sin(declination) +
        Math.cos(observerLatitude) * Math.cos(declination) * Math.cos(hourAngle),
    ),
  );
}

function bisectHorizonCrossing(
  lower: number,
  upper: number,
  date: Date,
  latitude: number,
  siderealDegrees: number,
): number {
  let low = lower;
  let high = upper;
  let lowValue = horizonAltitude(low, latitude, siderealDegrees);
  for (let iteration = 0; iteration < 45; iteration += 1) {
    const middle = (low + high) / 2;
    const middleValue = horizonAltitude(middle, latitude, siderealDegrees);
    if (Math.abs(middleValue) < 1e-9) return normalize360(middle);
    if (lowValue * middleValue <= 0) {
      high = middle;
    } else {
      low = middle;
      lowValue = middleValue;
    }
  }
  return normalize360((low + high) / 2);
}

function calculateAscendantLongitude(date: Date, latitude: number, longitude: number): number {
  if (Math.abs(latitude) >= 66) {
    throw new Error(
      "El cálculo de casas iguales no está disponible de forma segura para latitudes polares en esta versión.",
    );
  }
  const siderealDegrees = normalize360(Astronomy.SiderealTime(date) * 15 + longitude);
  const step = 0.5;
  const roots: number[] = [];
  let previousLongitude = 0;
  let previousAltitude = horizonAltitude(0, latitude, siderealDegrees);
  for (let index = 1; index <= 720; index += 1) {
    const currentLongitude = index * step;
    const currentAltitude = horizonAltitude(currentLongitude, latitude, siderealDegrees);
    if (previousAltitude === 0 || previousAltitude * currentAltitude < 0) {
      roots.push(
        bisectHorizonCrossing(previousLongitude, currentLongitude, date, latitude, siderealDegrees),
      );
    }
    previousLongitude = currentLongitude;
    previousAltitude = currentAltitude;
  }
  const eastHorizonRoot = roots.find((root) => {
    const equatorial = eclipticLongitudeToEquatorial(root);
    const hourAngle = normalize180(siderealDegrees - equatorial.rightAscension);
    return hourAngle < 0;
  });
  if (eastHorizonRoot === undefined) {
    throw new Error("No fue posible encontrar el horizonte oriental para estas coordenadas.");
  }
  return eastHorizonRoot;
}

function buildResult(data: BirthData): {
  date: Date;
  meta: AstrologyCalculationMeta;
  placements: CelestialPlacement[];
  ascendant: CelestialPlacement;
  houses: HouseCusp[];
  angles: NatalAngle[];
  aspects: NatalAspect[];
} {
  const date = resolveBirthDate(data);
  const meta = metaFor(data, date);
  const rawPlacements = calculatePlacements(date);
  const ascendantLongitude = calculateAscendantLongitude(date, data.latitude, data.longitude);
  const ascendant = placementFromLongitude("Ascendant", "Ascendente", ascendantLongitude, 0);
  const houses = Array.from({ length: 12 }, (_, index) => {
    const cuspLongitude = normalize360(ascendantLongitude + index * 30);
    const sign = signForLongitude(cuspLongitude);
    return {
      house: index + 1,
      longitude: cuspLongitude,
      sign,
      degreeInSign: cuspLongitude - sign.startDegree,
    };
  });
  const placements = rawPlacements.map((placement) => ({
    ...placement,
    house: houseForLongitude(placement.longitude, ascendantLongitude),
  }));
  const angles = calculateAngles(ascendantLongitude);
  const aspects = calculateAspects(placements);
  meta.limitations.push(
    "Los aspectos mostrados son los cinco aspectos mayores entre los diez cuerpos calculados y usan orbes fijos; no sustituyen una carta profesional.",
  );
  return { date, meta, placements, ascendant, houses, angles, aspects };
}

export function calculateNatalChart(data: BirthData): NatalChart {
  if (!data.birthTime) {
    throw new Error(
      "La carta natal necesita una hora de nacimiento para calcular ascendente y casas.",
    );
  }
  const result = buildResult(data);
  return {
    meta: result.meta,
    placements: result.placements,
    ascendant: result.ascendant,
    houses: result.houses,
    angles: result.angles,
    aspects: result.aspects,
  };
}

export function calculateAscendant(data: BirthData): AscendantResult {
  if (!data.birthTime) {
    throw new Error("El ascendente necesita una hora de nacimiento.");
  }
  const result = buildResult(data);
  return { meta: result.meta, ascendant: result.ascendant };
}

export function calculateLunarSign(data: BirthData): LunarSignResult {
  const date = resolveBirthDate(data);
  const meta = metaFor(data, date);
  const approximateTime = !data.birthTime;
  if (approximateTime) {
    meta.limitations.push(
      "No se indicó hora de nacimiento: la Luna se calculó para las 12:00 de la fecha local; su signo puede cambiar durante el día.",
    );
  }
  const position = eclipticPosition(Astronomy.Body.Moon, date);
  const moon = placementFromLongitude(
    Astronomy.Body.Moon,
    "Luna",
    position.longitude,
    position.latitude,
  );
  return { meta, moon, approximateTime };
}

export function formatDegree(degree: number): string {
  return `${Math.floor(degree)}° ${Math.round((degree - Math.floor(degree)) * 60)}′`;
}
