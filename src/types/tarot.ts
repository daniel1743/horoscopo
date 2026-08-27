/**
 * Tipos de dominio para el sistema de tarot.
 * Los componentes NUNCA reciben filas crudas de Supabase — solo TarotCard.
 */

export type TarotArcana = "major" | "minor";
export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";
export type TarotYesNoTendency = "favorable" | "caution" | "open";
export type TarotSpreadKey =
  "daily" | "yes_no" | "three_cards" | "decision" | "past_present_future";

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
  routeKey:
    "tarotDaily" | "tarotYesNo" | "tarotThreeCards" | "tarotDecision" | "tarotPastPresentFuture";
  numberOfCards: number;
  positions: TarotSpreadPosition[];
  description: string;
  icon: "sun" | "premium" | "tarot";
}

export interface TarotDrawnCard {
  card: TarotCard;
  position: TarotSpreadPosition;
  reversed: boolean;
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
