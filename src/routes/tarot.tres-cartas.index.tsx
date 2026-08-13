import { createFileRoute } from "@tanstack/react-router";
import { TarotThreeCardsPage } from "@/pages/tarot/TarotThreeCardsPage";
import { buildMeta } from "@/config/seo";
import { tarotDeckQueryOptions } from "@/hooks/useTarotDeck";
import { routes } from "@/config/routes";

export const Route = createFileRoute("/tarot/tres-cartas/")({
  beforeLoad: ({ context }) => {
    void context.queryClient.prefetchQuery(tarotDeckQueryOptions());
  },
  head: () => {
    const m = buildMeta({
      title: "Tirada de Tarot de 3 cartas gratis · Creovision",
      description:
        "Baraja y elige tres cartas para una lectura general de tarot: pasado, presente y tendencia futura.",
      canonical: routes.tarotThreeCards,
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotThreeCardsPage,
});
