import type { PlanetaryBody } from "../planetary/planetary-engine";
import { ZODIAC_SIGNS, solarHouseForSign, type RuleDefinition, type RuleFact } from "./domain";

export const RULE_CATALOG_VERSION = "rule-catalog@2d:initial-static";

function stableIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9:_-]/g, "_");
}

function affectedSigns(eventSign?: (typeof ZODIAC_SIGNS)[number]) {
  if (!eventSign) return ZODIAC_SIGNS;
  return ZODIAC_SIGNS.filter((sign) => [1, 4, 7, 10].includes(solarHouseForSign(sign, eventSign)));
}

function bodyWeight(body: PlanetaryBody): number {
  if (body === "moon") return 0.82;
  if (body === "sun") return 0.88;
  if (body === "mercury" || body === "venus" || body === "mars") return 0.9;
  return 0.78;
}

export function createFact(input: Omit<RuleFact, "id">): RuleFact {
  const sourceEventKey = input.sourceEventIds.map(stableIdPart).join("+");
  return {
    id: [
      "rule-fact",
      sourceEventKey,
      stableIdPart(input.ruleId),
      input.sign,
      input.topic,
      stableIdPart(input.semanticKey),
      input.payload.kind,
    ].join(":"),
    ...input,
  };
}

export const INITIAL_RULE_CATALOG: readonly RuleDefinition[] = [
  {
    id: "aspect-venus-mars-relationships",
    version: "1",
    eventType: "exact_aspect",
    family: "aspects",
    evaluate(event) {
      if (event.type !== "exact_aspect") return [];
      const bodies = [event.bodyA, event.bodyB];
      if (!bodies.includes("venus") || !bodies.includes("mars")) return [];
      const supportive = event.aspectType === "sextile" || event.aspectType === "trine";
      return ZODIAC_SIGNS.map((sign) =>
        createFact({
          ruleId: "aspect-venus-mars-relationships",
          sourceEventIds: [event.id],
          sign,
          topic: "relationships",
          polarity: supportive ? "supportive" : "challenging",
          importance: supportive ? 0.72 : 0.78,
          confidence: 0.78,
          priority: 72,
          tags: ["venus", "mars", event.aspectType],
          payload: {
            kind: "aspect_emphasis",
            aspectType: event.aspectType,
            sourceBodies: ["venus", "mars"],
            solarHouse: 1,
            recommendedTone: supportive ? "energized" : "reflective",
          },
          occurredAt: event.occurredAt,
          semanticKey: `${sign}:relationships:venus-mars`,
          conflictKey: `${sign}:relationships`,
        }),
      );
    },
  },
  {
    id: "aspect-mercury-saturn-organization",
    version: "1",
    eventType: "exact_aspect",
    family: "aspects",
    evaluate(event) {
      if (event.type !== "exact_aspect") return [];
      const bodies = [event.bodyA, event.bodyB];
      if (!bodies.includes("mercury") || !bodies.includes("saturn")) return [];
      return ZODIAC_SIGNS.map((sign) =>
        createFact({
          ruleId: "aspect-mercury-saturn-organization",
          sourceEventIds: [event.id],
          sign,
          topic: "organization",
          polarity:
            event.aspectType === "square" || event.aspectType === "opposition"
              ? "challenging"
              : "supportive",
          importance: 0.74,
          confidence: 0.8,
          priority: 70,
          tags: ["mercury", "saturn", event.aspectType],
          payload: {
            kind: "aspect_emphasis",
            aspectType: event.aspectType,
            sourceBodies: ["mercury", "saturn"],
            solarHouse: 1,
            recommendedTone: "practical",
          },
          occurredAt: event.occurredAt,
          semanticKey: `${sign}:organization:mercury-saturn`,
          conflictKey: `${sign}:organization`,
        }),
      );
    },
  },
  {
    id: "aspect-sun-jupiter-creativity",
    version: "1",
    eventType: "exact_aspect",
    family: "aspects",
    evaluate(event) {
      if (event.type !== "exact_aspect") return [];
      const bodies = [event.bodyA, event.bodyB];
      if (!bodies.includes("sun") || !bodies.includes("jupiter")) return [];
      return ZODIAC_SIGNS.map((sign) =>
        createFact({
          ruleId: "aspect-sun-jupiter-creativity",
          sourceEventIds: [event.id],
          sign,
          topic: "creativity",
          polarity: "supportive",
          importance: 0.76,
          confidence: 0.76,
          priority: 68,
          tags: ["sun", "jupiter", event.aspectType],
          payload: {
            kind: "aspect_emphasis",
            aspectType: event.aspectType,
            sourceBodies: ["sun", "jupiter"],
            solarHouse: 1,
            recommendedTone: "energized",
          },
          occurredAt: event.occurredAt,
          semanticKey: `${sign}:creativity:sun-jupiter`,
          conflictKey: `${sign}:creativity`,
        }),
      );
    },
  },
  {
    id: "aspect-moon-saturn-reflection",
    version: "1",
    eventType: "exact_aspect",
    family: "aspects",
    evaluate(event) {
      if (event.type !== "exact_aspect") return [];
      const bodies = [event.bodyA, event.bodyB];
      if (!bodies.includes("moon") || !bodies.includes("saturn")) return [];
      return ZODIAC_SIGNS.map((sign) =>
        createFact({
          ruleId: "aspect-moon-saturn-reflection",
          sourceEventIds: [event.id],
          sign,
          topic: "reflection",
          polarity: "neutral",
          importance: 0.7,
          confidence: 0.75,
          priority: 66,
          tags: ["moon", "saturn", event.aspectType],
          payload: {
            kind: "aspect_emphasis",
            aspectType: event.aspectType,
            sourceBodies: ["moon", "saturn"],
            solarHouse: 1,
            recommendedTone: "steady",
          },
          occurredAt: event.occurredAt,
          semanticKey: `${sign}:reflection:moon-saturn`,
          conflictKey: `${sign}:reflection`,
        }),
      );
    },
  },
  {
    id: "ingress-personal-planet-focus",
    version: "1",
    eventType: "sign_ingress",
    family: "ingresses",
    evaluate(event) {
      if (event.type !== "sign_ingress") return [];
      const topicByBody = {
        mercury: "communication",
        venus: "relationships",
        mars: "personal_energy",
      } as const;
      const topic = topicByBody[event.body as keyof typeof topicByBody];
      if (!topic) return [];
      return affectedSigns(event.toSign).map((sign) => {
        const solarHouse = solarHouseForSign(sign, event.toSign);
        return createFact({
          ruleId: "ingress-personal-planet-focus",
          sourceEventIds: [event.id],
          sign,
          topic,
          polarity: "neutral",
          importance: 0.62 + solarHouse / 100,
          confidence: 0.74,
          priority: 58 + bodyWeight(event.body) * 10,
          tags: [event.body, event.toSign, `house-${solarHouse}`],
          payload: {
            kind: "sign_ingress_focus",
            body: event.body,
            toSign: event.toSign,
            solarHouse,
            recommendedTone: "practical",
          },
          occurredAt: event.occurredAt,
          semanticKey: `${sign}:${topic}:ingress:${event.body}`,
          conflictKey: `${sign}:${topic}`,
        });
      });
    },
  },
  {
    id: "station-mercury-review",
    version: "1",
    eventType: "retrograde_station",
    family: "stations",
    evaluate(event) {
      if (event.type !== "retrograde_station" || event.body !== "mercury") return [];
      return ZODIAC_SIGNS.map((sign) =>
        createFact({
          ruleId: "station-mercury-review",
          sourceEventIds: [event.id],
          sign,
          topic: "communication",
          polarity: "neutral",
          importance: 0.8,
          confidence: 0.82,
          priority: 76,
          tags: ["mercury", "retrograde_station", "review"],
          payload: {
            kind: "station_focus",
            body: "mercury",
            stationType: "retrograde",
            recommendedTone: "reflective",
          },
          occurredAt: event.occurredAt,
          semanticKey: `${sign}:communication:mercury-station`,
          conflictKey: `${sign}:communication`,
        }),
      );
    },
  },
  {
    id: "station-mercury-direct",
    version: "1",
    eventType: "direct_station",
    family: "stations",
    evaluate(event) {
      if (event.type !== "direct_station" || event.body !== "mercury") return [];
      return ZODIAC_SIGNS.map((sign) =>
        createFact({
          ruleId: "station-mercury-direct",
          sourceEventIds: [event.id],
          sign,
          topic: "communication",
          polarity: "supportive",
          importance: 0.78,
          confidence: 0.82,
          priority: 74,
          tags: ["mercury", "direct_station", "reorganization"],
          payload: {
            kind: "station_focus",
            body: "mercury",
            stationType: "direct",
            recommendedTone: "practical",
          },
          occurredAt: event.occurredAt,
          semanticKey: `${sign}:communication:mercury-station`,
          conflictKey: `${sign}:communication`,
        }),
      );
    },
  },
  {
    id: "lunar-major-phase",
    version: "1",
    eventType: "lunar_phase",
    family: "lunar_phases",
    evaluate(event) {
      if (event.type !== "lunar_phase") return [];
      const byPhase = {
        new_moon: ["reflection", "neutral", "reflective"],
        first_quarter: ["personal_energy", "challenging", "practical"],
        full_moon: ["reflection", "neutral", "steady"],
        last_quarter: ["organization", "neutral", "practical"],
      } as const;
      const [topic, polarity, tone] = byPhase[event.phase];
      return ZODIAC_SIGNS.map((sign) =>
        createFact({
          ruleId: "lunar-major-phase",
          sourceEventIds: [event.id],
          sign,
          topic,
          polarity,
          importance: event.phase === "full_moon" ? 0.72 : 0.66,
          confidence: 0.78,
          priority: event.phase === "full_moon" ? 69 : 63,
          tags: ["moon", event.phase],
          payload: {
            kind: "lunar_phase_focus",
            phase: event.phase,
            solarHouse: 1,
            recommendedTone: tone,
          },
          occurredAt: event.occurredAt,
          semanticKey: `${sign}:${topic}:lunar:${event.phase}`,
          conflictKey: `${sign}:${topic}`,
        }),
      );
    },
  },
] as const;
