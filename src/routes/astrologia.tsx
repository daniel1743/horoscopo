import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/astrologia")({
  head: () => ({
    meta: [
      { title: "Astrología — Proyecto Astral" },
      { name: "description", content: "Comprende los principales conceptos de tu carta astral." },
      { property: "og:title", content: "Astrología — Proyecto Astral" },
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
