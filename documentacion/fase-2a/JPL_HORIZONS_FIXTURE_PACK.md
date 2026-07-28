# JPL HORIZONS FIXTURE PACK — Auditoría Fase 2A

**Generado**: 2026-07-28T19:47 UTC
**Engine**: astronomy-engine@2.1.19:planetary@2a
**Propósito**: Proporcionar 24 fixtures astronómicos con consultas JPL Horizons reproducibles para verificación externa de las posiciones calculadas por PlanetaryEngine.

---

## Configuración JPL Horizons

Toda consulta DEBE usar parámetros idénticos para garantizar comparabilidad:

| Parámetro | Valor |
|-----------|-------|
| Ephemeris Type | OBSERVER |
| Target Body | {body} [Geocenter] |
| Observer Location | Geocentric [500@399] |
| Table Settings → Ecliptic | ECLIPTRUE (True ecliptic of date) |
| Table Settings → Reference Frame | True equinox of date |
| Table Settings → Aberration | Astometric |
| Units | degrees |
| Quantity | 31 (Observed ecliptic longitude) |
| Web URL | https://ssd.jpl.nasa.gov/horizons/app.html#/ |
| Telnet | `telnet horizons.jpl.nasa.gov 6775` |
| API | https://ssd-api.jpl.nasa.gov/horizons.api |

---

## Fixtures 1-5: USNO Solsticios/Equinoccios (EXACTOS — VERIFICABLES)

Estos 5 fixtures tienen valor esperado EXACTO (0°, 90°, 180°, 270°) porque en el instante del solsticio/equinoccio el Sol está por definición en esa longitud eclíptica en true equinox of date. La fuente es USNO Earth's Seasons.

| # | Cuerpo | Fase | ISO UTC | Esperado | Obtenido (AE) | Δ (°) | Δ (arcmin) | Fuente |
|---|--------|------|---------|----------|---------------|-------|------------|--------|
| 1 | sun | equinoccio_marzo | 2024-03-20T03:06:00.000Z | 0.0° | 359.999747° | 0.000253 | 0.015 | [USNO](https://aa.usno.navy.mil/data/docs/EarthSeasons.php) |
| 2 | sun | solsticio_junio | 2024-06-20T20:51:00.000Z | 90.0° | 89.999929° | 0.000071 | 0.004 | [USNO](https://aa.usno.navy.mil/data/docs/EarthSeasons.php) |
| 3 | sun | equinoccio_septiembre | 2024-09-22T12:44:00.000Z | 180.0° | 180.000032° | 0.000032 | 0.002 | [USNO](https://aa.usno.navy.mil/data/docs/EarthSeasons.php) |
| 4 | sun | solsticio_diciembre | 2024-12-21T09:20:00.000Z | 270.0° | 269.999876° | 0.000124 | 0.007 | [USNO](https://aa.usno.navy.mil/data/docs/EarthSeasons.php) |
| 5 | sun | equinoccio_marzo | 2025-03-20T09:01:00.000Z | 0.0° | 359.999716° | 0.000284 | 0.017 | [USNO](https://aa.usno.navy.mil/data/docs/EarthSeasons.php) |

**Resultado**: 5/5 PASS. Δ máxima = **0.017 arcmin** ≤ 1.2 arcmin. Tolerancia de la Constitución cumplida para el Sol.

---

## Fixtures 6-24: Cuerpos con consulta JPL documentada (PENDIENTE_JPL)

Estos 19 fixtures tienen `expected = null`. La columna "Obtenido (AE)" contiene el valor calculado por astronomy-engine. **Para cerrar la auditoría**, se debe ejecutar la consulta JPL Horizons indicada, registrar la longitud eclíptica de JPL, y comparar Δ.

### Sistema de coordenadas

| Propiedad | Valor |
|-----------|-------|
| Sistema | True ecliptic of date (Astronomy.Ecliptic + GeoVector con aberration=true) |
| Centro | Geocéntrico (500@399 equivalent) |
| Aberración | Estelar corregida (GeoVector(..., true)) |

### Tabla de fixtures pendientes

| # | Cuerpo | Fase | ISO UTC | Obtenido (AE) | Consulta JPL |
|---|--------|------|---------|---------------|-------------|
| 6 | moon | snapshot_referencia | 2024-06-21T12:00:00.000Z | 263.744433° | Moon, Geocentric, ECLIPTRUE, True equinox |
| 7 | moon | equinoccio_marzo_2024 | 2024-03-20T03:06:00.000Z | 123.815622° | Moon, Geocentric, ECLIPTRUE, True equinox |
| 8 | mercury | estacion_retrograda | 2024-12-06T00:00:00.000Z | 254.582217° | Mercury, Geocentric, ECLIPTRUE, True equinox |
| 9 | mercury | posible_post_estacion_directa | 2024-12-15T21:00:00.000Z | 246.396247° | Mercury, Geocentric, ECLIPTRUE, True equinox |
| 10 | mercury | post_estacion_directa_estable | 2024-12-25T00:00:00.000Z | 251.722659° | Mercury, Geocentric, ECLIPTRUE, True equinox |
| 11 | venus | snapshot_referencia | 2024-06-21T12:00:00.000Z | 95.203648° | Venus, Geocentric, ECLIPTRUE, True equinox |
| 12 | venus | inicio_2024 | 2024-01-01T00:00:00.000Z | 242.612302° | Venus, Geocentric, ECLIPTRUE, True equinox |
| 13 | mars | oposicion_retrogrado | 2022-12-08T05:00:00.000Z | 76.107266° | Mars, Geocentric, ECLIPTRUE, True equinox |
| 14 | mars | oposicion_retrogrado_2025 | 2025-01-15T00:00:00.000Z | 116.653585° | Mars, Geocentric, ECLIPTRUE, True equinox |
| 15 | jupiter | oposicion_retrogrado | 2024-12-07T21:00:00.000Z | 76.255097° | Jupiter, Geocentric, ECLIPTRUE, True equinox |
| 16 | jupiter | snapshot_referencia | 2024-06-21T12:00:00.000Z | 66.121563° | Jupiter, Geocentric, ECLIPTRUE, True equinox |
| 17 | saturn | oposicion_retrogrado | 2024-09-08T04:00:00.000Z | 346.027398° | Saturn, Geocentric, ECLIPTRUE, True equinox |
| 18 | saturn | snapshot_referencia | 2024-06-21T12:00:00.000Z | 349.368676° | Saturn, Geocentric, ECLIPTRUE, True equinox |
| 19 | uranus | oposicion_retrogrado | 2024-11-17T00:00:00.000Z | 55.245678° | Uranus, Geocentric, ECLIPTRUE, True equinox |
| 20 | uranus | snapshot_referencia | 2024-06-21T12:00:00.000Z | 55.267092° | Uranus, Geocentric, ECLIPTRUE, True equinox |
| 21 | neptune | oposicion_retrogrado | 2024-09-21T00:00:00.000Z | 358.518719° | Neptune, Geocentric, ECLIPTRUE, True equinox |
| 22 | neptune | snapshot_referencia | 2024-06-21T12:00:00.000Z | 359.902664° | Neptune, Geocentric, ECLIPTRUE, True equinox |
| 23 | pluto | oposicion_retrogrado | 2024-07-23T00:00:00.000Z | 300.875627° | Pluto, Geocentric, ECLIPTRUE, True equinox |
| 24 | pluto | entrada_acuario | 2024-11-19T20:00:00.000Z | 299.999169° | Pluto, Geocentric, ECLIPTRUE, True equinox |

---

## Instrucciones de verificación

1. Acceder a https://ssd.jpl.nasa.gov/horizons/app.html#/
2. Para cada fixture 6-24:
   - Seleccionar **Ephemeris Type**: OBSERVER
   - **Target Body**: `{body} [Geocenter]`
   - **Observer Location**: `Geocentric [500@399]`
   - **Time Span**: la fecha/hora UTC indicada en el fixture
   - **Table Settings**:
     - Ecliptic: `ECLIPTRUE (True ecliptic of date)`
     - Reference Frame: `True equinox of date`
     - Aberration: `Astometric`
   - **Quantity**: 31 (Observed ecliptic longitude)
   - Ejecutar consulta y registrar la longitud eclíptica
3. Comparar: Δ = |obtenido_JPL − obtenido_AE|
4. Si Δ ≤ 0.02° (1.2 arcmin) → **PASS**. Si no → **FAIL**.

---

## Paquete JSON

El archivo completo con los 24 fixtures en formato máquina está disponible en:
`documentacion/fase-2a/fixtures-phase-2a.json`

Contiene para cada fixture: body, iso, phase, expected, obtained, delta_deg, delta_arcmin, tolerance, status, coord_system, center, aberration, source, source_url, jpl_query.

---

## Nota metodológica

- **NO se certifica precisión sub-0.0003° para los 10 cuerpos.** Solo el Sol tiene certificación externa (5 fixtures USNO, Δ ≤ 0.017 arcmin).
- Los otros 9 cuerpos están en estado **PENDIENTE_JPL**.
- Para cerrar la auditoría, se requieren los 19 valores esperados de JPL Horizons.
- La tolerancia exigida por la Constitución (REGLA 2) es Δ ≤ 1.2 arcmin = 0.02°.