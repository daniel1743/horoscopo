import { describe, expect, it } from "vitest";
import { routes, zodiacRoute } from "./routes";
import { getNextBestAction, type NBAContext } from "./next-best-actions.config";
import type { PersonalizationContext } from "@/lib/account/personalization-context";

function personalization(patch: Partial<PersonalizationContext> = {}): PersonalizationContext {
  return {
    enabled: true,
    personalized: true,
    identity: {
      sunSign: null,
      moonSign: null,
      hasBirthData: false,
      birthTimeKnown: null,
      hasNatalProfile: false,
    },
    recent: {
      intents: [],
      services: [],
      dominantIntent: null,
      intentScores: {},
      lastRelevantActivityAt: null,
    },
    today: {
      horoscopeUsed: false,
      moonUsed: false,
      dailyCardUsed: false,
      tarotUsed: false,
    },
    saved: {
      tarotCount: 0,
      lunarCount: 0,
      lastTarotSavedAt: null,
      lastLunarSavedAt: null,
      recentTarotIntent: null,
      recentTarotSpreadType: null,
    },
    favorites: {
      count: 0,
      types: [],
      recentType: null,
    },
    continuity: {
      hasSavedTarot: false,
      hasSavedLunar: false,
      hasFavorites: false,
      hasRecentActivity: false,
    },
    ...patch,
  };
}

// =============================================================================
// TAROT (existing tests)
// =============================================================================

describe("getNextBestAction personalized tarot ranking", () => {
  it("keeps the standard recommendation without personalization", () => {
    const result = getNextBestAction({ source: "tarot_yes_no" });

    expect(result.primary?.href).toBe(routes.tarotThreeCardsDecision);
    expect(result.secondary?.href).toBe(routes.tarotDaily);
  });

  it("keeps the standard recommendation when personalization is disabled", () => {
    const result = getNextBestAction({
      source: "tarot_yes_no",
      personalization: {
        enabled: false,
        personalized: false,
        identity: { hasBirthData: false },
        today: {},
        recent: {},
      } as PersonalizationContext,
    });

    expect(result.primary?.href).toBe(routes.tarotThreeCardsDecision);
    expect(result.secondary?.href).toBe(routes.tarotDaily);
  });

  it("can rank moon first for love tarot when birth data exists and moon was not used today", () => {
    const result = getNextBestAction({
      source: "tarot_three_cards",
      tarotTopic: "amor",
      personalization: personalization({
        identity: {
          sunSign: "sagitario",
          moonSign: "geminis",
          hasBirthData: true,
          birthTimeKnown: true,
          hasNatalProfile: true,
        },
      }),
    });

    expect(result.primary?.href).toBe(routes.moonPersonalToday);
  });

  it("ranks lower friction options above moon for love tarot without birth data", () => {
    const result = getNextBestAction({
      source: "tarot_three_cards",
      tarotTopic: "amor",
      personalization: personalization(),
    });

    expect(result.primary?.href).toBe(routes.horoscopeToday);
  });

  it("does not let love history outrank current work intent", () => {
    const result = getNextBestAction({
      source: "tarot_three_cards",
      tarotTopic: "trabajo",
      personalization: personalization({
        recent: {
          intents: ["love", "love", "love"],
          services: ["tarot_three_cards"],
          dominantIntent: "love",
          intentScores: { love: 1 },
          lastRelevantActivityAt: "2026-08-11T10:00:00.000Z",
        },
        identity: {
          sunSign: null,
          moonSign: null,
          hasBirthData: true,
          birthTimeKnown: true,
          hasNatalProfile: true,
        },
      }),
    });

    expect(result.primary?.href).toBe(routes.horoscopeToday);
  });

  it("keeps three cards strong after yes/no", () => {
    const result = getNextBestAction({
      source: "tarot_yes_no",
      personalization: personalization(),
    });

    expect(result.primary?.href).toBe(routes.tarotThreeCardsDecision);
  });

  it("does not recommend the daily card again when it was already used today", () => {
    const result = getNextBestAction({
      source: "tarot_three_cards",
      tarotTopic: "decision",
      personalization: personalization({
        today: {
          horoscopeUsed: false,
          moonUsed: false,
          dailyCardUsed: true,
          tarotUsed: true,
        },
      }),
    });

    expect(result.primary?.href).toBe(routes.horoscopeToday);
  });

  it("uses real route keys for tarot daily fallbacks", () => {
    const withoutCard = getNextBestAction({ source: "tarot_daily" });
    const withCard = getNextBestAction({
      source: "tarot_daily",
      dynamicCardSlug: "el-sol",
    } satisfies NBAContext);

    expect(withoutCard.secondary?.href).toBe(routes.tarotLibrary);
    expect(withCard.secondary?.href).toBe("/tarot/cartas/el-sol");
  });
});

// =============================================================================
// HOROSCOPE (FASE 6B.0 — extended)
// =============================================================================

describe("getNextBestAction horoscope source", () => {
  it("birthData=true ranks moon as primary direction", () => {
    const result = getNextBestAction({
      source: "horoscope",
      sign: "geminis",
      horoscopePeriod: "hoy",
      personalization: personalization({
        identity: {
          sunSign: "sagitario",
          moonSign: "geminis",
          hasBirthData: true,
          birthTimeKnown: true,
          hasNatalProfile: true,
        },
      }),
    });

    expect(result.primary?.label).toBe("Tu Luna de Hoy");
    expect(result.primary?.href).toBe(routes.moonPersonalToday);
  });

  it("personal sunSign does not get confused with visited sign", () => {
    const result = getNextBestAction({
      source: "horoscope",
      sign: "geminis", // visited sign
      horoscopePeriod: "hoy",
      personalization: personalization({
        identity: {
          sunSign: "sagitario", // personal sign
          moonSign: "tauro",
          hasBirthData: true,
          birthTimeKnown: true,
          hasNatalProfile: true,
        },
      }),
    });

    // The primary is always "Tu Luna de Hoy" when hasBirthData=true,
    // unaffected by visited sign
    expect(result.primary?.label).toBe("Tu Luna de Hoy");
    expect(result.primary?.href).toBe(routes.moonPersonalToday);

    // The personal sunSign does NOT contaminate the visited sign route
    // (the page itself controls the sign via props, not via NBA)
    expect(result.secondary?.label).toBe("Carta del Día");
  });

  it("without birthData falls back to standard recommendation", () => {
    const result = getNextBestAction({
      source: "horoscope",
      sign: "geminis",
      personalization: personalization({
        identity: {
          sunSign: "sagitario",
          moonSign: null,
          hasBirthData: false,
          birthTimeKnown: null,
          hasNatalProfile: false,
        },
      }),
    });

    expect(result.primary?.label).toBe("Carta del Día");
    expect(result.primary?.href).toBe(routes.tarotDaily);
    expect(result.secondary?.label).toBe("Descubrir mi Luna");
  });

  it("personalization OFF → fallback standard", () => {
    const result = getNextBestAction({
      source: "horoscope",
      sign: "geminis",
      personalization: {
        enabled: false,
        personalized: false,
        identity: {
          sunSign: null,
          moonSign: null,
          hasBirthData: false,
          birthTimeKnown: null,
          hasNatalProfile: false,
        },
      } as PersonalizationContext,
    });

    // Fallback: no birth data → Carta del Día primary
    expect(result.primary?.label).toBe("Carta del Día");
  });

  it("horoscope resolves hasBirthData from personalization even without explicit prop", () => {
    // This simulates SignHoroscopePage which does NOT pass hasBirthData
    const result = getNextBestAction({
      source: "horoscope",
      sign: "geminis",
      horoscopePeriod: "semana",
      personalization: personalization({
        identity: {
          sunSign: "sagitario",
          moonSign: "geminis",
          hasBirthData: true,
          birthTimeKnown: true,
          hasNatalProfile: true,
        },
      }),
    });

    // hasBirthData is resolved from personalization.identity.hasBirthData
    expect(result.primary?.label).toBe("Tu Luna de Hoy");
    expect(result.primary?.href).toBe(routes.moonPersonalToday);
  });

  it("context error (null personalization) → fallback", () => {
    const result = getNextBestAction({
      source: "horoscope",
      sign: "geminis",
      personalization: null,
    });

    expect(result.primary?.label).toBe("Carta del Día");
    expect(result.secondary?.label).toBe("Descubrir mi Luna");
  });
});

// =============================================================================
// COMPATIBILITY (FASE 6B.0 — extended)
// =============================================================================

describe("getNextBestAction compatibility source", () => {
  it("real sunSign feeds NBA primary destination", () => {
    const result = getNextBestAction({
      source: "compatibility",
      personalization: personalization({
        identity: {
          sunSign: "sagitario",
          moonSign: null,
          hasBirthData: true,
          birthTimeKnown: null,
          hasNatalProfile: false,
        },
      }),
    });

    expect(result.primary?.label).toBe("Ver mi horóscopo de hoy");
    expect(result.primary?.href).toBe(zodiacRoute("sagitario"));
  });

  it("signA does NOT substitute userSign", () => {
    // This simulates CompatibilityPairPage which does NOT pass sign/userSign
    const result = getNextBestAction({
      source: "compatibility",
      // signA and signB are NOT used by the compatibility case
      personalization: personalization({
        identity: {
          sunSign: "sagitario",
          moonSign: null,
          hasBirthData: true,
          birthTimeKnown: null,
          hasNatalProfile: false,
        },
      }),
    });

    // The route must lead to the user's own sign, not signA
    expect(result.primary?.href).toBe(zodiacRoute("sagitario"));
  });

  it("pair without user own sign preserves sunSign", () => {
    const result = getNextBestAction({
      source: "compatibility",
      personalization: personalization({
        identity: {
          sunSign: "leo",
          moonSign: null,
          hasBirthData: false,
          birthTimeKnown: null,
          hasNatalProfile: false,
        },
      }),
    });

    expect(result.primary?.label).toBe("Ver mi horóscopo de hoy");
    expect(result.primary?.href).toBe(zodiacRoute("leo"));
  });

  it("anonymous uses fallback (neutral continuity)", () => {
    const result = getNextBestAction({
      source: "compatibility",
      personalization: personalization({
        enabled: false,
        personalized: false,
        identity: {
          sunSign: null,
          moonSign: null,
          hasBirthData: false,
          birthTimeKnown: null,
          hasNatalProfile: false,
        },
      }),
    });

    expect(result.primary?.label).toBe("Mira qué energía acompaña hoy a tu signo");
    expect(result.primary?.href).toBe(routes.horoscope);
    expect(result.secondary?.label).toBe("Probar otra combinación");
  });

  it("personalization OFF → fallback", () => {
    const result = getNextBestAction({
      source: "compatibility",
      personalization: null,
    });

    expect(result.primary?.href).toBe(routes.horoscope);
    expect(result.secondary?.label).toBe("Probar otra combinación");
  });

  it("context error → fallback", () => {
    const result = getNextBestAction({
      source: "compatibility",
      // Simulates a failed getPersonalizationContext
      personalization: {
        enabled: false,
        personalized: false,
        identity: {
          sunSign: null,
          moonSign: null,
          hasBirthData: false,
          birthTimeKnown: null,
          hasNatalProfile: false,
        },
      } as PersonalizationContext,
    });

    expect(result.primary?.href).toBe(routes.horoscope);
  });
});