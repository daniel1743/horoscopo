import { createFileRoute } from "@tanstack/react-router";
import { TarotHubPage } from "@/pages/tarot/TarotHubPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/")({
  head: () => {
    const m = buildMeta({
      title: "Tarot · Proyecto Astral",
      description:
        "Lecturas simbólicas de tarot para reflexionar con calma: carta del día, consulta sí o no y tirada de tres cartas.",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotHubPage,
});
