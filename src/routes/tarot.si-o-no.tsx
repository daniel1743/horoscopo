import { createFileRoute } from "@tanstack/react-router";
import { TarotYesNoPage } from "@/pages/tarot/TarotYesNoPage";
import { buildMeta } from "@/config/seo";
import { tarotDeckQueryOptions } from "@/hooks/useTarotDeck";
import { routes } from "@/config/routes";

export const Route = createFileRoute("/tarot/si-o-no")({
  beforeLoad: ({ context }) => {
    void context.queryClient.prefetchQuery(tarotDeckQueryOptions());
  },
  head: () => {
    const m = buildMeta({
      title: "Tarot sí o no · Creovision",
      description:
        "Una consulta orientativa del tarot que sugiere avance, cautela o la necesidad de observar más antes de decidir.",
      canonical: routes.tarotYesNo,
      structuredData: "WebPage",
    });
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  component: TarotYesNoPage,
});
