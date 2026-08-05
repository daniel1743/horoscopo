import { createFileRoute, notFound } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";
import { isRoutePubliclyEnabled } from "@/config/public-features";

export const Route = createFileRoute("/nosotros")({
  beforeLoad: () => {
    if (!isRoutePubliclyEnabled("about")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Sobre nosotros — Creovision" },
      { name: "description", content: "Quiénes somos y qué nos mueve." },
      { property: "og:title", content: "Sobre nosotros — Creovision" },
      { property: "og:description", content: "Quiénes somos y qué nos mueve." },
    ],
  }),
  component: () => (
    <Placeholder title="Sobre nosotros" description="Quiénes somos y qué nos mueve." />
  ),
});
