/**
 * YAML 12 — Diálogo de búsqueda (desktop) + página completa (móvil).
 * Fuente única de estado, cierre síncrono al navegar, atajos ⌘K/ESC.
 */
import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchInput } from "./SearchInput";
import { SearchResultCard } from "./SearchResultCard";
import { Icon } from "@/components/ui/icon";
import { searchService } from "@/services/search.service";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { SEARCH_COPY, SEARCH_LIMITS, SEARCH_QUERY_PARAMS } from "@/config/search";
import { routes } from "@/config/routes";
import { normalizeSearchQuery } from "@/lib/search/normalize-search-query";
import type { SearchResult } from "@/types/search";

export interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useDebounced<T>(value: T, delay: number): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return v;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = React.useState("");
  const debounced = useDebounced(query, SEARCH_LIMITS.debounceMs);
  const navigate = useNavigate();
  const { recent, push, clear, remove } = useRecentSearches();

  const normalized = normalizeSearchQuery(debounced);
  const enabled = normalized.length >= SEARCH_LIMITS.minQueryLength;

  const { data, isFetching } = useQuery({
    queryKey: ["search-suggest", normalized],
    queryFn: ({ signal }) => searchService.getSuggestions({ query: normalized, signal }),
    enabled,
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const goToResults = React.useCallback(
    (q: string) => {
      const clean = normalizeSearchQuery(q);
      if (clean.length < SEARCH_LIMITS.minQueryLength) return;
      push(clean);
      onOpenChange(false);
      navigate({
        to: routes.search as never,
        search: {
          [SEARCH_QUERY_PARAMS.query]: clean,
          [SEARCH_QUERY_PARAMS.type]: "all",
          [SEARCH_QUERY_PARAMS.page]: 1,
        } as never,
      });
    },
    [navigate, onOpenChange, push],
  );

  const handleResultClick = React.useCallback(
    (result: SearchResult) => {
      push(normalized);
      onOpenChange(false);
      // navigation handled by <Link>; no async
      void result;
    },
    [normalized, onOpenChange, push],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[10%] max-w-2xl translate-y-0 gap-0 rounded-3xl p-0">
        <VisuallyHidden asChild>
          <DialogTitle>{SEARCH_COPY.inputLabel}</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden asChild>
          <DialogDescription>{SEARCH_COPY.inputPlaceholder}</DialogDescription>
        </VisuallyHidden>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToResults(query);
          }}
          className="border-b border-border/60 p-4"
        >
          <SearchInput value={query} onValueChange={setQuery} autoFocus size="lg" />
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!enabled && recent.length > 0 && (
            <section aria-labelledby="recent-title">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3
                  id="recent-title"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {SEARCH_COPY.recentTitle}
                </h3>
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  {SEARCH_COPY.recentClear}
                </button>
              </div>
              <ul className="space-y-1">
                {recent.map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToResults(r)}
                      className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted/50"
                    >
                      <Icon name="history" size="sm" decorative />
                      <span className="truncate">{r}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`${SEARCH_COPY.clearLabel}: ${r}`}
                      onClick={() => remove(r)}
                      className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                    >
                      <Icon name="close" size="sm" decorative />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!enabled && recent.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {SEARCH_COPY.inputPlaceholder}
            </p>
          )}

          {enabled && (
            <section aria-labelledby="sug-title">
              <h3
                id="sug-title"
                className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {isFetching ? SEARCH_COPY.loadingLabel : SEARCH_COPY.suggestionsTitle}
              </h3>
              {(data ?? []).length === 0 && !isFetching ? (
                <p className="p-4 text-sm text-muted-foreground">
                  {SEARCH_COPY.emptyTitle(normalized)}
                </p>
              ) : (
                <ul className="space-y-1">
                  {(data ?? []).map((s) => (
                    <li key={`${s.sourceType}-${s.routePath}`}>
                      <SearchResultCard
                        variant="row"
                        result={{
                          sourceType: s.sourceType,
                          sourceId: s.routePath,
                          title: s.title,
                          excerpt: null,
                          routePath: s.routePath,
                          imageKey: null,
                          metadata: { kind: "static_page", routeKey: s.routePath },
                          sourcePublishedAt: null,
                          rank: 0,
                          matchType: s.matchType,
                        }}
                        onNavigate={handleResultClick}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 border-t border-border/60 pt-3">
                <button
                  type="button"
                  onClick={() => goToResults(query)}
                  className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {SEARCH_COPY.seePrefix} “{normalized}”
                </button>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Hook para atajos ⌘K / Ctrl+K. */
export function useSearchDialogShortcut(setOpen: (v: boolean) => void) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);
}
