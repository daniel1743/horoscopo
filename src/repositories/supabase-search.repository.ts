/**
 * YAML 12 — Implementación del repositorio contra Supabase.
 * Solo llama a las funciones RPC search_site / search_suggest.
 * NUNCA solicita searchable_text.
 */
import { supabase } from "@/integrations/supabase/client";
import type { SearchRepository } from "./search.repository";
import { mapRpcRowToResult, mapSuggestRow } from "@/lib/search/search-mappers";
import { SEARCH_LIMITS } from "@/config/search";
import { normalizeSearchQuery } from "@/lib/search/normalize-search-query";
import type { SearchResult, SearchSuggestion } from "@/types/search";

export const supabaseSearchRepository: SearchRepository = {
  async search({ query, filters, limit, offset }) {
    const q = normalizeSearchQuery(query);
    if (q.length < SEARCH_LIMITS.minQueryLength) return [];
    const { data, error } = await supabase.rpc("search_site", {
      p_query: q,
      p_source_types:
        filters?.sourceTypes && filters.sourceTypes.length > 0
          ? (filters.sourceTypes as string[])
          : undefined,
      p_limit: Math.min(limit ?? SEARCH_LIMITS.defaultLimit, SEARCH_LIMITS.maxLimit),
      p_offset: Math.min(Math.max(offset ?? 0, 0), SEARCH_LIMITS.maxOffset),
    });
    if (error) throw new Error("search_failed");
    const rows = (data ?? []) as unknown as Parameters<typeof mapRpcRowToResult>[0][];
    const out: SearchResult[] = [];
    for (const r of rows) {
      const m = mapRpcRowToResult(r);
      if (m) out.push(m);
    }
    return out;
  },

  async suggest({ query, limit }) {
    const q = normalizeSearchQuery(query).slice(0, SEARCH_LIMITS.suggestionsMaxQueryLength);
    if (q.length < SEARCH_LIMITS.minQueryLength) return [];
    const { data, error } = await supabase.rpc("search_suggest", {
      p_query: q,
      p_limit: Math.min(
        limit ?? SEARCH_LIMITS.suggestionsDefaultLimit,
        SEARCH_LIMITS.suggestionsMaxLimit,
      ),
    });
    if (error) throw new Error("suggest_failed");
    const rows = (data ?? []) as unknown as Parameters<typeof mapSuggestRow>[0][];
    const out: SearchSuggestion[] = [];
    for (const r of rows) {
      const m = mapSuggestRow(r);
      if (m) out.push(m);
    }
    return out;
  },
};
