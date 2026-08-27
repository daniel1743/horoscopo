/**
 * Servicio de tarot. Consume el repositorio; nunca guarda preguntas ni resultados.
 */
import type { TarotCard, TarotDrawnCard, TarotReading, TarotSpreadKey } from "@/types/tarot";
import { resilientTarotRepository } from "@/repositories/resilient-tarot.repository";
import type { TarotRepository } from "@/repositories/tarot.repository";
import {
  drawOneCard,
  drawUniqueCards,
  drawReversed,
  getOrCreateAnonymousSeed,
  pickDailyCard,
  readStoredDaily,
  toLocalDateKey,
  writeStoredDaily,
} from "@/lib/tarot/card-selection";
import { tarotDeckConfig, tarotQuestionLimits, tarotSpreads } from "@/config/tarot";

export class TarotDeckIncompleteError extends Error {
  constructor(
    readonly count: number,
    readonly minimum: number,
  ) {
    super("Baraja incompleta");
    this.name = "TarotDeckIncompleteError";
  }
}
export class TarotCardNotFoundError extends Error {
  constructor(readonly identifier: string) {
    super(`Carta no encontrada: ${identifier}`);
    this.name = "TarotCardNotFoundError";
  }
}

function sanitizeQuestion(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.slice(0, tarotQuestionLimits.maxCharacters);
}

export class TarotService {
  constructor(private readonly repo: TarotRepository = resilientTarotRepository) {}

  /** Devuelve la baraja publicada ordenada por display_order. */
  loadDeck(): Promise<TarotCard[]> {
    return this.repo.getPublishedCards();
  }

  /** Carta del día estable. Persiste en localStorage y renueva al cambiar la fecha. */
  async getDailyCard(input?: {
    date?: Date;
    deck?: readonly TarotCard[];
  }): Promise<TarotDrawnCard | null> {
    const deck = input?.deck ?? (await this.loadDeck());
    if (deck.length === 0) return null;
    const dateKey = toLocalDateKey(input?.date ?? new Date());
    const stored = readStoredDaily();
    if (stored && stored.dateKey === dateKey) {
      const found = deck.find((c) => c.cardKey === stored.cardKey);
      if (found) {
        return {
          card: found,
          position: tarotSpreads.daily.positions[0],
          reversed: tarotDeckConfig.reversalsEnabled ? stored.reversed : false,
        };
      }
    }
    const seed = getOrCreateAnonymousSeed();
    const pick = pickDailyCard({ deck, date: input?.date, anonymousSeed: seed });
    if (!pick) return null;
    const reversed = tarotDeckConfig.reversalsEnabled ? pick.reversed : false;
    writeStoredDaily({ cardKey: pick.card.cardKey, dateKey: pick.dateKey, reversed });
    return { card: pick.card, position: tarotSpreads.daily.positions[0], reversed };
  }

  /** Consulta sí/no con una única carta. No persiste la pregunta. */
  async drawYesNoCard(input?: {
    question?: string;
    deck?: readonly TarotCard[];
  }): Promise<TarotReading | null> {
    const deck = input?.deck ?? (await this.loadDeck());
    const card = drawOneCard(deck);
    if (!card) return null;
    const question = sanitizeQuestion(input?.question);
    return {
      spread: "yes_no" as TarotSpreadKey,
      drawn: [
        {
          card,
          position: tarotSpreads.yes_no.positions[0],
          reversed: tarotDeckConfig.reversalsEnabled ? drawReversed() : false,
        },
      ],
      question,
      drawnAtIso: new Date().toISOString(),
    };
  }

  /** Tirada de tres cartas ÚNICAS. Preserva el orden de posiciones. */
  async drawThreeCards(input?: {
    question?: string;
    deck?: readonly TarotCard[];
  }): Promise<TarotReading | null> {
    const deck = input?.deck ?? (await this.loadDeck());
    if (deck.length < tarotSpreads.three_cards.numberOfCards) return null;
    const cards = drawUniqueCards(deck, tarotSpreads.three_cards.numberOfCards);
    const question = sanitizeQuestion(input?.question);
    const drawn: TarotDrawnCard[] = tarotSpreads.three_cards.positions.map((position, idx) => ({
      card: cards[idx],
      position,
      reversed: tarotDeckConfig.reversalsEnabled ? drawReversed() : false,
    }));
    return {
      spread: "three_cards" as TarotSpreadKey,
      drawn,
      question,
      drawnAtIso: new Date().toISOString(),
    };
  }

  getCardBySlug(slug: string) {
    return this.repo.getCardBySlug(slug);
  }
  getLibrary(opts?: Parameters<TarotRepository["getLibrary"]>[0]) {
    return this.repo.getLibrary(opts);
  }
  getPublishedCardCount() {
    return this.repo.getPublishedCardCount();
  }
}

export const tarotService = new TarotService();
