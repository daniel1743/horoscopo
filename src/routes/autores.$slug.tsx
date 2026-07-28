import { createFileRoute, notFound } from "@tanstack/react-router";
import { AuthorPage } from "@/pages/editorial/AuthorPage";
import { getAuthorBySlug, listCategories, listPublishedArticles } from "@/lib/editorial/repository";
import { buildMeta } from "@/config/seo";
import { authorRoute } from "@/config/routes";
import type { EditorialArticle, EditorialAuthor, EditorialCategory } from "@/types/editorial";

interface LoaderData {
  author: EditorialAuthor;
  articles: EditorialArticle[];
  categories: EditorialCategory[];
}

export const Route = createFileRoute("/autores/$slug")({
  loader: async ({ params }): Promise<LoaderData> => {
    const author = await getAuthorBySlug(params.slug);
    if (!author) throw notFound();
    const [articles, categories] = await Promise.all([
      listPublishedArticles({ authorId: author.id, limit: 60 }),
      listCategories(),
    ]);
    return { author, articles, categories };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Autor no encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { author } = loaderData;
    const m = buildMeta({
      title: `${author.name} | Proyecto Astral`,
      description: author.bio ?? author.roleLabel ?? undefined,
      canonical: authorRoute(author.slug),
    });
    return { meta: m.meta, links: m.links };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[28px] font-semibold text-ink">Autor no encontrado</h1>
    </div>
  ),
  component: AuthorRoute,
});

function AuthorRoute() {
  const { author, articles, categories } = Route.useLoaderData() as LoaderData;
  const byId = new Map<string, EditorialCategory>(categories.map((c) => [c.id, c] as const));
  return <AuthorPage author={author} articles={articles} categoriesById={byId} />;
}
