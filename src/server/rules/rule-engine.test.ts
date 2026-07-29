import { describe, expect, it } from "vitest";
import type { TimeWindowEventSet } from "../transits/time-window-event-resolver";
import { DEFAULT_EDITORIAL_POLICY } from "./editorial-policy";
import { ZODIAC_SIGNS, RuleEngineError, solarHouseForSign, type RuleDefinition } from "./domain";
import { INITIAL_RULE_CATALOG } from "./rule-catalog";
import { runRuleEngine } from "./rule-engine";

const baseEventSet: TimeWindowEventSet = {
  id: "event-set:test",
  kind: "time_window_event_set",
  windowStart: "2024-06-01T00:00:00.000Z",
  windowEnd: "2024-06-08T00:00:00.000Z",
  resolverVersion: "test",
  planetaryEngineVersion: "planetary",
  aspectEngineVersion: "aspect",
  events: [
    {
      id: "event:lunar:new",
      type: "lunar_phase",
      occurredAt: "2024-06-01T03:00:00.000Z",
      windowStart: "2024-06-01T00:00:00.000Z",
      windowEnd: "2024-06-08T00:00:00.000Z",
      resolverVersion: "test",
      phase: "new_moon",
      sunMoonAngle: 0,
    },
    {
      id: "event:ingress:mercury",
      type: "sign_ingress",
      occurredAt: "2024-06-02T03:00:00.000Z",
      windowStart: "2024-06-01T00:00:00.000Z",
      windowEnd: "2024-06-08T00:00:00.000Z",
      resolverVersion: "test",
      body: "mercury",
      fromSign: "tauro",
      toSign: "geminis",
      longitudeAtEvent: 60,
    },
    {
      id: "event:aspect:venus-mars",
      type: "exact_aspect",
      occurredAt: "2024-06-03T03:00:00.000Z",
      windowStart: "2024-06-01T00:00:00.000Z",
      windowEnd: "2024-06-08T00:00:00.000Z",
      resolverVersion: "test",
      bodyA: "mars",
      bodyB: "venus",
      aspectType: "square",
      exactAngle: 90,
      actualAngle: 90,
      orb: 0,
      phaseBefore: "applying",
      phaseAfter: "separating",
    },
    {
      id: "event:station:mercury",
      type: "direct_station",
      occurredAt: "2024-06-04T03:00:00.000Z",
      windowStart: "2024-06-01T00:00:00.000Z",
      windowEnd: "2024-06-08T00:00:00.000Z",
      resolverVersion: "test",
      body: "mercury",
      speedBefore: -0.01,
      speedAtEvent: 0,
      speedAfter: 0.01,
    },
  ],
  invariants: {
    utcWindow: true,
    deterministicOrdering: true,
    noNatalChartData: true,
    noEditorialInterpretation: true,
    noGeneratedText: true,
  },
};

describe("RuleEngine", () => {
  it("produce hechos deterministas, activaciones y trazabilidad", () => {
    const first = runRuleEngine({ eventSet: baseEventSet, period: "weekly" });
    const second = runRuleEngine({ eventSet: baseEventSet, period: "weekly" });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.facts.length).toBeGreaterThan(0);
    expect(first.activations.length).toBeGreaterThan(0);
    expect(first.facts.every((fact) => fact.sourceEventIds.length > 0)).toBe(true);
    expect(first.facts.some((fact) => fact.payload.kind === "lunar_phase_focus")).toBe(true);
    expect(first.facts.some((fact) => fact.payload.kind === "sign_ingress_focus")).toBe(true);
    expect(first.facts.some((fact) => fact.payload.kind === "aspect_emphasis")).toBe(true);
    expect(JSON.stringify(first)).not.toContain("Hoy ");
    expect(JSON.stringify(first)).not.toContain("natal");
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
  });

  it("reordenar eventos no cambia salida", () => {
    const original = runRuleEngine({ eventSet: baseEventSet, period: "weekly" });
    const reordered = runRuleEngine({
      eventSet: { ...baseEventSet, events: [...baseEventSet.events].reverse() },
      period: "weekly",
    });
    expect(JSON.stringify(reordered)).toBe(JSON.stringify(original));
  });

  it("ejecuta evaluaciones concurrentes sin contaminar IDs", async () => {
    const input = { eventSet: baseEventSet, period: "weekly" as const };
    const sequential = runRuleEngine(input);
    const concurrent = await Promise.all([
      runRuleEngine(input),
      runRuleEngine(input),
      runRuleEngine(input),
    ]);
    const reordered = runRuleEngine({
      eventSet: { ...baseEventSet, events: [...baseEventSet.events].reverse() },
      period: "weekly",
    });

    expect(concurrent.map((result) => JSON.stringify(result))).toEqual([
      JSON.stringify(sequential),
      JSON.stringify(sequential),
      JSON.stringify(sequential),
    ]);
    expect(JSON.stringify(reordered)).toBe(JSON.stringify(sequential));
    for (const result of concurrent) {
      expect(new Set(result.facts.map((fact) => fact.id)).size).toBe(result.facts.length);
      expect(result.facts.every((fact) => fact.id.startsWith("rule-fact:"))).toBe(true);
    }
  });

  it("no muta el event set", () => {
    const before = JSON.stringify(baseEventSet);
    runRuleEngine({ eventSet: baseEventSet, period: "daily" });
    expect(JSON.stringify(baseEventSet)).toBe(before);
  });

  it("rechaza periodo invalido, politica invalida y catalogo duplicado", () => {
    expect(() => runRuleEngine({ eventSet: baseEventSet, period: "yearly" as never })).toThrow(
      RuleEngineError,
    );
    expect(() =>
      runRuleEngine({
        eventSet: baseEventSet,
        period: "daily",
        policy: { ...DEFAULT_EDITORIAL_POLICY, maxFactsPerTopic: 0 },
      }),
    ).toThrow(RuleEngineError);
    const duplicateCatalog: readonly RuleDefinition[] = [
      INITIAL_RULE_CATALOG[0]!,
      INITIAL_RULE_CATALOG[0]!,
    ];
    expect(() =>
      runRuleEngine({ eventSet: baseEventSet, period: "daily", catalog: duplicateCatalog }),
    ).toThrow(RuleEngineError);
  });

  it("calcula casas solares para Aries, Leo y la rotacion completa", () => {
    expect(ZODIAC_SIGNS.map((sign) => solarHouseForSign("aries", sign))).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(ZODIAC_SIGNS.map((sign) => solarHouseForSign("leo", sign))).toEqual([
      9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
    for (const target of ZODIAC_SIGNS) {
      expect(
        new Set(ZODIAC_SIGNS.map((eventSign) => solarHouseForSign(target, eventSign))).size,
      ).toBe(12);
    }
  });

  it.each([...ZODIAC_SIGNS])("rotacion exhaustiva de casas solares para %s", (target) => {
    expect(
      new Set(ZODIAC_SIGNS.map((eventSign) => solarHouseForSign(target, eventSign))).size,
    ).toBe(12);
    expect(solarHouseForSign(target, target)).toBe(1);
  });

  it.each(["new_moon", "full_moon"] as const)(
    "%s produce hechos estructurados lunares",
    (phase) => {
      const result = runRuleEngine({
        eventSet: {
          ...baseEventSet,
          events: [
            {
              id: `event:lunar:${phase}`,
              type: "lunar_phase",
              occurredAt: "2024-06-01T03:00:00.000Z",
              windowStart: baseEventSet.windowStart,
              windowEnd: baseEventSet.windowEnd,
              resolverVersion: "test",
              phase,
              sunMoonAngle: phase === "new_moon" ? 0 : 180,
            },
          ],
        },
        period: "daily",
      });
      expect(result.facts.every((item) => item.payload.kind === "lunar_phase_focus")).toBe(true);
    },
  );

  it("catalogo estatico conserva metadatos auditables", () => {
    expect(INITIAL_RULE_CATALOG.length).toBeGreaterThanOrEqual(8);
    expect(INITIAL_RULE_CATALOG.every((rule) => rule.id && rule.version && rule.family)).toBe(true);
    expect(INITIAL_RULE_CATALOG.every((rule) => typeof rule.evaluate === "function")).toBe(true);
    expect(
      JSON.stringify(INITIAL_RULE_CATALOG, (_key, value) =>
        typeof value === "function" ? "[evaluator]" : value,
      ),
    ).toContain("[evaluator]");
  });
});

export { baseEventSet };
