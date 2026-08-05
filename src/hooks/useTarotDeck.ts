import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { tarotService } from "@/services/tarot.service";
import { minimumCardsForCurrentEnv } from "@/config/tarot";

export const tarotQueryKeys = {
  deck: ["tarot", "deck"] as const,
  card: (slug: string) => ["tarot", "card", slug] as const,
  library: (arcana?: string, suit?: string) =>
    ["tarot", "library", arcana ?? "all", suit ?? "all"] as const,
  daily: (dateKey: string) => ["tarot", "daily", dateKey] as const,
};

export interface DeckState {
  cards: import("@/types/tarot").TarotCard[];
  ready: boolean;
  minimum: number;
}

export const tarotDeckQueryOptions = () =>
  queryOptions<DeckState>({
    queryKey: tarotQueryKeys.deck,
    queryFn: async () => {
      const cards = await tarotService.loadDeck();
      const minimum = minimumCardsForCurrentEnv();
      return { cards, ready: cards.length >= minimum, minimum };
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

export function useTarotDeck() {
  return useQuery(tarotDeckQueryOptions());
}
