import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/nosotros")({
  head: () => {
    const m = buildMeta({
      title: "Sobre nosotros — Creovision",
      description: "Quiénes somos y qué nos mueve.",
      canonical: "/nosotros",
    });
    return { meta: m.meta, links: m.links };
  },
  component: () => (
    <Placeholder title="Sobre nosotros" description="Quiénes somos y qué nos mueve." />
  ),
});
