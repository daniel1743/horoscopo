# SEO-10 — Auditoría final post-cambios del programa SEO

Fecha: 2026-08-19
Proyecto: Creovision.io
Agente: Claude Sonnet (Auditor SEO técnico final)
Modo: FINAL_AUDIT_NO_CODE
Estado: PASS_CON_OBSERVACIONES
Prioridad: CRITICA

> Regla de oro: esta es la auditoría de cierre técnico. No se buscan optimizaciones triviales; solo importa si existe algo P0/P1 que impida empezar a medir (SEO-11).

---

## 1. Objetivo

Verificar de extremo a extremo, tras SEO-00 a SEO-09, que Creovision está técnicamente listo para SEO-11 (medición y observación). No se implementa nada.

## 2. Estado heredado

| Fase    | Estado     |
| ------- | ---------- |
| SEO-00  | COMPLETADO |
| SEO-01  | COMPLETADO |
| SEO-02  | COMPLETADO |
| SEO-03  | COMPLETADO |
| SEO-04  | COMPLETADO |
| SEO-05  | COMPLETADO |
| SEO-06  | COMPLETADO |
| SEO-06D | COMPLETADO |
| SEO-07  | COMPLETADO |
| SEO-08  | COMPLETADO |
| SEO-09  | COMPLETADO |

Documentos leídos para esta auditoría: `00_BASELINE_Y_REGLAS.md`, `01_NORMALIZACION_WWW_CANONICAL.md`, `02_INDEXACION_SITEMAP_ROBOTS.md`, `03_PAGINAS_PROTEGIDAS_TOP10.md`, `04_QUICK_WIN_LUNA.md`, `05_TAROT_TRES_CARTAS.md`, `06_COMPATIBILIDAD_GEMINIS_SAGITARIO.md`, `07_ENLAZADO_INTERNO.md`, `08_METADATA_Y_CAPAS_DE_CONTENIDO.md`, `09_STRUCTURED_DATA.md`, `README.md`.

## 3. Git status

Worktree preexistente consistente con el estado de cierre de SEO-09C. SEO-10 no introduce cambios funcionales. Relación de archivos modificados funcionalmente por SEO-01…SEO-09 (todos preexistentes a esta auditoría):

- `src/config/seo.ts` (SEO-09B: `buildJsonLd`), `src/config/seo.ts` (historic), `src/components/seo/StructuredData.tsx` (eliminado, SEO-09B).
- `src/config/compatibility-indexability.ts` (SEO-06D-B), `src/config/compatibility-internal-links.ts` (SEO-07B).
- `src/config/structured-data.test.ts` (SEO-09B), `src/config/seo-indexability.test.ts`.
- Rutas públicas: `index.tsx`, `horoscopo.*`, `luna.*`, `tarot.*`, `compatibilidad.*`, `sitemap[.]xml.ts`.
- `supabase/migrations/20260818233000_fix_demo_article_project_astral_brand.sql` (SEO-08D).
- `src/pages/compatibility/CompatibilityPairPage.tsx`, `src/pages/horoscope/SignHoroscopePage.tsx` (SEO-07B).

## 4. Dominio/canonical

- Dominio canónico: `https://www.creovision.io` (siteConfig.url). `absoluteUrl` antepone el host a todos los canónicos. PASS.
- Sin query/hash en canónicos; trailing slash consistente. PASS.
- non-www → www: redirección 308 en producción (origen externo/Vercel, documentado SEO-01A/00). Los canónicos son todos `www`. PASS.
- Hallazgo histórico SEO-00-04 (canonical ausente en `/`, `/horoscopo`, `/luna/fases/$slug`) quedó RESUELTO: `src/routes/index.tsx` pasa `canonical: routes.home`, `/horoscopo` (`horoscopo.index.tsx`) usa `canonical`, y `/luna/fases/$slug` emite canonical vía `absoluteUrl(moonPhaseRoute(...))`. PASS.

## 5. Robots

- `public/robots.txt`: `Allow: /` global; disallow a `/admin`, `/api/`, `/_authenticated/`, `/design-system`, `/*.json$`; sitemap y host `www`. PASS.
- `/buscar` emite `robots: "noindex, follow"` en su `head` (router). PASS.
- Compatibilidad fallback demo emite `noindex,follow` vía `buildCompatibilityPairMeta` para pares fuera de `INDEXABLE_COMPATIBILITY_PAIR_KEYS`. PASS.
- No hay `noindex` accidental en páginas reales/protegidas. PASS.

## 6. Sitemap

- `/buscar` excluido (nunca se añade; no está en `getSitemapEntries`). PASS.
- Compatibilidad: solo `indexableCompatibilityPairs()` (aries__libra, cancer__capricornio, geminis__sagitario); demos excluidos. PASS.
- Tarot cards: `GET /sitemap.xml` usa `getSitemapEntriesWithPublishedTarot` → `tarotService.getLibrary()` (catálogo real `tarot_cards`), no la lista estática de 8. PASS.
- `as-de-copas` y `dos-de-espadas` incluidos; `carta-inexistente` ausente (cubierto por tests). PASS.
- URLs generadas con `absoluteUrl` → `www`. PASS.

## 7. Indexabilidad

- Páginas reales: `index,follow` por defecto de `buildMeta`. PASS.
- Compabilidad: allowlist indexable; resto noindex,follow. PASS.
- `/buscar`: noindex. PASS.
- Sin indexación accidental de demos/fallback. PASS.

## 8. Soft-404/notFound

- Tarot card inexistente → `notFound()` en loader (`loadTarotCardRouteData` / `tarotService.getCardBySlug`). PASS.
- Signos de compatibilidad inválidos → `notFound()` en `beforeLoad`. PASS.
- Perfil público inexistente → `notFound()` en `u.$username.tsx` (`requirePublicProfile`). PASS.
- Luna fase inválida → `notFound()` en `parseParams` de `luna.fases.$slug.tsx`. PASS.
- No hay nuevas soft-404 evidentes. PASS.

## 9. Metadata

- Titles/descriptions de páginas protegidas preservados (SEO-03). PASS.
- Moon phases usan `seo_title`/`seo_description` de DB (`getMoonPhaseHeadMetadata`). PASS.
- Tarot card metadata preservada (`getTarotCardMetaInput`). PASS.
- Géminis/Sagitario description específica (`GEMINI_SAGITTARIUS_META_DESCRIPTION`). PASS.
- No hay metadata undefined/null en las rutas auditadas (con fallbacks seguros). PASS.

## 10. Páginas protegidas

`/`, `/horoscopo`, `/tarot/carta-del-dia`, `/tarot/tres-cartas/trabajo`:

- HARD/SOFT freeze respetado. H1/CTA/contenido intactos. Metadata intacta (solo cambios previamente autorizados por fases). JSON-LD agregado en `head` es invisible y no rompe el contrato (WebPage/CollectionPage, sin cambios en render). PASS.

## 11. Horóscopo

`/horoscopo` hub + `/horoscopo/hoy|semana|mes` + `/horoscopo/$sign`: metadata específica, canonical, H1 coherente, contenido desde DB. PASS. Enlace signo → compatibilidad indexable (SEO-07B). PASS.

## 12. Luna

`/luna` (SEO-04): CTA `Conocer Tu Luna de Hoy`, `MoonHubPathways`, canonical. Fases con metadata editorial. `/luna/hoy` y `/luna/calendario` correctos. PASS.

## 13. Tarot

`/tarot/tres-cartas` semántica influencia/mirar/próximo paso (SEO-05). `/tarot/tres-cartas/trabajo` intacto. 78 cartas resolubles desde fuente real (`tarot_cards`); card inválida → notFound; sitemap completo. PASS.

## 14. Compatibilidad

Fuente única `compatibility-indexability.ts`. `geminis__sagitario`, `cancer__capricornio`, `aries__libra` indexables. Fallback demo `noindex,follow` y fuera de sitemap. `alternativePairs` filtrado. Enlaces signo ↔ par completos. Orden inverso redirige (sin duplicado). PASS.

## 15. Enlazado interno

Sin links SEO hacia fallback demos. Home/Luna/Tarot no sobre-enlazados. Navigation/footer sin stuffing. PASS.

## 16. Structured Data

SSR (`head().scripts`), un WebSite, un nodo local, `@graph`, `@id` deterministas, alineación canonical, sin duplicación CSR, serialización segura, cero queries DB extra, ausencia de Organization/SearchAction/Article/BreadcrumbList/FAQPage/Product/Review/AggregateRating. PASS. (Observaciones P2: objeto `structuredData` legacy sin consumidor; nodo JSON-LD también en demos noindex.)

## 17. Editorial

Migración nueva `20260818233000_...sql` corrige `Proyecto Astral` → `Creovision` de forma puntual; migración histórica intacta; sin expansión editorial inventada. PASS.

## 18. Tests

- `npx --yes vitest run src/config/seo-indexability.test.ts`: **PASS (34 tests)**.
- `npx --yes vitest run src/config/structured-data.test.ts`: **PASS (5 tests)**.
- Total: 39 tests PASS. Sin fallos nuevos.

## 19. Build

`npm run build`: **PASS** (client + SSR + Nitro/Vercel). Sin errores atribuibles a SEO.

## 20. Typecheck

`npx tsc --noEmit --pretty false`: **FAIL_PREEXISTENTE_PERMITIDO**. Deuda global de tipos en rutas de navegación/cuenta/moon-navigation/tarot-grid (TYPO de `routes`/zodiac) y tipos de `vitest`. Ningún error en archivos funcionales SEO-01…SEO-09. Sin fallos nuevos.

## 21. P0/P1/P2

- **P0 = 0**
- **P1 = 0**
- **P2 = 3** (no bloqueantes):
  1. Objeto `structuredData` legacy sin consumidor en `seo.ts` (limpieza opcional).
  2. Nodo JSON-LD WebPage también emitido en compatibilidad demos noindex (no contradice robots/sitemap; limpio sería omitirlo).
  3. `threeCardReadings.general.seo.description` residual obsoleto ("pasado/presente/futuro", no renderizado).

## 22. FIX si aplica

No aplica. No existen problemas P0/P1 que exijan una microfase de corrección.

## 23. Riesgos residuales

- `vite preview` local no sirve como validación SSR (limitación de infraestructura ya documentada).
- Validación externa de Schema Markup Validator / Rich Results no realizada por falta de contexto de navegador garantizado; WebPage/CollectionPage no garantizan rich result y ello no invalida el marcado.
- Deuda de tipos global permanece (fuera de alcance SEO, permitida).

## 24. Matriz final

| Área | Estado | Riesgo | Bloquea SEO-11 |
|---|---|---|---|
| Dominio/canonical | PASS | Bajo | NO |
| Robots | PASS | Bajo | NO |
| Sitemap | PASS | Bajo | NO |
| Indexabilidad | PASS | Bajo | NO |
| Soft-404/notFound | PASS | Bajo | NO |
| Metadata | PASS | Bajo | NO |
| Páginas protegidas | PASS | Bajo | NO |
| Horóscopo | PASS | Bajo | NO |
| Luna | PASS | Bajo | NO |
| Tarot | PASS | Bajo | NO |
| Compatibilidad | PASS | Bajo | NO |
| Enlazado interno | PASS | Bajo | NO |
| Structured Data | PASS_CON_OBSERVACIONES | Bajo (P2) | NO |
| Editorial | PASS | Bajo | NO |

## 25. Decisiones finales

```
technical_readiness: READY_WITH_P2
seo11_ready: YES
p0_count: 0
p1_count: 0
p2_count: 3
protected_pages: PASS
sitemap: PASS
indexability: PASS
structured_data: PASS
```

## 26. Estado

**PASS_CON_OBSERVACIONES** (solo P2, no bloqueantes).

Creovision está técnicamente listo para SEO-11. No se atribuye ninguna mejora de ranking/CTR a los cambios realizados: la medición corresponde exclusivamente a SEO-11.

No se modificó código funcional. SEO-10 queda COMPLETADO; SEO-11 queda PENDIENTE y no fue iniciado.