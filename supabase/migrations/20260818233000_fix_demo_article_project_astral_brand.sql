-- SEO-08D: corrección puntual de marca en metadata editorial demo.
-- No edita la migración histórica 20260727225111_....

UPDATE public.editorial_articles
SET seo = jsonb_set(
    jsonb_set(
      seo,
      '{title}',
      to_jsonb('Artículo de demostración — Creovision'::text),
      true
    ),
    '{description}',
    to_jsonb('Contenido de ejemplo utilizado para validar la infraestructura editorial de Creovision.'::text),
    true
  )
WHERE slug = 'articulo-de-demostracion'
  AND seo ->> 'title' = 'Artículo de demostración — Proyecto Astral'
  AND seo ->> 'description' = 'Contenido de ejemplo utilizado para validar la infraestructura editorial de Proyecto Astral.';

-- Rollback puntual:
-- UPDATE public.editorial_articles
-- SET seo = jsonb_set(
--     jsonb_set(
--       seo,
--       '{title}',
--       to_jsonb('Artículo de demostración — Proyecto Astral'::text),
--       true
--     ),
--     '{description}',
--     to_jsonb('Contenido de ejemplo utilizado para validar la infraestructura editorial de Proyecto Astral.'::text),
--     true
--   )
-- WHERE slug = 'articulo-de-demostracion'
--   AND seo ->> 'title' = 'Artículo de demostración — Creovision'
--   AND seo ->> 'description' = 'Contenido de ejemplo utilizado para validar la infraestructura editorial de Creovision.';
