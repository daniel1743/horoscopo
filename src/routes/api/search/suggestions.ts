/**
 * YAML 12 — Endpoint de sugerencias.
 * GET /api/search/suggestions?q=...&limit=8
 */
import { createFileRoute } from "@tanstack/react-router";
import { searchService } from "@/services/search.service";
import { SEARCH_LIMITS } from "@/config/search";

function json(status: number, body: unknown, cacheSeconds: number | null = 120) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "X-Robots-Tag": "noindex, follow",
  };
  if (cacheSeconds !== null) {
    headers["Cache-Control"] = `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=60`;
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export const Route = createFileRoute("/api/search/suggestions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").slice(0, SEARCH_LIMITS.suggestionsMaxQueryLength);
        if (!q || q.trim().length < SEARCH_LIMITS.minQueryLength) {
          return json(200, { query: q, suggestions: [] });
        }
        try {
          const suggestions = await searchService.getSuggestions({ query: q });
          return json(200, { query: q, suggestions }, 120);
        } catch {
          return json(200, { query: q, suggestions: [] }, null);
        }
      },
    },
  },
});
