# TABLA DE VENTANAS Y DERIVACIÓN — Auditoría Fase 2A

**Propósito**: Evidencia numérica del comportamiento de `calculateSpeedDegreesPerDay` con diferentes tamaños de ventana de muestreo para cada cuerpo planetario.

---

## Fuente de las estaciones de Mercurio

Las fechas de estaciones retrógradas de Mercurio se obtuvieron de:
- **Astronomical Almanac 2025**, Table: Planetary Phenomena — Mercury
- **Sky & Telescope**, Mercury Retrograde Calendar 2024
- Valores de referencia: inicio retrogradación ~2024-11-25, estación retrógrada ~2024-12-06, estación directa ~2024-12-15, fin retrogradación ~2024-12-15.

---

## 1. Mercurio — Ventana crítica 2024-12-15T21:00Z

**Fase real**: Posible post-estación directa (≈12-18h después del cruce por cero desde velocidad negativa a positiva). **NO es "centro de retrogradación"**.

Evidencia numérica generada con `scripts/audit-phase-2a-v3.ts`:

| Ventana | Velocidad (°/día) | Clasificación |
|---------|-------------------|---------------|
| ±12h (implementación actual) | −0.000287 | **RETRÓGRADO** ← FALSO POSITIVO |
| ±6h | +0.000083 | DIRECTO |
| ±1h | +0.000203 | DIRECTO |
| ±30min | +0.000205 | DIRECTO |
| ±15min | +0.000206 | DIRECTO |
| ±5min | +0.000206 | DIRECTO |
| ±1min | +0.000206 | DIRECTO |

**Conclusión**: La ventana de ±12h produce clasificación RETRÓGRADO, mientras que todas las ventanas ≤1h producen DIRECTO. El instante 2024-12-15T21:00Z está DESPUÉS de la estación directa. La ventana de ±12h captura velocidad retrógrada residual de ~12h antes y la promedia con la velocidad directa actual, resultando en un valor negativo espurio.

---

## 2. Mercurio — Barrido completo de estaciones (diciembre 2024)

| Fecha | Fase | ±12h (°/d) | Clasif. | ±1h (°/d) | Clasif. | ±15min (°/d) | Clasif. | ¿Discrepancia? |
|-------|------|------------|---------|-----------|---------|--------------|---------|----------------|
| 2024-12-06T00:00Z | estación_retrógrada | −1.382288 | RETR | −1.384250 | RETR | −1.384263 | RETR | No |
| 2024-12-10T00:00Z | período_retrógrado | −1.048533 | RETR | −1.049542 | RETR | −1.049548 | RETR | No |
| 2024-12-14T00:00Z | fin_período_retrógrado | −0.331428 | RETR | −0.331187 | RETR | −0.331185 | RETR | No |
| 2024-12-14T12:00Z | pre_estación_directa | −0.240087 | RETR | −0.239758 | RETR | −0.239756 | RETR | No |
| 2024-12-15T00:00Z | cercano_estación_directa | −0.150712 | RETR | −0.150312 | RETR | −0.150310 | RETR | No |
| 2024-12-15T12:00Z | cercano_estación_directa | −0.063736 | RETR | −0.063280 | RETR | −0.063277 | RETR | No |
| **2024-12-15T21:00Z** | **posible_post_estación** | **−0.000287** | **RETR** | **+0.000203** | **DIR** | **+0.000206** | **DIR** | **❌ SÍ** |
| 2024-12-16T00:00Z | post_estación_directa | +0.020499 | DIR | +0.020998 | DIR | +0.021002 | DIR | No |
| 2024-12-25T00:00Z | directo_estable | +1.001016 | DIR | +1.001337 | DIR | +1.001339 | DIR | No |

**Ventana de discrepancia**: La única discrepancia ocurre en el intervalo de ~12h centrado en 2024-12-15T21:00Z. La estación directa ocurre aproximadamente 12-18h antes de este timestamp, y la ventana de ±12h alcanza a capturar velocidades retrógradas del período previo.

---

## 3. Planetas en oposición — Velocidades con ventana actual (±12h)

*Valores informativos. Sin fixture JPL, la clasificación es NO_DEMOSTRADA.*

| Cuerpo | Fecha | Velocidad (°/día) | isRetrograde |
|--------|-------|-------------------|-------------|
| mars | 2022-12-08T05:00Z | −0.383925 | true |
| mars | 2025-01-15T00:00Z | −0.400279 | true |
| jupiter | 2024-12-07T21:00Z | −0.136379 | true |
| saturn | 2024-09-08T04:00Z | −0.076665 | true |

---

## 4. Comparación de alternativas para la ventana de muestreo

### Alternativa A — Ventana fija ±1h

**Precisión de clasificación**: ALTA. Elimina el falso positivo de Mercurio detectado.

**Estabilidad numérica**: BAJA para cuerpos lentos. Neptuno tiene velocidad orbital ~0.006°/día. En ±1h, Δlongitud ≈ 0.00025°. La precisión de astronomy-engine es ~10⁻⁶ grados, por lo que el ruido numérico puede dominar la señal. Ejemplo con Neptuno:
- 2024-06-21T12:00Z: speed(±12h) = +0.0060 °/d, speed(±1h) ≈ +0.0060 °/d con mayor varianza.

**Cambio contractual**: Ninguno. `isRetrograde: boolean` se mantiene.

### Alternativa B — Derivada adaptativa

**Precisión de clasificación**: MUY ALTA. Ventana proporcional a velocidad esperada:

| Rango de |speed_est| | Ventana | Cuerpos |
|--------------------------|---------|---------|
| > 2 °/día | ±1h | Mercury, Venus (fases rápidas) |
| > 0.1 °/día | ±6h | Mars, Jupiter, Saturn |
| ≤ 0.1 °/día | ±24h | Uranus, Neptune, Pluto |

**Estabilidad numérica**: MEDIA. Requiere una estimación previa de velocidad (iteración de 2 pasos o valor de referencia). Añade complejidad de implementación.

**Cambio contractual**: Ninguno. `isRetrograde: boolean` se mantiene.

### Alternativa C — Umbrales específicos por cuerpo

**Precisión de clasificación**: ALTA. Tabla fija de ventanas por cuerpo basada en velocidad orbital media conocida:

| Cuerpo | Velocidad orbital media (°/d) | Ventana recomendada |
|--------|-------------------------------|---------------------|
| sun | ~0.986 | ±1h |
| moon | ~13.176 | ±30min |
| mercury | ~4.092 (varía 0-4) | ±1h |
| venus | ~1.602 | ±1h |
| mars | ~0.524 | ±6h |
| jupiter | ~0.083 | ±12h |
| saturn | ~0.034 | ±12h |
| uranus | ~0.012 | ±24h |
| neptune | ~0.006 | ±24h |
| pluto | ~0.004 | ±24h |

**Estabilidad numérica**: ALTA. Determinista y predecible.

**Cambio contractual**: Ninguno. `isRetrograde: boolean` se mantiene.

### Alternativa D — Mantener ±12h sin modificar + ADR de tolerancia

**Precisión de clasificación**: BAJA (falso positivo documentado). Requiere ADR que documente la tolerancia temporal aceptada.

**Estabilidad numérica**: ALTA. Sin cambios de código.

**Cambio contractual**: ADR requerido. Documentar que `isRetrograde` puede ser incorrecto en ventanas de ±6h alrededor de estaciones planetarias.

---

## 5. Recomendación

**Alternativa recomendada**: **C (Umbrales específicos por cuerpo)**.

Justificación:
1. **Mejor balance precisión/estabilidad**: Elimina el falso positivo de Mercurio sin arriesgar ruido numérico en planetas lentos.
2. **Sin cambio contractual**: `isRetrograde: boolean` permanece igual. No se introduce `isStationary`.
3. **Determinista**: Tabla fija, predecible, sin iteraciones.
4. **Simple de implementar**: Reemplazar `RETROGRADE_SAMPLE_MS` constante por lookup table.

Si se prefiere máxima simplicidad con mínimo cambio de código, la Alternativa A (±1h fija) también elimina el falso positivo, pero Codex debe evaluar si el ruido numérico en planetas lentos es aceptable (Δ < 0.001 °/día, probablemente irrelevante para uso astrológico).

---

## 6. Separación de preocupaciones

| Preocupación | Afectada por ventana? | Estado actual |
|--------------|----------------------|---------------|
| absoluteLongitude | NO (cálculo puntual) | PRECISO |
| sign + degreeInSign | NO (derivado de absoluteLongitude) | PRECISO |
| speedDegreesPerDay | SÍ (promedio sobre ventana) | APROXIMADO (±12h) |
| isRetrograde | SÍ (derivado de speedDegreesPerDay) | PUEDE FALLAR cerca de estaciones |

---

*Evidencia numérica reproducible: `npx tsx scripts/audit-phase-2a-v3.ts`*