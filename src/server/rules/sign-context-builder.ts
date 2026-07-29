import { DEFAULT_EDITORIAL_POLICY } from "./editorial-policy";
import {
  ZODIAC_SIGNS,
  RuleEngineError,
  type EditorialPolicy,
  type GenerationManifest,
  type RuleEngineResult,
  type RuleFact,
  type RuleSuppression,
  type SignContext,
  buildGenerationManifest,
} from "./domain";
import { assertEditorialPolicy } from "./rule-engine";

function scoreFact(fact: RuleFact, policy: EditorialPolicy): number {
  return fact.priority + fact.importance * 10 + fact.confidence * 5 + policy.weights.recency;
}

function compareFacts(left: RuleFact, right: RuleFact, policy: EditorialPolicy): number {
  const scoreDelta = scoreFact(right, policy) - scoreFact(left, policy);
  if (Math.abs(scoreDelta) > Number.EPSILON) return scoreDelta;
  const importanceDelta = right.importance - left.importance;
  if (Math.abs(importanceDelta) > Number.EPSILON) return importanceDelta;
  const confidenceDelta = right.confidence - left.confidence;
  if (Math.abs(confidenceDelta) > Number.EPSILON) return confidenceDelta;
  const timeDelta = left.occurredAt.localeCompare(right.occurredAt);
  if (timeDelta !== 0) return timeDelta;
  const ruleDelta = left.ruleId.localeCompare(right.ruleId);
  if (ruleDelta !== 0) return ruleDelta;
  return left.id.localeCompare(right.id);
}

function suppression(
  reason: RuleSuppression["reason"],
  fact: RuleFact,
  winnerFactId?: string,
): RuleSuppression {
  return {
    id: `suppression:${reason}:${fact.id}`,
    suppressedRuleId: fact.ruleId,
    suppressedFactId: fact.id,
    reason,
    winnerFactId,
  };
}

function selectFacts(
  facts: readonly RuleFact[],
  result: RuleEngineResult,
  policy: EditorialPolicy,
): { selected: readonly RuleFact[]; suppressions: readonly RuleSuppression[] } {
  const sorted = [...facts].sort((left, right) => compareFacts(left, right, policy));
  const selected: RuleFact[] = [];
  const suppressions: RuleSuppression[] = [];
  const semanticWinners = new Map<string, RuleFact>();
  const conflictWinners = new Map<string, RuleFact>();
  const topicCounts = new Map<string, number>();
  const maxFacts = policy.maxFactsByPeriod[result.period];

  for (const fact of sorted) {
    if (!policy.allowedTopics.includes(fact.topic)) {
      suppressions.push(suppression("policy_forbidden", fact));
      continue;
    }
    const duplicateWinner = semanticWinners.get(fact.semanticKey);
    if (duplicateWinner) {
      suppressions.push(suppression("duplicate_meaning", fact, duplicateWinner.id));
      continue;
    }
    const conflictWinner = fact.conflictKey ? conflictWinners.get(fact.conflictKey) : undefined;
    if (conflictWinner && conflictWinner.polarity !== fact.polarity) {
      suppressions.push(suppression("conflict", fact, conflictWinner.id));
      continue;
    }
    const currentTopicCount = topicCounts.get(fact.topic) ?? 0;
    if (currentTopicCount >= policy.maxFactsPerTopic) {
      suppressions.push(suppression("topic_limit", fact));
      continue;
    }
    if (selected.length >= maxFacts) {
      suppressions.push(suppression("period_limit", fact));
      continue;
    }
    selected.push(fact);
    semanticWinners.set(fact.semanticKey, fact);
    if (fact.conflictKey) conflictWinners.set(fact.conflictKey, fact);
    topicCounts.set(fact.topic, currentTopicCount + 1);
  }

  return {
    selected: selected.sort((left, right) => compareFacts(left, right, policy)),
    suppressions: suppressions.sort((left, right) => left.id.localeCompare(right.id)),
  };
}

export function buildSignContexts(
  result: RuleEngineResult,
  policy: EditorialPolicy = DEFAULT_EDITORIAL_POLICY,
): readonly SignContext[] {
  if (!result || !Array.isArray(result.facts) || !Array.isArray(result.activations)) {
    throw new RuleEngineError("resultado de RuleEngine invalido", "INVALID_SIGN_CONTEXT");
  }
  assertEditorialPolicy(policy);
  return ZODIAC_SIGNS.map((sign) => {
    const facts = result.facts.filter((fact) => fact.sign === sign);
    const { selected, suppressions } = selectFacts(facts, result, policy);
    return {
      id: `sign-context:${result.sourceEventSetId}:${result.period}:${sign}:${result.ruleCatalogVersion}:${policy.version}`,
      kind: "sign_context",
      sign,
      period: result.period,
      windowStart: result.windowStart,
      windowEnd: result.windowEnd,
      editorialTimezone: policy.timezone,
      ruleCatalogVersion: result.ruleCatalogVersion,
      policyVersion: policy.version,
      selectedFacts: selected,
      activations: result.activations.filter((activation) =>
        activation.producedFactIds.some((factId) => facts.some((fact) => fact.id === factId)),
      ),
      suppressions,
      invariants: {
        noGeneratedText: true,
        noNatalChartData: true,
        deterministicOrdering: true,
        policyApplied: true,
      },
    };
  });
}

export function buildRuleGenerationManifest(
  result: RuleEngineResult,
  contexts: readonly SignContext[],
): GenerationManifest {
  return buildGenerationManifest(result, contexts);
}
