# YAML 12 — Buscador y descubrimiento

## Resumen
Buscador unificado sobre PostgreSQL FTS (unaccent + pg_trgm) con tabla derivada `search_documents`. Estáticos (signos, secciones) desde registry local. Sin persistir consultas en Supabase; historial local únicamente.

## Arquitectura
- **DB (fuente derivada):** `search_documents` + trigger `trg_search_documents_refresh_vector` + RPC `search_site`/`search_suggest`. Fuentes de verdad siguen siendo `editorial_articles`, `horoscopes`, `tarot_cards`, `moon_phase_content`, `compatibility_profiles`, `editorial_authors`, `editorial_categories`.
- **Server-only indexer:** `src/server/search/search-source-registry.ts` + `search-index.service.ts`. Nunca importar desde el cliente.
- **Repos/servicios:** `src/repositories/supabase-search.repository.ts` → `src/services/search.service.ts`. La IA reutiliza este servicio.
- **API HTTP:** `/api/search` (resultados) y `/api/search/suggestions` — ambos con `X-Robots-Tag: noindex, follow`. No loguean consulta.
- **UI:** `SearchInput`, `SearchResultCard`, `SearchDialog` (desktop, ⌘K), `SearchTrigger` (elige diálogo o navegación según viewport), página `/buscar` (móvil + resultados canónicos).
- **Historial:** `useRecentSearches` en localStorage, con `isSensitiveQuery` filtrando.

## SEO
- `/buscar` declara `<meta robots="noindex, follow">` y `<link rel="canonical" href="/buscar">` sin query params. Los parámetros `q`, `tipo`, `pagina` viven en URL pero no forman canonical.

## Privacidad
- No se envía `q` a analítica, logs ni tablas.
- Historial solo local; nunca se sincroniza.
- Consultas sensibles no se guardan.

## Validación
- Lint + typecheck pasan.
- Estado de búsqueda en URL con Zod (`fallback` sin `min`/`max`; clamp en componente).
- Diálogo cierra síncronamente al navegar (`onOpenChange(false)` antes de `navigate`).

## Setup externo
Ver `SEARCH_SYSTEM_SETUP.md` (migración, RPC, sincronización periódica).
