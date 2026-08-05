/**
 * Tipos de dominio para el sistema de tarot.
 * Los componentes NUNCA reciben filas crudas de Supabase — solo TarotCard.
 */

export type TarotArcana = "major" | "minor";
export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";
export type TarotYesNoTendency = "favorable" | "caution" | "open";
export type TarotSpreadKey = "daily" | "yes_no" | "three_cards";
export type ThreeCardReadingSlug = "general" | "amor" | "trabajo" | "decision";
export type AccessLevel = "free" | "registered" | "premium";

export interface TarotCard {
  id: string;
  cardKey: string;
  slug: string;
  name: string;
  arcana: TarotArcana;
  number: number | null;
  suit: TarotSuit | null;
  rank: string | null;
  summary: string;
  uprightMeaning: string;
  reversedMeaning: string | null;
  keywords: string[];
  reflectionQuestion: string | null;
  yesNoTendency: TarotYesNoTendency;
  imageKey: string;
  displayOrder: number;
  isDemo: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
}

export interface TarotSpreadPosition {
  key: string;
  label: string;
  description: string;
}

export interface TarotSpreadDefinition {
  key: TarotSpreadKey;
  label: string;
  routeKey: "tarotDaily" | "tarotYesNo" | "tarotThreeCards";
  numberOfCards: number;
  positions: TarotSpreadPosition[];
  description: string;
  icon: "sun" | "premium" | "tarot";
}

export interface TarotDrawnCard {
  card: TarotCard;
  position: TarotSpreadPosition;
}

export interface TarotReading {
  spread: TarotSpreadKey;
  drawn: TarotDrawnCard[];
  /** Nunca se persiste ni se envía a Supabase; solo vive en sessionStorage. */
  question?: string;
  drawnAtIso: string;
}

export interface TarotServiceResult<T> {
  ok: boolean;
  data?: T;
  error?: "unavailable" | "deck_incomplete" | "not_found" | "validation" | "network";
}

/* ============ TIRADA DE TRES CARTAS CONFIGURABLE ============ */

export interface ThreeCardPositionConfig {
  key: "emotional_world" | "relationship_dynamic" | "guidance_forward" | "past" | "present" | "future" | "situation" | "challenge_opportunity" | "recommended_action" | "decision_driver" | "consideration" | "choice_criteria";
  label: string;
  shortLabel: string;
  description: string;
  interpretationFocus: string;
  displayOrder: 1 | 2 | 3;
}

export interface ThreeCardReadingConfig {
  slug: ThreeCardReadingSlug;
  title: string;
  shortTitle: string;
  description: string;
  intro: string;
  userContextLabel: string;
  userContextPlaceholder: string;
  positions: readonly [ThreeCardPositionConfig, ThreeCardPositionConfig, ThreeCardPositionConfig];
  synthesisInstructions: string;
  seo: {
    title: string;
    description: string;
    canonical?: string;
  };
  access: AccessLevel;
  enabled: boolean;
}
