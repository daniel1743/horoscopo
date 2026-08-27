import { createFileRoute } from "@tanstack/react-router";
import { MemoryPage } from "@/pages/ai/MemoryPage";

export const Route = createFileRoute("/_authenticated/mi-espacio/memoria")({
  head: () => ({
    meta: [
      { title: "Memoria del asistente — Mi espacio" },
      { name: "description", content: "Control total sobre los recuerdos de la Guía Astral." },
      { property: "og:title", content: "Memoria del asistente — Creovision" },
      {
        property: "og:description",
        content: "Consulta, edita y elimina lo que se recuerda de ti.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MemoryPage,
});
