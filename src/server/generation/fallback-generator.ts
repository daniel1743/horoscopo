import type { SignContext } from "../rules/domain";
import { GENERATION_SCHEMA_VERSION, type GeneratedHoroscopeDraft } from "./domain";

const SECTION_TOPICS = {
  love: ["love", "relationships"],
  work: ["work", "organization", "communication", "creativity"],
  wellbeing: ["wellbeing", "personal_energy"],
  reflection: ["reflection"],
} as const;

function sentenceFor(
  section: keyof GeneratedHoroscopeDraft["sections"],
  context: SignContext,
): string {
  const topics = SECTION_TOPICS[section];
  const facts = context.selectedFacts.filter((fact) => topics.includes(fact.topic as never));
  const baseTopic = facts[0]?.topic ?? "reflection";
  const polarity = facts[0]?.polarity ?? "neutral";
  const tone =
    polarity === "challenging"
      ? "invita a avanzar con pausa, observando matices antes de tomar decisiones importantes"
      : polarity === "supportive"
        ? "favorece una mirada abierta, concreta y disponible para ordenar prioridades"
        : "puede servir para mirar el periodo con calma, claridad y sentido practico";
  return `Para ${context.sign}, el area de ${baseTopic} ${tone}. Esta lectura se apoya solo en los hechos seleccionados del contexto y propone una orientacion general, sin presentar certezas ni resultados garantizados.`;
}

export function buildFallbackDraft(context: SignContext): GeneratedHoroscopeDraft {
  const usedFactIds = context.selectedFacts.map((fact) => fact.id).sort();
  const sourceEventIds = [
    ...new Set(context.selectedFacts.flatMap((fact) => [...fact.sourceEventIds])),
  ].sort();
  return {
    schemaVersion: GENERATION_SCHEMA_VERSION,
    signContextId: context.id,
    sign: context.sign,
    period: context.period,
    title: `Orientacion astral general para ${context.sign} en este periodo`,
    summary: `El contexto disponible para ${context.sign} ofrece una lectura general basada en hechos estructurados y trazables. La orientacion mantiene un tono prudente, sin afirmar certezas ni agregar datos personales o natales.`,
    sections: {
      love: sentenceFor("love", context),
      work: sentenceFor("work", context),
      wellbeing: sentenceFor("wellbeing", context),
      reflection: sentenceFor("reflection", context),
    },
    closingMessage: `Toma esta lectura como una guia simbolica y general para observar el periodo con mas claridad y calma.`,
    usedFactIds,
    sourceEventIds,
  };
}
