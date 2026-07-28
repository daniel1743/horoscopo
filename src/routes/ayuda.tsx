import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/ayuda")({
  head: () => ({
    meta: [
      { title: "Ayuda — Proyecto Astral" },
      { name: "description", content: "Respuestas a las preguntas más frecuentes." },
      { property: "og:title", content: "Ayuda — Proyecto Astral" },
      { property: "og:description", content: "Respuestas a las preguntas más frecuentes." },
    ],
  }),
  component: () => (
    <Placeholder title="Ayuda" description="Respuestas a las preguntas más frecuentes." />
  ),
});
