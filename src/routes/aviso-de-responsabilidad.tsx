import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/aviso-de-responsabilidad")({
  head: () => ({
    meta: [
      { title: "Aviso de responsabilidad — Creovision" },
      { name: "description", content: "El alcance del contenido editorial." },
      { property: "og:title", content: "Aviso de responsabilidad — Creovision" },
      { property: "og:description", content: "El alcance del contenido editorial." },
    ],
  }),
  component: () => (
    <Placeholder
      title="Aviso de responsabilidad"
      description="El alcance del contenido editorial."
    />
  ),
});
