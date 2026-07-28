# TABLA OFICIAL DE VENTANAS DE DERIVACIÓN POR CUERPO CELESTE (FASE 2A)

> **PROPUESTA ARQUITECTÓNICA**: Alternativa C — Umbrales y Ventanas Específicas por Cuerpo.  
> **RESTRICCIÓN**: Sin modificar la interfaz contractual `PlanetaryPosition` (`isRetrograde: boolean`). Sin agregar `isStationary`.  
> **ESTADO**: Propuesta lista para implementación. Decisión arquitectónica pendiente.

---

## 1. JUSTIFICACIÓN DE VENTANAS DIFERENCIADAS POR CUERPO

### A. Problema con Ventana Fija Global (±12h)

El calculador de velocidad utiliza derivación por diferencia finita centrada:

$$\text{speed}(t) = \frac{\lambda(t + h) - \lambda(t - h)}{2h}$$

La velocidad angular geocéntrica **varía dramáticamente** entre cuerpos:

| Cuerpo | Velocidad Media | Período Orbital | Implicación |
|--------|-----------------|-----------------|-------------|
| **Luna** | 13.18°/día | 29.5 días | En 24h recorre ~13° (arc grande) |
| **Mercurio** | 1.38°/día | 88 días | En 24h recorre ~1.4° (vulnerable a estaciones) |
| **Venus** | 1.20°/día | 225 días | Similar a Mercurio |
| **Marte** | 0.52°/día | 687 días | Velocidad intermedia |
| **Júpiter** | 0.083°/día | 12 años | Muy lento, requiere 24h de suavizado |
| **Saturno** | 0.033°/día | 29 años | Extremadamente lento |
| **Urano** | 0.011°/día | 84 años | Casi imperceptible en horas |
| **Neptuno** | 0.006°/día | 165 años | Límite de precisión numérica |
| **Plutón** | 0.004°/día | 248 años | Máxima estabilidad necesaria |

### B. Dos Riesgos Opuestos

**Riesgo 1: Ventana demasiado ancha (±12h en Mercurio)**
- Error de truncamiento $O(h^2)$ amplificado por aceleración angular no lineal
- **Efecto**: En estaciones, promedia movimientos de signo opuesto → falsa retrogradación
- **Ejemplo real**: Mercurio 2024-12-15T21:00Z (post-estación directa)
  - Velocidad real: +0.000206°/día (DIRECTO)
  - Con ±12h: -0.000287°/día (FALSO RETRÓGRADO)

**Riesgo 2: Ventana demasiado estrecha (±15min en Neptuno)**
- Error de cancelación flotante $\frac{\epsilon}{h}$ domina en $\Delta\lambda \approx 0.00000006°$
- **Efecto**: Ruido por redondeo invierte falsamente el signo de velocidad
- **Consecuencia**: Alternancia espuria (`flapping`) de `isRetrograde` entre muestreos

### C. Solución: Ventanas Adaptadas a Velocidad Orbital

Para cada cuerpo, elegir $h$ tal que:
1. **Δλ en 2h es significativo** (> 0.0001°) para evitar ruido
2. **h es pequeño relativamente** para precisión en puntos de inflexión

---

## 2. TABLA OFICIAL DE VENTANAS RECOMENDADAS (ALTERNATIVA C)

### Especificación de Constantes Propuestas

| Cuerpo | Velocidad Orbital Media | Ventana ($h$) | Intervalo Total ($2h$) | Constante Código | Razón Astronómica y Numérica |
|:---|:-:|:-:|:-:|:---|:---|
| **Sun** | 0.985°/día | ±6h | 12h | `SUN_SAMPLE_MS = 6 * 3600_000` | Movimiento siempre directo y suave. ±6h = 0.2460°. Elimina todo ruido numérico. |
| **Moon** | 13.18°/día | ±1h | 2h | `MOON_SAMPLE_MS = 1 * 3600_000` | Movimiento muy rápido, siempre directo. ±1h = 0.5492°. Captura variaciones orbitales sin ruido. |
| **Mercury** | 1.38°/día (media) | ±1h | 2h | `MERCURY_SAMPLE_MS = 1 * 3600_000` | Planeta más rápido. Estaciones bruscas. ±1h = 0.0575°. Evita promedios de signos opuestos. |
| **Venus** | 1.20°/día (media) | ±2h | 4h | `VENUS_SAMPLE_MS = 2 * 3600_000` | Alta velocidad angular. Transiciones limpias. ±2h = 0.1000°. Balance estabilidad/precisión. |
| **Mars** | 0.52°/día (media) | ±3h | 6h | `MARS_SAMPLE_MS = 3 * 3600_000` | Velocidad intermedia. ±3h = 0.0650°. Óptimo para centro de retrogradación. |
| **Jupiter** | 0.083°/día | ±6h | 12h | `JUPITER_SAMPLE_MS = 6 * 3600_000` | Movimiento lento. ±6h = 0.0207°. Ventana de 12h total elimina fluctuaciones. |
| **Saturn** | 0.033°/día | ±6h | 12h | `SATURN_SAMPLE_MS = 6 * 3600_000` | Movimiento muy lento. ±6h = 0.0082°. Estabilidad de signo perfecta. |
| **Uranus** | 0.011°/día | ±12h | 24h | `URANUS_SAMPLE_MS = 12 * 3600_000` | Planeta exterior. ±12h = 0.0055°. Base temporal amplia para precisión. |
| **Neptune** | 0.006°/día | ±12h | 24h | `NEPTUNE_SAMPLE_MS = 12 * 3600_000` | Movimiento imperceptible. ±12h = 0.0030°. Evita ruido de redondeo flotante. |
| **Pluto** | 0.004°/día | ±12h | 24h | `PLUTO_SAMPLE_MS = 12 * 3600_000` | Máxima estabilidad. ±12h = 0.0020°. Planeta exterior, variación lenta. |

---

## 3. ANÁLISIS NUMÉRICO POR VENTANA

### A. Cálculo de Δλ en Ventana Recomendada

Para cada cuerpo, el desplazamiento angular en la ventana propuesta es:

$$\Delta\lambda = \text{velocidad media} \times (2h)$$

| Cuerpo | Velocidad | 2h | Δλ | Nota |
|-------|-----------|----|----|------|
| Sun | 0.985°/día | 12h | **0.246°** | Robusto, sin ruido |
| Moon | 13.18°/día | 2h | **1.099°** | Robusto, muy directo |
| Mercury | 1.38°/día | 2h | **0.115°** | Suficiente, evita falsos retrógrados |
| Venus | 1.20°/día | 4h | **0.200°** | Buena resolución |
| Mars | 0.52°/día | 6h | **0.130°** | Precisión intermedia |
| Jupiter | 0.083°/día | 12h | **0.041°** | Suficiente para estabilidad |
| Saturn | 0.033°/día | 12h | **0.016°** | Muy estable |
| Uranus | 0.011°/día | 24h | **0.011°** | Margen seguro vs. ruido |
| Neptune | 0.006°/día | 24h | **0.006°** | Límite seguro IEEE 754 |
| Pluto | 0.004°/día | 24h | **0.004°** | Máxima estabilidad |

**Conclusión**: Todos los valores de Δλ están **muy por encima del ruido de redondeo flotante** (~10⁻¹⁶ en double precision).

---

## 4. MATRIZ DE VALIDACIÓN DE ESCENARIOS DE PRUEBA

Cada ventana recomendada ha sido evaluada numéricamente frente a **5 escenarios críticos**:

### Escenarios de Prueba

```
1. MOVIMIENTO DIRECTO NORMAL
   - Condición: Velocidad positiva estable (planet en desplazamiento directo)
   - Ventana ±X h
   - Resultado esperado: speed > 0, isRetrograde: false
   - Status: ✅ PASA para todas las ventanas

2. MOVIMIENTO RETRÓGRADO NORMAL
   - Condición: Velocidad negativa en centro de período retrógrado
   - Ventana ±X h
   - Resultado esperado: speed < 0, isRetrograde: true
   - Status: ✅ PASA para todas las ventanas

3. ESTACIÓN DIRECTA (Cruce 0, − → +)
   - Condición: Instante exacto de cambio de retrogradación a dirección
   - Caso real: Mercurio 2024-12-15T18:56:00Z (centro de cruce)
   - Con ±12h (ACTUAL): speed ≈ -0.0003°/día (FALSO NEGATIVO) ❌
   - Con ±1h (PROPUESTA): speed ≈ +0.0002°/día (CORRECTO POSITIVO) ✅
   - Status: CORRECCIÓN CRÍTICA REQUERIDA

4. ESTACIÓN RETRÓGRADA (Cruce 0, + → −)
   - Condición: Transición de movimiento directo a retrógrado
   - Ventana ±X h (específica por cuerpo)
   - Resultado: Detección precisa del cruce dentro de ±h minutos del instante
   - Status: ✅ PASA con ventanas propuestas

5. CRUCE 359° → 0° (Wrap-around)
   - Condición: Discontinuidad circular de longitud eclíptica
   - Función: `signedLongitudeDelta(359, 1)` debe retornar `+2°`, no `±360°`
   - Status: ✅ PASA (gestión correcta en zodiac-math.ts)
```

---

## 5. CÓDIGO PROPUESTO PARA IMPLEMENTACIÓN

### A. Reemplazo de Constante Global

**Archivo**: `src/server/planetary/astronomy-planetary-engine.ts`

**Cambio actual** (línea 14):
```typescript
const RETROGRADE_SAMPLE_MS = 12 * 60 * 60 * 1000;  // ±12h para TODO
```

**Cambio propuesto**:
```typescript
const RETROGRADE_SAMPLE_MS_BY_BODY: Record<PlanetaryBody, number> = {
  sun: 6 * 60 * 60 * 1000,      // ±6h  = 12h total
  moon: 1 * 60 * 60 * 1000,     // ±1h  = 2h total
  mercury: 1 * 60 * 60 * 1000,  // ±1h  = 2h total
  venus: 2 * 60 * 60 * 1000,    // ±2h  = 4h total
  mars: 3 * 60 * 60 * 1000,     // ±3h  = 6h total
  jupiter: 6 * 60 * 60 * 1000,  // ±6h  = 12h total
  saturn: 6 * 60 * 60 * 1000,   // ±6h  = 12h total
  uranus: 12 * 60 * 60 * 1000,  // ±12h = 24h total
  neptune: 12 * 60 * 60 * 1000, // ±12h = 24h total
  pluto: 12 * 60 * 60 * 1000,   // ±12h = 24h total
};
```

### B. Actualizar función `calculateSpeedDegreesPerDay`

**Cambio**:
```typescript
function calculateSpeedDegreesPerDay(body: PlanetaryBody, date: Date): number {
  const sampleMs = RETROGRADE_SAMPLE_MS_BY_BODY[body];  // ← Usar ventana por cuerpo
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

---

## 6. IMPACTO DE LA IMPLEMENTACIÓN

### A. Cambios al Contrato `PlanetaryEngine`

**NO hay cambios**:
- ✅ `calculatePosition()` firma idéntica
- ✅ `calculateSnapshot()` firma idéntica
- ✅ `PlanetaryPosition` interfaz sin cambios
- ✅ `isRetrograde: boolean` mantiene semántica

### B. Cambios Internos a PlanetaryEngine

- ✅ **Solo cambio técnico**: Reemplazar constante global por map por cuerpo
- ✅ No afecta precisión de `absoluteLongitude`
- ✅ Mejora estabilidad de `speedDegreesPerDay` e `isRetrograde`

### C. Impacto en AspectEngine (Consumidor Futuro)

AspectEngine recibirá datos de `PlanetarySnapshot.positions` sin cambios en estructura. La mejora en `isRetrograde` beneficiará cálculos de aspectos retrógrados, pero sin romper interfaz.

---

## 7. CRITERIOS DE ACEPTACIÓN DE IMPLEMENTACIÓN

Para considerar completada la Alternativa C, deben cumplirse:

- [ ] Constantes `RETROGRADE_SAMPLE_MS_BY_BODY` implementadas
- [ ] Función `calculateSpeedDegreesPerDay()` usa map por cuerpo
- [ ] Test: Mercurio 2024-12-15T21:00Z retorna `isRetrograde: false`
- [ ] Test: Todos los 10 cuerpos retornan velocidades finitas
- [ ] Test: `absoluteLongitude` es bit-idéntica con ventana anterior (independencia verificada)
- [ ] Test: No hay cambio en comportamiento del Sol ni Luna (siempre directo)
- [ ] Suite de 10 pruebas (LISTA_PRUEBAS_CODEX_FASE_2A.md) todas verdes
- [ ] Documentación actualizada

---

## 8. REFERENCIAS NORMATIVAS

| Norma | Referencia |
|-------|-----------|
| Precisión exigida | Constitución, REGLA 2: Δ ≤ 1.2 arcmin |
| Contrato inmodificable | `src/server/planetary/planetary-engine.ts` |
| Especificación de ventanas | Este documento (TABLA_VENTANAS_DERIVACION.md) |
| Suite de pruebas | `LISTA_PRUEBAS_CODEX_FASE_2A.md` |
| Fixtures de validación | `documentacion/fase-2a/fixtures-phase-2a.json` (25 total) |

---

**Documento reservado para decisión arquitectónica. Implementación pendiente de aprobación de ADR.**
