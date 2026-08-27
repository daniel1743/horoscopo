import { createFileRoute } from "@tanstack/react-router";
import { TarotYesNoPage } from "@/pages/tarot/TarotYesNoPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/si-o-no")({
  head: () => {
    const m = buildMeta({
      title: "Tarot sí o no · Creovision",
      description:
        "Una consulta orientativa del tarot que sugiere avance, cautela o la necesidad de observar más antes de decidir.",
      canonical: "/tarot/si-o-no",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotYesNoPage,
});
