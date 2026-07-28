import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { AuthorBlock } from "@/components/editorial/AuthorBlock";
import { authorRoute, routes } from "@/config/routes";
import type { EditorialArticle, EditorialAuthor, EditorialCategory } from "@/types/editorial";

interface Props {
  author: EditorialAuthor;
  articles: EditorialArticle[];
  categoriesById: Map<string, EditorialCategory>;
}

export function AuthorPage({ author, articles, categoriesById }: Props) {
  return (
    <PageShell
      width="default"
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Autores", href: routes.authors },
        { label: author.name, href: authorRoute(author.slug) },
      ]}
    >
      <PageHeader eyebrow="Autor" title={author.name} description={author.roleLabel ?? undefined} />

      <div className="mb-10">
        <AuthorBlock author={author} />
      </div>

      {articles.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-6 font-body text-ink-soft">
          Este autor todavía no tiene artículos publicados.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {articles.map((a) => (
            <li key={a.id}>
              <EditorialCard article={a} category={categoriesById.get(a.categoryId) ?? null} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
