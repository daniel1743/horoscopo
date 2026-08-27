import { createFileRoute } from "@tanstack/react-router";
import { TarotLibraryPage } from "@/pages/tarot/TarotLibraryPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/cartas/")({
  head: () => {
    const m = buildMeta({
      title: "Biblioteca de cartas · Tarot · Creovision",
      description:
        "Explora las 78 cartas del Tarot, sus significados al derecho e invertidos, palabras clave y preguntas para reflexionar.",
      canonical: "/tarot/cartas",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotLibraryPage,
});
