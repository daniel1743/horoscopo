import { createFileRoute } from "@tanstack/react-router";
import { TarotCardDetailPage } from "@/pages/tarot/TarotCardDetailPage";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/tarot/cartas/$card")({
  head: ({ params }) => {
    const name = decodeURIComponent(params.card).replace(/-/g, " ");
    const m = buildMeta({
      title: `${name} · Tarot · Creovision`,
      description: `Significado simbólico y palabras clave de la carta ${name}.`,
      canonical: `/tarot/cartas/${encodeURIComponent(params.card)}`,
    });
    return { meta: m.meta, links: m.links };
  },
  component: Page,
});

function Page() {
  const { card } = Route.useParams();
  return <TarotCardDetailPage slug={card} />;
}
