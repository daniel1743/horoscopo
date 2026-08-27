import { createFileRoute } from "@tanstack/react-router";
import { AstrologyPage } from "@/components/astrology/AstrologyPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/astrologia/sinastria")({
  head: () => {
    const m = buildMeta({
      title: "Sinastría de referencia | Creovision",
      description:
        "Compara dos cartas natales con aspectos cruzados calculados localmente y sin guardar los datos introducidos.",
      canonical: "/astrologia/sinastria",
    });
    return {
      meta: [...m.meta, { name: "robots", content: "noindex,nofollow" }],
      links: m.links,
    };
  },
  component: SynastryRoutePage,
});

function SynastryRoutePage() {
  return <AstrologyPage mode="synastry" />;
}
