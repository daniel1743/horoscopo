import type { RuleFact, SignContext } from "../rules/domain";
import { GENERATION_SCHEMA_VERSION, type GeneratedHoroscopeDraft } from "./domain";

export function generationFact(
  id = "fact:one",
  sourceEventIds: readonly string[] = ["event:one"],
): RuleFact {
  return {
    id,
    ruleId: "rule:test",
    sourceEventIds,
    sign: "aries",
    topic: "reflection",
    polarity: "neutral",
    importance: 0.7,
    confidence: 0.8,
    priority: 60,
    tags: ["safe-data"],
    payload: {
      kind: "lunar_phase_focus",
      phase: "new_moon",
      solarHouse: 1,
      recommendedTone: "reflective",
    },
    occurredAt: "2024-06-01T00:00:00.000Z",
    semanticKey: "aries:reflection:test",
  };
}

export function signContext(facts: readonly RuleFact[] = [generationFact()]): SignContext {
  return {
    id: "sign-context:test:daily:aries",
    kind: "sign_context",
    sign: "aries",
    period: "daily",
    windowStart: "2024-06-01T00:00:00.000Z",
    windowEnd: "2024-06-02T00:00:00.000Z",
    editorialTimezone: "America/Santiago",
    ruleCatalogVersion: "rules",
    policyVersion: "policy",
    selectedFacts: facts,
    activations: [],
    suppressions: [],
    invariants: {
      noGeneratedText: true,
      noNatalChartData: true,
      deterministicOrdering: true,
      policyApplied: true,
    },
  };
}

export function validDraft(context = signContext()): GeneratedHoroscopeDraft {
  const usedFactIds = context.selectedFacts.map((fact) => fact.id).sort();
  const sourceEventIds = [
    ...new Set(context.selectedFacts.flatMap((fact) => [...fact.sourceEventIds])),
  ].sort();
  return {
    schemaVersion: GENERATION_SCHEMA_VERSION,
    signContextId: context.id,
    sign: context.sign,
    period: context.period,
    title: "Orientacion general y prudente para Aries en este periodo",
    summary:
      "El contexto disponible ofrece una lectura general y trazable para observar el periodo con calma. La redaccion mantiene un tono reflexivo, evita certezas absolutas y se apoya solo en los hechos seleccionados.",
    sections: {
      love: "En vinculos y afectos, el periodo invita a observar las reacciones con calma y dar espacio a conversaciones cuidadosas. La lectura se mantiene como una orientacion general, sin prometer resultados ni cambios inevitables.",
      work: "En trabajo y organizacion, conviene ordenar prioridades con sentido practico y revisar compromisos antes de ampliarlos. El contexto sugiere atencion gradual, sin convertir la lectura en una prediccion cerrada.",
      wellbeing:
        "En bienestar general, el foco esta en reconocer el ritmo disponible y evitar exigencias innecesarias. Esta orientacion propone pausa, claridad y cuidado cotidiano sin ofrecer afirmaciones clinicas.",
      reflection:
        "En reflexion personal, los hechos seleccionados favorecen mirar el periodo con perspectiva y registrar lo que necesita mas claridad. La lectura conserva un tono prudente y no agrega eventos externos.",
    },
    closingMessage:
      "Usa esta guia como una referencia simbolica y general para observar el periodo con calma, criterio propio y sentido practico.",
    usedFactIds,
    sourceEventIds,
  };
}
