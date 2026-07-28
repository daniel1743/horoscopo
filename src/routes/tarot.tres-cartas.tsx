import { createFileRoute } from "@tanstack/react-router";
import { TarotThreeCardsPage } from "@/pages/tarot/TarotThreeCardsPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/tres-cartas")({
  head: () => {
    const m = buildMeta({
      title: "Tirada de tres cartas · Tarot · Proyecto Astral",
      description:
        "Tres cartas de tarot para observar una situación: lo que influye, lo que conviene mirar y un posible próximo paso.",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotThreeCardsPage,
});
