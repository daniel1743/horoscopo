import { describe, expect, it } from "vitest";
import {
  buildPersonalizationContext,
  type PersonalizationContextRows,
} from "./personalization-context";

const NOW = new Date("2026-08-11T12:00:00.000Z");

function activity(
  intent: string | undefined,
  createdAt: string,
  metadata: Record<string, unknown> = {},
): PersonalizationContextRows["activities"][number] {
  return {
    id: crypto.randomUUID(),
    user_id: "user-1",
    activity_type: "tarot_reading",
    ref_type: "tarot_reading",
    ref_id: "ref",
    metadata: {
      service: "tarot",
      subtype: "three_cards",
      ...(intent ? { intent } : {}),
      ...metadata,
    },
    created_at: createdAt,
  };
}

function rows(patch: Partial<PersonalizationContextRows> = {}): PersonalizationContextRows {
  return {
    now: NOW,
    privacy: { ai_personalization_enabled: true },
    profile: {
      sun_sign: "sagitario",
      moon_sign: "geminis",
    },
    natalProfile: {
      birth_date: "1990-12-01",
      birth_time: "10:30",
      birth_time_status: "known",
      birth_place_label: "Santiago, CL",
      birth_city: "Santiago",
      birth_country: "Chile",
      birth_latitude: -33.45,
      birth_longitude: -70.66,
    },
    activities: [],
    savedTarot: [],
    savedLunar: [],
    favorites: [],
    ...patch,
  };
}

describe("buildPersonalizationContext", () => {
  it("returns disabled context when personalization is disabled", () => {
    const context = buildPersonalizationContext(
      rows({ privacy: { ai_personalization_enabled: false } }),
    );

    expect(context.enabled).toBe(false);
    expect(context.personalized).toBe(false);
    expect(context.recent.dominantIntent).toBeNull();
  });

  it("does not label a user from one love interaction", () => {
    const context = buildPersonalizationContext(
      rows({ activities: [activity("love", "2026-08-11T10:00:00.000Z")] }),
    );

    expect(context.recent.intents).toEqual(["love"]);
    expect(context.recent.dominantIntent).toBeNull();
  });

  it("detects dominant recent intent with enough evidence", () => {
    const context = buildPersonalizationContext(
      rows({
        activities: [
          activity("love", "2026-08-11T10:00:00.000Z"),
          activity("daily", "2026-08-10T10:00:00.000Z", { subtype: "daily_card" }),
          activity("love", "2026-08-09T10:00:00.000Z"),
          activity("love", "2026-08-08T10:00:00.000Z"),
        ],
      }),
    );

    expect(context.recent.dominantIntent).toBe("love");
    expect(context.recent.intentScores.love).toBeGreaterThan(
      context.recent.intentScores.daily ?? 0,
    );
  });

  it("weights old activity down and ignores activity older than 90 days", () => {
    const context = buildPersonalizationContext(
      rows({
        activities: [
          activity("work", "2026-08-10T10:00:00.000Z"),
          activity("love", "2026-07-20T10:00:00.000Z"),
          activity("love", "2026-04-01T10:00:00.000Z"),
        ],
      }),
    );

    expect(context.recent.intents).toEqual(["work", "love"]);
    expect(context.recent.dominantIntent).toBeNull();
    expect(context.recent.intentScores.work).toBeGreaterThan(context.recent.intentScores.love ?? 0);
  });

  it("derives identity, today state, saved context and favorites without raw private text", () => {
    const context = buildPersonalizationContext(
      rows({
        activities: [
          activity("daily", "2026-08-11T09:00:00.000Z", {
            subtype: "daily_card",
            question: "¿Me responderá hoy?",
          }),
        ],
        savedTarot: [
          {
            spread_type: "three_cards",
            cards: [{ theme: "amor" }],
            created_at: "2026-08-10T10:00:00.000Z",
          },
        ],
        savedLunar: [{ created_at: "2026-08-09T10:00:00.000Z" }],
        favorites: [
          { item_type: "tarot_card", created_at: "2026-08-08T10:00:00.000Z" },
          { item_type: "zodiac_sign", created_at: "2026-08-07T10:00:00.000Z" },
        ],
      }),
    );

    expect(context.identity).toMatchObject({
      sunSign: "sagitario",
      moonSign: "geminis",
      hasBirthData: true,
      birthTimeKnown: true,
      hasNatalProfile: true,
    });
    expect(context.today.dailyCardUsed).toBe(true);
    expect(context.today.tarotUsed).toBe(true);
    expect(context.saved).toMatchObject({
      tarotCount: 1,
      lunarCount: 1,
      recentTarotIntent: "love",
      recentTarotSpreadType: "three_cards",
    });
    expect(context.favorites).toMatchObject({
      count: 2,
      types: ["tarot_card", "zodiac_sign"],
      recentType: "tarot_card",
    });
    expect(JSON.stringify(context)).not.toContain("Me responderá");
  });
});
