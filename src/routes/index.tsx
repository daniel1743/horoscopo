import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/HomePage";
import { buildMeta } from "@/config/seo";

const meta = buildMeta({
  title: "Tarot, luna y guías simbólicas | Creovision",
  description:
    "Explora tarot, ciclos lunares y guías simbólicas mediante una experiencia editorial clara y contemporánea.",
});

export const Route = createFileRoute("/")({
  head: () => ({ meta: meta.meta, links: meta.links }),
  component: HomePage,
});
