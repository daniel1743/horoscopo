import { createFileRoute } from "@tanstack/react-router";
import { TarotDailyPage } from "@/pages/tarot/TarotDailyPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/carta-del-dia")({
  head: () => {
    const m = buildMeta({
      title: "Carta del día · Tarot · Proyecto Astral",
      description:
        "Una carta simbólica diaria del tarot para observar con calma. Permanece estable durante todo el día.",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotDailyPage,
});
