-- ============================================================
-- YAML 12: Buscador unificado
-- Extensiones + tabla derivada + RPC search_site
-- ============================================================

-- 1) Extensiones
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2) Tabla derivada search_documents
CREATE TABLE IF NOT EXISTS public.search_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id text NOT NULL,
  title text NOT NULL,
  excerpt text,
  searchable_text text NOT NULL,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  route_path text NOT NULL,
  image_key text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  language text NOT NULL DEFAULT 'es',
  is_public boolean NOT NULL DEFAULT false,
  source_published_at timestamptz,
  source_updated_at timestamptz,
  indexed_at timestamptz NOT NULL DEFAULT now(),
  search_vector tsvector,
  CONSTRAINT search_documents_source_type_check
    CHECK (source_type IN ('article','author','category','horoscope','tarot_card','moon_phase','compatibility')),
  CONSTRAINT search_documents_unique_source UNIQUE (source_type, source_id),
  CONSTRAINT search_documents_valid_route CHECK (route_path LIKE '/%'),
  CONSTRAINT search_documents_public_requires_route
    CHECK (is_public = false OR char_length(route_path) > 1)
);

-- 3) GRANTs
GRANT SELECT ON public.search_documents TO anon, authenticated;
GRANT ALL ON public.search_documents TO service_role;

-- 3b) Immutable unaccent wrapper (required for generated tsvector expressions / immutable indexes)
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
SET search_path = public
AS $fn$ SELECT public.unaccent('public.unaccent', $1) $fn$;

-- 3c) Trigger to populate search_vector (unaccent is not IMMUTABLE so we can't use a generated column with it)
CREATE OR REPLACE FUNCTION public.search_documents_refresh_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $trg$
DECLARE
  v_keywords text;
BEGIN
  BEGIN
    v_keywords := (SELECT string_agg(value, ' ') FROM jsonb_array_elements_text(NEW.keywords) AS value);
  EXCEPTION WHEN OTHERS THEN
    v_keywords := '';
  END;
  NEW.search_vector :=
    setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(NEW.title, ''))), 'A')
    || setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(v_keywords, ''))), 'B')
    || setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(NEW.excerpt, ''))), 'B')
    || setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(NEW.searchable_text, ''))), 'C');
  RETURN NEW;
END;
$trg$;

DROP TRIGGER IF EXISTS trg_search_documents_refresh_vector ON public.search_documents;
CREATE TRIGGER trg_search_documents_refresh_vector
  BEFORE INSERT OR UPDATE ON public.search_documents
  FOR EACH ROW EXECUTE FUNCTION public.search_documents_refresh_vector();

-- 4) RLS
ALTER TABLE public.search_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published search docs"
  ON public.search_documents
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Service role bypasses RLS by default; no INSERT/UPDATE/DELETE policies for other roles.

-- 5) Índices
CREATE INDEX IF NOT EXISTS search_documents_vector_idx
  ON public.search_documents USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS search_documents_title_trgm_idx
  ON public.search_documents USING GIN ((public.immutable_unaccent(lower(title))) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS search_documents_excerpt_trgm_idx
  ON public.search_documents USING GIN ((public.immutable_unaccent(lower(coalesce(excerpt, '')))) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS search_documents_type_public_idx
  ON public.search_documents (source_type, is_public);

CREATE INDEX IF NOT EXISTS search_documents_indexed_at_idx
  ON public.search_documents (indexed_at DESC);

-- 6) Función RPC search_site
CREATE OR REPLACE FUNCTION public.search_site(
  p_query text,
  p_source_types text[] DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  source_type text,
  source_id text,
  title text,
  excerpt text,
  route_path text,
  image_key text,
  metadata jsonb,
  source_published_at timestamptz,
  rank real,
  match_type text
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_query text;
  v_normalized text;
  v_limit integer;
  v_offset integer;
  v_ts tsquery;
  v_types text[];
BEGIN
  v_query := coalesce(p_query, '');
  v_query := btrim(v_query);
  v_query := regexp_replace(v_query, '\s+', ' ', 'g');
  IF char_length(v_query) < 2 THEN
    RETURN;
  END IF;
  IF char_length(v_query) > 160 THEN
    v_query := substr(v_query, 1, 160);
  END IF;

  v_normalized := unaccent(lower(v_query));

  v_limit := LEAST(GREATEST(coalesce(p_limit, 20), 1), 50);
  v_offset := LEAST(GREATEST(coalesce(p_offset, 0), 0), 500);

  IF p_source_types IS NOT NULL AND array_length(p_source_types, 1) > 0 THEN
    v_types := ARRAY(
      SELECT unnest(p_source_types)
      INTERSECT
      SELECT unnest(ARRAY['article','author','category','horoscope','tarot_card','moon_phase','compatibility'])
    );
    IF array_length(v_types, 1) IS NULL THEN
      RETURN;
    END IF;
  END IF;

  BEGIN
    v_ts := websearch_to_tsquery('spanish', unaccent(v_query));
  EXCEPTION WHEN OTHERS THEN
    v_ts := plainto_tsquery('spanish', unaccent(v_query));
  END;

  RETURN QUERY
  WITH candidates AS (
    SELECT
      d.source_type,
      d.source_id,
      d.title,
      d.excerpt,
      d.route_path,
      d.image_key,
      d.metadata,
      d.source_published_at,
      CASE
        WHEN unaccent(lower(d.title)) = v_normalized THEN 1.0::real
        WHEN unaccent(lower(d.title)) LIKE v_normalized || '%' THEN 0.85::real
        WHEN d.search_vector @@ v_ts THEN 0.7::real + LEAST(ts_rank(d.search_vector, v_ts), 1.0)::real * 0.15
        WHEN similarity(unaccent(lower(d.title)), v_normalized) >= 0.25 THEN
          0.4::real + similarity(unaccent(lower(d.title)), v_normalized)::real * 0.3
        WHEN similarity(unaccent(lower(coalesce(d.excerpt, ''))), v_normalized) >= 0.25 THEN
          0.25::real + similarity(unaccent(lower(coalesce(d.excerpt, ''))), v_normalized)::real * 0.2
        ELSE 0.0::real
      END AS base_rank,
      CASE
        WHEN unaccent(lower(d.title)) = v_normalized THEN 'exact'
        WHEN unaccent(lower(d.title)) LIKE v_normalized || '%' THEN 'title'
        WHEN d.search_vector @@ v_ts THEN 'full_text'
        ELSE 'approximate'
      END AS match_type
    FROM public.search_documents d
    WHERE d.is_public = true
      AND (v_types IS NULL OR d.source_type = ANY(v_types))
      AND (
        unaccent(lower(d.title)) = v_normalized
        OR unaccent(lower(d.title)) LIKE v_normalized || '%'
        OR d.search_vector @@ v_ts
        OR similarity(unaccent(lower(d.title)), v_normalized) >= 0.25
        OR similarity(unaccent(lower(coalesce(d.excerpt, ''))), v_normalized) >= 0.25
      )
  )
  SELECT
    c.source_type,
    c.source_id,
    c.title,
    c.excerpt,
    c.route_path,
    c.image_key,
    c.metadata,
    c.source_published_at,
    (c.base_rank
      + CASE
          WHEN c.source_type IN ('article','horoscope') AND c.source_published_at IS NOT NULL
          THEN LEAST(0.05, 0.05 / (1 + EXTRACT(EPOCH FROM (now() - c.source_published_at)) / 2592000))::real
          ELSE 0.0::real
        END
    )::real AS rank,
    c.match_type
  FROM candidates c
  WHERE c.base_rank > 0
  ORDER BY rank DESC, c.source_published_at DESC NULLS LAST
  LIMIT v_limit OFFSET v_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_site(text, text[], integer, integer) TO anon, authenticated;

-- 7) Función auxiliar de sugerencias (título y prefijo, ultra-ligera)
CREATE OR REPLACE FUNCTION public.search_suggest(
  p_query text,
  p_limit integer DEFAULT 8
)
RETURNS TABLE (
  source_type text,
  source_id text,
  title text,
  route_path text,
  image_key text,
  metadata jsonb,
  match_type text
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_query text;
  v_normalized text;
  v_limit integer;
BEGIN
  v_query := btrim(coalesce(p_query, ''));
  IF char_length(v_query) < 2 THEN
    RETURN;
  END IF;
  IF char_length(v_query) > 100 THEN
    v_query := substr(v_query, 1, 100);
  END IF;

  v_normalized := unaccent(lower(v_query));
  v_limit := LEAST(GREATEST(coalesce(p_limit, 8), 1), 10);

  RETURN QUERY
  SELECT
    d.source_type,
    d.source_id,
    d.title,
    d.route_path,
    d.image_key,
    d.metadata,
    CASE
      WHEN unaccent(lower(d.title)) = v_normalized THEN 'exact'
      WHEN unaccent(lower(d.title)) LIKE v_normalized || '%' THEN 'title'
      ELSE 'approximate'
    END AS match_type
  FROM public.search_documents d
  WHERE d.is_public = true
    AND (
      unaccent(lower(d.title)) LIKE v_normalized || '%'
      OR similarity(unaccent(lower(d.title)), v_normalized) >= 0.3
    )
  ORDER BY
    CASE WHEN unaccent(lower(d.title)) = v_normalized THEN 0
         WHEN unaccent(lower(d.title)) LIKE v_normalized || '%' THEN 1
         ELSE 2 END,
    similarity(unaccent(lower(d.title)), v_normalized) DESC
  LIMIT v_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_suggest(text, integer) TO anon, authenticated;