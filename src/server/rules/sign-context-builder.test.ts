import { describe, expect, it } from "vitest";
import { DEFAULT_EDITORIAL_POLICY } from "./editorial-policy";
import { ZODIAC_SIGNS, type RuleEngineResult, type RuleFact } from "./domain";
import { runRuleEngine } from "./rule-engine";
import { baseEventSet } from "./rule-engine.test";
import { buildRuleGenerationManifest, buildSignContexts } from "./sign-context-builder";

function fact(id: string, overrides: Partial<RuleFact> = {}): RuleFact {
  return {
    id,
    ruleId: `rule:${id}`,
    sourceEventIds: ["event:test"],
    sign: "aries",
    topic: "communication",
    polarity: "neutral",
    importance: 0.7,
    confidence: 0.8,
    priority: 50,
    tags: ["test"],
    payload: {
      kind: "station_focus",
      body: "mercury",
      stationType: "direct",
      recommendedTone: "practical",
    },
    occurredAt: "2024-06-01T00:00:00.000Z",
    semanticKey: id,
    conflictKey: "aries:communication",
    ...overrides,
  };
}

function resultWithFacts(
  facts: readonly RuleFact[],
  period: RuleEngineResult["period"],
): RuleEngineResult {
  return {
    id: `result:${period}`,
    sourceEventSetId: "event-set:test",
    period,
    windowStart: "2024-06-01T00:00:00.000Z",
    windowEnd: "2024-06-08T00:00:00.000Z",
    ruleCatalogVersion: "catalog",
    policyVersion: DEFAULT_EDITORIAL_POLICY.version,
    facts,
    activations: facts.map((item) => ({
      ruleId: item.ruleId,
      eventIds: item.sourceEventIds,
      producedFactIds: [item.id],
      score: item.priority,
    })),
  };
}

describe("SignContextBuilder", () => {
  it("genera exactamente 12 contextos en orden canonico y con versiones", () => {
    const engineResult = runRuleEngine({ eventSet: baseEventSet, period: "weekly" });
    const contexts = buildSignContexts(engineResult);
    expect(contexts).toHaveLength(12);
    expect(contexts.map((context) => context.sign)).toEqual([...ZODIAC_SIGNS]);
    expect(contexts.every((context) => context.ruleCatalogVersion && context.policyVersion)).toBe(
      true,
    );
    expect(contexts.every((context) => context.invariants.noGeneratedText)).toBe(true);
  });

  it("aplica Top-N diario, semanal y mensual", () => {
    const manyFacts = Array.from({ length: 10 }, (_, index) =>
      fact(`fact:${index}`, {
        priority: 100 - index,
        topic: index % 3 === 0 ? "communication" : index % 3 === 1 ? "reflection" : "organization",
        semanticKey: `meaning:${index}`,
        conflictKey: undefined,
      }),
    );
    expect(buildSignContexts(resultWithFacts(manyFacts, "daily"))[0]?.selectedFacts).toHaveLength(
      3,
    );
    expect(buildSignContexts(resultWithFacts(manyFacts, "weekly"))[0]?.selectedFacts).toHaveLength(
      5,
    );
    expect(buildSignContexts(resultWithFacts(manyFacts, "monthly"))[0]?.selectedFacts).toHaveLength(
      6,
    );
  });

  it("limita a dos hechos por tema y registra supresiones", () => {
    const facts = Array.from({ length: 5 }, (_, index) =>
      fact(`same-topic:${index}`, {
        priority: 90 - index,
        topic: "communication",
        semanticKey: `same-topic:${index}`,
        conflictKey: undefined,
      }),
    );
    const context = buildSignContexts(resultWithFacts(facts, "monthly"))[0]!;
    expect(context.selectedFacts).toHaveLength(2);
    expect(context.suppressions.some((item) => item.reason === "topic_limit")).toBe(true);
  });

  it("resuelve duplicados semanticos y conflictos", () => {
    const context = buildSignContexts(
      resultWithFacts(
        [
          fact("winner", { priority: 90, semanticKey: "same", polarity: "supportive" }),
          fact("duplicate", { priority: 80, semanticKey: "same", polarity: "supportive" }),
          fact("conflict", { priority: 70, semanticKey: "other", polarity: "challenging" }),
        ],
        "monthly",
      ),
    )[0]!;
    expect(context.selectedFacts.map((item) => item.id)).toContain("winner");
    expect(context.suppressions.some((item) => item.reason === "duplicate_meaning")).toBe(true);
    expect(context.suppressions.some((item) => item.reason === "conflict")).toBe(true);
  });

  it("desempata de forma determinista y no muta resultado", () => {
    const input = resultWithFacts([fact("b"), fact("a")], "monthly");
    const before = JSON.stringify(input);
    const first = buildSignContexts(input);
    const second = buildSignContexts({ ...input, facts: [...input.facts].reverse() });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first[0]?.selectedFacts[0]?.id).toBe("a");
    expect(JSON.stringify(input)).toBe(before);
  });

  it("contexto sin hechos queda valido y vacio", () => {
    const contexts = buildSignContexts(resultWithFacts([], "daily"));
    expect(contexts).toHaveLength(12);
    expect(contexts.every((context) => context.selectedFacts.length === 0)).toBe(true);
  });

  it("suprime tema no permitido y no usa temas prohibidos", () => {
    const context = buildSignContexts(
      resultWithFacts([fact("bad-topic", { topic: "health" as never })], "daily"),
    )[0]!;
    expect(context.selectedFacts).toHaveLength(0);
    expect(context.suppressions[0]?.reason).toBe("policy_forbidden");
    expect(JSON.stringify(context)).not.toContain("health");
  });

  it("manifest y round-trip JSON son deterministas", () => {
    const engineResult = runRuleEngine({ eventSet: baseEventSet, period: "weekly" });
    const contexts = buildSignContexts(engineResult);
    const manifest = buildRuleGenerationManifest(engineResult, contexts);
    expect(JSON.parse(JSON.stringify(contexts))).toEqual(contexts);
    expect(buildRuleGenerationManifest(engineResult, [...contexts].reverse())).toEqual(manifest);
  });

  it("eventos duplicados no generan contextos duplicados", () => {
    const engineResult = runRuleEngine({
      eventSet: { ...baseEventSet, events: [baseEventSet.events[0]!, baseEventSet.events[0]!] },
      period: "daily",
    });
    const contexts = buildSignContexts(engineResult);
    expect(contexts).toHaveLength(12);
    expect(contexts[0]?.suppressions.some((item) => item.reason === "duplicate_meaning")).toBe(
      true,
    );
  });
});
