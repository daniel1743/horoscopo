import { createFileRoute } from "@tanstack/react-router";
import { TarotThreeCardsAmorPage } from "@/pages/tarot/TarotThreeCardsAmorPage";
import { buildMeta } from "@/config/seo";
import { threeCardReadings } from "@/config/three-card-readings";
import { tarotDeckQueryOptions } from "@/hooks/useTarotDeck";

const config = threeCardReadings.amor;

export const Route = createFileRoute("/tarot/tres-cartas/amor")({
  beforeLoad: ({ context }) => {
    void context.queryClient.prefetchQuery(tarotDeckQueryOptions());
  },
  head: () => {
    const m = buildMeta({
      title: config.seo.title,
      description: config.seo.description,
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotThreeCardsAmorPage,
});
