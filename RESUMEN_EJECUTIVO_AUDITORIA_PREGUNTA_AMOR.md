# RESUMEN EJECUTIVO - Auditoría Campo "Tu pregunta (opcional)"

**Fecha:** 2026-08-02  
**Veredicto:** ⚠️ CORRECCIÓN REQUERIDA - CRÍTICA PRIVACIDAD

---

## ¿LA PREGUNTA INFLUYE EN LAS INTERPRETACIONES?

### Respuesta Corta

✅ **SÍ** cuando la IA funciona (DeepSeek)  
❌ **NO** cuando se usa el fallback

---

## PROBLEMA CRÍTICO ENCONTRADO

### Texto Actual de Privacidad (FALSO)

**Ubicación:** `src/components/tarot/TarotQuestionInput.tsx` línea 17

```typescript
hint = "La pregunta no se guarda ni se envía a ningún servicio."
```

### Análisis de Veracidad

| Afirmación | Realidad | Estado |
|------------|----------|--------|
| "no se guarda" | ✅ Correcto - NO va a Supabase | VERDADERO |
| "ni se envía a ningún servicio" | ❌ SÍ se envía a DeepSeek | **FALSO** |

### Riesgo

- Afirmación falsa sobre transmisión de datos personales
- Violación de transparencia de privacidad
- Potencial incumplimiento GDPR/LOPD

---

## FLUJO TÉCNICO COMPLETO

### Trazabilidad Frontend → IA

```
1. Textarea (TarotQuestionInput.tsx)
   ↓
2. Estado local: question (ThreeCardLoveExperienceShell.tsx línea 70)
   ↓
3. Hook: userContext prop (ThreeCardLoveExperienceShell.tsx línea 93)
   ↓
4. Payload API: user.context (useThreeCardInterpretation.ts línea 38)
   ↓
5. Endpoint: input.user.context (interpret-reading.ts línea 513)
   ↓
6. Prompt: interpolado en línea 198 (interpret-reading.ts)
   ↓
7. IA: enviado a DeepSeek como parte del mensaje
```

### Trazabilidad Fallback (cuando IA falla)

```
Endpoint → buildFallbackReading() → buildThreeCardSynthesisFallback()
                                     ↓
                              ❌ NO recibe userContext
                              ❌ Genera texto genérico
```

---

## HALLAZGOS PRINCIPALES

### ✅ Funciona Correctamente

1. **Persistencia:** La pregunta NO se guarda en Supabase
2. **Frontend:** El campo captura y envía correctamente la pregunta
3. **API:** El endpoint acepta y procesa el campo `user.context`
4. **Prompt IA:** La pregunta se incluye en el prompt enviado a DeepSeek

### ❌ Problemas Encontrados

1. **CRÍTICO - Privacidad:** Texto UI afirma falsamente que no se envía a servicios externos
2. **CRÍTICO - Seguridad:** Safety check NO valida `user.context` (solo `user.question`)
3. **CRÍTICO - UX:** Fallback ignora completamente la pregunta del usuario
4. **Calidad:** Prompt no instruye explícitamente a la IA para usar el contexto

---

## CORRECCIONES OBLIGATORIAS

### Prioridad 1: INMEDIATO (antes de próximo deploy)

#### 1. Corregir Texto de Privacidad

**Archivo:** `src/components/tarot/TarotQuestionInput.tsx`  
**Línea:** 17

**Cambiar de:**
```typescript
hint = "La pregunta no se guarda ni se envía a ningún servicio."
```

**Cambiar a:**
```typescript
hint = "Se usa para personalizar la interpretación (procesada por IA, no guardada en tu cuenta)."
```

**Tiempo:** 5 minutos  
**Riesgo si no se hace:** Legal/compliance

---

#### 2. Añadir Safety Check para Context

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`  
**Líneas:** 474-490

**Cambiar validación para incluir AMBOS campos:**
```typescript
const textsToValidate = [input.user.context, input.user.question]
  .filter((text): text is string => Boolean(text?.trim()));

if (textsToValidate.length > 0) {
  const combinedText = textsToValidate.join(" ");
  const safetyCheck = checkSafety(combinedText);
  // ... resto del código
}
```

**Tiempo:** 10 minutos  
**Riesgo si no se hace:** Vulnerabilidad de seguridad

---

### Prioridad 2: IMPORTANTE (siguiente sprint)

#### 3. Corregir Fallback para Usar Contexto

**Archivos afectados:**
- `src/lib/tarot/synthesis-generator.ts` (líneas 107, 129-145)
- `src/routes/api/tarot/interpret-reading.ts` (líneas 342, 529)

**Cambios:**
- Añadir parámetro `userContext?: string` a `buildThreeCardSynthesisFallback`
- Adaptar textos generados cuando hay contexto
- Pasar contexto en llamada al fallback

**Tiempo:** 30 minutos  
**Riesgo si no se hace:** Mala UX cuando IA falla

---

#### 4. Mejorar Instrucciones en Prompt

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`  
**Líneas:** 198-220

**Añadir instrucciones explícitas:**
```typescript
${userContext ? `CONTEXTO DEL USUARIO: "${userContext}"

IMPORTANTE: Adapta TODAS las interpretaciones a esta situación específica.
No te limites a añadir una frase genérica al inicio.` : ""}
```

**Tiempo:** 10 minutos  
**Riesgo si no se hace:** Personalizaciones inconsistentes

---

## TIEMPO TOTAL ESTIMADO

- **Fase 1 (Crítico):** 15 minutos
- **Fase 2 (Importante):** 40 minutos
- **Total:** 55 minutos

---

## DECISIÓN FINAL

### ¿Mantener o Eliminar el Campo?

**RECOMENDACIÓN: MANTENER** (con correcciones obligatorias)

### Razones para Mantener

1. ✅ El campo SÍ tiene valor funcional cuando la IA funciona
2. ✅ Los usuarios esperan esta opción en lecturas de tarot
3. ✅ Solo requiere correcciones técnicas, no rediseño
4. ✅ La transmisión a IA es legítima si se informa correctamente

### Condición

El campo NO debe estar visible hasta completar **al menos las correcciones 1 y 2** (críticas).

---

## ARCHIVOS CLAVE

### Para Correcciones Inmediatas
- `src/components/tarot/TarotQuestionInput.tsx` (línea 17)
- `src/routes/api/tarot/interpret-reading.ts` (líneas 474-490)

### Para Correcciones Fase 2
- `src/lib/tarot/synthesis-generator.ts` (líneas 107, 129-145)
- `src/routes/api/tarot/interpret-reading.ts` (líneas 198-220, 342, 529)

---

## DOCUMENTACIÓN COMPLETA

Para detalles técnicos exhaustivos, consultar:

1. **Informe completo:** `AUDITORIA_INFLUENCIA_PREGUNTA_TIRADA_AMOR.md`  
   (Análisis línea por línea con evidencia de código)

2. **Guía de implementación:** `CORRECCIONES_REQUERIDAS_PREGUNTA_AMOR.md`  
   (Pasos exactos para cada corrección con código completo)

3. **Este resumen:** `RESUMEN_EJECUTIVO_AUDITORIA_PREGUNTA_AMOR.md`  
   (Vista rápida para decisión ejecutiva)

---

## CONCLUSIÓN

La pregunta del usuario **SÍ influye** en las interpretaciones generadas por IA, pero:

1. El texto de privacidad actual es **falso** y debe corregirse **inmediatamente**
2. Existen vulnerabilidades de seguridad que deben solucionarse
3. La experiencia con fallback es inconsistente y debe mejorarse
4. Con las correcciones implementadas, el campo cumple su propósito y debe mantenerse

**Acción requerida:** Implementar correcciones 1 y 2 antes del próximo deploy.

---

**FIN DEL RESUMEN EJECUTIVO**
