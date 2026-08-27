import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/astrologia")({
  head: () => {
    const m = buildMeta({
      title: "Astrología — Proyecto Astral",
      description: "Comprende los principales conceptos de tu carta astral.",
      canonical: "/astrologia",
    });
    return { meta: m.meta, links: m.links };
  },
  component: () => (
    <Placeholder
      title="Astrología"
      description="Comprende los principales conceptos de tu carta astral."
    />
  ),
});
