# 04_MODULE_BLUEPRINTS.md — Planos de Módulos Futuros

**Versión**: 1.0
**Fecha**: 28/07/2026
**Propósito**: Ficha técnica detallada de cada módulo pendiente de construcción o completitud. NO contiene implementación, solo especificación de qué construir y con qué restricciones.

---

## MÓDULO M1: Code-Splitting y Lazy Loading

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 2 (P0) |
| **ID** | 2.1 |
| **Prioridad** | CRÍTICA |
| **Horas estimadas** | 4-6h |
| **Objetivo** | Implementar lazy loading en las 54 rutas para reducir el bundle inicial ~60-70% |
| **Alcance** | Refactorizar `src/routeTree.gen.ts` (1393 líneas) y `src/router.tsx` para usar `lazyRouteComponent`. Cada ruta debe cargarse bajo demanda. NO se modifica la lógica interna de las rutas. |
| **Dependencias** | Ninguna (es el primer paso de FASE 2) |
| **Entradas** | `src/routeTree.gen.ts`, `src/router.tsx`, 54 archivos en `src/routes/` |
| **Salidas** | Bundle inicial reducido. Cada ruta en su propio chunk. Métricas de bundle pre/post. |
| **Reutilización obligatoria** | TanStack Router `lazyRouteComponent` API nativa. NO crear sistema propio de lazy loading. |
| **Riesgos** | Romper navegación entre rutas. Conflictos con loaders existentes. |
| **Agente responsable** | Cline (experto TanStack) |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) `bun run build` exitoso sin errores. (2) Navegación entre todas las rutas funciona. (3) Bundle analysis muestra chunks separados por ruta. (4) Bundle inicial ≤40% del tamaño actual. (5) `bun scripts/check-direct-routes.ts` pasa. |

---

## MÓDULO M2: Structured Data / JSON-LD

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 2 (P0) |
| **ID** | 2.2 |
| **Prioridad** | CRÍTICA |
| **Horas estimadas** | 3-4h |
| **Objetivo** | Implementar JSON-LD structured data para habilitar rich snippets en Google |
| **Alcance** | Crear componente `<JsonLd />` que renderice `application/ld+json`. Implementar: `Article` (editorial), `FAQPage` (tarot), `BreadcrumbList`, `WebSite` (home). Integrar con `src/config/seo.ts`. |
| **Dependencias** | 2.1 (Code-Splitting) — para no tener conflictos de merge en rutas |
| **Entradas** | `src/config/seo.ts`, metadatos de artículos, tarot FAQs, breadcrumbs |
| **Salidas** | JSON-LD inline en cada ruta relevante. Rich snippets validables en Google Rich Results Test. |
| **Reutilización obligatoria** | Sistema centralizado `src/config/seo.ts`. Tipos de Zod para validar estructura JSON-LD. |
| **Riesgos** | JSON-LD malformado penaliza SEO. Duplicación de datos con meta tags existentes. |
| **Agente responsable** | Claude |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) Google Rich Results Test pasa para Article, FAQ, BreadcrumbList. (2) Sin errores de consola. (3) JSON-LD usa datos reales del contenido (no placeholders). (4) Integrado con `src/config/seo.ts`. |

---

## MÓDULO M3: Sitemap.xml Dinámico

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 2 (P0) |
| **ID** | 2.3 |
| **Prioridad** | CRÍTICA |
| **Horas estimadas** | 2-3h |
| **Objetivo** | Generar sitemap.xml dinámico con todas las rutas públicas indexables |
| **Alcance** | Server function que genera XML con `<urlset>` conteniendo: home, horóscopos (12 signos), tarot, luna, editorial (todos los artículos published), compatibilidad, buscar. Incluir `<lastmod>`, `<changefreq>`, `<priority>`. |
| **Dependencias** | Ninguna (independiente) |
| **Entradas** | Lista de rutas públicas, tabla `articles` (solo published), signos del zodíaco |
| **Salidas** | Ruta `GET /sitemap.xml` que devuelve XML válido |
| **Reutilización obligatoria** | `src/data/zodiac.ts` para signos. Repositorio editorial para artículos. |
| **Riesgos** | Sitemap con URLs rotas. Tamaño excesivo (>50MB o >50K URLs). |
| **Agente responsable** | Cline |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) `GET /sitemap.xml` devuelve 200 con Content-Type `application/xml`. (2) XML válido según schema sitemap.org. (3) Todas las URLs listadas son accesibles (status 200). (4) `robots.txt` referencia el sitemap. |

---

## MÓDULO M4: Cleanup console.log

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 2 (P1) |
| **ID** | 2.4 |
| **Prioridad** | ALTA |
| **Horas estimadas** | 1-2h |
| **Objetivo** | Eliminar o wrappear los 54 console.log detectados en código de producción |
| **Alcance** | Revisar cada ocurrencia. Si es debug legítimo → wrapper `if (import.meta.env.DEV)`. Si es innecesario → eliminar. Si es error tracking → migrar a sistema de logging (preparar para 5.4). |
| **Dependencias** | Ninguna |
| **Entradas** | 54 ubicaciones de console.log listadas en `PERFORMANCE_AUDIT.md` |
| **Salidas** | Cero console.log en build de producción |
| **Reutilización obligatoria** | `import.meta.env.DEV` para condicionales. NO crear utilidad de logging en este módulo (eso es 5.4). |
| **Riesgos** | Eliminar logs útiles para debugging futuro. |
| **Agente responsable** | Cline / Claude |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) `grep -r "console.log" src/` devuelve 0 resultados (o solo dentro de `if (import.meta.env.DEV)`). (2) Build de producción no muestra logs en consola. |

---

## MÓDULO M5: useDebounced DRY

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 2 (P1) |
| **ID** | 2.5 |
| **Prioridad** | ALTA |
| **Horas estimadas** | 0.5h |
| **Objetivo** | Eliminar la duplicación del hook `useDebounced` |
| **Alcance** | Extraer `useDebounced` de `src/components/search/SearchDialog.tsx` (líneas 25-32) a `src/hooks/useDebounced.ts`. Actualizar imports en `SearchDialog.tsx` y `src/routes/buscar.tsx` (líneas 53-60). Eliminar la copia duplicada. |
| **Dependencias** | Ninguna |
| **Entradas** | 2 archivos con código idéntico |
| **Salidas** | 1 hook en `src/hooks/useDebounced.ts`. 2 imports actualizados. |
| **Reutilización obligatoria** | `src/hooks/` como ubicación canónica para hooks compartidos |
| **Riesgos** | Ninguno (código idéntico, solo se mueve) |
| **Agente responsable** | Cline |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) `grep -r "function useDebounced" src/components/` devuelve 0. (2) `grep -r "function useDebounced" src/hooks/` devuelve 1. (3) SearchDialog y buscar.tsx funcionan sin cambios de comportamiento. |

---

## MÓDULO M6: Migración de Hardcodeos al Design System

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 2 (P1) |
| **ID** | 2.6 |
| **Prioridad** | ALTA |
| **Horas estimadas** | 3-4h |
| **Objetivo** | Migrar ~40+ hardcodeos de estilos a tokens del Design System |
| **Alcance** | Reemplazar: hex codes arbitrarios → `var(--color-*)`, px values → `var(--spacing-*)`, sombras hardcodeadas → `var(--shadow-*)`, radios arbitrarios → `var(--radius-*)`. Priorizar componentes más usados (layout, cards, botones). |
| **Dependencias** | 2.1 (Code-Splitting), 2.9 (Bundle Analysis) — para priorizar componentes |
| **Entradas** | Resultados de `bun scripts/check-hardcoded-styles.ts`. Bundle analysis para priorización. |
| **Salidas** | `check-hardcoded-styles.ts` pasa limpiamente. Componentes usan tokens DS. |
| **Reutilización obligatoria** | Tokens en `src/styles.css` y `src/design-system/tokens.ts`. NO crear nuevos tokens sin justificación. |
| **Riesgos** | Regresión visual por cambio de valores. Romper especificidad CSS. |
| **Agente responsable** | Claude / Codex |
| **Agente auditor** | Anti-Gravity + revisión visual manual |
| **Criterio de aceptación** | (1) `bun scripts/check-hardcoded-styles.ts` sale con 0 errores. (2) No hay regresiones visuales (comparación manual pre/post). (3) Todos los tokens usados existen en `src/styles.css`. (4) Componentes funcionan en light mode (dark mode no requerido aún). |

---

## MÓDULO M7: Breadcrumbs

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 2 (P1) |
| **ID** | 2.7 |
| **Prioridad** | ALTA |
| **Horas estimadas** | 2-3h |
| **Objetivo** | Implementar componente de breadcrumbs con navegación jerárquica y soporte SEO |
| **Alcance** | Componente `<Breadcrumbs />` en `src/components/layout/`. Integrar con TanStack Router para generar la ruta jerárquica automáticamente. Incluir `BreadcrumbList` JSON-LD. Insertar en layout principal (`__root.tsx`). |
| **Dependencias** | 2.2 (Structured Data) — para consistencia en JSON-LD |
| **Entradas** | Estado de ruta actual de TanStack Router. Mapeo de rutas a labels legibles. |
| **Salidas** | Breadcrumbs visibles en todas las páginas. JSON-LD BreadcrumbList en cada página. |
| **Reutilización obligatoria** | `src/config/seo.ts` para labels. Sistema de iconos `src/config/icons.ts` para separadores. |
| **Riesgos** | Rutas dinámicas sin label amigable. Breadcrumbs incorrectos en rutas anidadas. |
| **Agente responsable** | Claude / Codex |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) Breadcrumbs visibles en ≥90% de las rutas. (2) Cada breadcrumb es un link funcional. (3) JSON-LD BreadcrumbList válido. (4) Responsive (no se rompe en mobile). |

---

## MÓDULO M8: Modo Oscuro

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 3 |
| **ID** | 3.1 |
| **Prioridad** | MEDIA |
| **Horas estimadas** | 3-4h |
| **Objetivo** | Activar el modo oscuro con toggle en UI y persistencia de preferencia |
| **Alcance** | Implementar toggle sol/luna en Navbar. Persistir preferencia en localStorage + cookie para SSR. Usar variables CSS `--dark` de Tailwind v4. Asegurar contraste WCAG AA en ambos temas. |
| **Dependencias** | 2.6 (Migrar Hardcodeos) — sin tokens consistentes, el dark mode es imposible. 2.10 (Auditoría F2). |
| **Entradas** | Tokens del Design System. Variables `--dark` ya definidas en Tailwind. Componente Navbar existente. |
| **Salidas** | Toggle funcional. Ambos temas con contraste adecuado. Sin flickering en carga SSR. |
| **Reutilización obligatoria** | Tokens existentes en `src/styles.css`. Componente Navbar existente. Iconos sol/luna del sistema centralizado. |
| **Riesgos** | Flickering en primera carga (SSR no conoce preferencia). Componentes con hardcodeos residuales se ven mal en dark mode. |
| **Agente responsable** | Cline |
| **Agente auditor** | Anti-Gravity + Claude (revisión a11y) |
| **Criterio de aceptación** | (1) Toggle cambia entre light/dark sin recargar página. (2) Preferencia persiste entre sesiones. (3) Sin flickering en carga inicial. (4) Contraste WCAG AA en ambos temas (verificado con herramienta). |

---

## MÓDULO M9: Favoritos Sincronizados con Supabase

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 3 |
| **ID** | 3.2 |
| **Prioridad** | MEDIA |
| **Horas estimadas** | 4-6h |
| **Objetivo** | Sincronizar favoritos del usuario con Supabase (actualmente solo localStorage) |
| **Alcance** | Nueva tabla `user_favorites` en Supabase. Server functions para add/remove/list favoritos. Sincronización bidireccional localStorage ↔ Supabase. Merge al hacer login. UI de favoritos en cuenta. |
| **Dependencias** | 2.10 (Auditoría F2). Requiere nueva migración (MUTEX con otros agentes). |
| **Entradas** | Sistema de auth existente. `useRecentSearches` hook (referencia de patrón localStorage). |
| **Salidas** | Tabla `user_favorites`. Favoritos persistentes entre dispositivos. Sin pérdida de datos al hacer login. |
| **Reutilización obligatoria** | `src/integrations/supabase/client.ts` para cliente. `src/lib/account/` para server functions. RLS existente como patrón. |
| **Riesgos** | Conflicto al mergear localStorage con Supabase (duplicados, pérdida). Migración conflictiva con otras tareas. |
| **Agente responsable** | Claude |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) Favoritos sobreviven a clear cache. (2) Favoritos sincronizados entre pestañas. (3) Al hacer login, favoritos locales se mergean (sin duplicados). (4) RLS: usuario solo ve sus favoritos. |

---

## MÓDULO M10: Iconos Personalizados de Zodíaco

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 3 |
| **ID** | 3.3 |
| **Prioridad** | BAJA |
| **Horas estimadas** | 8-12h |
| **Objetivo** | Crear set de 12 iconos personalizados para los signos del zodíaco |
| **Alcance** | Diseñar/adaptar 12 iconos SVG para Aries...Piscis. Integrar con `src/config/icons.ts`. Reemplazar placeholders de Lucide en componentes de horóscopo, compatibilidad y home. |
| **Dependencias** | 2.10 (Auditoría F2) |
| **Entradas** | `src/config/icons.ts`. Componentes que muestran signos (HoroscopeSignPage, CompatibilityDetailPage, Home). |
| **Salidas** | 12 SVGs en `src/components/ui/icons/`. Registro en `icons.ts`. |
| **Reutilización obligatoria** | Sistema centralizado de iconos (`<Icon name="..." />`). Script `check-direct-icon-imports.ts` debe seguir pasando. |
| **Riesgos** | SVGs mal optimizados (pesados). Estilo inconsistente entre iconos. Regresión visual. |
| **Agente responsable** | Codex |
| **Agente auditor** | Anti-Gravity + revisión visual |
| **Criterio de aceptación** | (1) 12 iconos disponibles vía `<Icon name="zodiac-aries" />` etc. (2) `check-direct-icon-imports.ts` pasa. (3) Iconos visibles en todas las páginas de horóscopo y compatibilidad. (4) SVG ≤2KB cada uno. |

---

## MÓDULO M11: Tests de Integración Frontend

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 4 |
| **ID** | 4.1 |
| **Prioridad** | ALTA |
| **Horas estimadas** | 12-16h |
| **Objetivo** | Establecer cobertura de tests de integración para componentes y server functions |
| **Alcance** | Configurar Vitest + Testing Library. Tests para: server functions (moon, horoscope, tarot, editorial, search), componentes clave (SearchDialog, MoonCalendar, HoroscopeSignPage), hooks (useDebounced). |
| **Dependencias** | FASE 3 completada (features estables) |
| **Entradas** | Código fuente de server functions en `src/lib/`. Componentes en `src/components/`. |
| **Salidas** | Suite de tests con ≥70% coverage. Config de Vitest. |
| **Reutilización obligatoria** | Zod schemas existentes para datos de prueba. Seed de Supabase para datos de test. |
| **Riesgos** | Tests frágiles por dependencia de Supabase. Mocking complejo de server functions. |
| **Agente responsable** | Claude + Cline |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) `bun test` pasa. (2) Coverage ≥70% (lines). (3) Tests no dependen de red externa (Supabase mockeado). (4) CI ejecuta tests automáticamente. |

---

## MÓDULO M12: CI/CD Pipeline

| Campo | Detalle |
|-------|---------|
| **Fase** | FASE 4 |
| **ID** | 4.5 |
| **Prioridad** | ALTA |
| **Horas estimadas** | 4-6h |
| **Objetivo** | Pipeline automatizado de integración continua |
| **Alcance** | GitHub Actions workflow que ejecute: lint (ESLint), type-check (tsc), tests (Vitest), build (bun run build), scripts de verificación (check-hardcoded-styles, check-direct-icon-imports, etc.). |
| **Dependencias** | 4.1 (Tests de Integración) — el pipeline ejecuta los tests |
| **Entradas** | Scripts existentes en `scripts/`. Config de ESLint, TS. |
| **Salidas** | Archivo `.github/workflows/ci.yml`. Badge en README. |
| **Reutilización obligatoria** | Scripts de verificación existentes. bun como package manager. |
| **Riesgos** | Build time excesivo. Falsos negativos en type-check. |
| **Agente responsable** | Cline |
| **Agente auditor** | Anti-Gravity |
| **Criterio de aceptación** | (1) Push a main dispara CI. (2) CI falla si lint/type-check/tests fallan. (3) CI incluye todos los scripts de verificación. (4) Tiempo de CI <10 min. |

---

## MATRIZ DE PRIORIDADES DE MÓDULOS

| Módulo | Prioridad | Impacto | Complejidad | Riesgo | Orden |
|--------|-----------|---------|-------------|--------|-------|
| M1 Code-Splitting | CRÍTICA | ALTO | ALTA | ALTO | 1° |
| M2 Structured Data | CRÍTICA | ALTO | MEDIA | MEDIO | 2° |
| M3 Sitemap XML | CRÍTICA | MEDIO | BAJA | BAJO | 3° |
| M4 Cleanup console.log | ALTA | BAJO | BAJA | BAJO | 4° |
| M5 useDebounced DRY | ALTA | BAJO | BAJA | BAJO | 5° |
| M6 Migrar Hardcodeos | ALTA | MEDIO | MEDIA | MEDIO | 6° |
| M7 Breadcrumbs | ALTA | MEDIO | MEDIA | BAJO | 7° |
| M8 Modo Oscuro | MEDIA | ALTO | MEDIA | MEDIO | 8° |
| M9 Favoritos Sync | MEDIA | MEDIO | MEDIA | MEDIO | 9° |
| M10 Iconos Zodiaco | BAJA | BAJO | ALTA | BAJO | 10° |
| M11 Tests Integración | ALTA | ALTO | ALTA | MEDIO | 11° |
| M12 CI/CD Pipeline | ALTA | ALTO | MEDIA | BAJO | 12° |

---

*Blueprints generados a partir de: Auditoría Maestra, 7 informes de auditoría, 14 documentos FASE 1, 05_CONTRATOS_PROPUESTOS.md.*