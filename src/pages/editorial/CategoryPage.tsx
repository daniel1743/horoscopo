import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { categoryRoute, routes } from "@/config/routes";
import type { EditorialArticle, EditorialCategory } from "@/types/editorial";

interface Props {
  category: EditorialCategory;
  articles: EditorialArticle[];
}

export function CategoryPage({ category, articles }: Props) {
  return (
    <PageShell
      width="default"
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Guías", href: routes.guides },
        { label: category.label, href: categoryRoute(category.slug) },
      ]}
    >
      <PageHeader
        eyebrow="Categoría editorial"
        title={category.label}
        description={category.description ?? undefined}
      />

      {articles.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-6 font-body text-ink-soft">
          Todavía no hay artículos publicados en esta categoría.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {articles.map((a) => (
            <li key={a.id}>
              <EditorialCard article={a} category={category} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
