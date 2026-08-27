import { createFileRoute } from "@tanstack/react-router";
import { CommunityFeedPage, type CommunitySharePrefill } from "@/pages/community/CommunityFeedPage";
import { buildMeta } from "@/config/seo";
import { routes } from "@/config/routes";
import type { CommunityPostType } from "@/lib/account/repository";

const shareTypes: readonly CommunityPostType[] = [
  "reflection",
  "horoscope",
  "moon",
  "tarot",
  "compatibility",
  "birth_chart",
  "other",
];

const readSearchString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const cleanValue = value.trim();
  return cleanValue || undefined;
};

const readShareType = (value: unknown): CommunityPostType =>
  shareTypes.includes(value as CommunityPostType) ? (value as CommunityPostType) : "reflection";

export const Route = createFileRoute("/comunidad")({
  validateSearch: (search: Record<string, unknown>) => ({
    shareType: typeof search.shareType === "string" ? search.shareType : undefined,
    shareTitle: readSearchString(search.shareTitle),
    shareBody: readSearchString(search.shareBody),
    shareSourceRef: readSearchString(search.shareSourceRef),
    shareSourceTitle: readSearchString(search.shareSourceTitle),
    shareSourceUrl: readSearchString(search.shareSourceUrl),
  }),
  head: () => {
    const meta = buildMeta({
      title: "Comunidad — Horóscopo, Tarot y Luna | Creovision",
      description: "Comparte reflexiones y lecturas simbólicas con la comunidad de Creovision.",
      canonical: routes.community,
    });
    return { meta: meta.meta, links: meta.links };
  },
  component: CommunityRoute,
});

function CommunityRoute() {
  const search = Route.useSearch();
  const hasPrefill = Boolean(search.shareBody && search.shareSourceUrl);
  const sharePrefill: CommunitySharePrefill | undefined = hasPrefill
    ? {
        initialPostType: readShareType(search.shareType),
        initialTitle: search.shareTitle ?? "",
        initialBody: search.shareBody ?? "",
        sourceRef: search.shareSourceRef ?? "",
        sourceTitle: search.shareSourceTitle ?? "",
        sourceUrl: search.shareSourceUrl ?? "",
      }
    : undefined;

  return <CommunityFeedPage sharePrefill={sharePrefill} />;
}
