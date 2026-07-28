import { EditorialCard } from "./EditorialCard";
import type { EditorialArticle, EditorialCategory } from "@/types/editorial";

interface Props {
  articles: EditorialArticle[];
  categoriesById: Map<string, EditorialCategory>;
}

export function RelatedArticles({ articles, categoriesById }: Props) {
  if (articles.length === 0) return null;
  return (
    <section aria-labelledby="related-title" className="flex flex-col gap-6">
      <h2 id="related-title" className="font-display text-[22px] font-semibold text-ink">
        Continúa leyendo
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {articles.map((a) => (
          <li key={a.id}>
            <EditorialCard article={a} category={categoriesById.get(a.categoryId) ?? null} />
          </li>
        ))}
      </ul>
    </section>
  );
}
