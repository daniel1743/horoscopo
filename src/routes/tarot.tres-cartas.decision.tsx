import { createFileRoute } from "@tanstack/react-router";
import { ThreeCardExperienceShell } from "@/components/tarot/experience/ThreeCardExperienceShell";
import { buildMeta } from "@/config/seo";
import { threeCardReadings } from "@/config/three-card-readings";
import { tarotDeckQueryOptions } from "@/hooks/useTarotDeck";

const config = threeCardReadings.decision;

export const Route = createFileRoute("/tarot/tres-cartas/decision")({
  beforeLoad: ({ context }) => {
    void context.queryClient.prefetchQuery(tarotDeckQueryOptions());
  },
  head: () => {
    const m = buildMeta({
      title: config.seo.title,
      description: config.seo.description,
      canonical: config.seo.canonical,
      structuredData: "WebPage",
    });
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  component: TarotThreeCardsDecisionPage,
});

function TarotThreeCardsDecisionPage() {
  return <ThreeCardExperienceShell readingSlug="decision" />;
}
