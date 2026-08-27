/**
 * YAML 12 — /buscar
 * - Página de resultados. noindex,follow. Canonical /buscar sin parámetros.
 * - Estado en URL (q, tipo, pagina). Debounce en input libre.
 */
import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { searchService } from "@/services/search.service";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import {
  SEARCH_COPY,
  SEARCH_FILTER_OPTIONS,
  SEARCH_LIMITS,
  SEARCH_QUERY_PARAMS,
  SEARCH_TYPE_LABELS,
} from "@/config/search";
import { normalizeSearchQuery } from "@/lib/search/normalize-search-query";
import type { SearchResult, SearchSourceType } from "@/types/search";
import { STATIC_SEARCH_DOCUMENTS } from "@/config/search-static-content";
import { routes } from "@/config/routes";

const searchSchema = z.object({
  [SEARCH_QUERY_PARAMS.query]: fallback(z.string(), "").default(""),
  [SEARCH_QUERY_PARAMS.type]: fallback(z.string(), "all").default("all"),
  [SEARCH_QUERY_PARAMS.page]: fallback(z.number().int(), 1).default(1),
});

export const Route = createFileRoute("/buscar")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Buscar — Creovision" },
      {
        name: "description",
        content: "Encuentra guías, signos, cartas, horóscopos, fases lunares y compatibilidades.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Buscar — Creovision" },
      { property: "og:description", content: "Buscador unificado de la plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/buscar" }],
  }),
  component: SearchRoute,
});

function useDebounced<T>(value: T, delay: number): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return v;
}

function SearchRoute() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const rawQ = search.q;
  const rawType = search.tipo;
  const rawPage = search.pagina;

  const q = normalizeSearchQuery(rawQ ?? "");
  const type = (SEARCH_FILTER_OPTIONS.some((o) => o.key === rawType) ? rawType : "all") as
    "all" | SearchSourceType;
  const page = Math.max(1, Math.min(Number(rawPage) || 1, SEARCH_LIMITS.maxPage));

  const [inputValue, setInputValue] = React.useState(rawQ ?? "");
  React.useEffect(() => setInputValue(rawQ ?? ""), [rawQ]);
  const debounced = useDebounced(inputValue, SEARCH_LIMITS.debounceMs);

  // sync debounced -> URL
  React.useEffect(() => {
    const clean = normalizeSearchQuery(debounced);
    if (clean === q) return;
    navigate({
      search: (prev) => ({
        ...prev,
        [SEARCH_QUERY_PARAMS.query]: clean,
        [SEARCH_QUERY_PARAMS.page]: 1,
      }),
      replace: true,
    });
  }, [debounced, navigate, q]);

  const { recent, push, clear, remove } = useRecentSearches();
  React.useEffect(() => {
    if (q.length >= SEARCH_LIMITS.minQueryLength) push(q);
  }, [q, push]);

  const filters = type === "all" ? undefined : { sourceTypes: [type] as SearchSourceType[] };

  const enabled = q.length >= SEARCH_LIMITS.minQueryLength;

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["search-all", q, type, page],
    queryFn: ({ signal }) =>
      searchService.searchAll({
        query: q,
        filters,
        page,
        pageSize: SEARCH_LIMITS.pageSize,
        signal,
      }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const results = React.useMemo<SearchResult[]>(() => data?.results ?? [], [data?.results]);
  const groups = React.useMemo(() => searchService.groupResults(results), [results]);

  const setType = (next: "all" | SearchSourceType) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [SEARCH_QUERY_PARAMS.type]: next,
        [SEARCH_QUERY_PARAMS.page]: 1,
      }),
      replace: true,
    });
  };

  return (
    <Container>
      <SectionHeading
        eyebrow={SEARCH_COPY.headingEyebrow}
        title={SEARCH_COPY.headingTitle}
        description={SEARCH_COPY.headingDescription}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const clean = normalizeSearchQuery(inputValue);
          navigate({
            search: (prev) => ({
              ...prev,
              [SEARCH_QUERY_PARAMS.query]: clean,
              [SEARCH_QUERY_PARAMS.page]: 1,
            }),
          });
        }}
        role="search"
        aria-label={SEARCH_COPY.inputLabel}
        className="mx-auto mt-6 max-w-2xl"
      >
        <SearchInput
          value={inputValue}
          onValueChange={setInputValue}
          onClear={() =>
            navigate({
              search: (prev) => ({
                ...prev,
                [SEARCH_QUERY_PARAMS.query]: "",
                [SEARCH_QUERY_PARAMS.page]: 1,
              }),
              replace: true,
            })
          }
          size="lg"
          autoFocus
        />
      </form>

      <nav
        aria-label="Filtros"
        className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2"
      >
        {SEARCH_FILTER_OPTIONS.map((opt) => {
          const active = opt.key === type;
          return (
            <button
              key={opt.key}
              type="button"
              aria-pressed={active}
              onClick={() => setType(opt.key)}
              className={[
                "rounded-full border px-4 py-1.5 text-sm transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </nav>

      <div className="mx-auto mt-10 max-w-4xl">
        {!enabled && (
          <DiscoveryState recent={recent} onClearRecent={clear} onRemoveRecent={remove} />
        )}

        {enabled && isError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">{SEARCH_COPY.errorMessage}</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-3">
              {SEARCH_COPY.retry}
            </Button>
          </div>
        )}

        {enabled && !isError && (
          <>
            <div className="mb-4 flex items-baseline justify-between px-1">
              <h2 className="font-serif text-xl text-foreground">
                {isFetching ? SEARCH_COPY.loadingLabel : SEARCH_COPY.resultsTitle(q)}
              </h2>
              <span className="text-xs text-muted-foreground">
                {data?.totalEstimate ?? 0} resultados
              </span>
            </div>

            {results.length === 0 && !isFetching ? (
              <div className="rounded-2xl border border-border/60 bg-card/60 p-10 text-center">
                <p className="text-base text-muted-foreground">{SEARCH_COPY.emptyTitle(q)}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {groups.map((g) => (
                  <section key={g.sourceType} aria-labelledby={`group-${g.sourceType}`}>
                    <h3
                      id={`group-${g.sourceType}`}
                      className="mb-3 flex items-center gap-2 px-1 text-sm font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {SEARCH_TYPE_LABELS[g.sourceType]}
                      <span className="text-xs opacity-70">({g.results.length})</span>
                    </h3>
                    <ul className="space-y-2">
                      {g.results.map((r) => (
                        <li key={`${r.sourceType}:${r.sourceId}`}>
                          <SearchResultCard result={r} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            {(data?.results?.length ?? 0) >= SEARCH_LIMITS.pageSize &&
              page < SEARCH_LIMITS.maxPage && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  {page > 1 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            [SEARCH_QUERY_PARAMS.page]: page - 1,
                          }),
                        })
                      }
                    >
                      Anterior
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate({
                        search: (prev) => ({ ...prev, [SEARCH_QUERY_PARAMS.page]: page + 1 }),
                      })
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              )}
          </>
        )}
      </div>
    </Container>
  );
}

function DiscoveryState({
  recent,
  onClearRecent,
  onRemoveRecent,
}: {
  recent: string[];
  onClearRecent: () => void;
  onRemoveRecent: (q: string) => void;
}) {
  const zodiac = STATIC_SEARCH_DOCUMENTS.filter((d) => d.sourceType === "zodiac_sign").slice(0, 12);
  const tools = STATIC_SEARCH_DOCUMENTS.filter((d) => d.sourceType === "static_page").slice(0, 8);
  return (
    <div className="space-y-10">
      {recent.length > 0 && (
        <section aria-labelledby="recent-title">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3
              id="recent-title"
              className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
            >
              {SEARCH_COPY.recentTitle}
            </h3>
            <button
              type="button"
              onClick={onClearRecent}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {SEARCH_COPY.recentClear}
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <li
                key={r}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-sm"
              >
                <Link
                  to={routes.search}
                  search={{ q: r, tipo: "all", pagina: 1 }}
                  className="inline-flex items-center gap-1"
                >
                  <Icon name="history" size="sm" decorative />
                  <span>{r}</span>
                </Link>
                <button
                  type="button"
                  aria-label={`${SEARCH_COPY.clearLabel}: ${r}`}
                  onClick={() => onRemoveRecent(r)}
                  className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted"
                >
                  <Icon name="close" size="sm" decorative />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="signs-title">
        <h3
          id="signs-title"
          className="mb-3 px-1 text-sm font-medium uppercase tracking-wider text-muted-foreground"
        >
          {SEARCH_COPY.discoverSigns}
        </h3>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {zodiac.map((z) => (
            <li key={z.id}>
              <Link
                to={z.routePath}
                className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2 text-sm hover:border-primary/50"
              >
                <Icon name="sun" size="sm" decorative />
                {z.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tools-title">
        <h3
          id="tools-title"
          className="mb-3 px-1 text-sm font-medium uppercase tracking-wider text-muted-foreground"
        >
          {SEARCH_COPY.discoverTools}
        </h3>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {tools.map((t) => (
            <li key={t.id}>
              <Link
                to={t.routePath}
                className="block rounded-2xl border border-border/60 bg-card px-4 py-3 hover:border-primary/50"
              >
                <span className="block font-medium">{t.title}</span>
                {t.description && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {t.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
