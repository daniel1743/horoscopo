import { createFileRoute } from "@tanstack/react-router";
import { GuidesPage } from "@/pages/editorial/GuidesPage";
import { listAuthors, listCategories, listPublishedArticles } from "@/lib/editorial/repository";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/guias")({
  loader: async () => {
    const [articles, categories, authors] = await Promise.all([
      listPublishedArticles({ limit: 60 }),
      listCategories(),
      listAuthors(),
    ]);
    return { articles, categories, authors };
  },
  head: () => {
    const m = buildMeta({
      title: "Guías — Creovision",
      description:
        "Ensayos y artículos editoriales sobre astrología, tarot, luna y compatibilidad, con una mirada clara y contemporánea.",
    });
    return { meta: m.meta, links: m.links };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[24px] font-semibold text-ink">
        No pudimos cargar las guías
      </h1>
      <p className="mt-3 font-body text-ink-soft">{error.message}</p>
    </div>
  ),
  component: GuidesRoute,
});

function GuidesRoute() {
  const { articles, categories, authors } = Route.useLoaderData();
  return <GuidesPage articles={articles} categories={categories} authors={authors} />;
}
