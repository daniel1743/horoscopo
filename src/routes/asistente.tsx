import { createFileRoute } from "@tanstack/react-router";
import { AssistantPage } from "@/pages/ai/AssistantPage";

export const Route = createFileRoute("/asistente")({
  head: () => ({
    meta: [
      { title: "Asistente — Proyecto Astral" },
      {
        name: "description",
        content:
          "Conversa con la Guía Astral: interpreta tus lecturas, aclara tu horóscopo o pregunta sobre nuestras guías.",
      },
      { property: "og:title", content: "Asistente — Proyecto Astral" },
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
