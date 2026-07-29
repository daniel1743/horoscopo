import type { SignContext } from "../rules/domain";
import {
  GENERATION_PROMPT_VERSION,
  GENERATION_SCHEMA_VERSION,
  type GenerationFactInput,
  type GenerationRequest,
  type PromptBundle,
  stableGenerationRequestId,
} from "./domain";
import { DEFAULT_GENERATION_CONSTRAINTS } from "./generation-policy";

function compareFacts(left: GenerationFactInput, right: GenerationFactInput): number {
  const topicDelta = left.topic.localeCompare(right.topic);
  if (topicDelta !== 0) return topicDelta;
  return left.factId.localeCompare(right.factId);
}

export function buildGenerationRequest(context: SignContext): GenerationRequest {
  const facts: GenerationFactInput[] = [...context.selectedFacts]
    .map((fact) => ({
      factId: fact.id,
      ruleId: fact.ruleId,
      sourceEventIds: [...fact.sourceEventIds].sort(),
      topic: fact.topic,
      polarity: fact.polarity,
      importance: fact.importance,
      confidence: fact.confidence,
      payload: fact.payload,
    }))
    .sort(compareFacts);

  return {
    id: stableGenerationRequestId(context),
    signContextId: context.id,
    sign: context.sign,
    period: context.period,
    windowStart: context.windowStart,
    windowEnd: context.windowEnd,
    editorialTimezone: context.editorialTimezone,
    facts,
    constraints: DEFAULT_GENERATION_CONSTRAINTS,
    outputSchemaVersion: GENERATION_SCHEMA_VERSION,
    promptVersion: GENERATION_PROMPT_VERSION,
  };
}

export function buildPromptBundle(request: GenerationRequest): PromptBundle {
  const schema = {
    schemaVersion: request.outputSchemaVersion,
    signContextId: request.signContextId,
    sign: request.sign,
    period: request.period,
    title: "string",
    summary: "string",
    sections: {
      love: "string",
      work: "string",
      wellbeing: "string",
      reflection: "string",
    },
    closingMessage: "string",
    usedFactIds: ["factId"],
    sourceEventIds: ["sourceEventId"],
  };

  const systemPrompt = [
    "Eres un redactor editorial de astrologia general. La astronomia y las reglas ya estan calculadas.",
    "Devuelve exclusivamente JSON valido. No uses Markdown, bloques de codigo ni explicaciones.",
    "No inventes hechos, planetas, eventos, aspectos, retrogradaciones ni datos natales.",
    "No cambies el signo, periodo, signContextId ni sourceEventIds.",
    "No hagas afirmaciones absolutas, diagnosticos, tratamientos ni promesas financieras.",
    "Usa tono claro, reflexivo, cercano, prudente y no fatalista.",
  ].join("\n");

  const userPrompt = JSON.stringify(
    {
      instructions: {
        output: "JSON object only",
        noMarkdown: true,
        noInventedFacts: true,
        noNatalChartData: true,
        noAbsoluteCertainty: true,
      },
      request,
      expectedSchema: schema,
    },
    null,
    2,
  );

  return {
    systemPrompt,
    userPrompt,
    responseFormat: {
      type: "json_object",
      schemaVersion: request.outputSchemaVersion,
    },
  };
}
