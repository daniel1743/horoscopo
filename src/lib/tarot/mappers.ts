/**
 * Mapper Supabase → dominio.
 * Único punto que traduce filas crudas a `TarotCard`.
 */
import type { TarotArcana, TarotCard, TarotSuit, TarotYesNoTendency } from "@/types/tarot";

export interface TarotCardRow {
  id: string;
  card_key: string;
  slug: string;
  name: string;
  arcana: string;
  number: number | null;
  suit: string | null;
  rank: string | null;
  summary: string;
  upright_meaning: string;
  reversed_meaning: string | null;
  keywords: unknown;
  reflection_question: string | null;
  yes_no_tendency: string;
  image_key: string;
  display_order: number;
  is_demo: boolean;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
}

export const TAROT_CARD_COLUMNS =
  "id,card_key,slug,name,arcana,number,suit,rank,summary,upright_meaning,reversed_meaning,keywords,reflection_question,yes_no_tendency,image_key,display_order,is_demo,seo_title,seo_description,published_at";

function parseKeywords(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((k): k is string => typeof k === "string").slice(0, 12);
  }
  return [];
}

function parseArcana(raw: string): TarotArcana {
  return raw === "minor" ? "minor" : "major";
}

function parseSuit(raw: string | null): TarotSuit | null {
  if (raw === "wands" || raw === "cups" || raw === "swords" || raw === "pentacles") {
    return raw;
  }
  return null;
}

function parseTendency(raw: string): TarotYesNoTendency {
  if (raw === "favorable" || raw === "caution") return raw;
  return "open";
}

function sanitizeEditorialText(text: string | null): string | null {
  if (!text) return text;
  if (text.includes("Frase genérica de prueba editorial")) {
    return "Una revelación aguarda ser descubierta.";
  }
  return text;
}

export function mapTarotCardRow(row: TarotCardRow): TarotCard {
  return {
    id: row.id,
    cardKey: row.card_key,
    slug: row.slug,
    name: row.name,
    arcana: parseArcana(row.arcana),
    number: row.number,
    suit: parseSuit(row.suit),
    rank: row.rank,
    summary: sanitizeEditorialText(row.summary) || "",
    uprightMeaning: sanitizeEditorialText(row.upright_meaning) || "",
    reversedMeaning: sanitizeEditorialText(row.reversed_meaning),
    keywords: parseKeywords(row.keywords),
    reflectionQuestion: sanitizeEditorialText(row.reflection_question),
    yesNoTendency: parseTendency(row.yes_no_tendency),
    imageKey: row.image_key,
    displayOrder: row.display_order,
    isDemo: row.is_demo,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    publishedAt: row.published_at,
  };
}
