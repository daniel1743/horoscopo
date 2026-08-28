import { createFileRoute, notFound } from "@tanstack/react-router";
import { TarotCardDetailPage } from "@/pages/tarot/TarotCardDetailPage";
import { buildMeta } from "@/config/seo";
import { tarotCardRoute } from "@/config/routes";
import { tarotService, type TarotService } from "@/services/tarot.service";
import { tarotQueryKeys } from "@/hooks/useTarotDeck";
import type { TarotCard } from "@/types/tarot";

interface LoaderData {
  card: TarotCard;
}

export function parseTarotCardParams(raw: { card: string }) {
  if (!raw.card || raw.card.trim().length === 0) throw notFound();
  return raw;
}

export async function loadTarotCardRouteData(
  slug: string,
  service: Pick<TarotService, "getCardBySlug"> = tarotService,
): Promise<LoaderData> {
  const card = await service.getCardBySlug(slug);
  if (!card) throw notFound();
  return { card };
}

export function getTarotCardMetaInput(slug: string, card?: Pick<TarotCard, "name"> | null) {
  const name = card?.name ?? decodeURIComponent(slug).replace(/-/g, " ");

  return {
    title: `${name} · Tarot · Creovision`,
    description: `Significado simbólico y palabras clave de la carta ${name}.`,
    canonical: tarotCardRoute(slug),
    structuredData: "WebPage" as const,
  };
}

export const Route = createFileRoute("/tarot/cartas/$card")({
  parseParams: parseTarotCardParams,
  loader: async ({ context, params }): Promise<LoaderData> => {
    const card = await context.queryClient.ensureQueryData({
      queryKey: tarotQueryKeys.card(params.card),
      queryFn: () => tarotService.getCardBySlug(params.card),
    });
    if (!card) throw notFound();
    return { card };
  },
  head: ({ params, loaderData }) => {
    const m = buildMeta(getTarotCardMetaInput(params.card, loaderData?.card));
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  component: Page,
});

function Page() {
  const { card } = Route.useParams();
  return <TarotCardDetailPage slug={card} />;
}
