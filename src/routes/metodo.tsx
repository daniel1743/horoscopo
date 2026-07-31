import { createFileRoute } from "@tanstack/react-router";
import { EditorialMethodPage } from "@/pages/editorial/EditorialMethodPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/metodo")({
  head: () => {
    const m = buildMeta({
      title: "Método editorial — Creovision",
      description:
        "Cómo trabajamos: principios, proceso editorial y límites de nuestro contenido sobre astrología y tarot.",
    });
    return { meta: m.meta, links: m.links };
  },
  component: EditorialMethodPage,
});
