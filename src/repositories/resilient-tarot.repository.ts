import type { TarotArcana, TarotCard, TarotSuit } from "@/types/tarot";
import type { TarotRepository } from "./tarot.repository";
import { localTarotRepository } from "./local-tarot.repository";
import { supabaseTarotRepository } from "./supabase-tarot.repository";

const REMOTE_TIMEOUT_MS = 900;

function mergeBySlug(remote: TarotCard[], local: TarotCard[]): TarotCard[] {
  const merged = new Map(local.map((card) => [card.slug, card]));
  for (const card of remote) merged.set(card.slug, card);
  return [...merged.values()].sort((a, b) => a.displayOrder - b.displayOrder);
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Tarot remote repository timeout")),
      milliseconds,
    );
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

async function withLocalFallback<T>(
  remote: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await withTimeout(remote(), REMOTE_TIMEOUT_MS);
  } catch {
    return fallback();
  }
}

export const resilientTarotRepository: TarotRepository = {
  async getPublishedCards(opts?: { arcana?: TarotArcana }) {
    return withLocalFallback(
      async () =>
        mergeBySlug(
          await supabaseTarotRepository.getPublishedCards(opts),
          await localTarotRepository.getPublishedCards(opts),
        ),
      () => localTarotRepository.getPublishedCards(opts),
    );
  },

  async getCardBySlug(slug: string) {
    return withLocalFallback(
      async () =>
        (await supabaseTarotRepository.getCardBySlug(slug)) ??
        localTarotRepository.getCardBySlug(slug),
      () => localTarotRepository.getCardBySlug(slug),
    );
  },

  async getCardByKey(cardKey: string) {
    return withLocalFallback(
      async () =>
        (await supabaseTarotRepository.getCardByKey(cardKey)) ??
        localTarotRepository.getCardByKey(cardKey),
      () => localTarotRepository.getCardByKey(cardKey),
    );
  },

  async getPublishedCardCount() {
    return withLocalFallback(
      async () =>
        Math.max(
          await supabaseTarotRepository.getPublishedCardCount(),
          await localTarotRepository.getPublishedCardCount(),
        ),
      () => localTarotRepository.getPublishedCardCount(),
    );
  },

  async getLibrary(opts?: { arcana?: TarotArcana; suit?: TarotSuit }) {
    return withLocalFallback(
      async () =>
        mergeBySlug(
          await supabaseTarotRepository.getLibrary(opts),
          await localTarotRepository.getLibrary(opts),
        ),
      () => localTarotRepository.getLibrary(opts),
    );
  },
};
