import { createFileRoute } from "@tanstack/react-router";
import { TarotPastPresentFuturePage } from "@/pages/tarot/TarotPastPresentFuturePage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/pasado-presente-futuro")({
  head: () => {
    const m = buildMeta({
      title: "Tarot pasado, presente y futuro · Creovision",
      description:
        "Explora una secuencia de tres cartas para observar antecedentes, presente y una posibilidad futura abierta.",
      canonical: "/tarot/pasado-presente-futuro",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotPastPresentFuturePage,
});
