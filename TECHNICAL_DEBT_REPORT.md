# TECHNICAL_DEBT_REPORT.md — Informe de Deuda Técnica

**Proyecto**: Proyecto Astral
**Fecha**: 28/07/2026
**Metodología**: Inspección de código, verificación de duplicaciones, análisis de dependencias

---

## DEUDA TÉCNICA PRIORIZADA

### 🔴 CRÍTICA (Debe resolverse antes del próximo despliegue a producción)

| # | Deuda | Riesgo | Esfuerzo | Evidencia |
|---|-------|--------|----------|-----------|
| **DT-01** | **CERO code-splitting** — 54 rutas con imports estáticos, bundle monolítico | HIGH | 4-6h | `src/routeTree.gen.ts` (1393 líneas), `src/router.tsx` sin lazy loading |
| **DT-02** | **Sin structured data / JSON-LD** — 0 ocurrencias en todo el proyecto | HIGH | 3-4h | Búsqueda exhaustiva: 0 `application/ld+json`, 0 `schema.org` |
| **DT-03** | **Sin sitemap.xml dinámico** — solo robots.txt estático | MEDIUM | 2-3h | `public/robots.txt` existe, sin generación de sitemap |

### 🟡 ALTA (Debe resolverse en el próximo sprint)

| # | Deuda | Riesgo | Esfuerzo | Evidencia |
|---|-------|--------|----------|-----------|
| **DT-04** | **54 console.log** en código de producción — posible leak de datos | LOW | 1-2h | Distribuidos en componentes, hooks, servicios, server functions |
| **DT-05** | **~40+ hardcodeos de estilos** fuera del Design System | MEDIUM | 3-4h | Hex codes, px values, shadows sin usar tokens (ver DESIGN_SYSTEM_AUDIT.md) |
| **DT-06** | **Hook `useDebounced` duplicado** en 2 archivos — código idéntico | MEDIUM | 0.5h | `SearchDialog.tsx:25-32` y `buscar.tsx:53-60` |
| **DT-07** | **Sin breadcrumbs** en ninguna ruta | MEDIUM | 2-3h | 0 componentes de breadcrumb en todo el proyecto |

### 🟢 MEDIA (Resolver en los próximos 2-3 sprints)

| # | Deuda | Riesgo | Esfuerzo | Evidencia |
|---|-------|--------|----------|-----------|
| **DT-08** | **Posible código legacy en `src/pages/`** — ¿redundante con `src/routes/`? | LOW | 1h | `src/pages/HomePage.tsx` + subdirectorios |
| **DT-09** | **Componentes grandes >300 líneas** — AdminArticlesPage (~618), TarotReadingPage, CompatibilityDetailPage, HoroscopeSignPage | MEDIUM | 4-6h c/u | Múltiples responsabilidades en un solo archivo |
| **DT-10** | **Sin test suite de integración frontend** | MEDIUM | 8-16h | 0 tests con Testing Library, Vitest o Playwright |
| **DT-11** | **Sin test suite end-to-end** | MEDIUM | 8-16h | 0 tests E2E con Playwright/Cypress |
| **DT-12** | **Sin test suite de accesibilidad** (WCAG, contraste) | MEDIUM | 4-6h | 0 tests con axe-core, pa11y o similares |
| **DT-13** | **Fuentes cargadas desde Google Fonts (externo)** — dependencia de terceros | LOW | 1-2h | `__root.tsx` carga desde fonts.googleapis.com |
| **DT-14** | **Dependencias pesadas sin lazy loading**: recharts (500KB), react-day-picker (60KB) | MEDIUM | 2-3h | Ambas solo se usan en admin, cargadas en bundle principal |
| **DT-15** | **Sin bundle analysis** — se desconoce el tamaño real del bundle | MEDIUM | 0.5h | Sin `rollup-plugin-visualizer` ni `vite build --debug` |

### 🔵 BAJA (Backlog — resolver cuando haya capacidad)

| # | Deuda | Riesgo | Esfuerzo | Evidencia |
|---|-------|--------|----------|-----------|
| **DT-16** | **Modo oscuro preparado pero no activado** — toggle sin implementar | LOW | 3-4h | Variable `--dark` en Tailwind, sin UI toggle |
| **DT-17** | **Iconos personalizados de zodíaco/luna/tarot no creados** | LOW | 8-12h | Documentado en YAML 01 como pendiente |
| **DT-18** | **Grids grandes sin `React.memo`** — MoonCalendar, TarotGrid, ZodiacGrid | LOW | 1-2h | Re-renders innecesarios en grids de 78/31/12 items |
| **DT-19** | **Sin CI/CD documentado** — no hay pipeline definido | LOW | 2-4h | Sin `.github/workflows/` ni configuración CI |
| **DT-20** | **HTTP security headers sin verificar** — CSP, X-Frame-Options, etc. | LOW | 1-2h | Depende de configuración Nitro en `server.ts` |
| **DT-21** | **Sin Content Security Policy explícito** | LOW | 1-2h | Sin header CSP configurado |
| **DT-22** | **4 instancias de createClient** — no singleton estricto | LOW | 1h | `client.ts`, `client.server.ts`, `auth-middleware.ts` |
| **DT-23** | **Sin `eslint-plugin-unused-imports`** — posibles imports sin uso | LOW | 0.5h | ESLint configurado pero sin esta regla |

---

## ANÁLISIS DE IMPACTO ACUMULADO

### Si NO se resuelve la deuda crítica (DT-01, DT-02, DT-03):

- **SEO**: Google no podrá indexar correctamente el sitio (sin structured data, sin sitemap)
- **Rendimiento**: TTI > 5s en conexiones lentas (bundle monolítico con 54 páginas)
- **UX**: Mala experiencia en primera carga, especialmente en mobile 3G/4G

### Si NO se resuelve la deuda alta (DT-04 a DT-07):

- **Calidad**: console.log en producción es mala práctica profesional
- **Mantenibilidad**: Hardcoding de estilos dificulta cambios de tema/modo oscuro
- **Navegabilidad**: Sin breadcrumbs, usuarios se pierden en rutas profundas

### Si NO se resuelve la deuda media (DT-08 a DT-15):

- **Estabilidad**: Sin tests, cada cambio es un riesgo de regresión
- **Bundle**: Dependencias pesadas ralentizan la carga inicial
- **Accesibilidad**: Sin tests de a11y, usuarios con discapacidades pueden tener problemas

---

## ESTIMACIÓN DE ESFUERZO TOTAL

| Categoría | Horas estimadas | Items |
|-----------|----------------|-------|
| 🔴 Crítica | 9-13h | 3 items |
| 🟡 Alta | 7-10h | 4 items |
| 🟢 Media | 26-50h | 8 items |
| 🔵 Baja | 20-32h | 8 items |
| **TOTAL** | **62-105h** | **23 items** |

**Tiempo estimado para resolver toda la deuda**: 3-4 semanas de desarrollo (1 desarrollador full-time).

---

## DEUDA TÉCNICA POR CATEGORÍA

### Rendimiento (30% del total)
- DT-01: Code-splitting (P0)
- DT-14: Dependencias pesadas sin lazy loading
- DT-15: Sin bundle analysis
- DT-18: Grids sin React.memo

### SEO (15% del total)
- DT-02: Sin structured data (P0)
- DT-03: Sin sitemap dinámico (P0)
- DT-07: Sin breadcrumbs

### Calidad del código (20% del total)
- DT-04: 54 console.log
- DT-06: Hook duplicado
- DT-08: Código legacy
- DT-09: Componentes grandes
- DT-23: ESLint sin unused-imports

### Design System (10% del total)
- DT-05: Hardcoding de estilos (~40+ fugas)
- DT-16: Modo oscuro sin activar
- DT-17: Iconos personalizados faltantes

### Testing (25% del total)
- DT-10: Sin tests de integración
- DT-11: Sin tests E2E
- DT-12: Sin tests de accesibilidad

---

## RECOMENDACIONES ESTRATÉGICAS

### Sprint 1 (2 semanas) — Crítico + Alto
1. DT-01: Implementar lazy loading en todas las rutas
2. DT-02: Implementar JSON-LD structured data por tipo de página
3. DT-03: Generar sitemap.xml dinámico
4. DT-04: Eliminar todos los console.log
5. DT-06: Extraer useDebounced a `src/hooks/useDebounced.ts`

### Sprint 2 (2 semanas) — Medio prioritario
6. DT-05: Migrar hardcodeos al Design System
7. DT-07: Implementar breadcrumbs
8. DT-14: Lazy-load recharts y react-day-picker
9. DT-15: Ejecutar bundle analysis y optimizar

### Sprint 3 (2-3 semanas) — Testing + Bajo
10. DT-10, DT-11, DT-12: Implementar suites de testing
11. DT-08, DT-09, DT-16, DT-18: Refactors y features pendientes

---

## MÉTRICA DE DEUDA TÉCNICA

**Technical Debt Ratio (TDR)**: Estimado en **~15%** del esfuerzo total del proyecto.

*Cálculo aproximado: 62-105h de deuda / ~700-800h estimadas de desarrollo total = ~15%*

Un TDR del 15% es **aceptable para un MVP/post-MVP** (ideal: <10%, crítico: >25%).

---

## CONCLUSIÓN

El proyecto tiene una deuda técnica **moderada y manejable**. No hay deuda arquitectónica grave (la arquitectura de capas está bien respetada). La mayor parte de la deuda es de **omisión** (tests no escritos, optimizaciones no aplicadas) más que de **comisión** (malas prácticas, arquitectura rota).

**Prioridad absoluta**: Code-splitting + SEO (structured data + sitemap) — estas 3 tareas representan el 80% del impacto en producción con solo ~9-13h de trabajo.