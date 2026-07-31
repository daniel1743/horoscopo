# PAQUETE DE IMPLEMENTACIÓN CODEX — FASE 2A

> **Objetivo**: Implementar las correcciones de Fase 2A en el motor planetario y de aspectos.
> **Estado**: LISTO_PARA_CODEX
> **Revisión**: Opus auditor (2026-07-28)

---

## OBJETIVO

Codex debe implementar las siguientes correcciones en el motor planetario y de aspectos del proyecto Astral:

1. Corregir el bug de fase en `aspect-engine.ts`
2. Implementar ventanas variables por cuerpo en `astronomy-planetary-engine.ts`
3. Agregar fixture 25 de Mercurio al JSON de fixtures
4. Implementar los 10 tests especificados en LISTA_PRUEBAS_CODEX_FASE_2A

---

## ARCHIVOS QUE PUEDEN MODIFICARSE

### Permitidos (con cambios específicos):

1. `src/server/aspects/aspect-engine.ts` — corregir fórmula de fase
2. `src/server/aspects/aspect-engine.test.ts` — actualizar tests afectados
3. `src/server/planetary/astronomy-planetary-engine.ts` — implementar ventanas por cuerpo
4. `src/server/planetary/planetary-engine.test.ts` — agregar tests
5. `documentacion/fase-2a/fixtures-phase-2a.json` — agregar fixture 25
6. `documentacion/fase-2a/LISTA_PRUEBAS_CODEX_FASE_2A.md` — (solo lectura, referencia)

### Prohibidos (NO tocar):

- `src/server/planetary/planetary-engine.ts` (contrato inamovible)
- `package.json` (sin cambios)
- `package-lock.json` (sin cambios)
- Cualquier archivo en `src/server/astronomy/` (no existe aún)
- Cualquier archivo en `src/server/moon/` (no toca)
- Archivos de documentación excepto `documentacion/fase-2a/`
- Archivos de `src/` que no estén en la lista permitida

---

## ALGORITMO EXACTO: CORRECCIÓN DE FASE (aspect-engine.ts)

### Problema

En `calculateAspectPhase()`, la línea:

```typescript
const direction = signedError * relativeSpeed;
```

produce el signo invertido respecto a lo que requiere la geometría.

### Corrección

Cambiar a:

```typescript
const direction = -signedError * relativeSpeed;
```

### Justificación

`signedError` es la distancia firmada DESDE el ángulo relativo HACIA el ángulo exacto. Cuando un planeta se aproxima al aspecto, `signedError` y `relativeSpeed` tienen signos que multiplicados dan positivo, pero geométricamente el aspecto se está APROXIMANDO, no separando.

La corrección `-(signedError) * relativeSpeed` inverte el signo para que:
- direction < 0 → applying (aproximándose)
- direction > 0 → separating (alejándose)
- |direction| ≤ ε → stationary

### Verificación

Caso de prueba: Moon a 359.85°, vel=+14.4, Sun a 0°
- Antes de 1 minuto: Moon a 359.87°, separación 0.13° < 0.15° → APROXIMÁNDOSE
- Original: direction = (-0.15) × (-14.4) = +2.16 → "separating" ❌
- Corregido: direction = -(-0.15) × (-14.4) = -2.16 → "applying" ✅

---

## ALGORITMO EXACTO: VENTANAS POR CUERPO (astronomy-planetary-engine.ts)

### Reemplazar

```typescript
const RETROGRADE_SAMPLE_MS = 12 * 60 * 60 * 1000;
```

### Por

```typescript
const RETROGRADE_SAMPLE_MS_BY_BODY: Record<PlanetaryBody, number> = {
  sun: 6 * 60 * 60 * 1000,      // ±6h
  moon: 1 * 60 * 60 * 1000,     // ±1h
  mercury: 1 * 60 * 60 * 1000,  // ±1h
  venus: 2 * 60 * 60 * 1000,    // ±2h
  mars: 3 * 60 * 60 * 1000,     // ±3h
  jupiter: 6 * 60 * 60 * 1000,  // ±6h
  saturn: 6 * 60 * 60 * 1000,   // ±6h
  uranus: 12 * 60 * 60 * 1000,  // ±12h
  neptune: 12 * 60 * 60 * 1000, // ±12h
  pluto: 12 * 60 * 60 * 1000,   // ±12h
};
```

### Actualizar `calculateSpeedDegreesPerDay`

```typescript
function calculateSpeedDegreesPerDay(body: PlanetaryBody, date: Date): number {
  const sampleMs = RETROGRADE_SAMPLE_MS_BY_BODY[body];
  const before = new Date(date.getTime() - sampleMs);
  const after = new Date(date.getTime() + sampleMs);
  const delta = signedLongitudeDelta(
    calculateLongitude(body, before),
    calculateLongitude(body, after),
  );
  const days = (after.getTime() - before.getTime()) / 86_400_000;
  return delta / days;
}
```

### Verificación crítica

Mercurio 2024-12-15T21:00Z:
- Con ±1h: speed = +0.000203°/día → isRetrograde = false ✅
- Con ±12h: speed = -0.000287°/día → isRetrograde = true ❌

---

## FIXTURES A INTEGRAR

### Fixture #25: Mercurio Estación Retrógrada

Agregar a `documentacion/fase-2a/fixtures-phase-2a.json`:

```json
{
  "id": "mercury_004",
  "body": "mercury",
  "iso": "2024-11-25T23:42:00.000Z",
  "phase": "estacion_retrograda",
  "expected": null,
  "obtained": 262.670407,
  "delta_deg": 0,
  "delta_arcmin": 0,
  "tolerance_deg": 0.02,
  "tolerance_arcmin": 1.2,
  "status": "PENDIENTE_JPL",
  "coord_system": "True ecliptic of date",
  "center": "Geocentric",
  "aberration": "Corrected",
  "source": "Astronomy Engine (JPL DE441 proxy)",
  "source_url": "https://github.com/donkirkby/astronomy-engine"
}
```

### Actualizar conteos

- `total_fixtures`: 25 (de 24)
- `pendiente_jpl_count`: 20 (de 19)
- `pass_count`: 5 (sin cambio)

---

## PRUEBAS OBLIGATORIAS

Las 10 pruebas detalladas en `LISTA_PRUEBAS_CODEX_FASE_2A.md` deben implementarse en `planetary-engine.test.ts`:

1. Precisión externa (25 fixtures)
2. Coherencia zodiacal (12 límites)
3. `signedLongitudeDelta` wrap-around (10 casos)
4. Mercurio post-estación (2024-12-15T21:00Z)
5. Sol y Luna nunca retrógrados (30+ fechas)
6. Retrogradación en oposiciones (6 planetas)
7. Independencia de longitud vs ventana
8. Estabilidad Neptuno/Plutón
9. Determinismo del snapshot
10. Script npm funcional

---

## ARCHIVOS PROHIBIDOS

No modificar bajo ninguna circunstancia:

- `src/server/planetary/planetary-engine.ts` (contrato)
- `package.json`
- `package-lock.json`
- `src/server/astronomy/` (si existe)
- `src/server/moon/`
- Archivos de `src/` que no estén explícitamente mencionados arriba
- Cualquier archivo fuera de `src/server/planetary/`, `src/server/aspects/`, y `documentacion/fase-2a/`

---

## CRITERIOS DE ACEPTACIÓN

1. ✅ `npm run test` pasa 100% (todos los tests de planetary-engine y aspect-engine)
2. ✅ Mercury 2024-12-15T21:00Z retorna `isRetrograde: false`
3. ✅ Moon 359.85° con vel=14.4 retorna `phase: "applying"` para conjunction
4. ✅ Moon 0.15° con vel=14.4 retorna `phase: "applying"` para conjunction
5. ✅ 25 fixtures en JSON (5 PASS + 20 PENDIENTE_JPL)
6. ✅ `absoluteLongitude` es idéntico para cualquier ventana (independencia verificada)
7. ✅ No hay cambios en `planetary-engine.ts` (contrato inalterado)
8. ✅ No hay cambios en `package.json` ni `package-lock.json`
9. ✅ No se crearon archivos fuera de los permitidos

---

## COMANDOS DE VALIDACIÓN

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\horoscopo"
npm run test
```

Verificar:
- 0 failures
- Todos los tests de fase (applying/separating) verdes
- Test de Mercurio post-estación verde
- Test de cruce 359→0 verde

---

## DEFINITION OF DONE

1. Todos los criterios de aceptación pasados
2. `git diff --stat` muestra cambios SOLO en:
   - `src/server/aspects/aspect-engine.ts`
   - `src/server/aspects/aspect-engine.test.ts`
   - `src/server/planetary/astronomy-planetary-engine.ts`
   - `src/server/planetary/planetary-engine.test.ts`
   - `documentacion/fase-2a/fixtures-phase-2a.json`
3. `git diff --check` no reporta trailing whitespace
4. No hay cambios en `src/server/planetary/planetary-engine.ts`
5. No hay cambios en `package.json` ni `package-lock.json`

---

## INSTRUCCIÓN FINAL

**NO ampliar el alcance de esta tarea.** Codex debe implementar SOLO lo especificado arriba. No crear nuevos archivos, no modificar documentación no mencionada, no iniciar AspectEngine.

Si encuentra un problema no previsto, detenerse y reportar. No improvisar soluciones.
