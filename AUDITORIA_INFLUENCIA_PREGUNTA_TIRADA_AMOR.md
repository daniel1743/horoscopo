# AUDITORÍA EXHAUSTIVA: Influencia Real del Campo "Tu pregunta (opcional)" en Tirada de Amor

**Fecha:** 2026-08-02  
**Alcance:** Tirada de Tres Cartas - Amor  
**Objetivo:** Determinar si la pregunta del usuario realmente influye en las interpretaciones generadas

---

## RESUMEN EJECUTIVO

**VEREDICTO FINAL:** ⚠️ **CORRECCIÓN REQUERIDA - CRÍTICA PRIVACIDAD**

### Hallazgos Críticos

1. ✅ **La pregunta SÍ llega a la IA** (DeepSeek)
2. ✅ **La pregunta SÍ se incluye en el prompt**
3. ❌ **El fallback IGNORA completamente la pregunta**
4. ⚠️ **CRÍTICO:** La UI afirma "no se envía a ningún servicio" pero SÍ se envía a DeepSeek
5. ⚠️ **La pregunta NO se guarda en base de datos** (correcto)

### Impacto de Privacidad

**CRÍTICO:** El texto actual de privacidad es **FALSO**:
- UI actual: "La pregunta no se guarda ni se envía a ningún servicio"
- Realidad: La pregunta se envía a DeepSeek (proveedor IA externo)
- Riesgo legal: Afirmación falsa sobre transmisión de datos personales

---

## FASE 1: TRAZABILIDAD FRONTEND → IA

### 1.1 Textarea → Estado Local

**Archivo:** `src/components/tarot/experience/ThreeCardLoveExperienceShell.tsx`

```typescript
// Línea 70: Declaración del estado
const [question, setQuestion] = useState("");

// Línea 277-281: Renderizado del campo
<TarotQuestionInput
  value={question}
  onChange={setQuestion}
  placeholder={config.userContextPlaceholder}
/>

// Línea 218: Reset limpia la pregunta
setQuestion("");
```

**✅ Confirmado:** El campo existe y mantiene estado local.

---

### 1.2 Estado → Hook useThreeCardInterpretation

**Archivo:** `src/components/tarot/experience/ThreeCardLoveExperienceShell.tsx`

```typescript
// Líneas 85-94: Paso de pregunta al hook como userContext
const {
  interpretation,
  isLoading: isInterpreting,
  error: interpretationError,
  interpret,
} = useThreeCardInterpretation({
  config,
  cardSlugs,
  userContext: question,  // ← AQUÍ SE PASA
});
```

**✅ Confirmado:** La pregunta se pasa como `userContext` al hook.

---

### 1.3 Hook → Payload API

**Archivo:** `src/hooks/useThreeCardInterpretation.ts`

```typescript
// Líneas 26-42: Construcción del payload
const response = await fetch("/api/tarot/interpret-reading", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    reading: {
      theme: config.slug,
    },
    cards: cardSlugs.map((slug, i) => ({
      slug,
      positionKey: config.positions[i].key,
    })),
    user: {
      context: userContext,  // ← AQUÍ SE SERIALIZA
      requestId: crypto.randomUUID(),
    },
    language: "es",
  }),
});
```

**✅ Confirmado:** La pregunta se envía como `user.context` en el payload JSON.

---

## FASE 2: INSPECCIÓN REQUEST Y SERVIDOR

### 2.1 Schema Zod del Endpoint

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

```typescript
// Líneas 37-41: Schema acepta context Y question
user: z.object({
  context: z.string().max(500).optional(),      // ← Frontend envía esto
  question: z.string().min(1).max(500).optional(), // ← No usado actualmente
  requestId: z.string().min(8).max(120),
}),
```

**✅ Confirmado:** El servidor acepta el campo `context` (máximo 500 caracteres).

**Observación:** Existe un campo `question` adicional no utilizado actualmente.

---

### 2.2 Safety Check

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

```typescript
// Líneas 475-490: Verificación de seguridad
stage = "safety_check";
if (input.user.question) {  // ← Solo revisa 'question', NO 'context'
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

**⚠️ VULNERABILIDAD:** El safety check solo valida `user.question`, pero el frontend envía `user.context`. 
**El contexto del usuario NO pasa por safety check.**

---

## FASE 3: INSPECCIÓN PROMPT IA

### 3.1 Construcción del Prompt

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

```typescript
// Línea 513: Llamada a buildReadingPrompt con context
const prompt = buildReadingPrompt(config, cards, input.user.context, input.user.question);

// Líneas 184-199: Interpolación en el prompt
function buildReadingPrompt(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  userContext?: string,
  userQuestion?: string,
): string {
  // ...
  return `Eres la Guía de Tarot de Creovision. Interpreta una lectura completa de tres cartas temática.

TEMA: ${config.title}
DESCRIPCIÓN: ${config.description}

${userContext ? `CONTEXTO DEL USUARIO: "${userContext}"` : ""}
${userQuestion ? `PREGUNTA DEL USUARIO: "${userQuestion}"` : ""}

CARTAS REVELADAS:
// ...
```

**✅ Confirmado:** 
- El `userContext` se interpola en el prompt si existe
- Se envía ANTES de las cartas reveladas
- La IA recibe instrucciones implícitas de usar este contexto

---

### 3.2 Instrucciones al Modelo

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

```typescript
// Líneas 221-266: Instrucciones de síntesis
INSTRUCCIONES DE SÍNTESIS:
${config.synthesisInstructions}

// Desde config (three-card-readings.ts líneas 53-54):
synthesisInstructions: "Integrar las tres cartas como una lectura coherente. 
Identificar el patrón emocional principal, la relación entre las posiciones, 
una posible tensión o recurso, una orientación práctica y una pregunta de reflexión."
```

**⚠️ PROBLEMA:** Las instrucciones NO mencionan explícitamente que debe usar el contexto del usuario.

El prompt confía en que el modelo vea el contexto arriba y lo integre automáticamente, pero no hay instrucción directa como:
- "Adapta tu interpretación al contexto específico del usuario"
- "Conecta las cartas con la situación descrita"
- "Responde considerando la pregunta planteada"

---

## FASE 4: INSPECCIÓN FALLBACK

### 4.1 Generador de Fallback

**Archivo:** `src/lib/tarot/synthesis-generator.ts`

```typescript
// Líneas 107-111: Firma de la función
export function buildThreeCardSynthesisFallback(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  positions: readonly [ThreeCardPositionConfig, ThreeCardPositionConfig, ThreeCardPositionConfig],
): ThreeCardSynthesis {
```

**❌ CRÍTICO:** El fallback **NO RECIBE** el parámetro `userContext`.

**Consecuencia:** Si la IA falla, el fallback genera una interpretación completamente genérica que ignora la pregunta del usuario.

---

### 4.2 Uso del Fallback

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

```typescript
// Líneas 525-533: Llamada al fallback sin contexto
} catch (aiError) {
  console.warn("[tarot_reading_ai_fallback]", aiError);
  
  stage = "fallback";
  const fallbackResponse = buildFallbackReading(config, cards, input.user.requestId);
  // ← NO se pasa input.user.context
```

**❌ CONFIRMADO:** El fallback descarta completamente la pregunta del usuario.

---

## FASE 5: AUDITORÍA DE PRIVACIDAD

### 5.1 Persistencia en Base de Datos

**Archivo:** `src/lib/account/repository.ts`

```typescript
// Líneas 212-214: Comentario explícito
/**
 * Guarda una lectura manualmente. Nunca se guarda la pregunta original,
 * solo la selección de cartas, la interpretación y una nota opcional.
 */

// Líneas 222-230: Función de guardado
export async function saveTarotReading(input: {
  userId: string;
  spreadType: SpreadType;
  cards: SavedReadingCard[];
  interpretation?: string | null;
  note?: string | null;  // ← Solo nota manual, NO pregunta original
}): Promise<SavedReading> {
```

**Archivo:** `src/integrations/supabase/types.ts`

```typescript
// Líneas 848-856: Schema de saved_tarot_readings
Row: {
  cards: Json;
  created_at: string;
  id: string;
  interpretation: string | null;
  note: string | null;
  spread_type: string;
  user_id: string;
  // ← NO existe campo 'question' ni 'context'
};
```

**✅ CORRECTO:** La pregunta NO se persiste en Supabase.

---

### 5.2 Transmisión a Servicios Externos

**Flujo de transmisión:**
1. Usuario escribe pregunta en textarea
2. Frontend → `/api/tarot/interpret-reading` (servidor propio)
3. Servidor → `buildReadingPrompt()` incluye pregunta
4. Servidor → `streamChatCompletion()` → DeepSeek API

**Archivo:** `src/lib/ai/gateway.server.ts`

```typescript
// Líneas 75-100: Función que transmite a DeepSeek
export async function streamChatCompletion(
  options: GatewayStreamOptions,
): Promise<{ stream: ReadableStream<Uint8Array>; getText: () => string }> {
  const provider = resolveAiProvider();
  const apiKey =
    provider === "deepseek" ? process.env.DEEPSEEK_API_KEY : process.env.LOVABLE_API_KEY;
  // ...
  const url = provider === "deepseek" ? resolveDeepSeekUrl() : LOVABLE_GATEWAY_URL;
```

**❌ CRÍTICO:** La pregunta del usuario SÍ se transmite a DeepSeek (o Lovable según configuración).

---

### 5.3 Análisis del Texto de Privacidad Actual

**Ubicación:** No encontrado directamente en código, pero referenciado en el problema reportado.

**Texto reportado por usuario:** _"La pregunta no se guarda ni se envía a ningún servicio"_

**Análisis de veracidad:**
- ✅ "no se guarda" → **VERDADERO** (no va a Supabase)
- ❌ "ni se envía a ningún servicio" → **FALSO** (sí se envía a DeepSeek/Lovable)

**Gravedad:** CRÍTICA - Violación de transparencia sobre transmisión de datos personales.

---

## FASE 6: PRUEBA COMPARATIVA CONCEPTUAL

### Escenario de Prueba

**Cartas fijas:** The Lovers, Two of Cups, The Tower (ejemplo)

**Contexto A:** ""  
**Contexto B:** "Estoy conociendo a alguien y quiero saber qué observar antes de avanzar"  
**Contexto C:** "Llevo años en relación y quiero recuperar la confianza"  
**Contexto D:** "Estoy pensando en cerrar una relación que ya no me hace sentir bien"

### Predicción de Comportamiento

**Con IA funcionando:**
- ✅ Debería adaptar interpretaciones al contexto específico
- ⚠️ Calidad depende de si el modelo sigue instrucciones implícitas
- ⚠️ Sin instrucción explícita, puede solo añadir frase inicial genérica

**Con Fallback:**
- ❌ Ignorará completamente el contexto
- ❌ Todas las interpretaciones serán idénticas independientemente del contexto
- ❌ Usuario sentirá que su pregunta fue desperdiciada

### Criterio de Aprobación

**Para considerar que la influencia es REAL:**
- Las interpretaciones individuales deben reflejar el tipo de situación
- La síntesis debe responder al asunto central planteado
- La orientación práctica debe cambiar coherentemente
- NO basta con añadir solo una frase inicial o pregunta final

---

## FASE 7: DECISIONES Y RECOMENDACIONES

### Escenario Actual: INFLUYE CON IA, NO INFLUYE CON FALLBACK

**Problemas identificados:</p>
1. **Privacidad:** Texto UI falso sobre transmisión
2. **Seguridad:** Safety check no valida `user.context`
3. **Inconsistencia:** Fallback ignora contexto
4. **Instrucciones débiles:** Prompt no instruye explícitamente usar contexto

---

### RECOMENDACIONES OBLIGATORIAS

#### 1. CORREGIR TEXTO DE PRIVACIDAD (CRÍTICO)

**Ubicación a buscar:**
- `TarotQuestionInput.tsx`
- Props de `config.intro` en three-card-readings.ts

**Texto actual (a encontrar):**
> "La pregunta no se guarda ni se envía a ningún servicio"

**Texto corregido propuesto:**
> "Tu pregunta personaliza la interpretación mediante IA. No la guardamos en tu cuenta, pero se procesa a través de nuestro proveedor de inteligencia artificial. Evita incluir nombres completos o datos muy sensibles."

**Alternativa más breve:**
> "Tu pregunta se usa para personalizar la interpretación (procesada por IA, no guardada en tu cuenta)."

---

#### 2. AÑADIR SAFETY CHECK PARA CONTEXT (SEGURIDAD)

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

**Cambio en línea 475:**

```typescript
stage = "safety_check";
// ANTES: solo verificaba user.question
if (input.user.question) {
  const safetyCheck = checkSafety(input.user.question);
  // ...
}

// DESPUÉS: verificar AMBOS campos
const textToCheck = [input.user.context, input.user.question]
  .filter(Boolean)
  .join(" ");

if (textToCheck.trim()) {
  const safetyCheck = checkSafety(textToCheck);
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

#### 3. MEJORAR INSTRUCCIONES EN PROMPT (CALIDAD)

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

**Modificar líneas 198-220:**

```typescript
${userContext ? `CONTEXTO DEL USUARIO: "${userContext}"

IMPORTANTE: Adapta TODAS las interpretaciones (por carta y síntesis) a esta situación específica. 
No te limites a añadir una frase genérica al inicio o final. Conecta el significado simbólico 
de cada carta con los elementos concretos del contexto descrito.` : ""}
```

---

#### 4. CORREGIR FALLBACK PARA USAR CONTEXTO (CRÍTICO)

**Archivo:** `src/lib/tarot/synthesis-generator.ts`

**Modificar firma función (línea 107):**

```typescript
export function buildThreeCardSynthesisFallback(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  positions: readonly [ThreeCardPositionConfig, ThreeCardPositionConfig, ThreeCardPositionConfig],
  userContext?: string,  // ← AÑADIR PARÁMETRO
): ThreeCardSynthesis {
```

**Modificar generación de texto (líneas 129-136):**

```typescript
const contextPrefix = userContext 
  ? `En relación a tu situación, esta lectura ` 
  : `Esta lectura `;

const mainPattern = `${contextPrefix}une ${keyword1}, ${keyword2} y ${keyword3} alrededor de ${categoryText}, ${tone}.`;

// Similar para guidance y reflectionQuestion: adaptar si hay contexto
```

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`

**Modificar llamada fallback (línea 529):**

```typescript
const fallbackResponse = buildFallbackReading(
  config, 
  cards, 
  input.user.requestId,
  input.user.context  // ← PASAR CONTEXTO
);
```

**Y modificar buildFallbackReading (líneas 342-374):**

```typescript
function buildFallbackReading(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  requestId: string,
  userContext?: string,  // ← AÑADIR PARÁMETRO
): InterpretReadingResponse {
  const synthesis = buildThreeCardSynthesisFallback(
    config, 
    cards, 
    config.positions,
    userContext  // ← PASAR A GENERADOR
  );
```

---

## FASE 8: TESTS RECOMENDADOS

### Tests a Crear

**Archivo:** `src/routes/api/tarot/interpret-reading.test.ts`

```typescript
describe("interpret-reading context handling", () => {
  it("should include user.context in prompt", async () => {
    // Mock buildReadingPrompt, verificar que recibe context
  });

  it("should apply safety check to user.context", async () => {
    // Enviar context con contenido unsafe, verificar rechazo
  });

  it("should pass context to fallback generator", async () => {
    // Forzar fallback, verificar que recibe context
  });

  it("should not persist context to database", async () => {
    // Verificar que saved_tarot_readings no tiene question
  });
});
```

---

## CONCLUSIONES FINALES

### Veredicto

⚠️ **CORRECCIÓN REQUERIDA - CRÍTICA PRIVACIDAD**

### Resumen de Hallazgos

1. ✅ La pregunta SÍ influye cuando la IA funciona
2. ❌ La pregunta NO influye cuando se usa fallback
3. ❌ CRÍTICO: El texto de privacidad es falso
4. ❌ SEGURIDAD: No hay safety check para el contexto
5. ✅ CORRECTO: No se persiste en base de datos

### Acciones Inmediatas Requeridas

**Prioridad 1 (Legal/Privacidad):**
- [ ] Corregir texto de privacidad INMEDIATAMENTE
- [ ] Añadir safety check para user.context

**Prioridad 2 (Experiencia de Usuario):**
- [ ] Corregir fallback para usar contexto
- [ ] Mejorar instrucciones en prompt IA

**Prioridad 3 (Calidad):**
- [ ] Añadir tests automatizados
- [ ] Validar comparativamente con preguntas reales

### Mantener o Eliminar Campo

**RECOMENDACIÓN: MANTENER**, pero con correcciones obligatorias.

**Razones:**
- El campo SÍ tiene valor funcional (cuando IA funciona)
- Los usuarios lo esperan en lecturas de tarot
- Solo requiere correcciones, no eliminación

**Condición:** NO debe estar visible hasta completar las 4 correcciones obligatorias.

---

## ARCHIVOS INVOLUCRADOS

### Frontend
- `src/components/tarot/experience/ThreeCardLoveExperienceShell.tsx` (estado y UI)
- `src/components/tarot/TarotQuestionInput.tsx` (componente input)
- `src/hooks/useThreeCardInterpretation.ts` (payload)

### Backend
- `src/routes/api/tarot/interpret-reading.ts` (endpoint principal)
- `src/lib/tarot/synthesis-generator.ts` (fallback)
- `src/config/three-card-readings.ts` (configuración)

### Seguridad
- `src/server/tarot/safety-check.ts` (validación contenido)

### AI Gateway
- `src/lib/ai/gateway.server.ts` (transmisión a DeepSeek)

### Base de Datos
- `src/lib/account/repository.ts` (guardado lecturas)
- `src/integrations/supabase/types.ts` (schema)

---

**FIN DEL INFORME**
