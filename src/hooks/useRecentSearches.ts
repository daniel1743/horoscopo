/**
 * YAML 12 — Búsquedas recientes en localStorage.
 * Nunca se sincroniza con Supabase ni se asocia a user_id.
 * Nunca guarda consultas sensibles.
 */
import { useCallback, useEffect, useState } from "react";
import { SEARCH_LIMITS, SEARCH_STORAGE_KEYS } from "@/config/search";
import { isSensitiveQuery } from "@/lib/search/sensitive-query";
import { normalizeSearchQuery } from "@/lib/search/normalize-search-query";

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEARCH_STORAGE_KEYS.recent);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === "string")
      .slice(0, SEARCH_LIMITS.recentMax);
  } catch {
    return [];
  }
}

function writeStorage(list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEARCH_STORAGE_KEYS.recent, JSON.stringify(list));
  } catch {
    /* localStorage puede fallar en modo privado; ignorar */
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readStorage());
  }, []);

  const push = useCallback((rawQuery: string) => {
    const q = normalizeSearchQuery(rawQuery).slice(0, SEARCH_LIMITS.recentMaxQueryLength);
    if (q.length < SEARCH_LIMITS.minQueryLength) return;
    if (isSensitiveQuery(q)) return;
    setRecent((prev) => {
      const next = [q, ...prev.filter((v) => v.toLowerCase() !== q.toLowerCase())].slice(
        0,
        SEARCH_LIMITS.recentMax,
      );
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((q: string) => {
    setRecent((prev) => {
      const next = prev.filter((v) => v !== q);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    writeStorage([]);
  }, []);

  return { recent, push, remove, clear };
}
