import { createFileRoute } from "@tanstack/react-router";
import { AstrologyPage } from "@/components/astrology/AstrologyPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/astrologia/carta-natal")({
  head: () => {
    const m = buildMeta({
      title: "Carta natal de referencia | Creovision",
      description:
        "Calcula posiciones planetarias, casas iguales, ángulos y aspectos mayores con tus datos de nacimiento, de forma local y transparente.",
      canonical: "/astrologia/carta-natal",
    });
    return { meta: m.meta, links: m.links };
  },
  component: () => <AstrologyPage mode="natal" />,
});
