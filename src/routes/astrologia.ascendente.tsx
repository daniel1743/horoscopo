import { createFileRoute } from "@tanstack/react-router";
import { AstrologyPage } from "@/components/astrology/AstrologyPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/astrologia/ascendente")({
  head: () => {
    const m = buildMeta({
      title: "Ascendente: cálculo de referencia | Creovision",
      description:
        "Calcula tu ascendente con fecha, hora, zona horaria y coordenadas de nacimiento; conoce sus límites y método.",
      canonical: "/astrologia/ascendente",
    });
    return { meta: m.meta, links: m.links };
  },
  component: () => <AstrologyPage mode="ascendant" />,
});
