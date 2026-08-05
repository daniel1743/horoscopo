/**
 * YAML 12 — Servicio único de búsqueda.
 * Combina resultados dinámicos (Supabase) + estáticos (registry) y agrupa.
 * La IA reutiliza este servicio; no crear un segundo buscador.
 */
import { supabaseSearchRepository } from "@/repositories/supabase-search.repository";
import { STATIC_SEARCH_DOCUMENTS } from "@/config/search-static-content";
import {
  groupResultsByType,
  mergeStaticAndDynamic,
  rankStaticDocuments,
} from "@/lib/search/search-ranking";
import { normalizeSearchQuery } from "@/lib/search/normalize-search-query";
import { SEARCH_LIMITS, SEARCH_TYPE_LABELS } from "@/config/search";
import { isPublicFeatureEnabled } from "@/config/public-features";
import type {
  SearchFilters,
  SearchResponse,
  SearchResult,
  SearchResultGroup,
  SearchSourceType,
  SearchSuggestion,
} from "@/types/search";

const PUBLIC_SEARCH_SOURCE_TYPES = new Set<SearchSourceType>([
  "article",
  "author",
  "category",
  "tarot_card",
  "moon_phase",
  "static_page",
  ...(isPublicFeatureEnabled("horoscope") ? (["horoscope"] as const) : []),
  ...(isPublicFeatureEnabled("compatibility") ? (["compatibility"] as const) : []),
  ...(isPublicFeatureEnabled("astrology") ? (["zodiac_sign"] as const) : []),
]);

function filterPublicResults<T extends { sourceType: SearchSourceType }>(items: readonly T[]): T[] {
  return items.filter((item) => PUBLIC_SEARCH_SOURCE_TYPES.has(item.sourceType));
}

export interface SearchServiceInput {
  query: string;
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

async function searchAll(input: SearchServiceInput): Promise<SearchResponse> {
  const query = normalizeSearchQuery(input.query);
  const filters = input.filters ?? {};
  if (query.length < SEARCH_LIMITS.minQueryLength) {
    return { query, results: [], totalEstimate: 0, filters };
  }
  const pageSize = Math.min(input.pageSize ?? SEARCH_LIMITS.pageSize, SEARCH_LIMITS.maxLimit);
  const page = Math.max(1, Math.min(input.page ?? 1, SEARCH_LIMITS.maxPage));
  const offset = (page - 1) * pageSize;

  const safeSourceTypes = filters.sourceTypes?.filter((type) =>
    PUBLIC_SEARCH_SOURCE_TYPES.has(type),
  );
  if (
    filters.sourceTypes &&
    filters.sourceTypes.length > 0 &&
    (!safeSourceTypes || safeSourceTypes.length === 0)
  ) {
    return { query, results: [], totalEstimate: 0, filters: { ...filters, sourceTypes: [] } };
  }

  const safeFilters: SearchFilters = {
    ...filters,
    sourceTypes: safeSourceTypes && safeSourceTypes.length > 0 ? safeSourceTypes : undefined,
  };

  const dynamic = filterPublicResults(
    await supabaseSearchRepository.search({
      query,
      filters: safeFilters,
      limit: pageSize,
      offset,
      signal: input.signal,
    }),
  );

  // Estáticos solo en la primera página y respetando filtro.
  const wantsStatic =
    page === 1 &&
    (!safeFilters.sourceTypes ||
      safeFilters.sourceTypes.length === 0 ||
      safeFilters.sourceTypes?.some((t) => t === "zodiac_sign" || t === "static_page"));

  const staticDocs = wantsStatic
    ? STATIC_SEARCH_DOCUMENTS.filter((d) => {
        if (!safeFilters.sourceTypes || safeFilters.sourceTypes.length === 0) return true;
        return safeFilters.sourceTypes.includes(d.sourceType);
      })
    : [];
  const staticMatches = rankStaticDocuments(staticDocs, query);
  const merged = mergeStaticAndDynamic(dynamic, staticMatches);

  return {
    query,
    results: merged.slice(0, pageSize),
    totalEstimate: merged.length,
    filters: safeFilters,
  };
}

async function getSuggestions(input: {
  query: string;
  signal?: AbortSignal;
}): Promise<SearchSuggestion[]> {
  const q = normalizeSearchQuery(input.query);
  if (q.length < SEARCH_LIMITS.minQueryLength) return [];
  const dynamic = filterPublicResults(
    await supabaseSearchRepository.suggest({
      query: q,
      limit: SEARCH_LIMITS.suggestionsDefaultLimit,
      signal: input.signal,
    }),
  );
  const staticMatches = rankStaticDocuments(STATIC_SEARCH_DOCUMENTS, q).slice(0, 4);
  const staticSug: SearchSuggestion[] = staticMatches.map((s) => ({
    sourceType: s.doc.sourceType,
    title: s.doc.title,
    routePath: s.doc.routePath,
    matchType: s.matchType,
  }));
  const seen = new Set<string>();
  const combined = [...dynamic, ...staticSug]
    .filter((r) => {
      if (seen.has(r.routePath)) return false;
      seen.add(r.routePath);
      return true;
    })
    .slice(0, SEARCH_LIMITS.suggestionsDefaultLimit);
  return combined;
}

function groupResults(results: readonly SearchResult[]): SearchResultGroup[] {
  const groups = groupResultsByType(results);
  return groups.map((g) => ({
    sourceType: g.sourceType,
    label: SEARCH_TYPE_LABELS[g.sourceType],
    results: g.results,
    totalEstimate: g.results.length,
  }));
}

export const searchService = {
  searchAll,
  getSuggestions,
  groupResults,
};

export type SearchService = typeof searchService;
