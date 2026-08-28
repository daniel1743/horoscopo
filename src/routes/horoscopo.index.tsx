import { createFileRoute, notFound } from "@tanstack/react-router";
import { HoroscopeHubPage } from "@/pages/horoscope/HoroscopeHubPage";
import { buildMeta } from "@/config/seo";
import { isPublicFeatureEnabled } from "@/config/public-features";
import { routes } from "@/config/routes";

export const Route = createFileRoute("/horoscopo/")({
  beforeLoad: () => {
    if (!isPublicFeatureEnabled("horoscope")) throw notFound();
  },
  head: () => {
    const m = buildMeta({
      title: "Horóscopo — Creovision",
      description:
        "Horóscopo diario, semanal y mensual para los doce signos, con foco, ánimo y energía.",
      canonical: routes.horoscope,
      structuredData: "CollectionPage",
    });
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  component: HoroscopeHubPage,
});
