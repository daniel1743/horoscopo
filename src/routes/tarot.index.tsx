import { createFileRoute } from "@tanstack/react-router";
import { TarotHubPage } from "@/pages/tarot/TarotHubPage";
import { buildMeta } from "@/config/seo";
import { routes } from "@/config/routes";

export const Route = createFileRoute("/tarot/")({
  head: () => {
    const m = buildMeta({
      title: "Tarot · Creovision",
      description:
        "Lecturas simbólicas de tarot para reflexionar con calma: carta del día, consulta sí o no y tirada de tres cartas.",
      canonical: routes.tarot,
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotHubPage,
});
