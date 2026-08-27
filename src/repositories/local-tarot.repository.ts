import { majorArcana } from "@/data/tarot-cards";
import type { TarotArcana, TarotCard, TarotSuit } from "@/types/tarot";
import type { TarotRepository } from "./tarot.repository";

const localDeck: TarotCard[] = majorArcana.map((card) => ({
  id: `local-${card.slug}`,
  cardKey: card.slug.replaceAll("-", "_"),
  slug: card.slug,
  name: card.name,
  arcana: card.arcana,
  number: card.number,
  suit: card.suit,
  rank: card.rank,
  summary: card.summary,
  uprightMeaning: card.upright,
  reversedMeaning: card.reversed,
  keywords: card.keywords,
  reflectionQuestion: card.reflectionQuestion,
  yesNoTendency: card.yesNoTendency,
  imageKey: card.imageKey,
  displayOrder: card.displayOrder,
  isDemo: false,
  seoTitle: `${card.name} — significado del Tarot | Creovision`,
  seoDescription: card.summary,
  publishedAt: "2026-08-27T00:00:00.000Z",
}));

function filteredDeck(opts?: { arcana?: TarotArcana; suit?: TarotSuit }): TarotCard[] {
  return localDeck.filter((card) => {
    if (opts?.arcana && card.arcana !== opts.arcana) return false;
    if (opts?.suit && card.suit !== opts.suit) return false;
    return true;
  });
}

export const localTarotRepository: TarotRepository = {
  async getPublishedCards(opts) {
    return filteredDeck(opts);
  },

  async getCardBySlug(slug) {
    return localDeck.find((card) => card.slug === slug) ?? null;
  },

  async getCardByKey(cardKey) {
    return localDeck.find((card) => card.cardKey === cardKey) ?? null;
  },

  async getPublishedCardCount() {
    return localDeck.length;
  },

  async getLibrary(opts) {
    return filteredDeck(opts);
  },
};

export { localDeck };
