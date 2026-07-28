import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryPage } from "@/pages/editorial/CategoryPage";
import { getCategoryBySlug, listPublishedArticles } from "@/lib/editorial/repository";
import { buildMeta } from "@/config/seo";
import { categoryRoute } from "@/config/routes";

export const Route = createFileRoute("/temas/$category")({
  loader: async ({ params }) => {
    const category = await getCategoryBySlug(params.category);
    if (!category) throw notFound();
    const articles = await listPublishedArticles({ categoryId: category.id, limit: 60 });
    return { category, articles };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Categoría no encontrada" }, { name: "robots", content: "noindex" }],
      };
    }
    const { category } = loaderData;
    const m = buildMeta({
      title: `${category.label} | Proyecto Astral`,
      description: category.description ?? undefined,
      canonical: categoryRoute(category.slug),
    });
    return { meta: m.meta, links: m.links };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[28px] font-semibold text-ink">Categoría no encontrada</h1>
    </div>
  ),
  component: CategoryRoute,
});

function CategoryRoute() {
  const { category, articles } = Route.useLoaderData();
  return <CategoryPage category={category} articles={articles} />;
}
