/**
 * AUDITORÍA FASE 2A v3 — CORREGIDA
 *
 * Principios:
 * - SOLO fixtures con valor esperado EXACTO (no "aprox." ni rangos).
 * - Mismo sistema de coordenadas: eclíptica verdadera de la fecha
 *   (Astronomy.Ecliptic produce true ecliptic of date).
 * - Lo que no puede verificarse con dato externo exacto → NO_DEMOSTRADA.
 * - El veredicto se genera automáticamente desde auditLog, no manualmente.
 *
 * NO modifica código de producción. NO implementa soluciones.
 */
import { astronomyPlanetaryEngine } from "../src/server/planetary/astronomy-planetary-engine";
import { signedLongitudeDelta, normalizeLongitude } from "../src/server/planetary/zodiac-math";
import type { PlanetaryBody } from "../src/server/planetary/planetary-engine";
import * as fs from "node:fs";
import * as path from "node:path";

// ============================================================================
// UTILIDADES
// ============================================================================

interface AuditEntry {
  test: string;
  status: "PASS" | "FAIL" | "NO_DEMOSTRADA" | "INFO";
  detail: string;
}

const auditLog: AuditEntry[] = [];

function log(test: string, status: AuditEntry["status"], detail: string): void {
  auditLog.push({ test, status, detail });
  const prefix =
    status === "PASS"
      ? "PASS"
      : status === "FAIL"
        ? "FAIL"
        : status === "NO_DEMOSTRADA"
          ? "NO_DEMOSTRADA"
          : "INFO";
  console.log(`${prefix} | ${test} | ${detail}`);
}

function degToArcmin(d: number): number {
  return d * 60;
}

// ============================================================================
// PUNTO 1: PRECISIÓN ASTRONÓMICA EXTERNA
// ============================================================================

console.log("=".repeat(72));
console.log("PUNTO 1: PRECISIÓN ASTRONÓMICA EXTERNA");
console.log("=".repeat(72));
console.log("");

const TOLERANCIA_GRADOS = 0.02; // 1.2 arcmin (Constitución REGLA 2)
console.log(
  `Tolerancia exigida: Δ ≤ ${TOLERANCIA_GRADOS}° = ${degToArcmin(TOLERANCIA_GRADOS)} arcmin`,
);
console.log("");

// ── 1A. SISTEMA DE COORDENADAS ─────────────────────────────────────────
console.log("── 1A. Sistema de coordenadas ──");
console.log("");
console.log("  Astronomy Engine (astronomy-engine@2.1.19):");
console.log("  - Astronomy.GeoVector(body, date, true) → vector geocéntrico");
console.log("    con corrección de aberración (true = aberración activada).");
console.log("  - Astronomy.Ecliptic(vector) → coordenadas eclípticas en");
console.log("    'true ecliptic of date' (eclíptica verdadera de la fecha).");
console.log("  - El equinoccio de referencia es el equinoccio verdadero de la");
console.log("    fecha (true equinox of date), NO Mean J2000.0.");
console.log("");
console.log("  Fixtures USNO:");
console.log("  - USNO publica instantes de solsticio/equinoccio en UTC.");
console.log("  - En el instante exacto del equinoccio de marzo, el Sol tiene");
console.log("    longitud eclíptica = 0° en true equinox of date POR DEFINICIÓN.");
console.log("  - En el solsticio de junio: 90°. Septiembre: 180°. Diciembre: 270°.");
console.log("  - Estos valores son EXACTOS para el instante publicado (no aproximados).");
console.log("  - La diferencia entre el instante USNO y la longitud calculada");
console.log("    mide exclusivamente la precisión de astronomy-engine.");
console.log("");
console.log("  Cuerpos sin fixture exacto:");
console.log("  - Para Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus,");
console.log("    Neptune, Pluto NO disponemos de valores esperados EXACTOS");
console.log("    en true ecliptic of date.");
console.log("  - Cualquier valor de la literatura que diga '~252°' o '6°-12°'");
console.log("    NO es evaluable contra tolerancia de 0.02°.");
console.log("  - Se declaran NO_DEMOSTRADA.");
console.log("");

log(
  "Sistema de coordenadas",
  "INFO",
  "astronomy-engine: true ecliptic of date + aberración. Fixtures USNO: true equinox of date. Compatibles.",
);

// ── 1B. FIXTURES DE PRECISIÓN EXACTA ────────────────────────────────────
console.log("── 1B. Fixtures de precisión exacta (USNO solsticios/equinoccios) ──");
console.log("");

interface ExactFixture {
  body: PlanetaryBody;
  iso: string;
  label: string;
  expectedLongitude: number;
  source: string;
  sourceUrl: string;
  coordSystem: string;
  center: string;
  aberration: string;
}

const exactFixtures: ExactFixture[] = [
  {
    body: "sun",
    iso: "2024-03-20T03:06:00.000Z",
    label: "Sol — equinoccio marzo 2024 (entrada Aries)",
    expectedLongitude: 0.0,
    source: "USNO Earth's Seasons",
    sourceUrl: "https://aa.usno.navy.mil/data/docs/EarthSeasons.php",
    coordSystem: "True equinox of date → True ecliptic of date",
    center: "Geocentric",
    aberration: "Astronomy.GeoVector(..., true) — aberración estelar corregida",
  },
  {
    body: "sun",
    iso: "2024-06-20T20:51:00.000Z",
    label: "Sol — solsticio junio 2024 (entrada Cáncer)",
    expectedLongitude: 90.0,
    source: "USNO Earth's Seasons",
    sourceUrl: "https://aa.usno.navy.mil/data/docs/EarthSeasons.php",
    coordSystem: "True equinox of date → True ecliptic of date",
    center: "Geocentric",
    aberration: "Astronomy.GeoVector(..., true) — aberración estelar corregida",
  },
  {
    body: "sun",
    iso: "2024-09-22T12:44:00.000Z",
    label: "Sol — equinoccio septiembre 2024 (entrada Libra)",
    expectedLongitude: 180.0,
    source: "USNO Earth's Seasons",
    sourceUrl: "https://aa.usno.navy.mil/data/docs/EarthSeasons.php",
    coordSystem: "True equinox of date → True ecliptic of date",
    center: "Geocentric",
    aberration: "Astronomy.GeoVector(..., true) — aberración estelar corregida",
  },
  {
    body: "sun",
    iso: "2024-12-21T09:20:00.000Z",
    label: "Sol — solsticio diciembre 2024 (entrada Capricornio)",
    expectedLongitude: 270.0,
    source: "USNO Earth's Seasons",
    sourceUrl: "https://aa.usno.navy.mil/data/docs/EarthSeasons.php",
    coordSystem: "True equinox of date → True ecliptic of date",
    center: "Geocentric",
    aberration: "Astronomy.GeoVector(..., true) — aberración estelar corregida",
  },
  {
    body: "sun",
    iso: "2025-03-20T09:01:00.000Z",
    label: "Sol — equinoccio marzo 2025 (entrada Aries)",
    expectedLongitude: 0.0,
    source: "USNO Earth's Seasons",
    sourceUrl: "https://aa.usno.navy.mil/data/docs/EarthSeasons.php",
    coordSystem: "True equinox of date → True ecliptic of date",
    center: "Geocentric",
    aberration: "Astronomy.GeoVector(..., true) — aberración estelar corregida",
  },
];

let exactPass = 0;
let exactFail = 0;

for (const f of exactFixtures) {
  const pos = astronomyPlanetaryEngine.calculatePosition(f.body, new Date(f.iso));

  // Distancia circular mínima para expected=0° (equinoccio Aries)
  let deltaGrados: number;
  if (f.expectedLongitude === 0.0) {
    const d0 = Math.abs(pos.absoluteLongitude - 0);
    const d360 = Math.abs(pos.absoluteLongitude - 360);
    deltaGrados = Math.min(d0, d360);
  } else {
    deltaGrados = Math.abs(pos.absoluteLongitude - f.expectedLongitude);
  }

  const deltaArcmin = degToArcmin(deltaGrados);
  const passed = deltaGrados <= TOLERANCIA_GRADOS;

  const detail =
    `body=${f.body} | ISO=${f.iso} | ` +
    `center=${f.center} | coord=${f.coordSystem} | aberration=${f.aberration} | ` +
    `expected=${f.expectedLongitude}.0° | obtained=${pos.absoluteLongitude.toFixed(6)}° | ` +
    `Δ=${deltaGrados.toFixed(6)}° (${deltaArcmin.toFixed(3)} arcmin) | ` +
    `tolerance=${TOLERANCIA_GRADOS}° | source=${f.source} | url=${f.sourceUrl}`;

  if (passed) {
    exactPass++;
    log(f.label, "PASS", detail);
  } else {
    exactFail++;
    log(f.label, "FAIL", detail);
  }
}
console.log("");
console.log(`  Exactos: ${exactPass} PASS, ${exactFail} FAIL de ${exactFixtures.length}`);
console.log("");

// ── 1C. CUERPOS SIN FIXTURE EXACTO ──────────────────────────────────────
console.log("── 1C. Cuerpos sin fixture externo exacto (NO_DEMOSTRADA) ──");
console.log("");

const bodiesNoExact: PlanetaryBody[] = [
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

for (const body of bodiesNoExact) {
  log(
    `${body} — precisión externa`,
    "NO_DEMOSTRADA",
    `Sin fixture externo exacto en true ecliptic of date. ` +
      `Se requiere consulta a JPL Horizons (ssd.jpl.nasa.gov/horizons) ` +
      `con settings: Observer=Geocentric[500@399], Ecliptic=ECLIPTRUE, ` +
      `Frame=True equinox of date, Aberration=Astometric. ` +
      `Almacenar resultado en src/server/planetary/__fixtures__/${body}.json`,
  );
}

console.log("");
console.log("── RESUMEN PUNTO 1 ──");
console.log(`  Sol (USNO): ${exactPass} PASS, ${exactFail} FAIL`);
console.log(`  9 cuerpos: NO_DEMOSTRADA (sin fixture exacto)`);
console.log(`  Precisión externa certificable: SOLO para el Sol (5 instantes).`);
console.log(`  Precisión externa para otros 9 cuerpos: NO DEMOSTRADA.`);
console.log("");

// ============================================================================
// PUNTO 2: RETROGRADACIÓN Y ESTACIONES
// ============================================================================

console.log("=".repeat(72));
console.log("PUNTO 2: RETROGRADACIÓN Y ESTACIONES");
console.log("=".repeat(72));
console.log("");

const CURRENT_WINDOW_MS = 12 * 60 * 60 * 1000; // ±12h

function computeSpeed(body: PlanetaryBody, date: Date, windowMs: number): number {
  const before = new Date(date.getTime() - windowMs);
  const after = new Date(date.getTime() + windowMs);
  const posBefore = astronomyPlanetaryEngine.calculatePosition(body, before);
  const posAfter = astronomyPlanetaryEngine.calculatePosition(body, after);
  const delta = signedLongitudeDelta(posBefore.absoluteLongitude, posAfter.absoluteLongitude);
  const days = (after.getTime() - before.getTime()) / 86_400_000;
  return delta / days;
}

// ── 2A. MERCURIO DICIEMBRE 2024 — FASES CORRECTAMENTE ETIQUETADAS ──────
console.log("── 2A. Mercurio diciembre 2024 — fases de retrogradación ──");
console.log("");
console.log("  Fuente: Astronomical Almanac 2025 / Sky & Telescope Mercury");
console.log("  Inicio retrogradación: ~2024-11-25 (Mercurio entra en fase retrógrada)");
console.log("  Estación retrógrada:    ~2024-12-06 (velocidad pasa de directa a retrógrada)");
console.log("  Período retrógrado:     2024-11-25 a 2024-12-15");
console.log("  Estación directa:       ~2024-12-15 (velocidad pasa de retrógrada a directa)");
console.log("  Movimiento directo:     posterior al 2024-12-15");
console.log("");
console.log("  NOTA: 2024-12-15T21:00Z NO es 'centro de retrogradación'.");
console.log("  Es CERCANO a la estación directa (≈12-18h después del cruce por cero).");
console.log("");

// Puntos de muestreo en la vecindad de la estación directa
const mercuryProbes: { iso: string; phase: string }[] = [
  { iso: "2024-12-06T00:00:00.000Z", phase: "inicio_retrogradacion" },
  { iso: "2024-12-10T00:00:00.000Z", phase: "periodo_retrogrado" },
  { iso: "2024-12-14T00:00:00.000Z", phase: "fin_periodo_retrogrado" },
  { iso: "2024-12-14T12:00:00.000Z", phase: "pre_estacion_directa" },
  { iso: "2024-12-15T00:00:00.000Z", phase: "cercano_estacion_directa" },
  { iso: "2024-12-15T12:00:00.000Z", phase: "cercano_estacion_directa" },
  { iso: "2024-12-15T21:00:00.000Z", phase: "posible_post_estacion" },
  { iso: "2024-12-16T00:00:00.000Z", phase: "post_estacion_directa" },
  { iso: "2024-12-25T00:00:00.000Z", phase: "directo_estable" },
];

console.log("  Comparación de ventanas ±12h vs ±1h vs ±15min:");
console.log("");

for (const probe of mercuryProbes) {
  const d = new Date(probe.iso);
  const s12h = computeSpeed("mercury", d, 12 * 3600_000);
  const s1h = computeSpeed("mercury", d, 1 * 3600_000);
  const s15m = computeSpeed("mercury", d, 15 * 60_000);
  const c12h = s12h < 0 ? "RETR" : s12h > 0 ? "DIR" : "≈0";
  const c1h = s1h < 0 ? "RETR" : s1h > 0 ? "DIR" : "≈0";
  const c15m = s15m < 0 ? "RETR" : s15m > 0 ? "DIR" : "≈0";

  const allSame = c12h === c1h && c1h === c15m;
  const flag = allSame ? "" : " ← DISCREPANCIA ENTRE VENTANAS";

  console.log(
    `  ${probe.iso}  ${probe.phase.padEnd(28)} ±12h:${s12h.toFixed(6).padStart(9)} ${c12h}  ±1h:${s1h.toFixed(6).padStart(9)} ${c1h}  ±15m:${s15m.toFixed(6).padStart(9)} ${c15m}${flag}`,
  );
}

// ── IDENTIFICAR DISCREPANCIA ──
const critDate = new Date("2024-12-15T21:00:00.000Z");
const s12hCrit = computeSpeed("mercury", critDate, 12 * 3600_000);
const s15mCrit = computeSpeed("mercury", critDate, 15 * 60_000);
const hayDiscrepancia = s12hCrit < 0 !== s15mCrit < 0;

console.log("");
if (hayDiscrepancia) {
  console.log("  ⚠️  CONFIRMADO: En 2024-12-15T21:00Z,");
  console.log(
    `     ±12h → ${s12hCrit < 0 ? "RETRÓGRADO" : "DIRECTO"} (speed=${s12hCrit.toFixed(8)} °/día)`,
  );
  console.log(
    `     ±15min → ${s15mCrit < 0 ? "RETRÓGRADO" : "DIRECTO"} (speed=${s15mCrit.toFixed(8)} °/día)`,
  );
  console.log("     La ventana de ±12h produce clasificación opuesta a ventanas finas.");
  console.log("     Esto ocurre porque ±12h captura ~6h antes y después del instante,");
  console.log("     promediando velocidad retrógrada residual con velocidad directa.");
  console.log("");

  log(
    "Mercurio 2024-12-15T21:00Z — discrepancia de clasificación por ventana",
    "FAIL",
    `±12h: speed=${s12hCrit.toFixed(8)} °/día (${s12hCrit < 0 ? "RETRÓGRADO" : "DIRECTO"}), ` +
      `±15min: speed=${s15mCrit.toFixed(8)} °/día (${s15mCrit < 0 ? "RETRÓGRADO" : "DIRECTO"}). ` +
      `La ventana de ±12h clasifica incorrectamente el instante cercano a la estación directa. ` +
      `Causa raíz: promediado lineal sobre intervalo de 24h que cruza el punto estacionario.`,
  );
} else {
  log(
    "Mercurio 2024-12-15T21:00Z — discrepancia de clasificación por ventana",
    "PASS",
    `Sin discrepancia entre ventanas.`,
  );
}

// ── 2B. SECCIÓN SEPARADA: PRECISIÓN DE VELOCIDAD ────────────────────────
console.log("");
console.log("── 2B. Precisión de velocidad (independiente de clasificación) ──");
console.log("");
console.log("  La velocidad calculada por calculateSpeedDegreesPerDay NO es");
console.log("  velocidad instantánea. Es velocidad media sobre ±12h.");
console.log("");
console.log("  Esto afecta a la CLASIFICACIÓN (isRetrograde) pero NO a la");
console.log("  PRECISIÓN DE LONGITUD (absoluteLongitude), que se calcula");
console.log("  puntualmente sin ventana de promediado.");
console.log("");

// Verificar que la longitud es correcta puntualmente vs velocidad promediada
const checkDate = new Date("2024-12-15T21:00:00.000Z");
const pos = astronomyPlanetaryEngine.calculatePosition("mercury", checkDate);
console.log(`  Mercurio en ${checkDate.toISOString()}:`);
console.log(`    absoluteLongitude = ${pos.absoluteLongitude.toFixed(6)}° (puntual, preciso)`);
console.log(`    speedDegreesPerDay = ${pos.speedDegreesPerDay.toFixed(8)} °/día (promedio ±12h)`);
console.log(`    isRetrograde = ${pos.isRetrograde} (derivado del promedio ±12h)`);
console.log("");

log(
  "Separación precisión-longitud vs precisión-velocidad",
  "INFO",
  "absoluteLongitude es puntual y preciso. speedDegreesPerDay e isRetrograde " +
    "son promedios sobre ±12h y pueden ser incorrectos cerca de estaciones.",
);

// ── 2C. CRUCE 359° → 0° ────────────────────────────────────────────────
console.log("── 2C. Cruce de longitud 359° → 0° ──");
const d359_0_1 = signedLongitudeDelta(359.0, 1.0);
const d359_0_2 = signedLongitudeDelta(1.0, 359.0);
const d358_2 = signedLongitudeDelta(358.0, 2.0);
console.log(`  signedLongitudeDelta(359.0, 1.0) = ${d359_0_1}  (esperado +2.0)`);
console.log(`  signedLongitudeDelta(1.0, 359.0) = ${d359_0_2}  (esperado -2.0)`);
console.log(`  signedLongitudeDelta(358.0, 2.0) = ${d358_2}  (esperado +4.0)`);
const wrapOk = d359_0_1 === 2.0 && d359_0_2 === -2.0 && d358_2 === 4.0;
if (wrapOk) {
  log("Cruce 359° → 0°", "PASS", "signedLongitudeDelta maneja wrap-around correctamente");
} else {
  log("Cruce 359° → 0°", "FAIL", `Valores: ${d359_0_1}, ${d359_0_2}, ${d358_2}`);
}
console.log("");

// ── 2D. SOL Y LUNA SIEMPRE DIRECTOS ────────────────────────────────────
console.log("── 2D. Sol y Luna: movimiento siempre directo ──");
const sunMoonDates = [
  "2024-01-15T00:00:00.000Z",
  "2024-03-20T03:06:00.000Z",
  "2024-06-20T20:51:00.000Z",
  "2024-09-22T12:44:00.000Z",
  "2024-12-21T09:20:00.000Z",
  "2025-03-20T09:01:00.000Z",
  "2023-07-04T00:00:00.000Z",
  "2022-10-31T00:00:00.000Z",
  "2026-01-01T00:00:00.000Z",
  "2021-06-15T00:00:00.000Z",
];
let sunR = 0,
  moonR = 0;
for (const iso of sunMoonDates) {
  const d = new Date(iso);
  if (astronomyPlanetaryEngine.calculatePosition("sun", d).isRetrograde) sunR++;
  if (astronomyPlanetaryEngine.calculatePosition("moon", d).isRetrograde) moonR++;
}
console.log(`  ${sunMoonDates.length} fechas. Sol retrógrado: ${sunR}, Luna retrógrada: ${moonR}`);
if (sunR === 0) log("Sol siempre directo", "PASS", `${sunMoonDates.length} fechas, 0 retrógrado`);
else log("Sol siempre directo", "FAIL", `${sunR} ocurrencias de Sol retrógrado`);
if (moonR === 0) log("Luna siempre directa", "PASS", `${sunMoonDates.length} fechas, 0 retrógrada`);
else log("Luna siempre directa", "FAIL", `${moonR} ocurrencias de Luna retrógrada`);
console.log("");

// ── 2E. PLANETAS EN OPOSICIÓN ──────────────────────────────────────────
console.log("── 2E. Planetas en fechas de oposición ──");
console.log("  Sin fixtures JPL exactos, la clasificación es NO DEMOSTRADA.");
console.log("  Se verifican como sanity check sin asignar PASS/FAIL.");
const oppChecks = [
  { body: "mars" as PlanetaryBody, iso: "2022-12-08T05:00:00.000Z", label: "Marte oposición" },
  { body: "jupiter" as PlanetaryBody, iso: "2024-12-07T21:00:00.000Z", label: "Júpiter oposición" },
  { body: "saturn" as PlanetaryBody, iso: "2024-09-08T04:00:00.000Z", label: "Saturno oposición" },
];
for (const c of oppChecks) {
  const p = astronomyPlanetaryEngine.calculatePosition(c.body, new Date(c.iso));
  console.log(
    `  ${c.body.padEnd(9)} ${c.label.padEnd(20)} speed=${p.speedDegreesPerDay.toFixed(6).padStart(9)} °/d  isRetrograde=${p.isRetrograde}`,
  );
}
console.log("  Estos valores son informativos. Sin fixture JPL no son PASS ni FAIL.");
console.log("");

// ── 2F. COMPARACIÓN DE ALTERNATIVAS PARA LA VENTANA ──────────────────
console.log("── 2F. Comparación de alternativas para la ventana de retrogradación ──");
console.log("");
console.log("  Problema: calculateSpeedDegreesPerDay usa ventana fija ±12h.");
console.log("  Cerca de estaciones, el promediado puede invertir el signo.");
console.log("");
console.log("  ALTERNATIVA A — Ventana fija ±1h:");
console.log("    Precisión:     Elimina el falso positivo de Mercurio.");
console.log("    Estabilidad:   Para planetas lentos (Neptuno: ~0.006°/día),");
console.log("                   ±1h captura Δlongitud ≈ 0.00025°. Esto está al");
console.log("                   límite de la precisión numérica de astronomy-engine");
console.log("                   (~1e-6 grados). Puede producir ruido.");
console.log("    Contracto:     Sin cambios. isRetrograde: boolean.");
console.log("");
console.log("  ALTERNATIVA B — Derivada adaptativa:");
console.log("    Precisión:     Ventana proporcional a velocidad esperada:");
console.log("                   |speed_est| > 2 °/d  → ±1h   (Mercurio, Venus)");
console.log("                   |speed_est| > 0.1   → ±6h   (Marte, Júpiter, Saturno)");
console.log("                   |speed_est| ≤ 0.1   → ±24h  (Urano, Neptuno, Plutón)");
console.log("    Estabilidad:   Requiere estimación previa de velocidad (iteración");
console.log("                   o valor de referencia). Añade complejidad.");
console.log("    Contracto:     Sin cambios. isRetrograde: boolean.");
console.log("");
console.log("  ALTERNATIVA C — Umbrales específicos por cuerpo:");
console.log("    Precisión:     Tabla de ventanas fijas por cuerpo basada en");
console.log("                   velocidad orbital conocida.");
console.log("    Estabilidad:   Determinista y predecible.");
console.log("    Contracto:     Sin cambios. isRetrograde: boolean.");
console.log("");
console.log("  ALTERNATIVA D — Mantener solo isRetrograde (sin modificar):");
console.log("    Precisión:     Acepta el falso positivo documentado.");
console.log("    Estabilidad:   Sin cambios de código.");
console.log("    Contracto:     Añadir ADR documentando tolerancia de ±12h.");
console.log("                   Para uso astrológico, la diferencia es imperceptible");
console.log("                   (el signo no cambia en ±12h).");
console.log("");
console.log("  COMPARACIÓN:");
console.log("    Alternativa | Prec. clasif. | Estab. numérica | Cambio contractual");
console.log("    A (±1h)     | ALTA           | BAJA (cuerpos lentos) | Ninguno");
console.log("    B (adapt)   | MUY ALTA       | MEDIA (iteración)     | Ninguno");
console.log("    C (tabla)   | ALTA           | ALTA                  | Ninguno");
console.log("    D (sin mod) | BAJA (doc.)    | ALTA                  | ADR requerido");
console.log("");

log(
  "RECOMENDACIÓN alternativa ventana retrogradación",
  "INFO",
  "Alternativa C (umbrales por cuerpo) ofrece mejor balance precisión/estabilidad " +
    "sin cambio contractual. Alternativa A (±1h) es la más simple pero arriesga ruido " +
    "numérico en planetas exteriores. Alternativa B añade complejidad innecesaria. " +
    "Alternativa D requiere ADR de tolerancia documentada.",
);

// ============================================================================
// PUNTO 3: PRUEBAS INSUFICIENTES
// ============================================================================

console.log("");
console.log("=".repeat(72));
console.log("PUNTO 3: PRUEBAS INSUFICIENTES — CONFIRMACIÓN DE HUECOS");
console.log("=".repeat(72));
console.log("");

// ── 3A ──
console.log("── 3A. 'signo previo' ──");
console.log("  planetary-engine.test.ts:58-64 verifica degreeInSign ∈ [0,30).");
console.log("  NO verifica before.sign === expectedPreviousSign.");
log(
  "signo previo no verifica signo correcto",
  "FAIL",
  "Test solo comprueba degreeInSign ∈ [0,30). No comprueba before.sign.",
);

// ── 3B ──
console.log("── 3B. signedLongitudeDelta ──");
const manualCases = [
  { from: 10, to: 20, exp: 10 },
  { from: 20, to: 10, exp: -10 },
  { from: 350, to: 10, exp: 20 },
  { from: 10, to: 350, exp: -20 },
  { from: 170, to: 190, exp: 20 },
  { from: 190, to: 170, exp: -20 },
  { from: 359, to: 1, exp: 2 },
  { from: 1, to: 359, exp: -2 },
  { from: 0, to: 180, exp: 180 },
  { from: 180, to: 0, exp: -180 },
];
let manualErrs = 0;
for (const c of manualCases) {
  const r = signedLongitudeDelta(c.from, c.to);
  if (Math.abs(r - c.exp) > 0.0001) manualErrs++;
}
if (manualErrs === 0) {
  log(
    "signedLongitudeDelta verificación manual",
    "INFO",
    `10/10 correctos. Pero SIN test automatizado en planetary-engine.test.ts.`,
  );
} else {
  log("signedLongitudeDelta verificación manual", "FAIL", `${manualErrs}/10 errores`);
}
log(
  "signedLongitudeDelta sin test directo",
  "FAIL",
  "No existe test unitario en planetary-engine.test.ts. Sin protección contra regresiones.",
);

// ── 3C ──
const fixturesDir = path.resolve("src/server/planetary/__fixtures__");
const fixturesExist = fs.existsSync(fixturesDir);
console.log(`── 3C. __fixtures__/: ${fixturesExist ? "EXISTE" : "NO EXISTE"} ──`);
if (!fixturesExist) {
  log(
    "fixtures planetarios externos",
    "FAIL",
    "src/server/planetary/__fixtures__/ no existe. moon/__fixtures__/ sí existe.",
  );
}

// ── 3D ──
console.log("── 3D. Tests de estaciones ──");
log(
  "tests de estaciones retrógradas",
  "FAIL",
  "No hay tests de inicio/fin de retrogradación, instantes estacionarios, ni clasificación contra fechas conocidas.",
);

// ── 3E ──
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
console.log("── 3E. tsx ──");
if ("tsx" in deps) {
  log("tsx en package.json", "PASS", deps.tsx);
} else {
  log("tsx en package.json", "FAIL", "No está en dependencies ni devDependencies.");
}

// ── 3F ──
console.log("── 3F. script test ──");
if ("test" in (pkg.scripts || {})) {
  log("script test", "PASS", pkg.scripts.test);
} else {
  log("script test", "FAIL", "No existe script 'test' en package.json.");
}

// ── 3G ──
console.log("");
console.log("── 3G. PRUEBAS MÍNIMAS IMPRESCINDIBLES ANTES DE FASE 2B ──");
console.log("");
console.log("  1. Crear src/server/planetary/__fixtures__/ con ≥20 timestamps JPL.");
console.log("  2. Test directo signedLongitudeDelta (10 casos).");
console.log("  3. Test isRetrograde en fechas de estación conocidas.");
console.log("  4. Test signo previo: verificar before.sign === signo_anterior.");
console.log("  5. tsx + script test en package.json.");
console.log("  6. Test de velocidad con ventanas múltiples (±1min a ±24h).");
console.log("  7. Test Sol y Luna nunca retrógrados (≥30 fechas).");
console.log("  8. Test snapshot completo contra fixture JPL (≥3 fechas).");
console.log("  9. Test de que absoluteLongitude no depende de la ventana.");
console.log("  10. Test de estabilidad numérica para planetas lentos.");

// ============================================================================
// PUNTO 4: CONFLICTO ARQUITECTÓNICO
// ============================================================================

console.log("");
console.log("=".repeat(72));
console.log("PUNTO 4: CONFLICTO ARQUITECTÓNICO — UBICACIÓN CANÓNICA");
console.log("=".repeat(72));
console.log("");

console.log("  CONSTITUCIÓN REGLA 2: src/server/moon/");
console.log("  CODEX implementó:     src/server/planetary/");
console.log("  src/server/astrology/: NO documentado.");
console.log("");
console.log("  OPCIONES:");
console.log("  A. Conservar src/server/planetary/ — viable con ADR de enmienda.");
console.log("  B. Integrar bajo src/server/moon/ — semánticamente incorrecto.");
console.log("  C. src/server/astronomy/ con moon/ y planetary/ — óptimo.");
console.log("  D. Emitir ADR formal primero — requisito previo.");
console.log("");
console.log("  Secuencia: D → C.");

log(
  "CONFLICTO ARQUITECTÓNICO",
  "FAIL",
  "Constitución dice src/server/moon/, código en src/server/planetary/. " +
    "Requiere ADR (Opción D) → migrar a src/server/astronomy/ (Opción C).",
);

// ============================================================================
// PUNTO 5: VEREDICTO AUTOMÁTICO
// ============================================================================

console.log("");
console.log("=".repeat(72));
console.log("PUNTO 5: VEREDICTO FINAL (generado desde auditLog)");
console.log("=".repeat(72));
console.log("");

const totalPass = auditLog.filter((e) => e.status === "PASS").length;
const totalFail = auditLog.filter((e) => e.status === "FAIL").length;
const totalNoDemo = auditLog.filter((e) => e.status === "NO_DEMOSTRADA").length;
const totalInfo = auditLog.filter((e) => e.status === "INFO").length;

console.log(
  `PASS: ${totalPass}  FAIL: ${totalFail}  NO_DEMOSTRADA: ${totalNoDemo}  INFO: ${totalInfo}`,
);
console.log("");

// ── Clasificación de FAIL ──
const precisionFail = exactFail; // del Punto 1
const retroFail = auditLog.filter(
  (e) => e.status === "FAIL" && e.test.includes("Mercurio 2024"),
).length;
const testGaps = auditLog.filter(
  (e) =>
    e.status === "FAIL" &&
    (e.test.includes("signo previo") ||
      e.test.includes("signedLongitudeDelta sin test") ||
      e.test.includes("fixtures planetarios") ||
      e.test.includes("estaciones retrógradas") ||
      e.test.includes("tsx") ||
      e.test.includes("script test")),
).length;
const archFail = auditLog.filter(
  (e) => e.status === "FAIL" && e.test.includes("CONFLICTO ARQUITECTÓNICO"),
).length;

console.log("Desglose de FAIL:");
console.log(`  Precisión externa (exacta):     ${precisionFail}  (Δ > 1.2 arcmin?)`);
console.log(`  Retrogradación (discrepancia):  ${retroFail}  (falso positivo?)`);
console.log(`  Pruebas insuficientes:          ${testGaps}`);
console.log(`  Conflicto arquitectónico:       ${archFail}`);
console.log("");

// ── Veredicto automático ──
console.log("=".repeat(72));

const implementationMathFails = precisionFail > 0 || retroFail > 0;

if (implementationMathFails) {
  console.log("");
  console.log("IMPLEMENTACIÓN MATEMÁTICA RECHAZADA");
  console.log("");
  if (precisionFail > 0) {
    console.log(
      `  Motivo 1: ${precisionFail} fixture(s) USNO fuera de tolerancia (Δ > 1.2 arcmin).`,
    );
  }
  if (retroFail > 0) {
    console.log(`  Motivo 2: Discrepancia de clasificación en Mercurio cerca de estación directa.`);
    console.log("  La ventana de ±12h invierte el signo de velocidad respecto a ±15min.");
  }
  console.log("");
  console.log("  LISTA MÍNIMA DE ARCHIVOS QUE CODEX DEBERÁ MODIFICAR:");
  console.log("");
  const filesToModify: string[] = [];
  if (precisionFail > 0) {
    filesToModify.push(
      "  src/server/planetary/astronomy-planetary-engine.ts — investigar Δ > 1.2 arcmin",
    );
  }
  if (retroFail > 0) {
    filesToModify.push(
      "  src/server/planetary/astronomy-planetary-engine.ts — RETROGRADE_SAMPLE_MS (línea 14)",
    );
    filesToModify.push(
      "  src/server/planetary/astronomy-planetary-engine.ts — calculateSpeedDegreesPerDay (líneas 68-77)",
    );
  }
  filesToModify.push(
    "  src/server/planetary/planetary-engine.test.ts — agregar 10 tests mínimos (sección 3G)",
  );
  filesToModify.push(
    "  src/server/planetary/__fixtures__/ — crear directorio con ≥20 timestamps JPL",
  );
  filesToModify.push("  package.json — agregar tsx a devDependencies + script 'test'");
  filesToModify.push(
    "  documentacion/gobierno-y-roadmap/10_MASTER_DECISION_LOG.md — emitir ADR para conflicto arquitectónico",
  );
  for (const f of filesToModify) console.log(f);
  console.log("");
  console.log("IMPLEMENTACIÓN MATEMÁTICA RECHAZADA");
} else {
  console.log("");
  console.log("APROBADO PARA CORRECCIÓN FOCALIZADA");
  console.log("");
  console.log("  Archivos a modificar (solo correcciones no-matemáticas):");
  console.log("  - src/server/planetary/__fixtures__/ — crear con timestamps JPL");
  console.log("  - src/server/planetary/planetary-engine.test.ts — 10 tests mínimos");
  console.log("  - package.json — tsx + script test");
  console.log("  - 10_MASTER_DECISION_LOG.md — ADR conflicto arquitectónico");
  console.log("");
  console.log("APROBADO PARA CORRECCIÓN FOCALIZADA");
}

// ── Log JSON ──
console.log("");
console.log("=".repeat(72));
console.log("LOG COMPLETO (JSON)");
console.log("=".repeat(72));
console.log(JSON.stringify(auditLog, null, 2));
