import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { categoryRoute, routes } from "@/config/routes";
import { editorialTopicFilters, type EditorialTopicSlug } from "@/config/editorial";
import type { EditorialArticle, EditorialAuthor, EditorialCategory } from "@/types/editorial";

interface Props {
  articles: EditorialArticle[];
  categories: EditorialCategory[];
  authors: EditorialAuthor[];
  unavailable?: boolean;
  topic?: string;
}

/** Hub editorial: portada de guías con categorías + listado. */
export function GuidesPage({ articles, categories, unavailable = false, topic }: Props) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const activeTopic =
    topic && Object.prototype.hasOwnProperty.call(editorialTopicFilters, topic)
      ? editorialTopicFilters[topic as EditorialTopicSlug]
      : undefined;
  const activeCategory = activeTopic
    ? categories.find((category) => category.slug === activeTopic.categorySlug)
    : undefined;
  const visibleArticles = activeCategory
    ? articles.filter((article) => article.categoryId === activeCategory.id)
    : articles;

  return (
    <PageShell
      width="default"
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Guías", href: routes.guides },
      ]}
    >
      <PageHeader
        eyebrow="Contenido editorial"
        title="Guías para leer el cielo con calma"
        description="Ensayos, artículos y prácticas para explorar astrología, tarot y ciclos lunares con una mirada contemporánea."
      />

      <nav aria-label="Explorar por tema" className="mb-10">
        <ul className="flex flex-wrap gap-2" role="list">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                to={categoryRoute(c.slug) as string}
                className="inline-flex items-center rounded-full border border-line bg-warm-white px-4 py-2 font-body text-[13px] font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {activeTopic ? (
        <div
          className="mb-8 flex flex-col gap-3 rounded-[var(--radius-card)] border border-brand/20 bg-brand-soft/30 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <p className="font-body text-sm text-ink">
            Mostrando guías relacionadas con <strong>{activeTopic.label}</strong>.
          </p>
          <a
            href={routes.guides}
            className="font-body text-sm font-semibold text-brand underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Ver todas las guías
          </a>
        </div>
      ) : null}

      {visibleArticles.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-6 font-body text-ink-soft">
          {unavailable
            ? "Las guías no están disponibles en este momento. Intenta volver a cargar la página en unos minutos."
            : activeTopic
              ? "No encontramos una guía publicada para este tema todavía. Explora otra categoría para continuar."
              : "Todavía no hay artículos publicados. Vuelve pronto."}
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {visibleArticles.map((a) => (
            <li key={a.id}>
              <EditorialCard article={a} category={byId.get(a.categoryId)} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
