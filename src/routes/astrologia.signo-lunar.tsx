import { createFileRoute } from "@tanstack/react-router";
import { AstrologyPage } from "@/components/astrology/AstrologyPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/astrologia/signo-lunar")({
  head: () => {
    const m = buildMeta({
      title: "Signo lunar: cálculo de referencia | Creovision",
      description:
        "Calcula el signo lunar de tu nacimiento con una posición astronómica de referencia y conoce la incertidumbre si falta la hora.",
      canonical: "/astrologia/signo-lunar",
    });
    return { meta: m.meta, links: m.links };
  },
  component: () => <AstrologyPage mode="moon" />,
});
