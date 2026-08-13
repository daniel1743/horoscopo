import { supabase } from "@/integrations/supabase/client";
import type { ActivityEntry, FavoriteType, PrivacySettings, SpreadType } from "./repository";

export type PersonalizationIntent =
  "love" | "work" | "decision" | "general" | "daily" | "relationship";
export type PersonalizationService =
  | "tarot"
  | "tarot_daily"
  | "tarot_yes_no"
  | "tarot_three_cards"
  | "moon"
  | "horoscope"
  | "compatibility"
  | "article"
  | "guide";

export interface PersonalizationContext {
  enabled: boolean;
  personalized: boolean;
  identity: {
    sunSign: string | null;
    moonSign: string | null;
    hasBirthData: boolean;
    birthTimeKnown: boolean | null;
    hasNatalProfile: boolean;
  };
  recent: {
    intents: PersonalizationIntent[];
    services: PersonalizationService[];
    dominantIntent: PersonalizationIntent | null;
    intentScores: Partial<Record<PersonalizationIntent, number>>;
    lastRelevantActivityAt: string | null;
  };
  today: {
    horoscopeUsed: boolean;
    moonUsed: boolean;
    dailyCardUsed: boolean;
    tarotUsed: boolean;
  };
  saved: {
    tarotCount: number;
    lunarCount: number;
    lastTarotSavedAt: string | null;
    lastLunarSavedAt: string | null;
    recentTarotIntent: PersonalizationIntent | null;
    recentTarotSpreadType: SpreadType | null;
  };
  favorites: {
    count: number;
    types: FavoriteType[];
    recentType: FavoriteType | null;
  };
  continuity: {
    hasSavedTarot: boolean;
    hasSavedLunar: boolean;
    hasFavorites: boolean;
    hasRecentActivity: boolean;
  };
}

interface ProfileContextRow {
  sun_sign: string | null;
  moon_sign: string | null;
}

interface NatalContextRow {
  birth_date: string | null;
  birth_time: string | null;
  birth_time_status: string | null;
  birth_place_label: string | null;
  birth_city: string | null;
  birth_country: string | null;
  birth_latitude: number | null;
  birth_longitude: number | null;
}

interface SavedTarotContextRow {
  spread_type: SpreadType;
  cards: Array<{ theme?: string }> | unknown;
  created_at: string;
}

interface SavedLunarContextRow {
  created_at: string;
}

interface FavoriteContextRow {
  item_type: FavoriteType;
  created_at: string;
}

export interface PersonalizationContextRows {
  privacy: Pick<PrivacySettings, "ai_personalization_enabled"> | null;
  profile: ProfileContextRow | null;
  natalProfile: NatalContextRow | null;
  activities: ActivityEntry[];
  savedTarot: SavedTarotContextRow[];
  savedLunar: SavedLunarContextRow[];
  favorites: FavoriteContextRow[];
  now?: Date;
}

const ALLOWED_INTENTS: PersonalizationIntent[] = [
  "love",
  "work",
  "decision",
  "general",
  "daily",
  "relationship",
];

const RELEVANT_ACTIVITY_TYPES = new Set<ActivityEntry["activity_type"]>([
  "view_horoscope",
  "view_tarot_card",
  "view_article",
  "view_guide",
  "tarot_reading",
  "reading_saved",
]);

const EMPTY_CONTEXT: PersonalizationContext = {
  enabled: false,
  personalized: false,
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
};

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function isIntent(value: unknown): value is PersonalizationIntent {
  return typeof value === "string" && ALLOWED_INTENTS.includes(value as PersonalizationIntent);
}

function isSameLocalDay(value: string, now: Date): boolean {
  const date = new Date(value);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function recencyWeight(createdAt: string, now: Date): number {
  const ageDays = Math.max(0, (now.getTime() - new Date(createdAt).getTime()) / 86_400_000);
  if (ageDays <= 7) return 1;
  if (ageDays <= 30) return 0.5;
  if (ageDays <= 90) return 0.2;
  return 0;
}

function normalizeService(metadata: Record<string, unknown>): PersonalizationService | null {
  const service = metadata.service;
  const subtype = metadata.subtype;
  if (service === "tarot" && subtype === "daily_card") return "tarot_daily";
  if (service === "tarot" && subtype === "yes_no") return "tarot_yes_no";
  if (service === "tarot" && subtype === "three_cards") return "tarot_three_cards";
  if (service === "tarot") return "tarot";
  if (service === "moon") return "moon";
  if (service === "horoscope") return "horoscope";
  if (service === "compatibility") return "compatibility";
  if (service === "article") return "article";
  if (service === "guide") return "guide";
  return null;
}

function tarotIntentFromTheme(theme: unknown): PersonalizationIntent | null {
  if (theme === "amor") return "love";
  if (theme === "trabajo") return "work";
  if (theme === "decision") return "decision";
  if (theme === "general") return "general";
  return null;
}

function deriveRecentTarotIntent(
  reading: SavedTarotContextRow | undefined,
): PersonalizationIntent | null {
  if (!reading || !Array.isArray(reading.cards)) return null;
  for (const card of reading.cards) {
    const intent = tarotIntentFromTheme(card.theme);
    if (intent) return intent;
  }
  return null;
}

export function buildPersonalizationContext(
  rows: PersonalizationContextRows,
): PersonalizationContext {
  if (!rows.privacy?.ai_personalization_enabled) {
    return { ...EMPTY_CONTEXT };
  }

  const now = rows.now ?? new Date();
  const relevantActivities = rows.activities
    .filter((activity) => RELEVANT_ACTIVITY_TYPES.has(activity.activity_type))
    .map((activity) => ({
      ...activity,
      weight: recencyWeight(activity.created_at, now),
      metadata: activity.metadata ?? {},
    }))
    .filter((activity) => activity.weight > 0);

  const intents = relevantActivities.map((activity) => activity.metadata.intent).filter(isIntent);
  const services = unique(
    relevantActivities
      .map((activity) => normalizeService(activity.metadata))
      .filter((service): service is PersonalizationService => Boolean(service)),
  );

  const weightedScores = new Map<PersonalizationIntent, number>();
  for (const activity of relevantActivities) {
    const intent = activity.metadata.intent;
    if (!isIntent(intent)) continue;
    weightedScores.set(intent, (weightedScores.get(intent) ?? 0) + activity.weight);
  }

  const dominantIntent =
    intents.length >= 3
      ? ([...weightedScores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null)
      : null;
  const totalScore = [...weightedScores.values()].reduce((sum, score) => sum + score, 0);
  const intentScores =
    totalScore > 0
      ? Object.fromEntries(
          [...weightedScores.entries()].map(([intent, score]) => [
            intent,
            Number((score / totalScore).toFixed(3)),
          ]),
        )
      : {};

  const lastRelevantActivityAt = relevantActivities[0]?.created_at ?? null;
  const todayActivities = rows.activities.filter((activity) =>
    isSameLocalDay(activity.created_at, now),
  );
  const todayServices = todayActivities
    .map((activity) => normalizeService(activity.metadata ?? {}))
    .filter((service): service is PersonalizationService => Boolean(service));
  const recentSavedTarot = rows.savedTarot[0];
  const favoriteTypes = unique(rows.favorites.map((favorite) => favorite.item_type));
  const hasBirthData = Boolean(
    rows.natalProfile?.birth_date ||
    rows.natalProfile?.birth_place_label ||
    rows.natalProfile?.birth_city ||
    rows.natalProfile?.birth_country ||
    rows.natalProfile?.birth_latitude ||
    rows.natalProfile?.birth_longitude,
  );

  return {
    enabled: true,
    personalized: true,
    identity: {
      sunSign: rows.profile?.sun_sign ?? null,
      moonSign: rows.profile?.moon_sign ?? null,
      hasBirthData,
      birthTimeKnown: rows.natalProfile?.birth_time_status
        ? rows.natalProfile.birth_time_status === "known"
        : rows.natalProfile?.birth_time
          ? true
          : null,
      hasNatalProfile: Boolean(rows.natalProfile),
    },
    recent: {
      intents,
      services,
      dominantIntent,
      intentScores,
      lastRelevantActivityAt,
    },
    today: {
      horoscopeUsed: todayServices.includes("horoscope"),
      moonUsed: todayServices.includes("moon"),
      dailyCardUsed: todayServices.includes("tarot_daily"),
      tarotUsed: todayServices.some((service) => service.startsWith("tarot")),
    },
    saved: {
      tarotCount: rows.savedTarot.length,
      lunarCount: rows.savedLunar.length,
      lastTarotSavedAt: rows.savedTarot[0]?.created_at ?? null,
      lastLunarSavedAt: rows.savedLunar[0]?.created_at ?? null,
      recentTarotIntent: deriveRecentTarotIntent(recentSavedTarot),
      recentTarotSpreadType: recentSavedTarot?.spread_type ?? null,
    },
    favorites: {
      count: rows.favorites.length,
      types: favoriteTypes,
      recentType: rows.favorites[0]?.item_type ?? null,
    },
    continuity: {
      hasSavedTarot: rows.savedTarot.length > 0,
      hasSavedLunar: rows.savedLunar.length > 0,
      hasFavorites: rows.favorites.length > 0,
      hasRecentActivity: relevantActivities.length > 0,
    },
  };
}

export async function getPersonalizationContext(): Promise<PersonalizationContext> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { ...EMPTY_CONTEXT };

  const userId = authData.user.id;
  const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const [
    privacyRes,
    profileRes,
    natalRes,
    activityRes,
    savedTarotRes,
    savedLunarRes,
    favoritesRes,
  ] = await Promise.all([
    supabase
      .from("user_privacy_settings")
      .select("ai_personalization_enabled")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("profiles").select("sun_sign, moon_sign").eq("id", userId).maybeSingle(),
    supabase
      .from("natal_profiles")
      .select(
        "birth_date, birth_time, birth_time_status, birth_place_label, birth_city, birth_country, birth_latitude, birth_longitude",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_activity_history")
      .select("id, user_id, activity_type, ref_type, ref_id, metadata, created_at")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("saved_tarot_readings")
      .select("spread_type, cards, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("saved_readings")
      .select("created_at")
      .eq("user_id", userId)
      .eq("reading_type", "lunar")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("user_favorites")
      .select("item_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (privacyRes.error) throw privacyRes.error;
  if (profileRes.error) throw profileRes.error;
  if (natalRes.error) throw natalRes.error;
  if (activityRes.error) throw activityRes.error;
  if (savedTarotRes.error) throw savedTarotRes.error;
  if (savedLunarRes.error) throw savedLunarRes.error;
  if (favoritesRes.error) throw favoritesRes.error;

  return buildPersonalizationContext({
    privacy: privacyRes.data,
    profile: profileRes.data,
    natalProfile: natalRes.data,
    activities: (activityRes.data ?? []) as ActivityEntry[],
    savedTarot: (savedTarotRes.data ?? []) as unknown as SavedTarotContextRow[],
    savedLunar: (savedLunarRes.data ?? []) as SavedLunarContextRow[],
    favorites: (favoritesRes.data ?? []) as FavoriteContextRow[],
  });
}
