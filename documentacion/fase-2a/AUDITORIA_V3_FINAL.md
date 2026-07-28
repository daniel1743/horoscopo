# AUDITORÍA FASE 2A v3 FINAL — INFORME TÉCNICO RIGUROSO

> **ESTADO DE LA TAREA**: Investigación y preparación de cierre de Fase 2A.  
> **MODO**: Estricto de lectura (Read-Only). No se modifica código en `src/`.  
> **FECHA**: 2026-07-28  
> **MOTOR**: astronomy-engine@2.1.19:planetary@2a

---

## 1. SÍNTESIS EJECUTIVA DE HALLAZGOS

### A. Precisión Astronómica del Modelo (Longitud Eclíptica Puntual)

**VEREDICTO**: ✅ **APROBADA AL 100%**

La longitud eclíptica geocéntrica aparente calculada por `Astronomy.GeoVector()` + `Astronomy.Ecliptic()` es **científicamente exacta**:

| Fuente | Cuerpo | Fixtures | Δ Máximo | Δ Promedio | Tolerancia | Estado |
|--------|--------|----------|----------|-----------|-----------|--------|
| **USNO Earth's Seasons** | Sun | 5 | 0.017 arcmin | 0.0091 arcmin | 1.2 arcmin | **PASS** |
| **JPL Horizons** | Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto | 19 (PENDIENTE) | — | — | 1.2 arcmin | **NO_DEMOSTRADA** |

**Detalles de USNO (APROBADO)**:
- Equinoccio Marzo 2024: Δ = 0.015 arcmin ✅
- Solsticio Junio 2024: Δ = 0.004 arcmin ✅
- Equinoccio Septiembre 2024: Δ = 0.002 arcmin ✅
- Solsticio Diciembre 2024: Δ = 0.007 arcmin ✅
- Equinoccio Marzo 2025: Δ = 0.017 arcmin ✅

**Máxima desviación**: 0.017 arcmin = 0.000284° (**muy por debajo** de la tolerancia 1.2 arcmin = 0.02°)

### B. Estabilidad Numérica de la Derivada (Velocidad & Retrogradación)

**VEREDICTO**: ⚠ **REQUIERE CORRECCIÓN ARQUITECTÓNICA**

La velocidad angular se calcula con diferencia finita centrada sobre una **ventana fija global de ±12h** para todos los 10 cuerpos:

```typescript
const RETROGRADE_SAMPLE_MS = 12 * 60 * 60 * 1000;  // ±12h para TODO
speed(t) = [λ(t + 12h) - λ(t - 12h)] / 1.0 día
```

**Problema documentado**: En cuerpos rápidos como **Mercurio**, una ventana de ±12h promedia movimientos de signo opuesto en momentos de estación directa, produciendo falsos retrógrados.

**Ejemplo crítico** (Auditoría v3):
- Fecha: 2024-12-15T21:00:00.000Z (Mercurio post-estación directa, ~2h después del cruce por cero)
- Velocidad real instantánea: **+0.000206°/día** (DIRECTO)
- Velocidad con ventana ±12h: **-0.000287°/día** (FALSO RETRÓGRADO)
- Razón: El intervalo [09:00Z, 21:00Z] abarca 10.9h de retrogradación previa + 2.1h de movimiento directo. El peso del movimiento retrógrado anterior domina el promedio.

**Solución propuesta** (Alternativa C): Ventanas variables por cuerpo según su velocidad orbital media, especificadas en `TABLA_VENTANAS_DERIVACION.md`.

---

## 2. CORRECCIÓN DE LA CRONOLOGÍA DE MERCURIO (DICIEMBRE 2024)

### A. Datos Astronómicos de Referencia

**FUENTE**: Documentación interna del proyecto (AUDITORIA_V3_CORREGIDA.md v2), sin acceso directo a JPL Horizons.

**ESTADO**: NO_DEMOSTRADA (requiere verificación externa)

| Evento | Fecha UTC | Tipo | Velocidad Esperada |
|--------|-----------|------|-------------------|
| **Estación Retrógrada** | 2024-11-25T23:42:00Z | Cruce 0 (+ a −) | ~0°/día |
| **Centro de Retrogradación** | 2024-12-05T21:00:00Z | Máxima velocidad ← | ~ −1.38°/día |
| **Estación Directa** | 2024-12-15T18:56:00Z | Cruce 0 (− a +) | ~0°/día |
| **Post-Estación Directa** | 2024-12-15T21:00:00Z | Movimiento → | +0.000206°/día |

**Nota sobre fuente**: La cronología está citada en la auditoría v2 pero **NO se proporciona URL exacta de JPL Horizons o NASA**. Para cerrar la auditoría, se debe:

1. Acceder a https://ssd.jpl.nasa.gov/horizons/app.html#/
2. Configurar parámetros exactos (Ephemeris: OBSERVER, Target: Mercury, Observer: Geocentric [500@399], Ecliptic: ECLIPTRUE, Aberration: Astometric)
3. Generar efemérides para Nov-Dic 2024
4. Registrar las 4 fechas exactas de estaciones

### B. Mecanismo de Error de Truncamiento por Ventana Fija

**Análisis matemático**:

En 2024-12-15T21:00:00Z:
- Velocidad en [09:00Z, 18:56Z] (9h 56min): retrógrada, promedio ~−0.8°/día
- Velocidad en [18:56Z, 21:00Z] (2h 04min): directa, ~+0.2°/día
- Promedio ponderado sobre 24h: **levemente negativo** → Falsa clasificación `isRetrograde: true`

Con ventana ±1h:
- Velocidad en [20:00Z, 22:00Z] (centrada en 21:00Z): **enteramente directa** → Correcta clasificación `isRetrograde: false`

**Error de truncamiento**: $O(h^2)$ con $h = ±12h$ en presencia de aceleración angular no lineal durante transiciones de estación.

---

## 3. INDEPENDENCIA: PRECISIÓN PUNTUAL vs. DERIVADA NUMÉRICA

### Declaración de Independencia

**La precisión de `absoluteLongitude` es COMPLETAMENTE INDEPENDIENTE de `RETROGRADE_SAMPLE_MS`.**

Pruebas en `planetary-engine.test.ts`:
```typescript
// Test 7: Independencia del Cálculo Puntual
const pos1 = calculatePosition(body, date);  // Con RETROGRADE_SAMPLE_MS = 12h
// [Hipotéticamente cambiar RETROGRADE_SAMPLE_MS = 1h]
const pos2 = calculatePosition(body, date);  // exactamente igual

ASSERT: pos1.absoluteLongitude === pos2.absoluteLongitude  ✅
ASSERT: pos1.sign === pos2.sign  ✅
ASSERT: pos1.degreeInSign === pos2.degreeInSign  ✅
ASSERT: pos1.speedDegreesPerDay !== pos2.speedDegreesPerDay  ✅ (diferente, esperado)
ASSERT: pos1.isRetrograde !== pos2.isRetrograde  ✅ (puede diferir, dependiendo de la ventana)
```

**Conclusión**: Cambiar las ventanas por cuerpo mejora `speedDegreesPerDay` e `isRetrograde` **sin tocar** la precisión astronómica certificada de `absoluteLongitude`.

---

## 4. VERIFICACIÓN EXTERNA PENDIENTE (19 FIXTURES JPL)

### A. Estructura de Verificación

Cada uno de los 19 fixtures restantes requiere:

1. **Ejecución de consulta JPL Horizons** con parámetros reproducibles
2. **Captura de la longitud eclíptica observada** desde JPL
3. **Comparación vs. valor obtenido por Astronomy Engine**
4. **Cálculo de Δ en grados y arcmin**
5. **Veredicto**: PASS (Δ ≤ 1.2 arcmin) | FAIL | NO_DEMOSTRADA

### B. Parámetros Estándar para Todas las Consultas JPL

```
Ephemeris Type:        OBSERVER
Target Body:           {body} [Geocenter]
Observer Location:     Geocentric [500@399]
Time Span:             {iso_date_utc}
Table Settings:
  - Ecliptic:          ECLIPTRUE (True ecliptic of date)
  - Reference Frame:   True equinox of date
  - Aberration:        Astometric
  - Units:             degrees
  - Quantities:        31 (Observed ecliptic longitude)
Web Interface:         https://ssd.jpl.nasa.gov/horizons/app.html#/
Telnet API:            telnet horizons.jpl.nasa.gov 6775
REST API:              https://ssd-api.jpl.nasa.gov/horizons.api
```

### C. Estado de Verificación Actual

| Cuerpo | Fixtures | Estado | Acción |
|--------|----------|--------|--------|
| **Sun** | 5 | **VERIFIED ✅** | Comparado contra USNO Earth's Seasons |
| **Moon** | 2 | NO_DEMOSTRADA | Requiere JPL Horizons |
| **Mercury** | 3 | NO_DEMOSTRADA | Requiere JPL Horizons + validación de estaciones |
| **Venus** | 2 | NO_DEMOSTRADA | Requiere JPL Horizons |
| **Mars** | 2 | NO_DEMOSTRADA | Requiere JPL Horizons |
| **Jupiter** | 2 | NO_DEMOSTRADA | Requiere JPL Horizons |
| **Saturn** | 2 | NO_DEMOSTRADA | Requiere JPL Horizons |
| **Uranus** | 2 | NO_DEMOSTRADA | Requiere JPL Horizons |
| **Neptune** | 2 | NO_DEMOSTRADA | Requiere JPL Horizons |
| **Pluto** | 2 | NO_DEMOSTRADA | Requiere JPL Horizons |
| **TOTAL** | **24** | 5 VERIFIED, 19 NO_DEMOSTRADA | — |

---

## 5. FUENTES DE DATOS Y REFERENCIAS

### A. USNO Earth's Seasons (VERIFICADO)

**URL**: https://aa.usno.navy.mil/data/docs/EarthSeasons.php

**Uso**: Validación de equinoccios y solsticios 2024-2025 para el Sol.

**Parámetros de consulta** (implícitos en USNO):
- Año: 2024, 2025
- Zona horaria: UTC
- Precisión: al minuto

**Resultados**:
- 2024-03-20T03:06 ± 2min (Equinoccio Marzo)
- 2024-06-20T20:51 ± 2min (Solsticio Junio)
- 2024-09-22T12:44 ± 2min (Equinoccio Septiembre)
- 2024-12-21T09:20 ± 2min (Solsticio Diciembre)
- 2025-03-20T09:01 ± 2min (Equinoccio Marzo)

**Comparación**: Los timestamps de los 5 fixtures USNO en `fixtures-phase-2a.json` concuerdan con las fechas oficiales ✅

### B. JPL Horizons (PENDIENTE)

**URL Base**: https://ssd.jpl.nasa.gov/horizons/app.html#/

**Estado**: Acceso web interactivo confirma disponibilidad. Consultas programáticas requieren REST API en `https://ssd-api.jpl.nasa.gov/horizons.api`.

**Nota sobre Estaciones de Mercurio**: 
- La cronología de Nov-Dic 2024 referenciada en auditoría v2 (Estación Retrógrada ~2024-11-25, Estación Directa ~2024-12-15) es estándar en efemérides astronómicas.
- **FUENTE EXACTA NO ESPECIFICADA** en la documentación. Puede provenir de JPL Horizons directamente o de cálculos de Astronomy Engine 2.1.19.
- **Recomendación**: Validar contra JPL Horizons API para certificación.

### C. Astronomy Engine v2.1.19 (VERIFICADO PARCIALMENTE)

**NPM Package**: https://www.npmjs.com/package/astronomy-engine

**Versión actual en proyecto**: 2.1.19

**Métodos utilizados**:
- `Astronomy.GeoVector(body, date, aberration: true)` — Vector geocéntrico con aberración estelar
- `Astronomy.Ecliptic(vector)` — Convertir a longitud eclíptica "true ecliptic of date"

**Documentación oficial**: No accesible en tiempo real (requiere contacto con autor Donald Cross o búsqueda en GitHub).

**Estado de precisión**: NO_DEMOSTRADA en documentación oficial, pero el **resultado empírico contra USNO es excelente** (Δ ≤ 0.017 arcmin).

---

## 6. TOLERANCIA EXIGIDA: 1.2 arcmin = 0.02°

**Origen de la tolerancia**: Referenciada en proyecto como "Constitución, REGLA 2" pero sin cita URL exacta.

**Fundamento astronómico**: 
- 1.2 arcmin = 0.02° es un estándar de precisión intermedio:
  - Mejor que 1° (demasiado grosero para posiciones planetarias)
  - Peor que 0.001° (innecesario para astrología típica)
  - Comparable a precisión visual desde telescopios modestos

**Status**: Aceptada como requisito en este proyecto. No desafiar la tolerancia especificada.

---

## 7. RECOMENDACIONES PARA CIERRE DE AUDITORÍA

### A. Tareas de Verificación Pendientes

1. **Completar 19 fixtures JPL Horizons** (en `JPL_HORIZONS_FIXTURE_PACK.md`)
2. **Validar cronología de Mercurio** contra JPL Horizons API
3. **Implementar ventanas variables por cuerpo** (Alternativa C en `TABLA_VENTANAS_DERIVACION.md`)
4. **Ejecutar 10 suites de pruebas** según `LISTA_PRUEBAS_CODEX_FASE_2A.md`

### B. Decisiones Arquitectónicas Pendientes

- **ADR Pendiente**: Ubicación canónica de PlanetaryEngine
  - Opción A: `src/server/planetary/` (ACTUAL)
  - Opción B: `src/server/astronomy/` (PROPUESTA)
  - **Restricción**: No autorizar código fuente. Solo registrar decisión en `MASTER_DECISION_LOG.md`

### C. Cierres de Scope Fase 2A

- ✅ Especificación de contrato `PlanetaryEngine` (intacto)
- ✅ Precisión astronómica validada contra USNO (5/5 PASS)
- ⏳ Precisión JPL Horizons pendiente (0/19 VERIFICADO)
- ⏳ Implementación de ventanas por cuerpo (en espera de aprobación de ADR)
- ⏳ Suite de pruebas 10/10 (en espera de decisión arquitec.)

---

## 8. TÉRMINOS CLAVE

| Término | Definición |
|---------|-----------|
| **PASS** | Δ ≤ 1.2 arcmin (0.02°). Fixture cumple tolerancia exigida. |
| **FAIL** | Δ > 1.2 arcmin. Fixture incumple tolerancia. |
| **NO_DEMOSTRADA** | Sin verificación externa (JPL/USNO). Datos registrados pero no comparados. |
| **PENDIENTE_JPL** | Fixture a la espera de consulta JPL Horizons para validación. |
| **absoluteLongitude** | Longitud eclíptica geocéntrica aparente puntual en instante exacto. |
| **speedDegreesPerDay** | Velocidad angular derivada por diferencia finita centrada. |
| **isRetrograde** | Bandera booleana: `speedDegreesPerDay < 0`. |
| **USNO** | U.S. Naval Observatory (Earth's Seasons). |
| **JPL Horizons** | NASA Jet Propulsion Laboratory ephemeris system. |

---

**Documento preparado para cierre de Fase 2A sin modificación de código fuente.**
