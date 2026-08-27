/**
 * YAML 12 — Mapeadores entre filas Supabase y tipos de dominio.
 * Los componentes consumen SearchResult, nunca filas crudas.
 */
import type {
  SearchDocument,
  SearchMatchType,
  SearchMetadata,
  SearchResult,
  SearchSourceType,
} from "@/types/search";

interface RpcSearchRow {
  source_type: string;
  source_id: string;
  title: string;
  excerpt: string | null;
  route_path: string;
  image_key: string | null;
  metadata: unknown;
  source_published_at: string | null;
  rank: number;
  match_type: string;
}

interface RpcSuggestRow {
  source_type: string;
  source_id: string;
  title: string;
  route_path: string;
  image_key: string | null;
  metadata: unknown;
  match_type: string;
}

const VALID_SOURCE_TYPES: readonly SearchSourceType[] = [
  "article",
  "author",
  "category",
  "horoscope",
  "tarot_card",
  "moon_phase",
  "compatibility",
  "zodiac_sign",
  "static_page",
];

const VALID_MATCH_TYPES: readonly SearchMatchType[] = [
  "exact",
  "title",
  "full_text",
  "approximate",
];

function coerceMetadata(raw: unknown, sourceType: SearchSourceType): SearchMetadata {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const kind =
    sourceType === "static_page" ? "static_page" : (sourceType as SearchMetadata["kind"]);
  return { kind, ...obj } as SearchMetadata;
}

function coerceSourceType(value: string): SearchSourceType | null {
  return (VALID_SOURCE_TYPES as readonly string[]).includes(value)
    ? (value as SearchSourceType)
    : null;
}

function coerceMatchType(value: string): SearchMatchType {
  return (VALID_MATCH_TYPES as readonly string[]).includes(value)
    ? (value as SearchMatchType)
    : "approximate";
}

function isValidRoute(path: string): boolean {
  return typeof path === "string" && path.startsWith("/") && path.length > 1;
}

export function mapRpcRowToResult(row: RpcSearchRow): SearchResult | null {
  const st = coerceSourceType(row.source_type);
  if (!st) return null;
  if (!isValidRoute(row.route_path)) return null;
  return {
    sourceType: st,
    sourceId: row.source_id,
    title: row.title,
    excerpt: row.excerpt,
    routePath: row.route_path,
    imageKey: row.image_key,
    metadata: coerceMetadata(row.metadata, st),
    sourcePublishedAt: row.source_published_at,
    rank: typeof row.rank === "number" ? row.rank : 0,
    matchType: coerceMatchType(row.match_type),
  };
}

export function mapRpcRowToDocument(row: RpcSearchRow): SearchDocument | null {
  const r = mapRpcRowToResult(row);
  if (!r) return null;
  const { rank: _rank, matchType: _mt, ...doc } = r;
  return doc;
}

export function mapSuggestRow(row: RpcSuggestRow): {
  sourceType: SearchSourceType;
  title: string;
  routePath: string;
  matchType: SearchMatchType;
  imageKey?: string | null;
} | null {
  const st = coerceSourceType(row.source_type);
  if (!st) return null;
  if (!isValidRoute(row.route_path)) return null;
  return {
    sourceType: st,
    title: row.title,
    routePath: row.route_path,
    matchType: coerceMatchType(row.match_type),
    imageKey: row.image_key,
  };
}
