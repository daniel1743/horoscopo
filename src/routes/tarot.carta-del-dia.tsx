import { createFileRoute } from "@tanstack/react-router";
import { TarotDailyPage } from "@/pages/tarot/TarotDailyPage";
import { buildMeta } from "@/config/seo";
import { tarotDeckQueryOptions } from "@/hooks/useTarotDeck";

export const Route = createFileRoute("/tarot/carta-del-dia")({
  beforeLoad: ({ context }) => {
    void context.queryClient.prefetchQuery(tarotDeckQueryOptions());
  },
  head: () => {
    const m = buildMeta({
      title: "Carta del día · Tarot · Creovision",
      description:
        "Una carta simbólica diaria del tarot para observar con calma. Permanece estable durante todo el día.",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotDailyPage,
});
