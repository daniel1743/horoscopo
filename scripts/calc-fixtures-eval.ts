import * as Astronomy from "astronomy-engine";

type CelestialBody =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

interface Fixture {
  body: CelestialBody;
  iso: string;
  label: string;
}

const fixtures: Fixture[] = [
  { body: "sun", iso: "2024-03-20T03:06:00.000Z", label: "Sol Equinoccio Marzo 2024" },
  { body: "sun", iso: "2024-06-20T20:51:00.000Z", label: "Sol Solsticio Junio 2024" },
  { body: "sun", iso: "2024-09-22T12:44:00.000Z", label: "Sol Equinoccio Septiembre 2024" },
  { body: "sun", iso: "2024-12-21T09:20:00.000Z", label: "Sol Solsticio Diciembre 2024" },
  { body: "sun", iso: "2025-03-20T09:01:00.000Z", label: "Sol Equinoccio Marzo 2025" },
  { body: "moon", iso: "2024-04-08T18:20:00.000Z", label: "Luna Eclipse Total Abril 2024" },
  { body: "moon", iso: "2024-10-17T11:26:00.000Z", label: "Luna Superluna Octubre 2024" },
  { body: "mercury", iso: "2024-11-25T23:42:00.000Z", label: "Mercurio Estacion Retrograda 2024" },
  { body: "mercury", iso: "2024-12-05T21:00:00.000Z", label: "Mercurio Max Retrogrado 2024" },
  { body: "mercury", iso: "2024-12-15T18:56:00.000Z", label: "Mercurio Estacion Directa 2024" },
  { body: "mercury", iso: "2024-12-15T21:00:00.000Z", label: "Mercurio Post Estacion Directa" },
  { body: "venus", iso: "2025-03-02T05:14:00.000Z", label: "Venus Estacion Retrograda 2025" },
  { body: "venus", iso: "2025-04-12T20:00:00.000Z", label: "Venus Estacion Directa 2025" },
  { body: "mars", iso: "2024-12-06T23:00:00.000Z", label: "Marte Estacion Retrograda 2024" },
  { body: "mars", iso: "2025-02-24T02:00:00.000Z", label: "Marte Estacion Directa 2025" },
  { body: "jupiter", iso: "2024-10-09T07:00:00.000Z", label: "Jupiter Estacion Retrograda 2024" },
  { body: "jupiter", iso: "2025-02-04T10:00:00.000Z", label: "Jupiter Estacion Directa 2025" },
  { body: "saturn", iso: "2024-06-29T19:00:00.000Z", label: "Saturno Estacion Retrograda 2024" },
  { body: "saturn", iso: "2024-11-15T14:00:00.000Z", label: "Saturno Estacion Directa 2024" },
  { body: "uranus", iso: "2024-09-01T15:00:00.000Z", label: "Urano Estacion Retrograda 2024" },
  { body: "uranus", iso: "2025-01-30T16:00:00.000Z", label: "Urano Estacion Directa 2025" },
  { body: "neptune", iso: "2024-07-02T10:00:00.000Z", label: "Neptuno Estacion Retrograda 2024" },
  { body: "neptune", iso: "2024-12-07T23:00:00.000Z", label: "Neptuno Estacion Directa 2024" },
  { body: "pluto", iso: "2024-05-02T18:00:00.000Z", label: "Pluton Estacion Retrograda 2024" },
  { body: "pluto", iso: "2024-10-12T00:00:00.000Z", label: "Pluton Estacion Directa 2024" },
];

const mapBody: Record<CelestialBody, Astronomy.Body> = {
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

console.log("=== CALCULATING FIXTURE LONGITUDES ===");
for (const f of fixtures) {
  const vec = Astronomy.GeoVector(mapBody[f.body], new Date(f.iso), true);
  const elon = Astronomy.Ecliptic(vec).elon;
  console.log(`${f.body.padEnd(8)} | ${f.iso} | ${elon.toFixed(6).padStart(10)}° | ${f.label}`);
}
