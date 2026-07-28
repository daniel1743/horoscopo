# LISTA DE PRUEBAS MÍNIMAS — Codex Fase 2A

**Propósito**: Enumerar las 10 pruebas mínimas imprescindibles que Codex debe implementar en `src/server/planetary/planetary-engine.test.ts` antes de que la Fase 2B pueda ser aprobada.

**Archivo a modificar**: `src/server/planetary/planetary-engine.test.ts`

---

## PRUEBA 1 — FIXTURES JPL HORIZONS

**Descripción**: Crear `src/server/planetary/__fixtures__/` con ≥20 timestamps verificados contra JPL Horizons para los 10 cuerpos (≥2 por cuerpo). Formato JSON.

**Fixture de ejemplo**:
```json
{
  "body": "mercury",
  "iso": "2024-12-15T21:00:00.000Z",
  "jpl_expected_longitude": 246.396xxx,
  "jpl_query_url": "https://ssd.jpl.nasa.gov/horizons/...",
  "coord_system": "True ecliptic of date",
  "center": "Geocentric [500@399]",
  "aberration": "Astometric"
}
```

**Test**: Para cada fixture, `astronomyPlanetaryEngine.calculatePosition(body, date).absoluteLongitude` debe diferir de `jpl_expected_longitude` en ≤ 0.02° (1.2 arcmin).

**Archivo de referencia**: `JPL_HORIZONS_FIXTURE_PACK.md` con 24 fixtures preconfigurados.

**Estado actual**: ❌ NO EXISTE.

---

## PRUEBA 2 — TEST DIRECTO signedLongitudeDelta

**Descripción**: Agregar 10 casos de test unitario para `signedLongitudeDelta`:

| from | to | expected | Descripción |
|------|----|----------|-------------|
| 10 | 20 | +10 | Movimiento directo simple |
| 20 | 10 | −10 | Movimiento retrógrado simple |
| 350 | 10 | +20 | Cruce 0° en sentido directo |
| 10 | 350 | −20 | Cruce 0° en sentido retrógrado |
| 170 | 190 | +20 | Sin wrap, directo |
| 190 | 170 | −20 | Sin wrap, retrógrado |
| 359 | 1 | +2 | Cruce estrecho directo |
| 1 | 359 | −2 | Cruce estrecho retrógrado |
| 0 | 180 | +180 | Máximo directo |
| 180 | 0 | −180 | Máximo retrógrado |

**Código esperado**: `check("signedLongitudeDelta ${desc}", signedLongitudeDelta(from, to) === expected, ...)`

**Estado actual**: ❌ NO EXISTE. La función es correcta (verificado manualmente 10/10) pero no tiene test.

---

## PRUEBA 3 — TEST DE ESTACIONES RETRÓGRADAS

**Descripción**: Verificar `isRetrograde` en fechas astronómicamente conocidas de inicio/fin de retrogradación para Mercurio, Marte y Júpiter.

**Fechas de referencia**:
- Mercurio: estación retrógrada 2024-12-06 → `isRetrograde = true`
- Mercurio: post-estación directa 2024-12-16 → `isRetrograde = false`
- Mercurio: período retrógrado 2024-12-10 → `isRetrograde = true`
- Marte: oposición 2022-12-08 → `isRetrograde = true`
- Júpiter: oposición 2024-12-07 → `isRetrograde = true`

**Nota**: Estas fechas son aproximadas (sin fixture JPL). Los tests deben marcarse como `INFO` o requerir fixtures JPL para ser `PASS`.

**Estado actual**: ❌ NO EXISTE.

---

## PRUEBA 4 — TEST SIGNO PREVIO CORRECTO

**Descripción**: Corregir el test existente "signo previo" (líneas 58-64) para que verifique `before.sign === expectedPreviousSign`, no solo `degreeInSign ∈ [0,30)`.

**Corrección**:
```typescript
// Actual (INCORRECTO):
check("signo previo ${boundary}",
  before.degreeInSign >= 0 && before.degreeInSign < 30, ...)

// Corregido:
check("signo previo ${boundary}",
  before.sign === ZODIAC_SIGN_ORDER[(index - 1 + 12) % 12] &&
  before.degreeInSign >= 0 && before.degreeInSign < 30, ...)
```

**Estado actual**: ❌ Test tautológico — solo verifica invariante de `longitudeToZodiac`.

---

## PRUEBA 5 — tsx + SCRIPT test EN package.json

**Descripción**:
```bash
npm install --save-dev tsx
```
Agregar a `package.json`:
```json
"scripts": {
  "test": "npx tsx scripts/check-planetary-engine.ts"
}
```

**Estado actual**: ❌ Ni `tsx` ni script `test` existen.

---

## PRUEBA 6 — TEST DE VELOCIDAD CON VENTANAS MÚLTIPLES

**Descripción**: Verificar que la clasificación `isRetrograde` es CONSISTENTE entre diferentes tamaños de ventana (no cambia de signo espuriamente) para Mercurio en fechas alejadas de estaciones.

**Ventanas a probar**: ±1min, ±5min, ±15min, ±30min, ±1h, ±6h, ±12h, ±24h.

**Criterio**: Para una fecha en el centro del período retrógrado (ej. 2024-12-10), TODAS las ventanas deben coincidir en `isRetrograde = true`.

**Estado actual**: ❌ NO EXISTE.

---

## PRUEBA 7 — TEST SOL Y LUNA NUNCA RETRÓGRADOS

**Descripción**: Verificar que `isRetrograde = false` para Sol y Luna en ≥30 fechas distribuidas en diferentes años (2021-2026).

**Implementación**:
```typescript
const dates = [...]; // ≥30 fechas UTC en diferentes años
for (const iso of dates) {
  const d = new Date(iso);
  check("Sol nunca retrógrado en ${iso}",
    !astronomyPlanetaryEngine.calculatePosition("sun", d).isRetrograde, ...);
  check("Luna nunca retrógrada en ${iso}",
    !astronomyPlanetaryEngine.calculatePosition("moon", d).isRetrograde, ...);
}
```

**Estado actual**: ❌ NO EXISTE (el test actual solo tiene 1 fecha snapshot).

---

## PRUEBA 8 — TEST SNAPSHOT COMPLETO CONTRA FIXTURE JPL

**Descripción**: Comparar el snapshot completo (10 cuerpos) contra un fixture JPL precalculado para ≥3 fechas diferentes.

**Fixture requerido**: Archivo JSON con 10 longitudes esperadas por fecha.

**Criterio**: Para cada cuerpo en cada fecha, Δ ≤ 1.2 arcmin.

**Dependencia**: PRUEBA 1 (fixtures JPL).

**Estado actual**: ❌ NO EXISTE.

---

## PRUEBA 9 — TEST DE QUE absoluteLongitude NO DEPENDE DE LA VENTANA

**Descripción**: Verificar que `absoluteLongitude` es idéntico para un mismo cuerpo y fecha independientemente de cómo se calcule (puntual vs dentro de snapshot vs repetido).

**Implementación**:
```typescript
// La posición puntual y la posición dentro del snapshot deben ser idénticas
const pos1 = engine.calculatePosition("mars", date);
const snap = engine.calculateSnapshot(date);
const pos2 = snap.positions.find(p => p.body === "mars")!;
check("absoluteLongitude es determinista puntual vs snapshot",
  pos1.absoluteLongitude === pos2.absoluteLongitude, ...);
```

**Estado actual**: ⚠️ El test de determinismo existe para `JSON.stringify(first) === JSON.stringify(second)` pero no compara puntual vs snapshot.

---

## PRUEBA 10 — TEST DE ESTABILIDAD NUMÉRICA PARA PLANETAS LENTOS

**Descripción**: Verificar que para planetas exteriores (Urano, Neptuno, Plutón), la velocidad calculada con ventana ±1h no produce valores anómalos (NaN, Infinity, o signo incorrecto comparado con ±24h).

**Implementación**:
```typescript
for (const body of ["uranus", "neptune", "pluto"]) {
  const speed1h = computeSpeed(body, date, 1 * 3600_000);
  const speed24h = computeSpeed(body, date, 24 * 3600_000);
  check("${body} speed ±1h es finita", Number.isFinite(speed1h), ...);
  check("${body} speed ±1h y ±24h mismo signo", 
    (speed1h < 0) === (speed24h < 0), ...);
}
```

**Estado actual**: ❌ NO EXISTE.

---

## RESUMEN

| # | Prueba | Prioridad | Dependencia |
|---|--------|-----------|-------------|
| 1 | Fixtures JPL | CRÍTICA | Ninguna (generar desde JPL) |
| 2 | signedLongitudeDelta directo | ALTA | Ninguna |
| 3 | Estaciones retrógradas | ALTA | Fixtures JPL (para ser PASS) |
| 4 | Signo previo corregido | ALTA | Ninguna |
| 5 | tsx + script test | ALTA | Ninguna |
| 6 | Ventanas múltiples | MEDIA | Ninguna |
| 7 | Sol/Luna nunca retrógrados | MEDIA | Ninguna |
| 8 | Snapshot vs JPL | CRÍTICA | Prueba 1 |
| 9 | absoluteLongitude determinista | MEDIA | Ninguna |
| 10 | Estabilidad numérica lentos | MEDIA | Ninguna |

---

## CRITERIO DE APROBACIÓN FASE 2B

La Fase 2B NO se aprobará hasta que:
1. Las 10 pruebas estén implementadas en `planetary-engine.test.ts`
2. `npx tsx scripts/check-planetary-engine.ts` ejecute las 10 pruebas con exit code 0
3. Las pruebas 1 y 8 requieren fixtures JPL (PENDIENTE_JPL hasta que se ejecuten las consultas)

---

*Este documento es parte del paquete técnico Fase 2A.*
*Archivos relacionados: `AUDITORIA_V3_CORREGIDA.md`, `JPL_HORIZONS_FIXTURE_PACK.md`, `TABLA_VENTANAS_DERIVACION.md`*