/**
 * Genera evidencia numérica para el paquete técnico Fase 2A.
 * NO modifica código. Solo calcula y emite datos para la documentación.
 */
import { astronomyPlanetaryEngine } from "../src/server/planetary/astronomy-planetary-engine";
import { signedLongitudeDelta, normalizeLongitude } from "../src/server/planetary/zodiac-math";
import type { PlanetaryBody } from "../src/server/planetary/planetary-engine";
import { PLANETARY_BODIES } from "../src/server/planetary/planetary-engine";

interface FixtureResult {
  body: string;
  iso: string;
  phase: string;
  expected: number | null;
  obtained: number;
  delta_deg: number;
  delta_arcmin: number;
  tolerance_deg: 0.02;
  tolerance_arcmin: 1.2;
  status: "PASS" | "PENDIENTE_JPL" | "NO_DEMOSTRADA" | "INFORMATIVO";
  coord_system: string;
  center: string;
  aberration: string;
  source: string;
  source_url: string;
  jpl_query?: string;
}

const FIXTURES: FixtureResult[] = [];

function addFixture(
  body: string, iso: string, phase: string,
  expected: number | null,
  source: string, sourceUrl: string,
  jplQuery?: string
) {
  const pos = astronomyPlanetaryEngine.calculatePosition(body as PlanetaryBody, new Date(iso));
  const obtained = pos.absoluteLongitude;

  let deltaDeg: number;
  let status: FixtureResult["status"];

  if (expected === null) {
    deltaDeg = 0;
    status = "PENDIENTE_JPL";
  } else if (expected === 0.0) {
    const d0 = Math.abs(obtained - 0);
    const d360 = Math.abs(obtained - 360);
    deltaDeg = Math.min(d0, d360);
    status = deltaDeg <= 0.02 ? "PASS" : "NO_DEMOSTRADA";
  } else {
    deltaDeg = Math.abs(obtained - expected);
    status = deltaDeg <= 0.02 ? "PASS" : "NO_DEMOSTRADA";
  }

  FIXTURES.push({
    body, iso, phase,
    expected, obtained: obtained,
    delta_deg: deltaDeg,
    delta_arcmin: deltaDeg * 60,
    tolerance_deg: 0.02,
    tolerance_arcmin: 1.2,
    status,
    coord_system: "True ecliptic of date (Astronomy.Ecliptic + GeoVector with aberration=true)",
    center: "Geocentric (500@399 equivalent)",
    aberration: "Stellar aberration corrected (GeoVector(..., true))",
    source,
    source_url: sourceUrl,
    jpl_query: jplQuery,
  });
}

// ============================================================================
// Fixture 1-5: USNO Solsticios/Equinoccios (EXACTOS)
// ============================================================================
const USNO_URL = "https://aa.usno.navy.mil/data/docs/EarthSeasons.php";
const USNO_SRC = "USNO Earth's Seasons";
addFixture("sun", "2024-03-20T03:06:00.000Z", "equinoccio_marzo", 0.0, USNO_SRC, USNO_URL);
addFixture("sun", "2024-06-20T20:51:00.000Z", "solsticio_junio", 90.0, USNO_SRC, USNO_URL);
addFixture("sun", "2024-09-22T12:44:00.000Z", "equinoccio_septiembre", 180.0, USNO_SRC, USNO_URL);
addFixture("sun", "2024-12-21T09:20:00.000Z", "solsticio_diciembre", 270.0, USNO_SRC, USNO_URL);
addFixture("sun", "2025-03-20T09:01:00.000Z", "equinoccio_marzo", 0.0, USNO_SRC, USNO_URL);

// ============================================================================
// Fixtures 6-25: Cuerpos con consulta JPL documentada pero SIN valor esperado exacto
// ============================================================================
// Para cada cuerpo, proporcionamos:
// - Timestamps en fases astronómicas relevantes
// - Consulta JPL Horizons reproducible exacta
// - expected = null (se requiere ejecutar la consulta para obtener el valor)

function jplQuery(body: PlanetaryBody, desc: string): string {
  return `https://ssd.jpl.nasa.gov/horizons/app.html#/ => ` +
    `Ephemeris Type: OBSERVER, Target Body: ${body} [Geocenter], ` +
    `Observer Location: Geocentric [500@399], ` +
    `Table Settings: Ecliptic=ECLIPTRUE (True ecliptic of date), ` +
    `Reference Frame: True equinox of date, ` +
    `Aberration: Astometric, ` +
    `Units: degrees, Quantity: 31 (Obs ecliptic lon)`;
}

// Moon — fases lunares
addFixture("moon", "2024-06-21T12:00:00.000Z", "snapshot_referencia", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("moon", "snapshot"));
addFixture("moon", "2024-03-20T03:06:00.000Z", "equinoccio_marzo_2024", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("moon", "equinoccio"));

// Mercury — cruces de signo + retrogradación
addFixture("mercury", "2024-12-06T00:00:00.000Z", "estacion_retrograda", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("mercury", "estacion_retrograda"));
addFixture("mercury", "2024-12-15T21:00:00.000Z", "posible_post_estacion_directa", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("mercury", "estacion_directa"));
addFixture("mercury", "2024-12-25T00:00:00.000Z", "post_estacion_directa_estable", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("mercury", "post_estacion"));

// Venus
addFixture("venus", "2024-06-21T12:00:00.000Z", "snapshot_referencia", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("venus", "snapshot"));
addFixture("venus", "2024-01-01T00:00:00.000Z", "inicio_2024", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("venus", "inicio_2024"));

// Mars — oposición (retrógrado)
addFixture("mars", "2022-12-08T05:00:00.000Z", "oposicion_retrogrado", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("mars", "oposicion_2022"));
addFixture("mars", "2025-01-15T00:00:00.000Z", "oposicion_retrogrado_2025", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("mars", "oposicion_2025"));

// Jupiter
addFixture("jupiter", "2024-12-07T21:00:00.000Z", "oposicion_retrogrado", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("jupiter", "oposicion_2024"));
addFixture("jupiter", "2024-06-21T12:00:00.000Z", "snapshot_referencia", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("jupiter", "snapshot"));

// Saturn
addFixture("saturn", "2024-09-08T04:00:00.000Z", "oposicion_retrogrado", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("saturn", "oposicion_2024"));
addFixture("saturn", "2024-06-21T12:00:00.000Z", "snapshot_referencia", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("saturn", "snapshot"));

// Uranus
addFixture("uranus", "2024-11-17T00:00:00.000Z", "oposicion_retrogrado", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("uranus", "oposicion_2024"));
addFixture("uranus", "2024-06-21T12:00:00.000Z", "snapshot_referencia", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("uranus", "snapshot"));

// Neptune
addFixture("neptune", "2024-09-21T00:00:00.000Z", "oposicion_retrogrado", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("neptune", "oposicion_2024"));
addFixture("neptune", "2024-06-21T12:00:00.000Z", "snapshot_referencia", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("neptune", "snapshot"));

// Pluto
addFixture("pluto", "2024-07-23T00:00:00.000Z", "oposicion_retrogrado", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("pluto", "oposicion_2024"));
addFixture("pluto", "2024-11-19T20:00:00.000Z", "entrada_acuario", null, "JPL_HORIZONS_PENDIENTE", "https://ssd.jpl.nasa.gov/horizons/app.html#/", jplQuery("pluto", "entrada_acuario"));

// ============================================================================
// EMITIR JSON
// ============================================================================
console.log(JSON.stringify({
  generated_at: new Date().toISOString(),
  engine_version: astronomyPlanetaryEngine.version,
  total_fixtures: FIXTURES.length,
  pass_count: FIXTURES.filter(f => f.status === "PASS").length,
  pendiente_jpl_count: FIXTURES.filter(f => f.status === "PENDIENTE_JPL").length,
  fixtures: FIXTURES,
  configuracion_jpl_horizons: {
    ephemeris_type: "OBSERVER",
    target_body: "{body} [Geocenter]",
    observer_location: "Geocentric [500@399]",
    table_settings: {
      ecliptic: "ECLIPTRUE (True ecliptic of date)",
      reference_frame: "True equinox of date",
      aberration: "Astometric",
      units: "degrees",
      quantities: "31 (Obs ecliptic longitude)",
    },
    web_url: "https://ssd.jpl.nasa.gov/horizons/app.html#/",
    telnet: "telnet horizons.jpl.nasa.gov 6775",
    api: "https://ssd-api.jpl.nasa.gov/horizons.api",
  },
  nota_metodologica: [
    "SOLO los 5 fixtures USNO tienen valor esperado EXACTO (solsticios/equinoccios).",
    "Los 20 fixtures restantes tienen expected=null y status=PENDIENTE_JPL.",
    "Para cerrar la auditoría Fase 2A, se debe ejecutar la consulta JPL Horizons",
    "para CADA uno de estos 20 fixtures, registrar la longitud eclíptica obtenida,",
    "y volver a comparar contra el valor obtenido aquí registrado.",
    "La tolerancia exigida por la Constitución es Δ ≤ 1.2 arcmin = 0.02°.",
  ]
}, null, 2));