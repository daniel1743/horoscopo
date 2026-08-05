/**
 * YAML 12 — Configuración central del buscador.
 * Labels, tipos permitidos, límites, filtros. Fuente única.
 */
import type { SearchSourceType } from "@/types/search";
import type { IconName } from "./icons";
import { isPublicFeatureEnabled } from "./public-features";

export const SEARCH_LIMITS = {
  minQueryLength: 2,
  maxQueryLength: 160,
  suggestionsMaxQueryLength: 100,
  defaultLimit: 20,
  maxLimit: 30,
  suggestionsDefaultLimit: 8,
  suggestionsMaxLimit: 10,
  pageSize: 20,
  maxPage: 50,
  maxOffset: 500,
  debounceMs: 220,
  serverTimeoutMs: 4000,
  recentMax: 8,
  recentMaxQueryLength: 100,
} as const;

export const SEARCH_TYPE_LABELS: Record<SearchSourceType, string> = {
  article: "Guía",
  author: "Autor",
  category: "Tema",
  horoscope: "Horóscopo",
  tarot_card: "Carta de tarot",
  moon_phase: "Fase lunar",
  compatibility: "Compatibilidad",
  zodiac_sign: "Signo",
  static_page: "Sección",
};

export const SEARCH_TYPE_ICONS: Record<SearchSourceType, IconName> = {
  article: "article",
  author: "user",
  category: "article",
  horoscope: "sun",
  tarot_card: "tarot",
  moon_phase: "moon",
  compatibility: "compatibility",
  zodiac_sign: "sun",
  static_page: "menu",
};

/** Filtros expuestos en /buscar (mapean a source_types del RPC). */
export interface SearchFilterOption {
  key: "all" | SearchSourceType;
  label: string;
}

export const SEARCH_FILTER_OPTIONS: readonly SearchFilterOption[] = [
  { key: "all", label: "Todo" },
  { key: "article", label: "Guías" },
  { key: "tarot_card", label: "Tarot" },
  { key: "moon_phase", label: "Luna" },
  ...(isPublicFeatureEnabled("horoscope")
    ? ([{ key: "horoscope", label: "Horóscopos" }] as const)
    : []),
  ...(isPublicFeatureEnabled("compatibility")
    ? ([{ key: "compatibility", label: "Compatibilidad" }] as const)
    : []),
  ...(isPublicFeatureEnabled("astrology")
    ? ([{ key: "zodiac_sign", label: "Signos" }] as const)
    : []),
] satisfies readonly SearchFilterOption[];

/** Tipos indexables desde Supabase (excluye estáticos). */
export const INDEXABLE_SOURCE_TYPES: readonly Exclude<
  SearchSourceType,
  "zodiac_sign" | "static_page"
>[] = [
  "article",
  "author",
  "category",
  "horoscope",
  "tarot_card",
  "moon_phase",
  "compatibility",
] as const;

/** Query params de /buscar. */
export const SEARCH_QUERY_PARAMS = {
  query: "q",
  type: "tipo",
  page: "pagina",
} as const;

export const SEARCH_STORAGE_KEYS = {
  recent: "recent-site-searches",
} as const;

export const SEARCH_COPY = {
  triggerLabel: "Buscar",
  triggerShortcut: "Ctrl/⌘ K",
  inputLabel: "Buscar en la plataforma",
  inputPlaceholder: "Guías, cartas, fases lunares...",
  clearLabel: "Borrar búsqueda",
  submitLabel: "Buscar",
  recentTitle: "Búsquedas recientes",
  recentClear: "Borrar historial",
  suggestionsTitle: "Coincidencias",
  quickTitle: "Accesos rápidos",
  discoverTopics: "Explora temas",
  discoverSigns: "Signos zodiacales",
  discoverTools: "Herramientas populares",
  discoverGuides: "Guías destacadas",
  emptyTitle: (q: string) => `No encontramos resultados para “${q}”`,
  resultsTitle: (q: string) => `Resultados para “${q}”`,
  errorMessage: "No pudimos completar la búsqueda.",
  retry: "Reintentar",
  loadingLabel: "Buscando…",
  seePrefix: "Ver todos en",
  headingEyebrow: "Explorar",
  headingTitle: "Busca en toda la plataforma",
  headingDescription: "Encuentra guías, cartas de tarot y fases lunares desde un solo lugar.",
} as const;
