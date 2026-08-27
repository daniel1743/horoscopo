import { createFileRoute } from "@tanstack/react-router";
import { AstrologyPage } from "@/components/astrology/AstrologyPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/astrologia/transitos")({
  head: () => {
    const m = buildMeta({
      title: "Tránsitos planetarios de referencia | Creovision",
      description:
        "Consulta posiciones planetarias y aspectos mayores frente a tu carta natal con un cálculo local, reproducible y transparente.",
      canonical: "/astrologia/transitos",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TransitRoutePage,
});

function TransitRoutePage() {
  return <AstrologyPage mode="transits" />;
}
