# IMPLEMENTACIÓN YAML 05 — SISTEMA EDITORIAL

## Resumen
Sistema editorial completo (hub de guías, categorías, artículos, autores,
tabla de contenidos, progreso de lectura, referencias, avisos y relacionados)
construido sobre la infraestructura ya congelada (YAML 01–04). Toda la data
reside en Supabase (Lovable Cloud) y se consume a través de un único
repositorio portable. Las páginas y componentes **nunca** hablan con Supabase
directamente.

## Almacenamiento — Supabase (Lovable Cloud)
Tablas creadas y aplicadas mediante migración:

- `user_roles` + `app_role` enum + `has_role()` security-definer.
- `editorial_categories` — 6 categorías seed (astrology, tarot, moon,
  compatibility, horoscope, editorial).
- `editorial_authors` — perfil editorial genérico.
- `editorial_articles` — modelo completo (draft/published/archived, JSONB
  content, SEO, tags, reading_time, sources, related_article_ids,
  disclaimer_key, review_date, is_demo, canonical_override, etc.).

RLS activo:
- Lectura pública solo de artículos `status = 'published'`.
- Escritura restringida a `admin` / `editor` vía `has_role()`.
- `has_role()` y `set_updated_at()` con `EXECUTE` revocado de `anon` /
  `authenticated` / `PUBLIC` (endurecimiento aplicado en migración adicional).

Seed inicial:
- 6 categorías canónicas.
- 1 autor editorial (`equipo-editorial`).
- 1 artículo de demostración marcado `is_demo = true`
  (`sistema-editorial-demostracion`, `disclaimer_key = "demo"`).

**No** se generó inventario ficticio: el resto del contenido queda pendiente
de aportación real.

## Portabilidad
- `@supabase/supabase-js` estándar.
- Variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` con fallback
  a `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` para SSR.
- `.env.example` documenta las claves para despliegue en Vercel u otros.
- Repositorio único (`src/lib/editorial/repository.ts`) — cambiar de backend
  solo requiere reescribir esta capa.

## Archivos creados

### Tipos y configuración
- `src/types/editorial.ts` — modelos de dominio (Article, Category, Author,
  bloques de contenido, referencias).
- `src/config/editorial.ts` — configuración editorial y registro de avisos
  reutilizables.

### Capa de datos
- `src/lib/editorial/repository.ts` — consultas + mapeo snake→camel.
- `src/lib/editorial/reading-time.ts` — cálculo de tiempo de lectura.

### Componentes editoriales (`src/components/editorial/`)
- `EditorialCard.tsx` — tarjeta reutilizable en grids.
- `ArticleContentRenderer.tsx` — renderer de bloques (paragraph, heading,
  list, quote, callout, image, divider, key_points, disclaimer).
- `TableOfContents.tsx` — TOC derivada de headings h2/h3.
- `ReadingProgress.tsx` — barra fina superior con progreso de scroll.
- `AuthorBlock.tsx` — biografía + enlace, modo completo y compacto.
- `ShareBar.tsx` — Web Share API + copiar enlace con feedback `aria-live`.
- `ArticleMeta.tsx` — categoría, autor compacto, fecha, tiempo, badge demo.
- `RelatedArticles.tsx` — grid de artículos relacionados.

### Páginas (`src/pages/editorial/`)
- `GuidesPage.tsx` — hub con nav de categorías + listado.
- `CategoryPage.tsx` — página de categoría.
- `AuthorPage.tsx` — perfil de autor y su producción.
- `ArticlePage.tsx` — artículo completo (TOC sticky, referencias, avisos,
  fecha de revisión, share, autor, relacionados).
- `EditorialMethodPage.tsx` — método editorial (principios, proceso,
  alcance).

### Rutas
- `src/routes/guias.tsx` (reescrita) — loader → repositorio.
- `src/routes/guias.$slug.tsx` (nueva).
- `src/routes/temas.$category.tsx` (nueva).
- `src/routes/autores.$slug.tsx` (nueva).
- `src/routes/metodo.tsx` (reescrita) — página editorial real.

### Otros
- `.env.example` — documentación de variables.
- Migraciones Supabase aplicadas (schema + hardening).

## Archivos modificados

- `src/config/routes.ts` — añadidas claves `topics: "/temas"`,
  `authors: "/autores"` y helpers `categoryRoute(slug)`, `authorRoute(slug)`.
- `src/components/home/FeaturedGuidesSection.tsx` — sustituye las guías mock
  por `useQuery` que consume el repositorio y muestra estado vacío honesto
  mientras no haya artículos publicados suficientes.

## Home
Solo se modificó `FeaturedGuidesSection.tsx` para reemplazar `featuredGuides`
mock por datos reales de Supabase. Ninguna otra sección de la Home fue
tocada. La estructura y orden de secciones permanecen congelados (YAML 04).

## SEO y metadatos
- Cada ruta consume `buildMeta({ title, description, image?, canonical? })`.
- `guias/$slug` prioriza `seo.title`, `seo.description`, `seo.og_image` y
  respeta `canonical_override` cuando existe.
- Estados not-found devuelven `robots: noindex`.
- Artículo con `is_demo = true` muestra badge visible en el meta bar; el
  disclaimer editorial se renderiza al final del cuerpo.

## Accesibilidad
- H1 único en cada página; secciones con `aria-labelledby`.
- TOC como `<nav aria-label="Tabla de contenidos">` con anclas `scroll-mt-24`.
- `ReadingProgress` expone `role="progressbar"` con `aria-valuenow`.
- Copy-link con `aria-live="polite"`.
- Iconos decorativos con `aria-hidden` heredado desde `Icon`.
- Focus visible mediante `focus-visible:ring-brand` global.

## Validación
- `npm run lint` → **0 errors** (6 warnings preexistentes en `components/ui/*`).
- `npx tsgo --noEmit` → **0 errors**.
- `npm run build` → **✓ built** (SSR + client + Nitro OK).
- `npm run check:centralization` → sin nuevos hex, sin imports directos de
  lucide-react, sin rutas hard-coded nuevas fuera de `routes.ts`.

## Congelación
Modelo de datos (schema Supabase), repositorio, tipos, componentes
editoriales, páginas (Guides / Category / Author / Article / Method) y rutas
quedan **congelados**. Cambios futuros permitidos únicamente vía:
- migraciones adicionales de Supabase (extender columnas / índices),
- nuevos bloques en `ArticleContentRenderer` (extender el discriminated union),
- nuevos avisos en `disclaimers` (`src/config/editorial.ts`).

## Pendientes reales (no bloquean congelación)
- Redacción de 4–6 artículos reales (infraestructura ya lista).
- Registro visual dedicado para imágenes editoriales (se admite `image_url`
  por artículo; hoy se usa gradiente decorativo cuando no hay imagen).
- Sitemap dinámico (extraer slugs publicados desde el repositorio).
