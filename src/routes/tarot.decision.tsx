import { createFileRoute } from "@tanstack/react-router";
import { TarotDecisionPage } from "@/pages/tarot/TarotDecisionPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/decision")({
  head: () => {
    const m = buildMeta({
      title: "Tarot para una decisión · Creovision",
      description:
        "Ordena una decisión con una lectura de dos cartas: qué conviene valorar y cuál puede ser un siguiente paso.",
      canonical: "/tarot/decision",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotDecisionPage,
});
