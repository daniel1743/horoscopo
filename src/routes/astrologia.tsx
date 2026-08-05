import { createFileRoute, notFound } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";
import { isPublicFeatureEnabled } from "@/config/public-features";

export const Route = createFileRoute("/astrologia")({
  beforeLoad: () => {
    if (!isPublicFeatureEnabled("astrology")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Astrología — Creovision" },
      { name: "description", content: "Comprende los principales conceptos de tu carta astral." },
      { property: "og:title", content: "Astrología — Creovision" },
      {
        property: "og:description",
        content: "Comprende los principales conceptos de tu carta astral.",
      },
    ],
  }),
  component: () => (
    <Placeholder
      title="Astrología"
      description="Comprende los principales conceptos de tu carta astral."
    />
  ),
});
