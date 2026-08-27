/**
 * YAML 12 — Contrato de repositorio de búsqueda.
 */
import type { SearchFilters, SearchResult, SearchSuggestion } from "@/types/search";

export interface SearchRepository {
  search(input: {
    query: string;
    filters?: SearchFilters;
    limit?: number;
    offset?: number;
    signal?: AbortSignal;
  }): Promise<SearchResult[]>;

  suggest(input: {
    query: string;
    limit?: number;
    signal?: AbortSignal;
  }): Promise<SearchSuggestion[]>;
}
