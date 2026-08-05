# CORRECCIONES REQUERIDAS: Campo "Tu pregunta (opcional)" - Tirada de Amor

**Prioridad:** CRÍTICA  
**Tipo:** Privacidad + Seguridad + UX  
**Estado:** Pendiente implementación

---

## RESUMEN EJECUTIVO

### Problema Principal

El componente `TarotQuestionInput` muestra el texto:
> "La pregunta no se guarda ni se envía a ningún servicio."

**Esta afirmación es FALSA:**
- ✅ Correcto: NO se guarda en base de datos
- ❌ FALSO: SÍ se envía a DeepSeek (proveedor IA)

### Impacto Legal

Afirmación falsa sobre transmisión de datos personales constituye:
- Violación de transparencia de privacidad
- Potencial incumplimiento GDPR/LOPD
- Pérdida de confianza del usuario

---

## CORRECCIÓN 1: TEXTO DE PRIVACIDAD (CRÍTICA - INMEDIATA)

### Archivo a Modificar

`src/components/tarot/TarotQuestionInput.tsx`

### Cambio Requerido

**Línea 17 - ANTES:**
```typescript
hint = "La pregunta no se guarda ni se envía a ningún servicio.",
```

**Línea 17 - DESPUÉS (Opción A - Completa):**
```typescript
hint = "Tu pregunta personaliza la interpretación mediante IA. No la guardamos en tu cuenta, pero se procesa a través de nuestro proveedor de inteligencia artificial.",
```

**Línea 17 - DESPUÉS (Opción B - Breve):**
```typescript
hint = "Se usa para personalizar la interpretación (procesada por IA, no guardada en tu cuenta).",
```

**Línea 17 - DESPUÉS (Opción C - Ultra breve):**
```typescript
hint = "Tu pregunta se procesa mediante IA para personalizar la lectura.",
```

### Recomendación

**Usar Opción B** - Balance entre brevedad y transparencia.

---

## CORRECCIÓN 2: SAFETY CHECK (CRÍTICA - SEGURIDAD)

### Problema

El safety check solo valida `user.question`, pero el frontend envía `user.context`.  
**El contexto del usuario NO pasa por validación de seguridad.**

### Archivo a Modificar

`src/routes/api/tarot/interpret-reading.ts`

### Cambio Requerido

**Líneas 474-490 - ANTES:**
```typescript
stage = "safety_check";
if (input.user.question) {
  const safetyCheck = checkSafety(input.user.question);
  if (!safetyCheck.isSafe) {
    const safetyResponse = buildSafetyResponse(safetyCheck);
    return jsonResponse(
      {
        error: {
          code: "content_unsafe",
          message: safetyResponse?.message || "No podemos procesar esta pregunta.",
        },
      },
      400,
      responseHeaders,
    );
  }
}
```

**Líneas 474-490 - DESPUÉS:**
```typescript
stage = "safety_check";
// Validar tanto context como question
const textsToValidate = [input.user.context, input.user.question]
  .filter((text): text is string => Boolean(text?.trim()));

if (textsToValidate.length > 0) {
  const combinedText = textsToValidate.join(" ");
  const safetyCheck = checkSafety(combinedText);
  if (!safetyCheck.isSafe) {
    const safetyResponse = buildSafetyResponse(safetyCheck);
    return jsonResponse(
      {
        error: {
          code: "content_unsafe",
          message: safetyResponse?.message || "No podemos procesar esta pregunta.",
        },
      },
      400,
      responseHeaders,
    );
  }
}
```

---

## CORRECCIÓN 3: MEJORAR INSTRUCCIONES PROMPT (CALIDAD)

### Problema

El prompt incluye el contexto del usuario, pero NO instruye explícitamente a la IA para usarlo.  
Confía en que el modelo lo integre automáticamente, lo cual puede ser inconsistente.

### Archivo a Modificar

`src/routes/api/tarot/interpret-reading.ts`

### Cambio Requerido

**Líneas 198-199 - ANTES:**
```typescript
${userContext ? `CONTEXTO DEL USUARIO: "${userContext}"` : ""}
${userQuestion ? `PREGUNTA DEL USUARIO: "${userQuestion}"` : ""}
```

**Líneas 198-220 - DESPUÉS:**
```typescript
${userContext ? `CONTEXTO DEL USUARIO: "${userContext}"

IMPORTANTE: Adapta TODAS las interpretaciones a esta situación específica:
- En cada posición, conecta el significado simbólico de la carta con elementos concretos del contexto
- En la síntesis, responde directamente a la situación planteada
- No te limites a añadir una frase genérica al inicio
- La orientación práctica debe ser relevante para este caso específico` : ""}
${userQuestion ? `PREGUNTA DEL USUARIO: "${userQuestion}"` : ""}
```

### Impacto Esperado

- Interpretaciones más personalizadas
- Mayor coherencia con la situación del usuario
- Justifica mejor la solicitud del campo

---

## CORRECCIÓN 4: FALLBACK CON CONTEXTO (CRÍTICA - UX)

### Problema

Cuando la IA falla, el fallback genera interpretación completamente genérica.  
**Ignora totalmente la pregunta del usuario**, causando mala experiencia.

### Archivos a Modificar

1. `src/lib/tarot/synthesis-generator.ts`
2. `src/routes/api/tarot/interpret-reading.ts`

### Cambio 4.1: Modificar Firma de Función

**Archivo:** `src/lib/tarot/synthesis-generator.ts`

**Líneas 107-111 - ANTES:**
```typescript
export function buildThreeCardSynthesisFallback(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  positions: readonly [ThreeCardPositionConfig, ThreeCardPositionConfig, ThreeCardPositionConfig],
): ThreeCardSynthesis {
```

**Líneas 107-111 - DESPUÉS:**
```typescript
export function buildThreeCardSynthesisFallback(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  positions: readonly [ThreeCardPositionConfig, ThreeCardPositionConfig, ThreeCardPositionConfig],
  userContext?: string,
): ThreeCardSynthesis {
```

### Cambio 4.2: Usar Contexto en Textos Generados

**Archivo:** `src/lib/tarot/synthesis-generator.ts`

**Líneas 129-136 - ANTES:**
```typescript
const mainPattern = `Esta lectura une ${keyword1}, ${keyword2} y ${keyword3} alrededor de ${categoryText}, ${tone}.`;

const relationshipBetweenCards = `${card1.name} abre la lectura desde ${pos1.shortLabel.toLowerCase()} y ${firstSentence(card1.uprightMeaning).toLowerCase()}. ${card2.name} muestra cómo esa energía se expresa en ${pos2.shortLabel.toLowerCase()}, mientras ${card3.name} orienta hacia una forma más concreta de avanzar.`;

const guidance = `Antes de avanzar, observa si la situación ofrece señales verificables de ${keyword3}, coherencia y reciprocidad. La tercera carta invita a elegir un paso posible, no a forzar una respuesta inmediata.`;

const reflectionQuestion = `¿Qué tendría que volverse más claro o concreto para que esta situación pueda avanzar sin que sostengas todo el esfuerzo?`;
```

**Líneas 129-145 - DESPUÉS:**
```typescript
const contextPrefix = userContext 
  ? `En relación a tu situación, esta lectura ` 
  : `Esta lectura `;

const mainPattern = `${contextPrefix}une ${keyword1}, ${keyword2} y ${keyword3} alrededor de ${categoryText}, ${tone}.`;

const relationshipBetweenCards = `${card1.name} abre la lectura desde ${pos1.shortLabel.toLowerCase()} y ${firstSentence(card1.uprightMeaning).toLowerCase()}. ${card2.name} muestra cómo esa energía se expresa en ${pos2.shortLabel.toLowerCase()}, mientras ${card3.name} orienta hacia una forma más concreta de avanzar.`;

const guidanceIntro = userContext
  ? `Considerando lo que planteaste, antes de avanzar`
  : `Antes de avanzar`;

const guidance = `${guidanceIntro}, observa si la situación ofrece señales verificables de ${keyword3}, coherencia y reciprocidad. La tercera carta invita a elegir un paso posible, no a forzar una respuesta inmediata.`;

const reflectionQuestion = userContext
  ? `En tu situación específica, ¿qué tendría que volverse más claro o concreto para poder avanzar con mayor certeza?`
  : `¿Qué tendría que volverse más claro o concreto para que esta situación pueda avanzar sin que sostengas todo el esfuerzo?`;
```

### Cambio 4.3: Actualizar Función buildFallbackReading

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

**Líneas 342-347 - ANTES:**
```typescript
function buildFallbackReading(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  requestId: string,
): InterpretReadingResponse {
  const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);
```

**Líneas 342-347 - DESPUÉS:**
```typescript
function buildFallbackReading(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  requestId: string,
  userContext?: string,
): InterpretReadingResponse {
  const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions, userContext);
```

### Cambio 4.4: Pasar Contexto en Llamada al Fallback

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

**Línea 529 - ANTES:**
```typescript
const fallbackResponse = buildFallbackReading(config, cards, input.user.requestId);
```

**Línea 529 - DESPUÉS:**
```typescript
const fallbackResponse = buildFallbackReading(config, cards, input.user.requestId, input.user.context);
```

---

## PRIORIZACIÓN DE IMPLEMENTACIÓN

### Fase 1: CRÍTICO (Implementar AHORA)

**Debe completarse antes de próximo deploy:**

1. ✅ **Corrección 1** - Texto de privacidad (5 min)
2. ✅ **Corrección 2** - Safety check (10 min)

**Total:** 15 minutos
**Riesgo si no se hace:** Legal/compliance

---

### Fase 2: IMPORTANTE (Siguiente sprint)

**Mejora la experiencia del usuario:**

3. ✅ **Corrección 4** - Fallback con contexto (30 min)
4. ✅ **Corrección 3** - Instrucciones prompt (10 min)

**Total:** 40 minutos
**Riesgo si no se hace:** UX degradada, usuarios sienten que su pregunta no sirve

---

## TESTS RECOMENDADOS

### Test Manual Inmediato

**Después de Corrección 1:**
1. Abrir tirada de amor
2. Verificar que el hint muestra el nuevo texto
3. Confirmar que no dice "no se envía a ningún servicio"

**Después de Corrección 2:**
1. Enviar contexto con palabras prohibidas (ej: "test unsafe content")
2. Verificar que devuelve error 400 con código "content_unsafe"

**Después de Corrección 4:**
1. Forzar uso de fallback (desconectar IA temporalmente)
2. Enviar tirada CON contexto: "Estoy conociendo a alguien nuevo"
3. Verificar que síntesis menciona "En relación a tu situación"
4. Enviar tirada SIN contexto
5. Verificar que síntesis usa texto genérico

### Tests Automatizados (Futuros)

```typescript
// src/routes/api/tarot/interpret-reading.test.ts
describe("User context handling", () => {
  it("should validate user.context for safety", async () => {
    const response = await POST("/api/tarot/interpret-reading", {
      body: {
        reading: { theme: "amor" },
        cards: [/* ... */],
        user: {
          context: "unsafe content here",
          requestId: "test-123",
        },
      },
    });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("content_unsafe");
  });

  it("should pass context to fallback", async () => {
    // Mock AI to fail
    const response = await POST("/api/tarot/interpret-reading", {
      body: {
        reading: { theme: "amor" },
        cards: [/* ... */],
        user: {
          context: "Mi situación específica",
          requestId: "test-123",
        },
      },
    });
    expect(response.body.synthesis.mainPattern).toContain("En relación a tu situación");
  });
});
```

---

## CHECKLIST DE IMPLEMENTACIÓN

### Pre-implementación
- [ ] Leer informe completo: `AUDITORIA_INFLUENCIA_PREGUNTA_TIRADA_AMOR.md`
- [ ] Entender flujo completo: textarea → hook → API → prompt → IA/fallback
- [ ] Backup de archivos a modificar

### Corrección 1 - Texto Privacidad
- [ ] Modificar `src/components/tarot/TarotQuestionInput.tsx` línea 17
- [ ] Elegir versión del hint (recomendado: Opción B)
- [ ] Verificar visualmente en navegador
- [ ] Screenshot para documentación

### Corrección 2 - Safety Check
- [ ] Modificar `src/routes/api/tarot/interpret-reading.ts` líneas 474-490
- [ ] Implementar validación combinada de context + question
- [ ] Test manual con contenido unsafe
- [ ] Verificar respuesta 400 con código correcto

### Corrección 3 - Prompt IA
- [ ] Modificar `src/routes/api/tarot/interpret-reading.ts` líneas 198-220
- [ ] Añadir instrucciones explícitas para usar contexto
- [ ] Test comparativo: mismas cartas, con/sin contexto
- [ ] Verificar que interpretaciones cambian significativamente

### Corrección 4 - Fallback
- [ ] Modificar `src/lib/tarot/synthesis-generator.ts` línea 107 (firma)
- [ ] Modificar `src/lib/tarot/synthesis-generator.ts` líneas 129-145 (uso)
- [ ] Modificar `src/routes/api/tarot/interpret-reading.ts` línea 342 (firma)
- [ ] Modificar `src/routes/api/tarot/interpret-reading.ts` línea 529 (llamada)
- [ ] Test manual forzando fallback
- [ ] Verificar mención del contexto en síntesis

### Post-implementación
- [ ] Ejecutar tests automatizados (si existen)
- [ ] Code review interno
- [ ] Actualizar `AUDITORIA_INFLUENCIA_PREGUNTA_TIRADA_AMOR.md` con estado
- [ ] Deploy a staging
- [ ] QA manual completo
- [ ] Deploy a producción
- [ ] Monitorear logs primeras 24h

---

## ARCHIVOS AFECTADOS

### Modificaciones Requeridas
1. `src/components/tarot/TarotQuestionInput.tsx` (1 línea)
2. `src/routes/api/tarot/interpret-reading.ts` (3 secciones)
3. `src/lib/tarot/synthesis-generator.ts` (2 secciones)

### Solo Lectura (No modificar)
- `src/hooks/useThreeCardInterpretation.ts`
- `src/components/tarot/experience/ThreeCardLoveExperienceShell.tsx`
- `src/config/three-card-readings.ts`
- `src/config/tarot.ts`

---

## NOTAS ADICIONALES

### Sobre la Configuración Actual

El archivo `src/config/tarot.ts` define:
```typescript
export const tarotQuestionLimits = {
  optional: true,
  minCharacters: 0,
  maxCharacters: 240,
  trim: true,
  storeInDatabase: false,      // ✅ Correcto
  sendToAnalytics: false,       // ✅ Correcto
} as const;
```

Esta configuración es CORRECTA y no requiere cambios.

### Sobre Persistencia

El sistema NUNCA guarda la pregunta en:
- ✅ Supabase tabla `saved_tarot_readings` - NO tiene campo para pregunta
- ✅ localStorage/sessionStorage - NO se almacena
- ✅ Analytics - `sendToAnalytics: false`

Solo se transmite temporalmente a la IA para procesar la interpretación.

### Sobre Transmisión Externa

La pregunta SÍ se envía a:
- DeepSeek API (o Lovable según configuración `AI_PROVIDER`)
- Se incluye en el prompt como parte del mensaje `user.content`
- Es necesario para personalizar la interpretación
- No se puede evitar si queremos que la pregunta influya

**Por eso es CRÍTICO corregir el texto de privacidad.**

---

## CONTACTO Y PREGUNTAS

Si hay dudas sobre la implementación:
1. Revisar `AUDITORIA_INFLUENCIA_PREGUNTA_TIRADA_AMOR.md` (informe completo)
2. Buscar líneas específicas mencionadas en este documento
3. Verificar flujo: frontend → hook → API → prompt

**Tiempo estimado total:** 1 hora (15 min crítico + 45 min mejoras)

---

**FIN DEL DOCUMENTO DE CORRECCIONES**
