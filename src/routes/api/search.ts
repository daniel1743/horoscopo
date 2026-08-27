/**
 * YAML 12 — Endpoint HTTP público de búsqueda.
 * GET /api/search?q=...&tipo=...&pagina=1&limit=20
 * - noindex; no loguea la consulta; parametrizado.
 */
import { createFileRoute } from "@tanstack/react-router";
import { searchService } from "@/services/search.service";
import { SEARCH_LIMITS } from "@/config/search";
import type { SearchSourceType } from "@/types/search";

const ALLOWED_TYPES: SearchSourceType[] = [
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

function parseTypes(value: string | null): SearchSourceType[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter((v): v is SearchSourceType => (ALLOWED_TYPES as string[]).includes(v));
  return parts.length ? parts : undefined;
}

function json(status: number, body: unknown, cacheSeconds: number | null = 60) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "X-Robots-Tag": "noindex, follow",
  };
  if (cacheSeconds !== null) {
    headers["Cache-Control"] =
      `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=60`;
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").slice(0, SEARCH_LIMITS.maxQueryLength);
        if (!q || q.trim().length < SEARCH_LIMITS.minQueryLength) {
          return json(200, { query: q, results: [], totalEstimate: 0, filters: {} });
        }
        const types = parseTypes(url.searchParams.get("tipo"));
        const page = Math.max(
          1,
          Math.min(Number(url.searchParams.get("pagina") ?? "1") || 1, SEARCH_LIMITS.maxPage),
        );
        const pageSize = Math.min(
          Number(url.searchParams.get("limit") ?? SEARCH_LIMITS.pageSize) || SEARCH_LIMITS.pageSize,
          SEARCH_LIMITS.maxLimit,
        );

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), SEARCH_LIMITS.serverTimeoutMs);
          const response = await searchService.searchAll({
            query: q,
            filters: types ? { sourceTypes: types } : undefined,
            page,
            pageSize,
            signal: controller.signal,
          });
          clearTimeout(timer);
          return json(200, response, 60);
        } catch {
          return json(502, { error: { code: "search_failed", message: "search_failed" } }, null);
        }
      },
    },
  },
});
