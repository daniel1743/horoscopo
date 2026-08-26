import { createFileRoute } from "@tanstack/react-router";
import { CommunityFeedPage } from "@/pages/community/CommunityFeedPage";
import { buildMeta } from "@/config/seo";
import { routes } from "@/config/routes";

export const Route = createFileRoute("/comunidad")({
  head: () => {
    const meta = buildMeta({
      title: "Comunidad — Horóscopo, Tarot y Luna | Creovision",
      description: "Comparte reflexiones y lecturas simbólicas con la comunidad de Creovision.",
      canonical: routes.community,
    });
    return { meta: meta.meta, links: meta.links };
  },
  component: CommunityFeedPage,
});
