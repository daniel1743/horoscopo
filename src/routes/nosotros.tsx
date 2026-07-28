import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Sobre nosotros — Proyecto Astral" },
      { name: "description", content: "Quiénes somos y qué nos mueve." },
      { property: "og:title", content: "Sobre nosotros — Proyecto Astral" },
      { property: "og:description", content: "Quiénes somos y qué nos mueve." },
    ],
  }),
  component: () => (
    <Placeholder title="Sobre nosotros" description="Quiénes somos y qué nos mueve." />
  ),
});
