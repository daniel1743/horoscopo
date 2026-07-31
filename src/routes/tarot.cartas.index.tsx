import { createFileRoute } from "@tanstack/react-router";
import { TarotLibraryPage } from "@/pages/tarot/TarotLibraryPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/cartas/")({
  head: () => {
    const m = buildMeta({
      title: "Biblioteca de cartas · Tarot · Creovision",
      description:
        "Explora los Arcanos Mayores publicados con su significado, palabras clave y preguntas para reflexionar.",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TarotLibraryPage,
});
