/**
 * YAML 12 — Normalización básica de consultas del cliente.
 * La normalización profunda (unaccent/lower) ocurre en la RPC.
 */
import { SEARCH_LIMITS } from "@/config/search";

export function normalizeSearchQuery(input: string): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ").slice(0, SEARCH_LIMITS.maxQueryLength);
}

/** Normalización local para comparaciones estáticas (sin tildes, minúsculas). */
export function normalizeForStaticMatch(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export function isQueryLongEnough(query: string): boolean {
  return normalizeSearchQuery(query).length >= SEARCH_LIMITS.minQueryLength;
}
