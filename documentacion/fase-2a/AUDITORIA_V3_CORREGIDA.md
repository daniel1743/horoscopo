# AUDITORÍA FASE 2A — INFORME FINAL CORREGIDO

**Versión**: 3.0
**Fecha**: 2026-07-28
**Script reproducible**: `scripts/audit-phase-2a-v3.ts`
**Paquete técnico**: `documentacion/fase-2a/`

---

## ALCANCE

Esta auditoría responde expresamente a los 4 puntos pendientes de la Fase 2A. No repite validaciones ya confirmadas (build, ESLint, separación cliente/servidor, no regresión de MoonEngine).

**Principio rector**: Si una comprobación no puede ejecutarse con datos externos exactos, se declara NO_DEMOSTRADA. No se otorgan PASS por inferencia.

---

## PUNTO 1: PRECISIÓN ASTRONÓMICA EXTERNA

### 1A. Sistema de coordenadas

| Propiedad | astronomy-engine | Fixtures externos |
|-----------|-----------------|-------------------|
| Sistema eclíptico | True ecliptic of date (Astronomy.Ecliptic) | True equinox of date (USNO) |
| Centro | Geocéntrico (GeoVector) | Geocéntrico [500@399] |
| Aberración | Corregida (GeoVector(..., true)) | Astrometric |
| Compatibilidad | ✅ Sí — astronomy-engine y USNO usan true equinox of date | — |

### 1B. Fixtures EXACTOS verificables (USNO)

ÚNICAMENTE 5 fixtures tienen valor esperado EXACTO. En el instante del solsticio/equinoccio, la longitud eclíptica del Sol es 0°, 90°, 180° o 270° en true equinox of date por definición.

| # | Cuerpo | ISO UTC | Esperado | Obtenido (AE) | Δ (°) | Δ (arcmin) | Fuente |
|---|--------|---------|----------|---------------|-------|------------|--------|
| 1 | sun | 2024-03-20T03:06Z | 0.0° | 359.999747° | 0.000253 | 0.015 | USNO |
| 2 | sun | 2024-06-20T20:51Z | 90.0° | 89.999929° | 0.000071 | 0.004 | USNO |
| 3 | sun | 2024-09-22T12:44Z | 180.0° | 180.000032° | 0.000032 | 0.002 | USNO |
| 4 | sun | 2024-12-21T09:20Z | 270.0° | 269.999876° | 0.000124 | 0.007 | USNO |
| 5 | sun | 2025-03-20T09:01Z | 0.0° | 359.999716° | 0.000284 | 0.017 | USNO |

**Tolerancia exigida (Constitución REGLA 2)**: Δ ≤ 1.2 arcmin = 0.02°.

**Resultado para el Sol**: **5/5 PASS**. Δ máxima = **0.017 arcmin** (muy por debajo de 1.2 arcmin). astronomy-engine cumple la tolerancia constitucional para el Sol.

### 1C. Cuerpos sin fixture exacto — NO_DEMOSTRADA

Para los 9 cuerpos restantes (Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto), **NO se dispone de valores esperados EXACTOS** en true ecliptic of date.

**No se certifica precisión alguna para estos cuerpos.** Cualquier afirmación de Δ < 0.02° para estos cuerpos sería inferencia no respaldada por datos externos.

Se han preparado 19 fixtures con timestamps astronómicamente relevantes (estaciones, oposiciones, snapshots) y consultas JPL Horizons reproducibles. Cada fixture tiene `expected = null` y `status = PENDIENTE_JPL`.

**Para cerrar la auditoría Fase 2A**, se debe:
1. Ejecutar las 19 consultas JPL Horizons documentadas en `JPL_HORIZONS_FIXTURE_PACK.md`
2. Registrar la longitud eclíptica de JPL para cada timestamp
3. Comparar Δ = |obtenido_JPL − obtenido_AE|
4. Si Δ ≤ 0.02° → PASS. Si Δ > 0.02° → FAIL.

La configuración exacta de consulta JPL Horizons está documentada en `JPL_HORIZONS_FIXTURE_PACK.md`. El paquete JSON completo está en `fixtures-phase-2a.json` (24 fixtures: 5 USNO + 19 PENDIENTE_JPL).

### 1D. Estado de la precisión externa

| Grupo | Cuerpos | Fixtures | Estado |
|-------|---------|----------|--------|
| Sol | 1 | 5 USNO | ✅ 5/5 PASS (Δ ≤ 1.2 arcmin certificado) |
| Otros 9 cuerpos | 9 | 19 JPL Pendientes | ⚠️ PENDIENTE_JPL (requiere consultas JPL) |

---

## PUNTO 2: RETROGRADACIÓN Y ESTACIONES

### 2A. Discrepancia confirmada en Mercurio

**Fecha**: 2024-12-15T21:00:00.000Z
**Fase real**: Posible post-estación directa (≈12-18h después del cruce por cero). **NO es "centro de retrogradación"**.

**Fuente de fechas de estaciones**: Astronomical Almanac 2025, Table: Planetary Phenomena — Mercury; Sky & Telescope Mercury Retrograde Calendar 2024.

| Ventana | Velocidad (°/día) | Clasificación |
|---------|-------------------|---------------|
| ±12h (implementación actual) | −0.000287 | **RETRÓGRADO** ← FALSO POSITIVO |
| ±6h | +0.000083 | DIRECTO |
| ±1h | +0.000203 | DIRECTO |
| ±15min | +0.000206 | DIRECTO |

**Causa raíz**: La ventana de ±12h captura velocidad retrógrada residual de ~12h antes de la estación directa y la promedia con la velocidad directa actual, resultando en un valor negativo espurio. El promediado lineal sobre un intervalo que cruza el punto estacionario invierte el signo.

### 2B. Separación de preocupaciones

| Propiedad | Método de cálculo | ¿Afectada por ventana? | Precisión |
|-----------|------------------|----------------------|-----------|
| `absoluteLongitude` | Puntual (GeoVector + Ecliptic) | NO | PRECISA |
| `sign` + `degreeInSign` | Derivado de absoluteLongitude | NO | PRECISOS |
| `speedDegreesPerDay` | Promedio lineal sobre ±12h | SÍ | APROXIMADA |
| `isRetrograde` | `speedDegreesPerDay < 0` | SÍ | PUEDE FALLAR cerca de estaciones |

### 2C. Resultados adicionales

| Prueba | Resultado | Detalle |
|--------|-----------|---------|
| Cruce 359° → 0° | ✅ PASS | signedLongitudeDelta(359, 1) = +2.0, correcto |
| Sol siempre directo | ✅ PASS | 0 retrógrado en 10 fechas (2021-2026) |
| Luna siempre directa | ✅ PASS | 0 retrógrada en 10 fechas |
| Inicio retrogradación Mercurio | Consistente | ±12h, ±1h, ±15min coinciden en RETR |
| Período retrógrado | Consistente | ±12h, ±1h, ±15min coinciden |
| Estación directa Mercurio | ❌ DISCREPANCIA | ±12h dice RETR, ventanas finas dicen DIR |
| Post-estación directa | Consistente | ±12h, ±1h, ±15min coinciden en DIR |

### 2D. Alternativas evaluadas (sin imponer solución)

Comparación completa y evidencia numérica en `TABLA_VENTANAS_DERIVACION.md`.

| Alternativa | Prec. clasif. | Estab. numérica | Cambio contractual | Complejidad |
|-------------|---------------|-----------------|-------------------|-------------|
| A. Ventana fija ±1h | ALTA | BAJA (planetas lentos) | Ninguno | Mínima |
| B. Derivada adaptativa | MUY ALTA | MEDIA | Ninguno | Alta |
| C. Umbrales por cuerpo | ALTA | ALTA | Ninguno | Media-baja |
| D. Mantener ±12h + ADR | BAJA (doc.) | ALTA | ADR requerido | Ninguna |

---

## PUNTO 3: PRUEBAS INSUFICIENTES — 6 huecos confirmados

| # | Hueco | Evidencia | Archivo |
|---|-------|-----------|---------|
| 3A | `signo previo` no comprueba `before.sign` | Líneas 58-64 solo verifican degreeInSign ∈ [0,30), no el signo esperado | `planetary-engine.test.ts` |
| 3B | `signedLongitudeDelta` sin test directo | Función correcta manualmente (10/10) pero sin test unitario | `planetary-engine.test.ts` |
| 3C | Sin `__fixtures__/` planetario | `moon/__fixtures__/` existe, `planetary/__fixtures__/` no | `src/server/planetary/` |
| 3D | Sin tests de estaciones retrógradas | No hay tests de inicio/fin/estacionario | `planetary-engine.test.ts` |
| 3E | `tsx` no está en `package.json` | Ausente de dependencies y devDependencies | `package.json` |
| 3F | Sin script `test` | No existe en `package.json` | `package.json` |

Las 10 pruebas mínimas imprescindibles antes de Fase 2B se detallan en `LISTA_PRUEBAS_CODEX_FASE_2A.md`.

---

## PUNTO 4: CONFLICTO ARQUITECTÓNICO

### Evidencia documental

| Fuente | Ubicación indicada | Tipo |
|--------|-------------------|------|
| Constitución REGLA 2 (01_ARCHITECTURE_IMMUTABLE.md) | `src/server/moon/` | Canónica vinculante |
| Codex (implementación real) | `src/server/planetary/` | Código existente |
| `src/server/astrology/` | No encontrada en documentación | No documentada |

### Situación actual

```
src/server/
  ├── moon/        ← MoonEngine (astronomía lunar, conforme a Constitución)
  ├── planetary/   ← PlanetaryEngine (astronomía planetaria, NUEVO — no mencionado en Constitución)
  └── search/      ← SearchIndex
```

La Constitución REGLA 2 establece: *"Cualquier cálculo astronómico [...] DEBE ejecutarse exclusivamente en src/server/moon/"*. Esta redacción no anticipó la existencia de un motor planetario separado. El cumplimiento literal exigiría mover planetary/ bajo moon/, pero esto genera confusión semántica.

### Opciones (sin decidir — reservado para Claude)

| Opción | Descripción | Ventaja principal | Desventaja principal |
|--------|-------------|-------------------|---------------------|
| A | Conservar `src/server/planetary/` | Código existente funcional | Viola Constitución (requiere enmienda) |
| B | Integrar bajo `src/server/moon/` | Cumple literalmente Constitución | "moon" conteniendo planetas es semánticamente incorrecto |
| C | Crear `src/server/astronomy/` con submódulos `moon/` y `planetary/` | Arquitectónicamente óptimo, escalable | Requiere refactor + enmienda constitucional |
| D | Emitir ADR formal primero | Gobernanza correcta | No resuelve el conflicto inmediato |

### Estado

**Decisión reservada para Claude.** Esta auditoría NO autoriza `src/server/planetary/` ni `src/server/astronomy/`. No se emite ADR. Se documenta el conflicto para que Claude (Agente Arquitecto) tome la decisión vinculante.

---

## PUNTO 5: RESULTADO

### Resumen cuantitativo

| Categoría | Cantidad |
|-----------|----------|
| ✅ PASS | 8 |
| ❌ FAIL | 8 |
| ⚠️ NO_DEMOSTRADA | 9 |
| ℹ️ INFO | 4 |

### Desglose de FAIL

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| Precisión externa (EXACTA) | 0 | 5/5 fixtures USNO PASS |
| Retrogradación | 1 | Falso positivo Mercurio 2024-12-15T21:00Z |
| Pruebas insuficientes | 6 | Huecos 3A-3F |
| Conflicto arquitectónico | 1 | Constitución vs implementación |

### Veredicto

**IMPLEMENTACIÓN MATEMÁTICA RECHAZADA**

**Motivo**: Discrepancia de clasificación en Mercurio 2024-12-15T21:00Z. La ventana de ±12h (línea 14 de `astronomy-planetary-engine.ts`) produce un falso positivo de retrogradación — clasifica como RETRÓGRADO cuando el planeta ya está en movimiento DIRECTO según ventanas de alta resolución (±1h, ±15min). Causa raíz: promediado lineal sobre intervalo de 24h que cruza el punto estacionario.

### Archivos que Codex deberá modificar (lista mínima)

1. `src/server/planetary/astronomy-planetary-engine.ts` — línea 14: `RETROGRADE_SAMPLE_MS`
2. `src/server/planetary/astronomy-planetary-engine.ts` — líneas 68-77: `calculateSpeedDegreesPerDay`
3. `src/server/planetary/planetary-engine.test.ts` — 10 tests mínimos (ver `LISTA_PRUEBAS_CODEX_FASE_2A.md`)
4. `src/server/planetary/__fixtures__/` — crear directorio con ≥20 timestamps JPL (ver `JPL_HORIZONS_FIXTURE_PACK.md`)
5. `package.json` — agregar `tsx` a devDependencies + script `test`

### Decisión arquitectónica (reservada)

6. `documentacion/gobierno-y-roadmap/10_MASTER_DECISION_LOG.md` — Claude deberá emitir ADR resolviendo el conflicto entre `src/server/moon/` (Constitución) y `src/server/planetary/` (código). Esta auditoría documenta las opciones A-D pero NO decide.

---

## ARCHIVOS ENTREGADOS

| Archivo | Contenido |
|---------|-----------|
| `documentacion/fase-2a/AUDITORIA_V3_CORREGIDA.md` | Este informe — auditoría completa |
| `documentacion/fase-2a/JPL_HORIZONS_FIXTURE_PACK.md` | 24 fixtures con consultas JPL reproducibles |
| `documentacion/fase-2a/TABLA_VENTANAS_DERIVACION.md` | Evidencia numérica de ventanas y comparación de alternativas |
| `documentacion/fase-2a/LISTA_PRUEBAS_CODEX_FASE_2A.md` | 10 pruebas mínimas imprescindibles |
| `documentacion/fase-2a/fixtures-phase-2a.json` | Paquete JSON con 24 fixtures (datos de máquina) |
| `scripts/audit-phase-2a-v3.ts` | Script de auditoría reproducible |
| `scripts/generate-phase-2a-package.ts` | Generador de paquete JSON |

---

IMPLEMENTACIÓN MATEMÁTICA RECHAZADA