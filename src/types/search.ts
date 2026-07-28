/**
 * YAML 12 — Tipos de dominio del buscador unificado.
 * Los componentes reciben SearchResult, no filas de Supabase.
 */

export type SearchSourceType =
  | "article"
  | "author"
  | "category"
  | "horoscope"
  | "tarot_card"
  | "moon_phase"
  | "compatibility"
  | "zodiac_sign"
  | "static_page";

export type SearchMatchType = "exact" | "title" | "full_text" | "approximate";

/** Metadatos discriminados por tipo. Nunca incluye datos privados. */
export type SearchMetadata =
  | ({ kind: "article" } & {
      slug: string;
      categoryKey?: string;
      authorName?: string;
      readingTime?: number;
      tags?: string[];
    })
  | ({ kind: "author" } & { slug: string; role?: string })
  | ({ kind: "category" } & { slug: string })
  | ({ kind: "horoscope" } & {
      signKey: string;
      periodType: "daily" | "weekly" | "monthly";
      periodStart?: string;
      periodEnd?: string;
    })
  | ({ kind: "tarot_card" } & { slug: string; arcana: string; number?: number; suit?: string })
  | ({ kind: "moon_phase" } & { phaseKey: string; slug: string })
  | ({ kind: "compatibility" } & { pairKey: string; signA: string; signB: string })
  | ({ kind: "zodiac_sign" } & { signKey: string; symbol?: string })
  | ({ kind: "static_page" } & { routeKey: string });

export interface SearchDocument {
  sourceType: SearchSourceType;
  sourceId: string;
  title: string;
  excerpt: string | null;
  routePath: string;
  imageKey: string | null;
  metadata: SearchMetadata;
  sourcePublishedAt: string | null;
}

export interface SearchResult extends SearchDocument {
  rank: number;
  matchType: SearchMatchType;
}

export interface SearchResultGroup {
  sourceType: SearchSourceType;
  label: string;
  results: SearchResult[];
  totalEstimate: number;
}

export interface SearchFilters {
  sourceTypes?: SearchSourceType[];
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalEstimate: number;
  filters: SearchFilters;
}

export interface SearchSuggestion {
  sourceType: SearchSourceType;
  title: string;
  routePath: string;
  matchType: SearchMatchType;
  imageKey?: string | null;
}

/** Documento estático local (no proviene de Supabase). */
export interface SearchStaticDocument {
  id: string;
  sourceType: Extract<SearchSourceType, "zodiac_sign" | "static_page">;
  title: string;
  description: string;
  keywords: string[];
  routePath: string;
  imageKey?: string;
  metadata: Extract<SearchMetadata, { kind: "zodiac_sign" | "static_page" }>;
}

/** Adaptador genérico para exponer filas de una fuente al índice. */
export interface SearchSourceAdapter<TRow = unknown> {
  sourceType: Extract<
    SearchSourceType,
    "article" | "author" | "category" | "horoscope" | "tarot_card" | "moon_phase" | "compatibility"
  >;
  fetchAll(client: unknown): Promise<TRow[]>;
  toDocument(row: TRow): SearchDocumentInput | null;
}

/** Forma persistida en `search_documents` (sin `id`; upsert por source_type+source_id). */
export interface SearchDocumentInput {
  sourceType: SearchSourceType;
  sourceId: string;
  title: string;
  excerpt: string | null;
  searchableText: string;
  keywords: string[];
  routePath: string;
  imageKey: string | null;
  metadata: SearchMetadata;
  language: string;
  isPublic: boolean;
  sourcePublishedAt: string | null;
  sourceUpdatedAt: string | null;
}
