# DIAGNÓSTICO: CALIDAD DE LECTURA TRES CARTAS AMOR

## 🔍 Causa Raíz Identificada

**Archivo:** `src/routes/api/tarot/interpret-reading.ts`  
**Función:** `buildReadingPrompt` (líneas 184-267)

---

## ❌ Problemas del Prompt Actual

### 1. Estructura Mecánica y Repetitiva

**Líneas 224-256:**
```typescript
DEVUELVE JSON VÁLIDO con esta estructura EXACTA:
{
  "positions": [
    {
      "positionKey": "${pos1.key}",
      "interpretation": "Interpreta ${card1.name} según ${pos1.interpretationFocus} (2-3 frases)",
      "positiveValue": "Fortaleza que aporta esta carta en esta posición (1-2 frases)",
      "caution": "Aspecto a observar (1-2 frases)",
      "practicalFocus": "Acción o reflexión concreta (1-2 frases)"
    },
    ...
```

**Problema:**
- ❌ Pide **5 campos por carta** (interpretation, positiveValue, caution, practicalFocus + positionKey)
- ❌ La IA genera **texto independiente para cada campo**
- ❌ Resultado: **15 textos separados** (5 campos × 3 cartas) que no se integran
- ❌ Cada campo parece una "ficha" aislada

### 2. Repetición de Nombres de Cartas

**Líneas 203-219:**
```typescript
1. ${pos1.label} (${pos1.shortLabel}):
   Carta: ${card1.name}                    ← Nombre aquí
   Significado: ${card1.uprightMeaning}
   ...

"interpretation": "Interpreta ${card1.name} según..."  ← Y aquí otra vez
```

**Problema:**
- El nombre de la carta aparece **en el input Y en la instrucción de output**
- IA tiende a repetirlo nuevamente en la interpretación
- Resultado: "El Mago... El Mago en tu mundo emocional... El Mago sugiere..."

### 3. Síntesis No Integra

**Líneas 249-255:**
```typescript
"synthesis": {
  "mainPattern": "Patrón general de las tres cartas (2-3 frases)",
  "relationshipBetweenCards": "Cómo se conectan las tres cartas (2-3 frases)",
  "emotionalTensionOrResource": "Recurso o tensión destacada (2-3 frases)",
  "guidance": "Orientación práctica sin ordenar decisiones (2-3 frases)",
  "reflectionQuestion": "Pregunta que integre las tres cartas (1 frase)"
}
```

**Problema:**
- ❌ Pide **5 campos más** en la síntesis
- ❌ Cada campo genera texto independiente
- ❌ La IA ya dijo todo en los 15 campos anteriores
- ❌ Resultado: **parafrasea lo mismo** con palabras distintas

### 4. Lenguaje Demasiado Abstracto

**Líneas 258-266:**
```typescript
RESTRICCIONES:
- NO afirmes sentimientos de terceros como hechos
- NO predicas reconciliaciones, separaciones ni decisiones
- NO uses lenguaje fatalista
- USA condicional: "puede", "sugiere", "invita a"
```

**Problema:**
- ✅ Las restricciones son correctas (no cambiar)
- ❌ Pero no hay **instrucciones positivas** de cómo SÍ escribir
- ❌ Solo le dice lo que NO debe hacer
- ❌ Resultado: Lenguaje **demasiado cauteloso y genérico**

---

## 📊 Ejemplo Real del Problema

### Salida Actual (Repetitiva):

**Posición 1:**
```
Siete de Oros
Tu mundo emocional

Interpretation: El Siete de Oros en tu mundo emocional invita a medir avances...
Positive Value: Capacidad de evaluar...
Caution: No dispersar energía...
Practical Focus: Identifica qué recursos...
```

**Posición 2:**
```
Siete de Bastos
La dinámica afectiva

Interpretation: El Siete de Bastos en la dinámica afectiva sugiere...
Positive Value: Sostener límites...
Caution: No responder a cada provocación...
Practical Focus: Observa cómo cuidas...
```

**Síntesis:**
```
Main Pattern: Las tres cartas presentan múltiples perspectivas...
Relationship: Siete de Oros establece el contexto, Siete de Bastos describe la dinámica...
Emotional Tension: Un equilibrio delicado...
Guidance: Confía en tus recursos...
Reflection Question: ¿Cómo puedo usar...?
```

**Problemas visibles:**
- ✗ Nombres de cartas repetidos 3+ veces cada una
- ✗ Cada sección independiente (no fluye)
- ✗ Síntesis repite lo ya dicho
- ✗ Lenguaje abstracto ("múltiples perspectivas", "equilibrio delicado")
- ✗ No aterriza en situación amorosa concreta

---

## ✅ Solución Propuesta

### Cambio 1: Simplificar Estructura por Carta

**DE:**
```json
{
  "interpretation": "...",
  "positiveValue": "...",
  "caution": "...",
  "practicalFocus": "..."
}
```

**A:**
```json
{
  "interpretation": "Texto integrado que incluye significado, luz y sombra en 3-4 frases naturales"
}
```

**Beneficio:** De 15 textos independientes → 3 interpretaciones + 1 síntesis integrada

---

### Cambio 2: Eliminar Repetición de Nombres

**DE:**
```
Carta: ${card1.name}
"interpretation": "Interpreta ${card1.name} según..."
```

**A:**
```
Esta carta representa...
[No mencionar nombre en instrucción - la IA lo usará naturalmente una vez]
```

---

### Cambio 3: Síntesis Como Cierre Real

**DE:**
```json
{
  "mainPattern": "...",
  "relationshipBetweenCards": "...",
  "emotionalTensionOrResource": "...",
  "guidance": "...",
  "reflectionQuestion": "..."
}
```

**A:**
```json
{
  "synthesis": "Párrafo integrado (4-5 frases) que conecta las 3 cartas, identifica la tensión principal y cierra con orientación práctica",
  "reflectionQuestion": "Pregunta poderosa y concreta"
}
```

**Beneficio:** Síntesis deja de ser 5 campos que parafrasean → 1 texto que eleva

---

### Cambio 4: Tono Más Humano

**AGREGAR al prompt:**
```
TONO Y ESTILO:
- Escribe como si hablaras con alguien que confía en ti
- Usa lenguaje directo pero cálido
- Evita frases que apliquen a cualquiera ("múltiples perspectivas")
- Conecta con la situación amorosa real cuando el usuario dio contexto
- Sé específico sobre qué hacer con esta información
```

---

## 📝 Prompt Corregido (Propuesta)

```typescript
function buildReadingPrompt(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  userContext?: string,
  userQuestion?: string,
): string {
  const [card1, card2, card3] = cards;
  const [pos1, pos2, pos3] = config.positions;

  return `Eres una lectora de tarot experimentada y empática. Tu cliente te ha preguntado sobre su situación amorosa.

SITUACIÓN DEL CLIENTE:
${userContext ? `"${userContext}"` : "Una situación amorosa que requiere claridad"}
${userQuestion ? `Pregunta específica: "${userQuestion}"` : ""}

HAS REVELADO TRES CARTAS:

Posición 1 - ${pos1.label}:
${card1.name}
Significado tradicional: ${card1.uprightMeaning}
Palabras clave: ${card1.keywords.slice(0, 3).join(", ")}
Lo que debes interpretar: ${pos1.interpretationFocus}

Posición 2 - ${pos2.label}:
${card2.name}
Significado tradicional: ${card2.uprightMeaning}
Palabras clave: ${card2.keywords.slice(0, 3).join(", ")}
Lo que debes interpretar: ${pos2.interpretationFocus}

Posición 3 - ${pos3.label}:
${card3.name}
Significado tradicional: ${card3.uprightMeaning}
Palabras clave: ${card3.keywords.slice(0, 3).join(", ")}
Lo que debes interpretar: ${pos3.interpretationFocus}

---

TU TAREA:

1. Interpreta cada carta desde su posición específica (${pos1.shortLabel}, ${pos2.shortLabel}, ${pos3.shortLabel})
2. Conecta las tres cartas como una historia coherente sobre amor
3. Identifica qué tensión o aprendizaje hay entre ellas
4. Da orientación práctica que realmente ayude

DEVUELVE JSON con esta estructura:

{
  "positions": [
    {
      "positionKey": "${pos1.key}",
      "cardSlug": "${card1.slug}",
      "interpretation": "Interpreta esta carta en ${pos1.shortLabel}. Explica qué te está mostrando sobre su mundo emocional. Menciona tanto luz como sombra. 3-4 frases naturales, sin fórmulas mecánicas."
    },
    {
      "positionKey": "${pos2.key}",
      "cardSlug": "${card2.slug}",
      "interpretation": "Interpreta esta carta en ${pos2.shortLabel}. Explica qué está pasando en la dinámica del vínculo. 3-4 frases directas."
    },
    {
      "positionKey": "${pos3.key}",
      "cardSlug": "${card3.slug}",
      "interpretation": "Interpreta esta carta en ${pos3.shortLabel}. Da orientación concreta sobre cómo avanzar. 3-4 frases útiles."
    }
  ],
  "synthesis": {
    "text": "Escribe un párrafo integrado (4-5 frases) que: (1) identifique la energía principal de esta lectura, (2) muestre cómo las tres cartas se relacionan o contrastan, (3) nombre la tensión o aprendizaje central, (4) cierre con orientación práctica. NO repitas lo que ya dijiste arriba. Eleva la lectura.",
    "reflectionQuestion": "Una pregunta poderosa y concreta que conecte las tres cartas con la situación amorosa. Que invite a actuar o reflexionar específicamente."
  }
}

RESTRICCIONES ÉTICAS:
- NO afirmes lo que siente la otra persona como hecho
- NO prometas reconciliación, regreso ni decisiones por tu cliente
- NO uses lenguaje fatalista o definitivo
- SÍ usa condicional: "puede", "sugiere", "parece"
- SÍ sé honesto sobre luces y sombras

TONO:
- Directo pero cálido
- Específico, no genérico
- Humano, no institucional
- Útil, no abstracto

Límites: 400 caracteres por interpretation, 500 caracteres synthesis.text, 150 reflectionQuestion.`;
}
```

---

## 📊 Comparación Antes/Después

### ANTES (Actual):

**Estructura:**
- 3 cartas × 4 campos = **12 textos independientes**
- 5 campos síntesis = **5 textos más**
- **Total: 17 textos** que no se integran

**Resultado:**
```
"Siete de Oros en tu mundo emocional invita a medir avances..."
"Valor positivo: capacidad de evaluar..."
"Cautela: no dispersar energía..."
"Enfoque práctico: identifica qué recursos..."

[Síntesis repite todo con sinónimos]
"La lectura presenta múltiples perspectivas..."
```

---

### DESPUÉS (Propuesta):

**Estructura:**
- 3 interpretaciones integradas
- 1 síntesis que eleva
- 1 pregunta poderosa
- **Total: 5 bloques** coherentes

**Resultado esperado:**
```
"El Siete de Oros te pide detenerte a evaluar. Has invertido tiempo y energía
emocional, y ahora necesitas preguntarte: ¿esto está creciendo? La carta no
te apresura, pero tampoco te invita a seguir invirtiendo sin ver frutos."

[Síntesis integra y eleva]
"Las tres cartas dibujan una situación donde has cultivado algo (Siete de Oros),
ahora defiendes ese espacio (Siete de Bastos), pero necesitas decidir si lo
que ha germinado es realmente lo que buscabas (As de Oros). La tensión está
entre sostener lo conocido o abrirte a algo nuevo."

"¿Estás defendiendo esta relación porque te nutre, o porque ya invertiste mucho?"
```

---

## 🎯 Implementación Recomendada

### Archivo a modificar:
`src/routes/api/tarot/interpret-reading.ts`

### Función a reemplazar:
`buildReadingPrompt` (líneas 184-267)

### Cambios específicos:

1. **Línea 193:** Cambiar tono de "Eres la Guía..." a "Eres una lectora..."
2. **Líneas 195-199:** Reescribir contexto como situación del cliente
3. **Líneas 201-219:** Simplificar presentación de cartas
4. **Líneas 224-256:** Reducir de 5 campos por carta → 1 interpretation
5. **Líneas 249-255:** Reducir de 5 campos síntesis → text + reflectionQuestion
6. **Líneas 258-266:** Agregar instrucciones positivas de tono

### Tiempo estimado:
- Modificación: 15 minutos
- Tests: 10 minutos
- Build: 5 minutos
- **Total: 30 minutos**

---

## ✅ Beneficios Esperados

1. **Menos repetición** - Nombres de cartas usados naturalmente, no mecánicamente
2. **Más integración** - De 17 textos independientes → 5 bloques coherentes
3. **Síntesis real** - Eleva en lugar de parafrasear
4. **Tono humano** - Directo, cálido, útil
5. **Aterriza en amor** - Conecta con situación amorosa concreta

---

## 🚨 Qué NO Cambiar

✅ **Mantener restricciones éticas** (líneas 258-262)  
✅ **Mantener límites de caracteres** (líneas 264-266)  
✅ **Mantener estructura JSON** (parseo funciona)  
✅ **Mantener validación Zod** (schemas correctos)  

---

## 📋 Próximos Pasos

1. ¿Aprobar el prompt corregido?
2. Implementar en `buildReadingPrompt`
3. Actualizar tipos TypeScript si es necesario
4. Ejecutar tests
5. Build
6. Probar manualmente con mismas 3 cartas para comparar

**Tiempo total:** ~30 minutos

---

**Fecha:** 2026-08-02  
**Archivo afectado:** `src/routes/api/tarot/interpret-reading.ts`  
**Líneas:** 184-267  
**Impacto:** Mejora calidad sin cambiar lógica
