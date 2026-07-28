# JPL HORIZONS FIXTURE PACK — Auditoría Fase 2A COMPLETA

**Generado**: 2026-07-28T19:47 UTC  
**Engine**: astronomy-engine@2.1.19:planetary@2a  
**Propósito**: Proporcionar los 25 fixtures astronómicos (24 existentes + 1 faltante identificado) con consultas JPL Horizons reproducibles para verificación externa.

---

## RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Fixtures totales requeridos** | 25 |
| **Fixtures actuales** | 24 |
| **Fixtures USNO (verificados PASS)** | 5 |
| **Fixtures JPL (pendientes verificación)** | 19 |
| **Fixture faltante** | 1 (Mercury cuarta estación) |
| **Cobertura de cuerpos** | 10/10 (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) |

---

## CONFIGURACIÓN JPL HORIZONS ESTÁNDAR

Toda consulta DEBE usar parámetros idénticos para garantizar comparabilidad:

| Parámetro | Valor | Notas |
|-----------|-------|-------|
| **Ephemeris Type** | OBSERVER | Para observaciones geocéntricas |
| **Target Body** | {body} [Geocenter] | Cuerpo específico del fixture |
| **Observer Location** | Geocentric [500@399] | Equivalente a código JPL para Tierra |
| **Table Settings → Ecliptic** | ECLIPTRUE | True ecliptic of date (aparente) |
| **Reference Frame** | True equinox of date | Coordenadas en equinoccio verdadero del instante |
| **Aberration** | Astometric | Aberración estelar aplicada (como en Astronomy.GeoVector(..., true)) |
| **Units** | degrees | Grados, no radianes |
| **Quantities** | 31 | Observed ecliptic longitude |
| **Web Interface** | https://ssd.jpl.nasa.gov/horizons/app.html#/ | Interfaz interactiva |
| **Telnet** | telnet horizons.jpl.nasa.gov 6775 | Acceso legacy vía telnet |
| **REST API** | https://ssd-api.jpl.nasa.gov/horizons.api | API programático |

---

## FIXTURES 1-5: USNO SOLSTICIOS/EQUINOCCIOS (VERIFICADOS ✅)

Estos 5 fixtures tienen valor esperado EXACTO porque en el instante preciso del solsticio/equinoccio el Sol está **por definición** en esa longitud eclíptica en true equinox of date.

**Fuente oficial**: https://aa.usno.navy.mil/data/docs/EarthSeasons.php

### Fixture #1: Sun — Equinoccio Marzo 2024
```json
{
  "id": "sun_001",
  "body": "sun",
  "iso": "2024-03-20T03:06:00.000Z",
  "phase": "equinoccio_marzo",
  "expected": 0.0,
  "obtained": 359.9997474891021,
  "delta_deg": 0.00025251089789435355,
  "delta_arcmin": 0.015150653873661213,
  "tolerance_deg": 0.02,
  "tolerance_arcmin": 1.2,
  "status": "PASS",
  "coord_system": "True ecliptic of date (Astronomy.Ecliptic + GeoVector with aberration=true)",
  "center": "Geocentric (500@399 equivalent)",
  "aberration": "Stellar aberration corrected (GeoVector(..., true))",
  "source": "USNO Earth's Seasons",
  "source_url": "https://aa.usno.navy.mil/data/docs/EarthSeasons.php",
  "usno_date_range": "2024-03-19 to 2024-03-21"
}
```
**Análisis**: Δ = 0.015 arcmin ✅ (bien por debajo del 1.2 arcmin)

### Fixture #2: Sun — Solsticio Junio 2024
```json
{
  "id": "sun_002",
  "body": "sun",
  "iso": "2024-06-20T20:51:00.000Z",
  "phase": "solsticio_junio",
  "expected": 90.0,
  "obtained": 89.9999293357651,
  "delta_deg": 0.00007066423489732188,
  "delta_arcmin": 0.0042398540938393126,
  "tolerance_deg": 0.02,
  "tolerance_arcmin": 1.2,
  "status": "PASS",
  "coord_system": "True ecliptic of date",
  "center": "Geocentric",
  "aberration": "Corrected",
  "source": "USNO Earth's Seasons",
  "source_url": "https://aa.usno.navy.mil/data/docs/EarthSeasons.php"
}
```
**Análisis**: Δ = 0.004 arcmin ✅ (excelente)

### Fixture #3: Sun — Equinoccio Septiembre 2024
```json
{
  "id": "sun_003",
  "body": "sun",
  "iso": "2024-09-22T12:44:00.000Z",
  "phase": "equinoccio_septiembre",
  "expected": 180.0,
  "obtained": 180.00003150288694,
  "delta_deg": 0.00003150288694087067,
  "delta_arcmin": 0.00189017321645224,
  "tolerance_deg": 0.02,
  "tolerance_arcmin": 1.2,
  "status": "PASS",
  "source": "USNO Earth's Seasons",
  "source_url": "https://aa.usno.navy.mil/data/docs/EarthSeasons.php"
}
```
**Análisis**: Δ = 0.002 arcmin ✅ (precisión excepcional)

### Fixture #4: Sun — Solsticio Diciembre 2024
```json
{
  "id": "sun_004",
  "body": "sun",
  "iso": "2024-12-21T09:20:00.000Z",
  "phase": "solsticio_diciembre",
  "expected": 270.0,
  "obtained": 269.99987579865683,
  "delta_deg": 0.00012420134316926124,
  "delta_arcmin": 0.007452080590155674,
  "tolerance_deg": 0.02,
  "tolerance_arcmin": 1.2,
  "status": "PASS",
  "source": "USNO Earth's Seasons",
  "source_url": "https://aa.usno.navy.mil/data/docs/EarthSeasons.php"
}
```
**Análisis**: Δ = 0.007 arcmin ✅

### Fixture #5: Sun — Equinoccio Marzo 2025
```json
{
  "id": "sun_005",
  "body": "sun",
  "iso": "2025-03-20T09:01:00.000Z",
  "phase": "equinoccio_marzo",
  "expected": 0.0,
  "obtained": 359.9997161891058,
  "delta_deg": 0.0002838108941887185,
  "delta_arcmin": 0.01702865365132311,
  "tolerance_deg": 0.02,
  "tolerance_arcmin": 1.2,
  "status": "PASS",
  "source": "USNO Earth's Seasons",
  "source_url": "https://aa.usno.navy.mil/data/docs/EarthSeasons.php"
}
```
**Análisis**: Δ = 0.017 arcmin ✅ (máximo, aún excelente)

**RESULTADO GENERAL FIXTURES 1-5**: 5/5 PASS. Δ promedio = 0.0091 arcmin. **Precisión del modelo APROBADA**.

---

## FIXTURES 6-24: CUERPOS CON CONSULTA JPL DOCUMENTADA (PENDIENTE_JPL)

Estos 19 fixtures tienen `expected = null`. La columna "Obtenido (AE)" contiene el valor calculado por astronomy-engine.

**Para cerrar la auditoría**, se debe ejecutar la consulta JPL Horizons indicada, registrar la longitud eclíptica de JPL, y comparar Δ.

### Tabla Maestra de Fixtures Pendientes JPL

| # | Cuerpo | Fecha UTC | Fase | AE Obtenido | JPL Esperado | Δ (°) | Δ (arcmin) | Estado |
|---|--------|-----------|------|------------|--------------|-------|-----------|--------|
| 6 | moon | 2024-06-21T12:00:00Z | snapshot_referencia | 263.7444° | ? | ? | ? | PENDIENTE_JPL |
| 7 | moon | 2024-03-20T03:06:00Z | equinoccio_marzo_2024 | 123.8156° | ? | ? | ? | PENDIENTE_JPL |
| 8 | mercury | 2024-12-06T00:00:00Z | estacion_retrograda | 254.5822° | ? | ? | ? | PENDIENTE_JPL |
| 9 | mercury | 2024-12-15T21:00:00Z | post_estacion_directa | 246.3962° | ? | ? | ? | PENDIENTE_JPL |
| 10 | mercury | 2024-12-25T00:00:00Z | post_estacion_directa_estable | 251.7227° | ? | ? | ? | PENDIENTE_JPL |
| 11 | venus | 2024-06-21T12:00:00Z | snapshot_referencia | 95.2036° | ? | ? | ? | PENDIENTE_JPL |
| 12 | venus | 2024-01-01T00:00:00Z | inicio_2024 | 242.6123° | ? | ? | ? | PENDIENTE_JPL |
| 13 | mars | 2022-12-08T05:00:00Z | oposicion_retrogrado | 76.1073° | ? | ? | ? | PENDIENTE_JPL |
| 14 | mars | 2025-01-15T00:00:00Z | oposicion_retrogrado_2025 | 116.6536° | ? | ? | ? | PENDIENTE_JPL |
| 15 | jupiter | 2024-12-07T21:00:00Z | oposicion_retrogrado | 76.2551° | ? | ? | ? | PENDIENTE_JPL |
| 16 | jupiter | 2024-06-21T12:00:00Z | snapshot_referencia | 66.1216° | ? | ? | ? | PENDIENTE_JPL |
| 17 | saturn | 2024-09-08T04:00:00Z | oposicion_retrogrado | 346.0274° | ? | ? | ? | PENDIENTE_JPL |
| 18 | saturn | 2024-06-21T12:00:00Z | snapshot_referencia | 349.3687° | ? | ? | ? | PENDIENTE_JPL |
| 19 | uranus | 2024-11-17T00:00:00Z | oposicion_retrogrado | 55.2457° | ? | ? | ? | PENDIENTE_JPL |
| 20 | uranus | 2024-06-21T12:00:00Z | snapshot_referencia | 55.2671° | ? | ? | ? | PENDIENTE_JPL |
| 21 | neptune | 2024-09-21T00:00:00Z | oposicion_retrogrado | 358.5187° | ? | ? | ? | PENDIENTE_JPL |
| 22 | neptune | 2024-06-21T12:00:00Z | snapshot_referencia | 359.9027° | ? | ? | ? | PENDIENTE_JPL |
| 23 | pluto | 2024-07-23T00:00:00Z | oposicion_retrogrado | 300.8756° | ? | ? | ? | PENDIENTE_JPL |
| 24 | pluto | 2024-11-19T20:00:00Z | entrada_acuario | 299.9992° | ? | ? | ? | PENDIENTE_JPL |

---

## FIXTURE #25: MERCURY CUARTA ESTACIÓN (FALTANTE — A CREAR)

**Hallazgo crítico**: Los documentos de especificación indican que Mercury debe tener **4 fixtures** pero actualmente hay solo **3**.

### Justificación de la Cuarta Estación

Según la cronología de Mercurio (Diciembre 2024) documentada en AUDITORIA_V3_CORREGIDA.md:

| Evento | Fecha | Descripción |
|--------|-------|-------------|
| Estación Retrógrada | 2024-11-25T23:42:00Z | Inicio de retrogradación |
| Centro Retrógrado | 2024-12-05T21:00:00Z | Máxima velocidad retrógrada (–1.38°/día) |
| Estación Directa | 2024-12-15T18:56:00Z | Fin de retrogradación |
| Post-Estación | 2024-12-15T21:00:00Z | Ya cubierto (fixture #9) |

**PROPUESTA**: Agregar fixture #25 como **Estación Retrógrada** (inicio de retrogradación):

```json
{
  "id": "mercury_004",
  "body": "mercury",
  "iso": "2024-11-25T23:42:00.000Z",
  "phase": "estacion_retrograda_inicio",
  "expected": null,
  "obtained": "PENDIENTE_CALCULO",
  "delta_deg": 0,
  "delta_arcmin": 0,
  "tolerance_deg": 0.02,
  "tolerance_arcmin": 1.2,
  "status": "PENDIENTE_JPL",
  "coord_system": "True ecliptic of date",
  "center": "Geocentric",
  "aberration": "Corrected",
  "source": "JPL_HORIZONS_PENDIENTE",
  "source_url": "https://ssd.jpl.nasa.gov/horizons/app.html#/",
  "jpl_query": "Mercury, Geocentric, ECLIPTRUE, Astometric, 2024-11-25T23:42:00Z"
}
```

**Notas sobre la cuarta estación**:
- Marca el **inicio** del período retrógrado de Mercurio
- Es crítica para validar la transición de movimiento directo a retrógrado
- Permite probar la ventana de derivación ±1h en condiciones de estación exacta (velocidad ~0°/día)

---

## INSTRUCCIONES DE VERIFICACIÓN

### Paso 1: Acceder a JPL Horizons
1. Ir a https://ssd.jpl.nasa.gov/horizons/app.html#/
2. Aceptar términos (si lo solicita)

### Paso 2: Para cada fixture #6–#25
1. Seleccionar **Ephemeris Type**: `OBSERVER`
2. **Target Body**: `{body} [Geocenter]` (ej: "Moon [Geocenter]")
3. **Observer Location**: `Geocentric [500@399]`
4. **Time Span**: Ingresar fecha/hora UTC del fixture (ej: `2024-06-21 12:00:00`)
5. **Table Settings**:
   - Ecliptic: `ECLIPTRUE (True ecliptic of date)`
   - Reference Frame: `True equinox of date`
   - Aberration: `Astometric`
6. **Quantities**: Seleccionar `31` (Observed ecliptic longitude)
7. **Units**: `degrees`
8. Hacer clic en "Generate Ephemeris"

### Paso 3: Registrar resultado
1. Copiar el valor de "Obs Ecl Lon" en grados (columna de longitud eclíptica)
2. Comparar contra "Obtenido (AE)" en la tabla
3. Calcular Δ = |JPL − AE|
4. Veredicto: PASS (Δ ≤ 1.2 arcmin), FAIL (Δ > 1.2 arcmin), o VERIFICATION_ERROR

### Paso 4: Actualizar fixture JSON
```json
{
  "expected": <valor_jpl>,
  "delta_deg": <delta_en_grados>,
  "delta_arcmin": <delta_en_arcmin>,
  "status": "PASS" | "FAIL"
}
```

---

## PAQUETE JSON COMPLETO

El archivo `documentacion/fase-2a/fixtures-phase-2a.json` contiene los 24 fixtures actuales. Tras la verificación JPL, será actualizado a 25 fixtures completos.

**Ubicación**: `documentacion/fase-2a/fixtures-phase-2a.json`

**Formato**: JSON array con metadatos completos para cada fixture, incluyendo fuentes exactas y consultas reproducibles.

---

## NOTAS FINALES

- **NO se certifica precisión sub-0.0003°** para los 10 cuerpos. Solo el Sol tiene certificación externa (5 fixtures USNO).
- Los otros 9 cuerpos están en estado **PENDIENTE_JPL**.
- Para cerrar la auditoría, se requieren los 19 valores esperados de JPL Horizons (fixtures #6–#24) + 1 nuevo fixture de Mercury (fixture #25).
- La tolerancia exigida es Δ ≤ 1.2 arcmin = 0.02° (Constitución, REGLA 2).
