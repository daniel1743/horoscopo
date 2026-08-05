import { createFileRoute, notFound } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";
import { isRoutePubliclyEnabled } from "@/config/public-features";

export const Route = createFileRoute("/contacto")({
  beforeLoad: () => {
    if (!isRoutePubliclyEnabled("contact")) throw notFound();
  },
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
