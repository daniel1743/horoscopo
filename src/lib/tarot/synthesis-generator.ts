/**
 * Síntesis global para tirada de tres cartas.
 * Conecta las tres posiciones en una lectura coherente.
 */
import type { TarotCard, ThreeCardPositionConfig, ThreeCardReadingConfig } from "@/types/tarot";

export interface ThreeCardSynthesis {
  text: string;
  reflectionQuestion: string;
}

/**
 * Genera síntesis determinista desde datos de cartas cuando IA no está disponible o falla.
 * No inventa información; usa datos existentes en las cartas.
 */
export function buildThreeCardSynthesisFallback(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  positions: readonly [ThreeCardPositionConfig, ThreeCardPositionConfig, ThreeCardPositionConfig],
): ThreeCardSynthesis {
  const [card1, card2, card3] = cards;
  const [pos1, pos2, pos3] = positions;

  // Análisis básico de keywords y tendencias
  const keywords1 = card1.keywords.slice(0, 2);
  const keywords2 = card2.keywords.slice(0, 2);
  const keywords3 = card3.keywords.slice(0, 2);

  // Detectar si hay solapamiento conceptual (keywords en común)
  const commonKeywords = [
    ...keywords1.filter((k) => keywords2.includes(k) || keywords3.includes(k)),
  ];

  // Contar cartas favorables, de cautela, abiertas
  const tendencies = [card1.yesNoTendency, card2.yesNoTendency, card3.yesNoTendency];
  const favorableCount = tendencies.filter((t) => t === "favorable").length;
  const cautionCount = tendencies.filter((t) => t === "caution").length;

  // Construir texto integrado
  let text = "";

  // Identificar energía principal
  if (favorableCount === 3) {
    text += `Las tres cartas sugieren una energía constructiva. ${pos1.shortLabel} lleva recursos internos, ${pos2.shortLabel} muestra un movimiento con potencial, y ${pos3.shortLabel} apunta hacia una orientación clara. `;
  } else if (cautionCount >= 2) {
    text += `La lectura invita a la reflexión. ${pos1.shortLabel} revela lo que llevas, ${pos2.shortLabel} sugiere un aspecto que requiere atención, y ${pos3.shortLabel} ofrece una orientación cautelosa pero útil. `;
  } else {
    text += `La lectura presenta múltiples perspectivas. ${pos1.shortLabel} muestra una realidad, ${pos2.shortLabel} añade complejidad, y ${pos3.shortLabel} señala un camino posible. `;
  }

  // Conexión entre cartas
  if (commonKeywords.length > 0) {
    text += `Las tres cartas convergen alrededor de "${commonKeywords[0]}"—un hilo común que conecta tu emoción, la dinámica actual y la orientación que necesitas. `;
  } else {
    text += `${card1.name} establece el contexto emocional, ${card2.name} describe la dinámica en juego, y ${card3.name} introduce lo que conviene considerar. `;
  }

  // Tensión o recurso + orientación
  if (favorableCount > cautionCount) {
    text += `Tienes capacidad para navegar esta situación. ${keywords1[0]}, ${keywords2[0]} y ${keywords3[0]} son fuerzas disponibles. ${pos3.label} sugiere enfocarte en ${pos3.interpretationFocus.toLowerCase()}.`;
  } else if (cautionCount > favorableCount) {
    text += `Hay un llamado a frenar, revisar y elegir con cuidado antes de actuar. ${pos3.label} sugiere observar ${pos3.interpretationFocus.toLowerCase()}.`;
  } else {
    text += `Hay un equilibrio delicado. Ni todo es favorable ni todo requiere cautela. Hay espacio para elegir cómo responder. ${pos3.label} te invita a enfocarte en ${pos3.interpretationFocus.toLowerCase()}.`;
  }

  // Pregunta de reflexión conectada a las tres cartas
  const reflectionQuestion = `¿Cómo puedo usar lo que llevo internamente—${keywords1[0]}, ${keywords2[0]}—para honrar la orientación que señala ${card3.name}?`;

  return {
    text,
    reflectionQuestion,
  };
}

/**
 * Prompt para IA que genera síntesis global.
 * Retorna instrucciones detalladas sin comprometer la tirada.
 */
export function buildSynthesisPrompt(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  positions: readonly [ThreeCardPositionConfig, ThreeCardPositionConfig, ThreeCardPositionConfig],
  userContext?: string,
): string {
  const [card1, card2, card3] = cards;
  const [pos1, pos2, pos3] = positions;

  return `
Eres una asistente de tarot reflexiva. Tu tarea es generar una síntesis global coherente para una tirada de tres cartas temática.

CONTEXTO DE LA TIRADA:
- Tema: ${config.title}
- Enfoque: ${config.synthesisInstructions}

CARTAS REVELADAS:
1. ${pos1.label} (${pos1.shortLabel}): ${card1.name}
   - Significado upright: ${card1.uprightMeaning}
   - Keywords: ${card1.keywords.slice(0, 4).join(", ")}
   - Foco de interpretación: ${pos1.interpretationFocus}

2. ${pos2.label} (${pos2.shortLabel}): ${card2.name}
   - Significado upright: ${card2.uprightMeaning}
   - Keywords: ${card2.keywords.slice(0, 4).join(", ")}
   - Foco de interpretación: ${pos2.interpretationFocus}

3. ${pos3.label} (${pos3.shortLabel}): ${card3.name}
   - Significado upright: ${card3.uprightMeaning}
   - Keywords: ${card3.keywords.slice(0, 4).join(", ")}
   - Foco de interpretación: ${pos3.interpretationFocus}

${userContext ? `CONTEXTO DEL USUARIO: "${userContext}"` : ""}

TU TAREA:
Genera una síntesis que:
1. NO concatene los tres significados. Integra las cartas como una narrativa.
2. Identifica cómo ${pos1.shortLabel} → ${pos2.shortLabel} → ${pos3.shortLabel} construyen una historia.
3. Busca patrones comunes (keywords que se repiten, tendencias similares).
4. Ofrece una orientación práctica sin ordenar decisiones.
5. Termina con una pregunta reflexiva que conecte las tres cartas.

ESTRUCTURA DE TU RESPUESTA:
Devuelve un JSON válido, sin markdown:
{
  "text": "Párrafo integrado de 4-5 frases que conecta las tres cartas como conjunto.",
  "reflectionQuestion": "Una pregunta de reflexión que integre las tres cartas."
}

RESTRICCIONES:
- No afirmes certezas de futuro.
- No leas la mente de terceros.
- No predijas reconciliaciones, separaciones ni decisiones.
- Usa lenguaje condicional y simbólico.
- Máximo 700 caracteres para text.
- Máximo 150 caracteres para reflectionQuestion.
- Español natural sin palabras truncadas.
`;
}
