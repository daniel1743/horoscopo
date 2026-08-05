import { createFileRoute, notFound } from "@tanstack/react-router";
import { AssistantPage } from "@/pages/ai/AssistantPage";
import { isPublicFeatureEnabled } from "@/config/public-features";

export const Route = createFileRoute("/asistente")({
  beforeLoad: () => {
    if (!isPublicFeatureEnabled("assistant")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Asistente — Creovision" },
      {
        name: "description",
        content:
          "Conversa con la Guía Astral: interpreta tus lecturas, aclara tu horóscopo o pregunta sobre nuestras guías.",
      },
      { property: "og:title", content: "Asistente — Creovision" },
      {
        property: "og:description",
        content: "Guía Astral, una IA orientativa apoyada en contenido editorial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});
