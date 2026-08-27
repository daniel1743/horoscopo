import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { categoryRoute, routes } from "@/config/routes";
import { listCategoriesResilient } from "@/lib/editorial/resilient-repository";

export function TopicsPage() {
  const query = useQuery({
    queryKey: ["editorial", "categories"],
    queryFn: listCategoriesResilient,
    staleTime: 1000 * 60 * 10,
  });
  return (
    <PageShell breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Temas" }]}>
      <PageHeader
        eyebrow="Biblioteca editorial"
        title="Temas para explorar con calma"
        description="Guías y artículos de Tarot, astrología, Luna y reflexión para acompañar tus consultas con contexto y lenguaje claro."
      />
      {query.isLoading ? (
        <p className="mt-8 text-sm text-ink-soft">Cargando temas…</p>
      ) : query.isError ? (
        <p role="alert" className="mt-8 text-sm text-ink-soft">
          No pudimos cargar los temas en este momento.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(query.data ?? []).map((category) => (
            <li key={category.id}>
              <Link
                to={categoryRoute(category.slug) as never}
                className="group block h-full rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 transition-colors hover:border-cosmic/45"
              >
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-cosmic">
                  Tema editorial
                </p>
                <h2 className="mt-2 font-display text-[22px] text-ink group-hover:text-cosmic">
                  {category.label}
                </h2>
                {category.description && (
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{category.description}</p>
                )}
                <span className="mt-5 inline-flex text-sm font-medium text-cosmic">
                  Explorar tema →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
