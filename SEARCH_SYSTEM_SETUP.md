# SEARCH_SYSTEM_SETUP.md — Configuración del buscador fuera de Lovable

## 1. Extensiones y tabla
Aplica la migración que:
- Habilita `unaccent` y `pg_trgm` (schema `public` o `extensions`).
- Crea `immutable_unaccent(text)` (`IMMUTABLE`, `SET search_path`) para usarla en índices GIN.
- Crea `search_documents` con columnas: `source_type`, `source_id`, `title`, `excerpt`, `searchable_text`, `keywords[]`, `route_path`, `image_key`, `metadata jsonb`, `language`, `is_public`, `source_published_at`, `source_updated_at`, `indexed_at`, `search_vector tsvector`.
- Índices: `GIN(search_vector)`, `GIN(immutable_unaccent(title) gin_trgm_ops)`, `unique(source_type, source_id)`.

## 2. Trigger de vector
`trg_search_documents_refresh_vector` (BEFORE INSERT/UPDATE) construye `search_vector` con `setweight('A', title) || setweight('B', keywords) || setweight('C', searchable_text)` usando `to_tsvector('spanish', immutable_unaccent(...))`.

## 3. RPC
- `search_site(p_query text, p_source_types text[], p_limit int, p_offset int)` — usa `websearch_to_tsquery('spanish', immutable_unaccent(p_query))` con fallback a `plainto_tsquery` y combina `ts_rank_cd` + `similarity(title, query)`.
- `search_suggest(p_query text, p_limit int)` — versión ligera para autocompletar.

## 4. RLS
`search_documents` con `ENABLE ROW LEVEL SECURITY` y política `SELECT` para `anon` y `authenticated` cuando `is_public = true`. Escritura solo por `service_role`.

## 5. Sincronización
Ejecuta `syncAll(supabaseAdmin, { removeOrphans: true })` desde un job server-only (Vercel Cron, GitHub Action, etc.). Adaptadores en `src/server/search/search-source-registry.ts`. Nunca importar en cliente.

Puntos de refresco incremental:
- Publicar/despublicar `editorial_articles` → `syncSearchDocument({ sourceType: "article", sourceId })`.
- Publicar `horoscopes`, `tarot_cards`, `moon_phase_content`, `compatibility_profiles` → mismo patrón.
- Archivar/eliminar → `removeSearchDocument`.

## 6. Variables de entorno
Solo estándar: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server), `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (cliente). Sin funciones exclusivas de Lovable Cloud.

## 7. Verificación
- `curl "$APP/api/search?q=aries"` responde JSON con `X-Robots-Tag: noindex, follow`.
- `/buscar?q=aries` muestra resultados agrupados y respeta filtros `?tipo=tarot_card`.
- Sin `q` válida, la página muestra descubrimiento (recientes + signos + herramientas).
