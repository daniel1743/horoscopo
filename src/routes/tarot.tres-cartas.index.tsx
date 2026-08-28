import { createFileRoute } from "@tanstack/react-router";
import { TarotThreeCardsPage } from "@/pages/tarot/TarotThreeCardsPage";
import { buildMeta } from "@/config/seo";
import { tarotDeckQueryOptions } from "@/hooks/useTarotDeck";
import { routes } from "@/config/routes";

export const tarotThreeCardsGeneralMeta = {
  title: "Tirada de Tarot de 3 cartas gratis · Creovision",
  description:
    "Elige tres cartas para una lectura general de tarot sobre una situación abierta: influencia, qué mirar y próximo paso.",
  canonical: routes.tarotThreeCards,
  structuredData: "WebPage",
} as const;

export const Route = createFileRoute("/tarot/tres-cartas/")({
  beforeLoad: ({ context }) => {
    void context.queryClient.prefetchQuery(tarotDeckQueryOptions());
  },
  head: () => {
    const m = buildMeta(tarotThreeCardsGeneralMeta);
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  component: TarotThreeCardsPage,
});
