import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/HomePage";
import { buildMeta } from "@/config/seo";

const meta = buildMeta({
  title: "Astrología, tarot y horóscopo con claridad | Creovision",
  description:
    "Explora tu horóscopo, tarot, compatibilidad y ciclos lunares mediante una experiencia editorial clara y contemporánea.",
});

export const Route = createFileRoute("/")({
  head: () => ({ meta: meta.meta, links: meta.links }),
  component: HomePage,
});
