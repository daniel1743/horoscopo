import { createFileRoute } from "@tanstack/react-router";
import { DreamDictionaryPage } from "@/pages/dreams/DreamDictionaryPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/suenos")({
  head: () => {
    const m = buildMeta({
      title: "Diccionario de sueños: símbolos y reflexión | Creovision",
      description:
        "Explora símbolos de sueños con lentes emocionales y simbólicos. Una guía de reflexión, no un diagnóstico ni una interpretación universal.",
      canonical: "/suenos",
    });
    return { meta: m.meta, links: m.links };
  },
  component: DreamDictionaryPage,
});
