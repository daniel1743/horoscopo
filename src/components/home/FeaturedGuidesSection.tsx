import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { homeConfig } from "@/config/home";
import { routes } from "@/config/routes";
import {
  listCategoriesResilient,
  listPublishedArticlesResilient,
} from "@/lib/editorial/resilient-repository";

/** Guías destacadas: fusiona artículos publicados remotos con el catálogo local resiliente. */
export function FeaturedGuidesSection() {
  const { featuredGuides: cfg } = homeConfig;

  const { data } = useQuery({
    queryKey: ["home", "featured-guides", cfg.maxItems],
    queryFn: async () => {
      const [articles, categories] = await Promise.all([
        listPublishedArticlesResilient({ limit: cfg.maxItems }),
        listCategoriesResilient(),
      ]);
      return { articles, categories };
    },
    staleTime: 5 * 60 * 1000,
  });

  const articles = data?.articles ?? [];
  const byId = new Map((data?.categories ?? []).map((c) => [c.id, c]));

  return (
    <Section tone="ivory" aria-labelledby="guides-title">
      <Container>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={cfg.eyebrow}
            title={cfg.title}
            description={cfg.description}
            className="mb-0"
          />
          <div className="hidden md:block">
            <Button asChild variant="secondary">
              <Link to={routes[cfg.action.routeKey!]}>{cfg.action.label}</Link>
            </Button>
          </div>
        </div>
        <h2 id="guides-title" className="sr-only">
          {cfg.title}
        </h2>

        {articles.length === 0 ? (
          <p className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line bg-warm-white p-6 font-body text-ink-soft">
            Estamos preparando nuestros primeros artículos. Vuelve pronto.
          </p>
        ) : (
          <>
            {/* Móvil */}
            <ul
              className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
              role="list"
            >
              {articles.map((a) => (
                <li
                  key={a.id}
                  className="snap-start shrink-0"
                  style={{ width: "82vw", maxWidth: 320 }}
                >
                  <EditorialCard article={a} category={byId.get(a.categoryId)} />
                </li>
              ))}
            </ul>

            {/* Tablet/Desktop */}
            <ul className="mt-10 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4" role="list">
              {articles.map((a) => (
                <li key={a.id}>
                  <EditorialCard article={a} category={byId.get(a.categoryId)} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-8 md:hidden">
          <Button asChild variant="secondary" fullWidth>
            <Link to={routes[cfg.action.routeKey!]}>{cfg.action.label}</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
