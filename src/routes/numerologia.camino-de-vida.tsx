import { createFileRoute } from "@tanstack/react-router";
import { LifePathPage } from "@/pages/numerology/LifePathPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/numerologia/camino-de-vida")({
  head: () => {
    const m = buildMeta({
      title: "Número de camino de vida: cálculo simbólico | Creovision",
      description:
        "Calcula tu número de camino de vida sin guardar tu fecha y explora una interpretación simbólica, práctica y no predictiva.",
      canonical: "/numerologia/camino-de-vida",
    });
    return { meta: m.meta, links: m.links };
  },
  component: LifePathPage,
});
