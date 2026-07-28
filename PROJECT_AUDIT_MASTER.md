# PROJECT_AUDIT_MASTER.md — Auditoría Maestra del Proyecto Astral

**Fecha de auditoría**: 28/07/2026
**Modo**: READ-ONLY — Cero modificaciones al código fuente
**Metodología**: Inspección de 282 archivos fuente, 5 subagentes paralelos, verificación contra 13 YAML de especificación + 6 documentos de setup

---

## RESUMEN EJECUTIVO

| Dimensión | Calificación | Estado |
|-----------|-------------|--------|
| Arquitectura general | **BUENA** | Respetada en un ~85% |
| Design System | **BUENA** | Centralizado, con fugas menores de hardcoding |
| Supabase / Seguridad | **EXCELENTE** | Sin secretos expuestos, RLS documentado, service_role aislado |
| Backend (servicios/repos) | **BUENA** | Patrón repositorio consistente, adaptadores presentes |
| CMS | **BUENA** | Sistema editorial unificado, admin con control de concurrencia |
| SEO | **REGULAR** | Meta tags centralizados pero faltan structured data, sitemap, breadcrumbs |
| Buscador | **BUENA** | FTS PostgreSQL bien diseñado, UI completa con ⌘K |
| Rendimiento | **POBRE** | CERO lazy loading en 54 rutas, bundle monolítico |
| Responsive | **BUENA** | Mobile-first general, drawer funcional, algunos overflow |
| Accesibilidad | **REGULAR** | ARIA básico presente, sin tests de contraste, narrativa por mejorar |
| Calidad del código | **BUENA** | 7 TODOs, 0 FIXME/HACK, lint config presente, scripts de verificación |
| Completitud vs especificación | **~75%** | Funcionalidades core presentes, features premium y advanced ausentes |

---

## HALLAZGOS PRINCIPALES (TOP 15)

### CRÍTICOS (DEBEN CORREGIRSE PRIMERO)

| # | Hallazgo | Riesgo | Evidencia |
|---|----------|--------|-----------|
| 1 | **CERO code-splitting** — 54 rutas con imports directos, bundle monolítico | HIGH | `src/routeTree.gen.ts` (1393 líneas, todos imports estáticos), `src/router.tsx` sin lazy loading |
| 2 | **Hook `useDebounced` duplicado** en 2 archivos | MEDIUM | `src/components/search/SearchDialog.tsx:25-32` y `src/routes/buscar.tsx:53-60` — código idéntico |
| 3 | **4 instancias de createClient** — no es singleton real | MEDIUM | `src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`, `client.ts:61-69` (lazy proxy) |
| 4 | **Sin structured data / JSON-LD** en ninguna página | HIGH | Búsqueda exhaustiva: 0 ocurrencias de `application/ld+json` o `schema.org` en todo src/ |
| 5 | **Sin sitemap.xml generado** — solo robots.txt estático | MEDIUM | `public/robots.txt` existe, ningún `sitemap.xml` en public/ ni generación dinámica |
| 6 | **Sin breadcrumbs** en ninguna ruta | MEDIUM | Búsqueda exhaustiva: 0 componentes de breadcrumb, 0 `breadcrumb` en aria-labels |
| 7 | **54 console.log** en código fuente — no eliminados para producción | LOW | Distribuidos en múltiples archivos de componentes y lib |

### IMPORTANTES (DEBEN ABORDARSE EN EL PRÓXIMO CICLO)

| # | Hallazgo | Riesgo | Evidencia |
|---|----------|--------|-----------|
| 8 | **Hardcoding de estilos**: colores, espaciados y bordes fuera del DS | MEDIUM | ~40+ ocurrencias de hexes, px values, shadows sin usar tokens (ver DESIGN_SYSTEM_AUDIT.md) |
| 9 | **Falta test suite de accesibilidad** — sin verificaciones de contraste WCAG | MEDIUM | 0 tests de a11y, 0 referencias a axe-core, pa11y o similares |
| 10 | **Modo oscuro preparado pero no activado** | LOW | Variable `--dark` en Tailwind existe, sin toggle en UI |
| 11 | **Componentes grandes**: 4 archivos >300 líneas | MEDIUM | `AdminArticlesPage` (~618), `TarotReadingPage`, `CompatibilityDetailPage`, `HoroscopeSignPage` |
| 12 | **Features desactivadas documentadas**: moonrise/moonset, moonZodiacSign | LOW | `src/config/moon.ts` — flags explícitamente en false, documentado en YAML 10 |
| 13 | **7 TODOs** sin resolver en código | LOW | Listados en PERFORMANCE_AUDIT.md |
| 14 | **Sin test suite de integración** para frontend | MEDIUM | 0 tests con Testing Library, Vitest o Playwright |

### OBSERVACIONES POSITIVAS

| # | Hallazgo | Evidencia |
|---|----------|-----------|
| 15 | **Excelente separación dato ↔ editorial** en sistema lunar | `src/server/moon/` (motor astronómico) vs `src/lib/moon/repository.ts` (contenido editorial) — contrato MoonEngine reemplazable |
| 16 | **Service role completamente aislado** — solo en server functions con dynamic import() | `src/integrations/supabase/client.server.ts` nunca se importa estáticamente desde cliente |
| 17 | **Validación de entrada con Zod** en todas las server functions | `src/lib/account/`, `src/lib/admin/`, `src/lib/search/` — Zod schemas en cada createServerFn |
| 18 | **Control de concurrencia optimista** en admin editorial | `src/lib/admin/articles.functions.ts` — version-based updates con double WHERE |

---

## ESTADO REAL DEL PROYECTO

### Porcentaje estimado de completitud: **~75%**

### Módulos COMPLETAMENTE TERMINADOS (95-100%)
- ✅ Design System base (tokens, tipografía, iconos, variantes CVA)
- ✅ Layout principal (Navbar, Footer, Drawer mobile)
- ✅ Sistema lunar (motor astronómico, calendario, fases, contenido editorial)
- ✅ Sistema de horóscopos (diario/semanal/mensual, 12 signos)
- ✅ Sistema de tarot (carta del día, 3 cartas, sí/no, mazo completo)
- ✅ Sistema editorial (artículos, categorías, autores, reading time)
- ✅ Buscador (FTS PostgreSQL, ⌘K dialog, página de resultados)
- ✅ Auth + Account (login, registro, perfil, reset password)
- ✅ Admin editorial (CRUD artículos con workflow drafts/published/archived)
- ✅ Compatibilidad de signos (pares A-B, todos los 78 pares)
- ✅ IA contextual (asistente con modo chat/reflection, rate limiting)

### Módulos PARCIALMENTE TERMINADOS (50-90%)
- ⚠️ SEO (meta tags centralizados, falta structured data/sitemap/breadcrumbs)
- ⚠️ Accesibilidad (ARIA básico, sin tests WCAG, sin screen reader testing)
- ⚠️ Rendimiento (sin lazy loading, sin code splitting, sin bundle analysis)
- ⚠️ Admin roles (sistema de roles definido, UI de gestión parcial)

### Módulos FALTANTES (0-20%)
- ❌ Modo oscuro (toggle de UI no implementado)
- ❌ Sitemap.xml dinámico
- ❌ Structured data / JSON-LD para rich snippets
- ❌ Tests end-to-end (Playwright/Cypress)
- ❌ Tests de integración frontend (Testing Library)
- ❌ CI/CD pipeline documentado
- ❌ Monitoreo de errores (más allá del error-capture básico)
- ❌ Analytics dashboard de admin
- ❌ Favoritos sincronizados (solo localStorage en useRecentSearches)
- ❌ Carta natal avanzada
- ❌ Informes PDF

---

## COMPARACIÓN CON LA ESPECIFICACIÓN (RESUMEN)

| YAML | Título | Fidelidad |
|------|--------|-----------|
| 01 | Design System + Home | **95%** — Tokens, tipografía, home editorial, iconos centralizados |
| 02 | Incremental | **90%** — Ajustes de layout y refinamientos |
| 03 | Layout | **90%** — Navbar/Footer/Drawer implementados |
| 04 | Home | **90%** — Secciones editoriales, zodíaco, categorías |
| 05 | Editorial | **95%** — CRUD unificado, autores, categorías, reading time |
| 06 | Horóscopos | **95%** — Diario/semanal/mensual, 12 signos, Supabase RLS |
| 07 | Tarot | **90%** — Carta del día, 3 cartas, sí/no, mazo completo |
| 08 | IA | **85%** — Asistente contextual, rate limiting, sin multi-step advanced |
| 09 | Cuenta | **80%** — Auth/profile completos, favoritos solo locales |
| 10 | Luna | **95%** — Motor astronómico, calendario, fases, editorial |
| 12 | Buscador | **95%** — FTS, ⌘K, sugerencias, historial local |
| 13 | Admin | **75%** — CRUD artículos completo, roles parcial, sin analytics |

### Lo que se OMITIÓ de la especificación
- Modo oscuro (YAML 01: "preparado pero no activado")
- Iconos personalizados de zodíaco/luna/tarot (YAML 01: "pendiente librería ilustrada propia")
- Orto/ocaso lunar y signo lunar zodiacal (YAML 10: explícitamente desactivados)
- Favoritos sincronizados con Supabase (YAML 09)
- Carta natal avanzada (mencionada como fuera de alcance en YAML 01)
- Analytics dashboard de admin (YAML 13)

### Lo que fue CAMBIADO respecto a la especificación
- No se detectaron desviaciones arquitectónicas significativas
- La arquitectura de capas (config → types → repositories → services → components → routes) se mantuvo consistente
- El patrón server functions de TanStack Start se adoptó correctamente

---

## ESTADO DE ARCHIVOS CLAVE POR CAPA

| Capa | Archivos | Estado |
|------|----------|--------|
| **Config** | 20 archivos en `src/config/` | ✅ Centralizado, feature flags, constantes |
| **Types** | 8 archivos en `src/types/` | ✅ Interfaces Zod + TS, bien definidos |
| **Design System** | 3 archivos en `src/design-system/` | ✅ Tokens, tipografía, variantes CVA |
| **Data** | 4 archivos en `src/data/` | ✅ Signos, tarot, categorías, home content |
| **Integrations** | 5 archivos en `src/integrations/supabase/` | ✅ Cliente, admin, middleware, types, storage |
| **Repositories** | 6 archivos en `src/repositories/` | ✅ Interfaz + implementación Supabase |
| **Services** | 5 archivos en `src/services/` | ✅ TanStack Query options centralizados |
| **Server** | `src/server/moon/` + `src/server/search/` | ✅ Server-only, bien aislado |
| **Lib** | 11 subdirectorios en `src/lib/` | ✅ Lógica de dominio por módulo |
| **Hooks** | 5 archivos en `src/hooks/` | ✅ Pequeños y enfocados (1 duplicación) |
| **Components** | ~80+ componentes | ✅ Organizados por dominio |
| **Routes** | 54 archivos en `src/routes/` | ✅ TanStack Router file-based |
| **UI Primitives** | 47 archivos en `src/components/ui/` | ✅ Shadcn + variantes propias |

---

## CONCLUSIÓN

El proyecto **Proyecto Astral** es un producto de **calidad media-alta** con una arquitectura bien pensada y mayormente bien ejecutada. La fidelidad a las especificaciones YAML es alta (~85-90% en features core). La deuda técnica es **moderada y manejable**.

**Lo más urgente**: Implementar code-splitting/lazy loading en las rutas y añadir structured data para SEO.

**Lo más valioso a largo plazo**: Activar el modo oscuro, completar los tests, y añadir sitemap.xml dinámico.

Para detalle completo de cada dimensión, consultar los 7 informes complementarios:
- `ARCHITECTURE_AUDIT.md`
- `DESIGN_SYSTEM_AUDIT.md`
- `SECURITY_AUDIT.md`
- `PERFORMANCE_AUDIT.md`
- `TECHNICAL_DEBT_REPORT.md`
- `IMPLEMENTATION_GAP_REPORT.md`
- `FINAL_PROJECT_STATUS.md`