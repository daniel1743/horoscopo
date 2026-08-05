import { createFileRoute } from "@tanstack/react-router";
import { TarotThreeCardsPage } from "@/pages/tarot/TarotThreeCardsPage";
import { buildMeta } from "@/config/seo";
import { tarotDeckQueryOptions } from "@/hooks/useTarotDeck";

export const Route = createFileRoute("/tarot/tres-cartas/")({
  beforeLoad: ({ context }) => {
    void context.queryClient.prefetchQuery(tarotDeckQueryOptions());
  },
  head: () => {
    const m = buildMeta({
      title: "Tirada de tres cartas · Tarot · Creovision",
      description:
        "Tres cartas de tarot para observar una situación: lo que influye, lo que conviene mirar y un posible próximo paso.",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotThreeCardsPage,
});
