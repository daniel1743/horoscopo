import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticlePage } from "@/pages/editorial/ArticlePage";
import { getArticleBySlug, listCategories, listRelatedArticles } from "@/lib/editorial/repository";
import { buildMeta } from "@/config/seo";
import { articleRoute } from "@/config/routes";
import type { ArticleWithRelations, EditorialArticle, EditorialCategory } from "@/types/editorial";

interface LoaderData {
  article: ArticleWithRelations;
  related: EditorialArticle[];
  categories: EditorialCategory[];
}

export const Route = createFileRoute("/guias/$slug")({
  loader: async ({ params }): Promise<LoaderData> => {
    const article = await getArticleBySlug(params.slug);
    if (!article) throw notFound();
    const [related, categories] = await Promise.all([
      listRelatedArticles(article, 3),
      listCategories(),
    ]);
    return { article, related, categories };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Artículo no disponible" }, { name: "robots", content: "noindex" }],
      };
    }
    const { article } = loaderData;
    const meta = buildMeta({
      title: article.seo.title ?? `${article.title} | Creovision`,
      description: article.seo.description ?? article.excerpt,
      image: article.seo.og_image ?? article.imageUrl ?? undefined,
      canonical: article.canonicalOverride ?? articleRoute(article.slug),
    });
    return { meta: meta.meta, links: meta.links };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[28px] font-semibold text-ink">
        Este artículo no está disponible
      </h1>
      <p className="mt-3 font-body text-ink-soft">Es posible que haya sido movido o retirado.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[24px] font-semibold text-ink">
        No pudimos cargar este artículo
      </h1>
      <p className="mt-3 font-body text-ink-soft">{error.message}</p>
    </div>
  ),
  component: ArticleRouteComponent,
});

function ArticleRouteComponent() {
  const { article, related, categories } = Route.useLoaderData() as LoaderData;
  const byId = new Map<string, EditorialCategory>(categories.map((c) => [c.id, c] as const));
  return <ArticlePage article={article} related={related} categoriesById={byId} />;
}
