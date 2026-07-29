import type { TimeWindowEvent } from "../transits/time-window-event-resolver";
import { DEFAULT_EDITORIAL_POLICY, EDITORIAL_PERIODS } from "./editorial-policy";
import {
  type EditorialPeriod,
  type EditorialPolicy,
  type RuleDefinition,
  RuleEngineError,
  type RuleEngineInput,
  type RuleEngineResult,
  type RuleFact,
} from "./domain";
import { INITIAL_RULE_CATALOG, RULE_CATALOG_VERSION } from "./rule-catalog";

function assertPeriod(period: unknown): asserts period is EditorialPeriod {
  if (!EDITORIAL_PERIODS.includes(period as EditorialPeriod)) {
    throw new RuleEngineError("periodo editorial invalido", "INVALID_PERIOD");
  }
}

export function assertEditorialPolicy(policy: EditorialPolicy): void {
  if (
    !policy ||
    typeof policy.version !== "string" ||
    policy.version.length === 0 ||
    typeof policy.timezone !== "string" ||
    policy.timezone.length === 0 ||
    !Number.isFinite(policy.maxFactsPerTopic) ||
    policy.maxFactsPerTopic < 1
  ) {
    throw new RuleEngineError("politica editorial invalida", "INVALID_EDITORIAL_POLICY");
  }
  for (const period of EDITORIAL_PERIODS) {
    if (!Number.isFinite(policy.maxFactsByPeriod[period]) || policy.maxFactsByPeriod[period] < 0) {
      throw new RuleEngineError("limite por periodo invalido", "INVALID_EDITORIAL_POLICY");
    }
  }
}

export function assertRuleCatalog(catalog: readonly RuleDefinition[]): void {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new RuleEngineError("catalogo de reglas invalido", "INVALID_RULE_CATALOG");
  }
  const ids = new Set<string>();
  for (const rule of catalog) {
    if (
      !rule ||
      typeof rule.id !== "string" ||
      rule.id.length === 0 ||
      typeof rule.version !== "string" ||
      rule.version.length === 0 ||
      typeof rule.evaluate !== "function"
    ) {
      throw new RuleEngineError("regla invalida", "INVALID_RULE_CATALOG");
    }
    if (ids.has(rule.id)) {
      throw new RuleEngineError(`regla duplicada: ${rule.id}`, "DUPLICATE_RULE_ID");
    }
    ids.add(rule.id);
  }
}

function compareEvents(left: TimeWindowEvent, right: TimeWindowEvent): number {
  const timeDelta = left.occurredAt.localeCompare(right.occurredAt);
  if (timeDelta !== 0) return timeDelta;
  return left.id.localeCompare(right.id);
}

function compareRules(left: RuleDefinition, right: RuleDefinition): number {
  return left.id.localeCompare(right.id);
}

function validateFact(fact: RuleFact, policy: EditorialPolicy): void {
  if (
    !fact.id ||
    !fact.ruleId ||
    fact.sourceEventIds.length === 0 ||
    !policy.allowedTopics.includes(fact.topic) ||
    !Number.isFinite(fact.importance) ||
    !Number.isFinite(fact.confidence) ||
    !Number.isFinite(fact.priority)
  ) {
    throw new RuleEngineError("hecho de regla invalido", "INVALID_RULE_FACT");
  }
}

export function runRuleEngine(input: RuleEngineInput): RuleEngineResult {
  if (!input || !input.eventSet || input.eventSet.kind !== "time_window_event_set") {
    throw new RuleEngineError("entrada de RuleEngine invalida", "INVALID_RULE_ENGINE_INPUT");
  }
  assertPeriod(input.period);
  const policy = input.policy ?? DEFAULT_EDITORIAL_POLICY;
  assertEditorialPolicy(policy);
  const catalog = [...(input.catalog ?? INITIAL_RULE_CATALOG)].sort(compareRules);
  assertRuleCatalog(catalog);

  const facts: RuleFact[] = [];
  const activations = [];
  const events = [...input.eventSet.events].sort(compareEvents);

  for (const event of events) {
    const rules = catalog.filter((rule) => rule.eventType === event.type);
    if (rules.length === 0) {
      throw new RuleEngineError(`evento sin soporte: ${event.type}`, "UNSUPPORTED_EVENT_TYPE");
    }
    for (const rule of rules) {
      const produced = [
        ...rule.evaluate(event, { eventSet: input.eventSet, period: input.period, policy }),
      ];
      for (const fact of produced) validateFact(fact, policy);
      facts.push(...produced);
      if (produced.length > 0) {
        activations.push({
          ruleId: rule.id,
          eventIds: [event.id],
          producedFactIds: produced.map((fact) => fact.id),
          score: produced.reduce((sum, fact) => sum + fact.priority, 0),
        });
      }
    }
  }

  const sortedFacts = facts.sort((left, right) => left.id.localeCompare(right.id));
  return {
    id: `rule-engine:${input.eventSet.id}:${input.period}:${RULE_CATALOG_VERSION}:${policy.version}`,
    sourceEventSetId: input.eventSet.id,
    period: input.period,
    windowStart: input.eventSet.windowStart,
    windowEnd: input.eventSet.windowEnd,
    ruleCatalogVersion: RULE_CATALOG_VERSION,
    policyVersion: policy.version,
    facts: sortedFacts,
    activations: activations.sort((left, right) => left.ruleId.localeCompare(right.ruleId)),
  };
}
