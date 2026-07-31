import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Creovision" },
      { name: "description", content: "Escríbenos para dudas, colaboraciones o prensa." },
      { property: "og:title", content: "Contacto — Creovision" },
      { property: "og:description", content: "Escríbenos para dudas, colaboraciones o prensa." },
    ],
  }),
  component: () => (
    <Placeholder title="Contacto" description="Escríbenos para dudas, colaboraciones o prensa." />
  ),
});
