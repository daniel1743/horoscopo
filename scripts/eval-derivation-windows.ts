import * as Astronomy from "astronomy-engine";

function getPos(body: Astronomy.Body, date: Date): number {
  const vec = Astronomy.GeoVector(body, date, true);
  return Astronomy.Ecliptic(vec).elon;
}

function signedDelta(from: number, to: number): number {
  let d = ((to % 360) + 360) % 360 - ((from % 360) + 360) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function getSpeed(body: Astronomy.Body, date: Date, windowMs: number): number {
  const t1 = new Date(date.getTime() - windowMs);
  const t2 = new Date(date.getTime() + windowMs);
  const l1 = getPos(body, t1);
  const l2 = getPos(body, t2);
  const days = (2 * windowMs) / 86400000;
  return signedDelta(l1, l2) / days;
}

console.log("=== EVALUATING BODY DERIVATION WINDOWS ===");
const bodiesConfig = [
  { name: "sun", body: Astronomy.Body.Sun, speed: 1.0, recommendedMs: 6 * 3600 * 1000 },
  { name: "moon", body: Astronomy.Body.Moon, speed: 13.2, recommendedMs: 1 * 3600 * 1000 },
  { name: "mercury", body: Astronomy.Body.Mercury, speed: 1.5, recommendedMs: 1 * 3600 * 1000 },
  { name: "venus", body: Astronomy.Body.Venus, speed: 1.2, recommendedMs: 2 * 3600 * 1000 },
  { name: "mars", body: Astronomy.Body.Mars, speed: 0.5, recommendedMs: 3 * 3600 * 1000 },
  { name: "jupiter", body: Astronomy.Body.Jupiter, speed: 0.2, recommendedMs: 6 * 3600 * 1000 },
  { name: "saturn", body: Astronomy.Body.Saturn, speed: 0.1, recommendedMs: 6 * 3600 * 1000 },
  { name: "uranus", body: Astronomy.Body.Uranus, speed: 0.05, recommendedMs: 12 * 3600 * 1000 },
  { name: "neptune", body: Astronomy.Body.Neptune, speed: 0.03, recommendedMs: 12 * 3600 * 1000 },
  { name: "pluto", body: Astronomy.Body.Pluto, speed: 0.02, recommendedMs: 12 * 3600 * 1000 },
];

const testDate = new Date("2024-12-15T21:00:00.000Z");
for (const b of bodiesConfig) {
  const spdRecommended = getSpeed(b.body, testDate, b.recommendedMs);
  const spd12h = getSpeed(b.body, testDate, 12 * 3600 * 1000);
  console.log(
    `${b.name.padEnd(8)} | recWindow: ${(b.recommendedMs / 3600000).toFixed(1).padStart(4)}h | recSpeed: ${spdRecommended.toFixed(6).padStart(9)} | 12hSpeed: ${spd12h.toFixed(6).padStart(9)}`
  );
}
