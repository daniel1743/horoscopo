/**
 * FASE H: Fallback Editorial sin IA
 *
 * Cuando IA falla (timeout, error, parse error, etc),
 * construir respuesta desde datos existentes de la carta.
 *
 * NO es una respuesta inferior, es un plan B seguro y determinista.
 */

import type { TarotCard } from "@/types/tarot";
import type { TarotContextualResponse } from "@/routes/api/tarot/interpret";

export function buildFallbackResponse(
  card: TarotCard,
  orientation: "upright" | "reversed",
  requestId: string,
  userQuestion?: string,
): TarotContextualResponse {
  const summary = normalizeText(card.summary);
  const uprightMeaning =
    normalizeText(card.uprightMeaning) || `${card.name} invita a observar tu situacion con calma.`;
  const reversedMeaning = normalizeText(card.reversedMeaning);
  const keywords = normalizeKeywords(card.keywords);
  const selectedMeaning =
    orientation === "reversed" ? reversedMeaning || uprightMeaning : uprightMeaning;

  const keywordStr = keywords.slice(0, 4).join(", ");

  // Mapear tendencia a energy
  const energy =
    card.yesNoTendency === "favorable"
      ? "favorable"
      : card.yesNoTendency === "caution"
        ? "caution"
        : "open";

  if (userQuestion && isSimpleGreeting(userQuestion)) {
    return buildFallbackGreetingResponse(card.name, energy, requestId);
  }

  // mainMessage: Combina summary + significado
  const mainMessage = buildMainMessage(card.name, summary, selectedMeaning, energy);

  // positiveValue: Desde keywords + summary
  const positiveValue = buildPositiveValue(card.name, keywordStr, summary);

  // caution: Inteligencia dependiendo de energy
  const caution = buildCaution(card.name, energy, reversedMeaning);

  // practicalAdvice: Acción concreta desde la carta
  const practicalAdvice = buildPracticalAdvice(card.name, energy, keywordStr);

  // reflectionQuestion: O usa la existente o genera una
  const reflectionQuestion =
    card.reflectionQuestion && card.reflectionQuestion.length >= 20
      ? card.reflectionQuestion
      : buildReflectionQuestion(card.name, energy);

  return {
    schemaVersion: "tarot-contextual-guide@1",
    requestId,
    energy,
    mainMessage,
    positiveValue,
    caution,
    practicalAdvice,
    reflectionQuestion,
    disclaimer: "Interpretación simbólica para reflexión personal.",
  };
}

// ============ BUILDERS ============

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeKeywords(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (keyword): keyword is string => typeof keyword === "string" && keyword.trim().length > 0,
      )
    : [];
}

function normalizeUserText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¡!¿?.,;:()[\]{}"'`´]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSimpleGreeting(question: string): boolean {
  const normalized = normalizeUserText(question);
  return [
    /^hola$/,
    /^buenas$/,
    /^buenos dias$/,
    /^buenas tardes$/,
    /^buenas noches$/,
    /^hey$/,
    /^holi$/,
    /^saludos$/,
    /^que tal$/,
    /^como estas$/,
  ].some((pattern) => pattern.test(normalized));
}

function buildFallbackGreetingResponse(
  cardName: string,
  energy: "favorable" | "caution" | "open",
  requestId: string,
): TarotContextualResponse {
  return {
    schemaVersion: "tarot-contextual-guide@1",
    requestId,
    responseMode: "conversation",
    energy,
    mainMessage: `Hola, que gusto acompanarte. Hoy la carta presente es ${cardName}; podemos mirarla con calma desde el amor, el trabajo, una decision, una emocion o una forma practica de aplicar su mensaje.`,
    positiveValue: `${cardName} puede abrir una conversacion serena y simbolica para ordenar lo que quieres explorar ahora.`,
    caution:
      "La lectura no reemplaza tus decisiones ni afirma certezas; funciona como una guia reflexiva.",
    practicalAdvice:
      "Puedes contarme el tema que quieres mirar y lo conectare con la carta de forma breve y clara.",
    reflectionQuestion: `Que aspecto de ${cardName} te gustaria explorar primero?`,
    disclaimer: "Interpretación simbólica para reflexión personal.",
  };
}

function buildMainMessage(
  cardName: string,
  summary: string,
  meaning: string,
  energy: "favorable" | "caution" | "open",
): string {
  // Estrategia: usa las primeras 1-2 oraciones del summary
  const sentences = summary.split(/(?<=[.!?])\s+/).filter(Boolean);

  if (sentences.length === 0) {
    return `${cardName} te invita a mirar tu situacion con calma y a ordenar lo que sientes antes de tomar una decision.`;
  }

  let result = sentences[0];

  // Si es muy corta, agregar segunda oración o meaning
  if (result.length < 100 && sentences.length > 1) {
    result += " " + sentences[1];
  }

  // Asegurar que no exceda max
  if (result.length > 400) {
    result = result.substring(0, 397) + "...";
  }

  if (result.length < 50) {
    result = `${result} Observa esta carta como una invitación simbólica a mirar tu situación con más calma.`;
  }

  // Limpiar resultado (remover puntos al final si quedó truncado)
  result = result.replace(/\.\.\.$/, ".");

  return result;
}

function buildPositiveValue(cardName: string, keywords: string, summary: string): string {
  // Estrategia: primer keyword + conexión a summary
  const firstKeyword = keywords.split(",")[0]?.trim();

  if (firstKeyword) {
    return `${cardName} conecta con ${firstKeyword}. Su presencia destaca la importancia de esta energía en tu situación.`;
  }

  // Fallback a summary
  const firstSentence = summary.split(/[.!?]/)[0];
  return firstSentence && firstSentence.length > 30
    ? firstSentence + "."
    : `${cardName} aporta su energía característica a tu reflexión.`;
}

function buildCaution(
  cardName: string,
  energy: "favorable" | "caution" | "open",
  reversedMeaning: string | null,
): string {
  if (energy === "favorable") {
    return `Aunque ${cardName} es positiva, recuerda que toda energía requiere balance. No asumas que todo está resuelto.`;
  }

  if (energy === "caution") {
    if (reversedMeaning) {
      return `${cardName} sugiere cautela. ${reversedMeaning.substring(0, 150)} Observa antes de actuar.`;
    }
    return `${cardName} invita a la observación. Tómate tiempo antes de tomar decisiones importantes.`;
  }

  // open
  return `${cardName} deja la lectura abierta. Su sentido depende del contexto, de tus decisiones y de cómo elijas actuar.`;
}

function buildPracticalAdvice(
  cardName: string,
  energy: "favorable" | "caution" | "open",
  keywords: string,
): string {
  if (energy === "favorable") {
    return `Aprovecha la energía de ${cardName} hoy. Si una idea te atrae, es momento de explorarla sin esperar a que todo sea perfecto.`;
  }

  if (energy === "caution") {
    return `Con ${cardName}, la mejor acción es pausar. Observa la situación desde distintos ángulos antes de decidir.`;
  }

  // open
  return `${cardName} te pide que confíes en tu instinto. Elige la dirección que resuena más contigo, sin forzar la respuesta.`;
}

function buildReflectionQuestion(
  cardName: string,
  energy: "favorable" | "caution" | "open",
): string {
  if (energy === "favorable") {
    return `¿Qué oportunidad que ${cardName} trae puedo aprovechar hoy?`;
  }

  if (energy === "caution") {
    return `¿Qué necesito observar o entender mejor antes de actuar?`;
  }

  return `¿Qué opción resuena más con quien quiero ser?`;
}
