import { createFileRoute } from "@tanstack/react-router";
import { TarotLibraryPage } from "@/pages/tarot/TarotLibraryPage";
import { buildMeta } from "@/config/seo";
import { routes } from "@/config/routes";

export const Route = createFileRoute("/tarot/cartas/")({
  head: () => {
    const m = buildMeta({
      title: "Biblioteca de cartas · Tarot · Creovision",
      description:
        "Explora los Arcanos Mayores publicados con su significado, palabras clave y preguntas para reflexionar.",
      canonical: routes.tarotLibrary,
      structuredData: "CollectionPage",
    });
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  component: TarotLibraryPage,
});
