import type { PlanetaryBody } from "../planetary/planetary-engine";
import { ZODIAC_SIGN_ORDER } from "../planetary/zodiac-math";
import type { TimeWindowEvent, TimeWindowEventSet } from "../transits/time-window-event-resolver";
import type { ZodiacSignKey } from "@/types/compatibility";

export const ZODIAC_SIGNS = ZODIAC_SIGN_ORDER;
export type ZodiacSign = ZodiacSignKey;
export type EditorialPeriod = "daily" | "weekly" | "monthly";
export type EditorialTopic =
  | "love"
  | "relationships"
  | "work"
  | "creativity"
  | "organization"
  | "wellbeing"
  | "reflection"
  | "communication"
  | "personal_energy";

export type RulePolarity = "supportive" | "challenging" | "neutral";
export type RecommendedTone = "reflective" | "practical" | "steady" | "energized";

export type RuleFactPayload =
  | {
      kind: "aspect_emphasis";
      aspectType: Extract<TimeWindowEvent, { type: "exact_aspect" }>["aspectType"];
      sourceBodies: readonly PlanetaryBody[];
      solarHouse: number;
      recommendedTone: RecommendedTone;
    }
  | {
      kind: "sign_ingress_focus";
      body: PlanetaryBody;
      toSign: ZodiacSign;
      solarHouse: number;
      recommendedTone: RecommendedTone;
    }
  | {
      kind: "station_focus";
      body: PlanetaryBody;
      stationType: "retrograde" | "direct";
      recommendedTone: RecommendedTone;
    }
  | {
      kind: "lunar_phase_focus";
      phase: Extract<TimeWindowEvent, { type: "lunar_phase" }>["phase"];
      solarHouse: number;
      recommendedTone: RecommendedTone;
    };

export interface RuleFact {
  id: string;
  ruleId: string;
  sourceEventIds: readonly string[];
  sign: ZodiacSign;
  topic: EditorialTopic;
  polarity: RulePolarity;
  importance: number;
  confidence: number;
  priority: number;
  tags: readonly string[];
  payload: RuleFactPayload;
  occurredAt: string;
  semanticKey: string;
  conflictKey?: string;
}

export interface RuleActivation {
  ruleId: string;
  eventIds: readonly string[];
  producedFactIds: readonly string[];
  score: number;
}

export interface RuleSuppression {
  id: string;
  suppressedRuleId?: string;
  suppressedFactId?: string;
  reason:
    | "lower_priority"
    | "topic_limit"
    | "duplicate_meaning"
    | "conflict"
    | "period_limit"
    | "policy_forbidden";
  winnerFactId?: string;
}

export interface SignContext {
  id: string;
  kind: "sign_context";
  sign: ZodiacSign;
  period: EditorialPeriod;
  windowStart: string;
  windowEnd: string;
  editorialTimezone: string;
  ruleCatalogVersion: string;
  policyVersion: string;
  selectedFacts: readonly RuleFact[];
  activations: readonly RuleActivation[];
  suppressions: readonly RuleSuppression[];
  invariants: {
    noGeneratedText: true;
    noNatalChartData: true;
    deterministicOrdering: true;
    policyApplied: true;
  };
}

export interface GenerationManifest {
  id: string;
  generatedForWindowStart: string;
  generatedForWindowEnd: string;
  sourceEventSetId: string;
  ruleCatalogVersion: string;
  editorialPolicyVersion: string;
  signContextIds: readonly string[];
}

export interface ValidationIssue {
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: readonly ValidationIssue[];
  warnings: readonly ValidationIssue[];
}

export interface EditorialPolicy {
  version: string;
  timezone: string;
  maxFactsByPeriod: Record<EditorialPeriod, number>;
  maxFactsPerTopic: number;
  allowedTopics: readonly EditorialTopic[];
  forbiddenClaimCategories: readonly string[];
  weights: {
    eventType: Record<TimeWindowEvent["type"], number>;
    body: Record<PlanetaryBody, number>;
    exactness: number;
    recency: number;
  };
}

export interface RuleEngineInput {
  eventSet: TimeWindowEventSet;
  period: EditorialPeriod;
  policy?: EditorialPolicy;
  catalog?: readonly RuleDefinition[];
}

export interface RuleEngineResult {
  id: string;
  sourceEventSetId: string;
  period: EditorialPeriod;
  windowStart: string;
  windowEnd: string;
  ruleCatalogVersion: string;
  policyVersion: string;
  facts: readonly RuleFact[];
  activations: readonly RuleActivation[];
}

export interface RuleEvaluationContext {
  eventSet: TimeWindowEventSet;
  period: EditorialPeriod;
  policy: EditorialPolicy;
}

export interface RuleDefinition {
  id: string;
  version: string;
  eventType: TimeWindowEvent["type"];
  family: string;
  evaluate: (event: TimeWindowEvent, context: RuleEvaluationContext) => readonly RuleFact[];
}

export class RuleEngineError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_RULE_ENGINE_INPUT"
      | "INVALID_PERIOD"
      | "INVALID_EDITORIAL_POLICY"
      | "INVALID_RULE_CATALOG"
      | "DUPLICATE_RULE_ID"
      | "INVALID_RULE_FACT"
      | "INVALID_SIGN_CONTEXT"
      | "UNSUPPORTED_EVENT_TYPE",
  ) {
    super(message);
    this.name = "RuleEngineError";
  }
}

export function solarHouseForSign(targetSign: ZodiacSign, eventSign: ZodiacSign): number {
  const targetIndex = ZODIAC_SIGNS.indexOf(targetSign);
  const eventIndex = ZODIAC_SIGNS.indexOf(eventSign);
  if (targetIndex < 0 || eventIndex < 0) {
    throw new RuleEngineError("signo zodiacal invalido", "INVALID_RULE_ENGINE_INPUT");
  }
  return ((eventIndex - targetIndex + 12) % 12) + 1;
}

export function buildGenerationManifest(
  result: RuleEngineResult,
  contexts: readonly SignContext[],
): GenerationManifest {
  const contextIds = [...contexts].map((context) => context.id).sort();
  return {
    id: `generation-manifest:${result.sourceEventSetId}:${result.period}:${result.ruleCatalogVersion}:${result.policyVersion}`,
    generatedForWindowStart: result.windowStart,
    generatedForWindowEnd: result.windowEnd,
    sourceEventSetId: result.sourceEventSetId,
    ruleCatalogVersion: result.ruleCatalogVersion,
    editorialPolicyVersion: result.policyVersion,
    signContextIds: contextIds,
  };
}
