/**
 * YAML 12 — Utilidades de fusión de resultados dinámicos + estáticos.
 * Toda la relevancia de contenido dinámico proviene del RPC.
 */
import type { SearchResult, SearchStaticDocument, SearchSourceType } from "@/types/search";
import { normalizeForStaticMatch } from "./normalize-search-query";

export interface RankedStaticMatch {
  doc: SearchStaticDocument;
  rank: number;
  matchType: "exact" | "title" | "approximate";
}

/** Ranking simple para el registro estático (sin Fuse.js). */
export function rankStaticDocuments(
  docs: readonly SearchStaticDocument[],
  query: string,
): RankedStaticMatch[] {
  const q = normalizeForStaticMatch(query);
  if (q.length < 2) return [];
  const results: RankedStaticMatch[] = [];
  for (const doc of docs) {
    const title = normalizeForStaticMatch(doc.title);
    const desc = normalizeForStaticMatch(doc.description);
    const kw = doc.keywords.map(normalizeForStaticMatch);
    let rank = 0;
    let matchType: RankedStaticMatch["matchType"] = "approximate";
    if (title === q) {
      rank = 1.0;
      matchType = "exact";
    } else if (title.startsWith(q) || kw.some((k) => k === q)) {
      rank = 0.85;
      matchType = "title";
    } else if (title.includes(q) || kw.some((k) => k.startsWith(q)) || desc.includes(q)) {
      rank = 0.55;
      matchType = "approximate";
    } else if (kw.some((k) => k.includes(q))) {
      rank = 0.4;
      matchType = "approximate";
    }
    if (rank > 0) results.push({ doc, rank, matchType });
  }
  return results.sort((a, b) => b.rank - a.rank);
}

/** Convierte matches estáticos en SearchResult y mezcla con dinámicos, eliminando duplicados por route. */
export function mergeStaticAndDynamic(
  dynamic: readonly SearchResult[],
  staticMatches: readonly RankedStaticMatch[],
): SearchResult[] {
  const seenRoutes = new Set<string>();
  const out: SearchResult[] = [];
  for (const r of dynamic) {
    if (seenRoutes.has(r.routePath)) continue;
    seenRoutes.add(r.routePath);
    out.push(r);
  }
  for (const s of staticMatches) {
    if (seenRoutes.has(s.doc.routePath)) continue;
    seenRoutes.add(s.doc.routePath);
    out.push({
      sourceType: s.doc.sourceType,
      sourceId: s.doc.id,
      title: s.doc.title,
      excerpt: s.doc.description,
      routePath: s.doc.routePath,
      imageKey: s.doc.imageKey ?? null,
      metadata: s.doc.metadata,
      sourcePublishedAt: null,
      rank: s.rank,
      matchType: s.matchType,
    });
  }
  return out.sort((a, b) => b.rank - a.rank);
}

export function groupResultsByType(
  results: readonly SearchResult[],
): Array<{ sourceType: SearchSourceType; results: SearchResult[] }> {
  const map = new Map<SearchSourceType, SearchResult[]>();
  for (const r of results) {
    const list = map.get(r.sourceType) ?? [];
    list.push(r);
    map.set(r.sourceType, list);
  }
  return Array.from(map.entries()).map(([sourceType, results]) => ({ sourceType, results }));
}
