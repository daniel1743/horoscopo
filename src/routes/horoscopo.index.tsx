import { createFileRoute } from "@tanstack/react-router";
import { HoroscopeHubPage } from "@/pages/horoscope/HoroscopeHubPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/horoscopo/")({
  head: () => {
    const m = buildMeta({
      title: "Horóscopo — Creovision",
      description:
        "Horóscopo diario, semanal y mensual para los doce signos, con foco, ánimo y energía.",
    });
    return { meta: m.meta, links: m.links };
  },
  component: HoroscopeHubPage,
});
