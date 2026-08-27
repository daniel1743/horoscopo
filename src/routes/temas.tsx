import { createFileRoute } from "@tanstack/react-router";
import { TopicsPage } from "@/pages/editorial/TopicsPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/temas")({
  head: () => {
    const m = buildMeta({
      title: "Temas y guías editoriales | Creovision",
      description:
        "Explora guías y artículos de Tarot, astrología, Luna y reflexión con contexto claro y responsable.",
      canonical: "/temas",
    });
    return { meta: m.meta, links: m.links };
  },
  component: TopicsPage,
});
