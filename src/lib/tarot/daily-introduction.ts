import type { TarotCard } from "@/types/tarot";

type DailyIntroCard = Pick<
  TarotCard,
  "name" | "summary" | "keywords" | "yesNoTendency" | "uprightMeaning"
>;

const MIN_TARGET_LENGTH = 70;
const MAX_TARGET_LENGTH = 160;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function splitSentences(value: string): string[] {
  return normalizeText(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function truncateAtWord(value: string): string {
  const normalized = normalizeText(value);
  if (normalized.length <= MAX_TARGET_LENGTH) return normalized;

  const truncated = normalized.slice(0, MAX_TARGET_LENGTH - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const clean = truncated.slice(0, lastSpace > MIN_TARGET_LENGTH ? lastSpace : truncated.length);
  return `${clean.replace(/[,:;.\s]+$/, "")}.`;
}

function buildKeywordFallback(card: DailyIntroCard): string {
  const keywords = card.keywords.slice(0, 3).join(", ");
  const focus = keywords || "lo que esta carta despierta";

  if (card.yesNoTendency === "caution") {
    return `Hoy, ${card.name} invita a observar ${focus} con calma antes de convertir una impresión en decisión.`;
  }

  if (card.yesNoTendency === "open") {
    return `Hoy, ${card.name} abre una reflexión sobre ${focus}, sin cerrar la respuesta antes de mirar el contexto.`;
  }

  return `Hoy, ${card.name} propone reconocer ${focus} y convertir esa claridad en un gesto concreto.`;
}

export function buildDailyTarotIntroduction(card: DailyIntroCard): string {
  const summarySentences = splitSentences(card.summary);
  const [firstSentence, secondSentence] = summarySentences;

  if (firstSentence && firstSentence.length >= MIN_TARGET_LENGTH) {
    return truncateAtWord(firstSentence);
  }

  if (firstSentence && secondSentence) {
    const joined = `${firstSentence.replace(/\.$/, "")}; ${secondSentence}`;
    if (joined.length >= MIN_TARGET_LENGTH && joined.length <= MAX_TARGET_LENGTH) {
      return joined;
    }
  }

  if (card.keywords.length > 0) {
    return truncateAtWord(buildKeywordFallback(card));
  }

  const uprightSentences = splitSentences(card.uprightMeaning);
  if (uprightSentences[0] && uprightSentences[0].length >= MIN_TARGET_LENGTH) {
    return truncateAtWord(uprightSentences[0]);
  }

  return truncateAtWord(buildKeywordFallback(card));
}
