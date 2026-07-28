# PERFORMANCE_AUDIT.md — Auditoría de Rendimiento

**Proyecto**: Proyecto Astral
**Fecha**: 28/07/2026

---

## 1. BUNDLE SPLITTING Y LAZY LOADING

### Hallazgo crítico: CERO code-splitting

| Aspecto | Estado | Evidencia |
|---------|--------|-----------|
| Lazy loading de rutas | ❌ 0% | `src/routeTree.gen.ts` — 1393 líneas, todos imports estáticos |
| React.lazy() | ❌ No usado | Búsqueda exhaustiva: 0 ocurrencias |
| Dynamic import() para rutas | ❌ No usado | 54 rutas con imports directos |
| Suspense boundaries | ⚠️ Mínimo | Solo `SectionErrorBoundary` (no afecta bundle splitting) |

**Evidencia concreta**:
- `src/router.tsx` (16 líneas): Sin `lazyRouteComponent`, sin `routeOptions` con lazy loading
- `src/routeTree.gen.ts`: Todos los imports son estáticos (`import { Route as XRouteImport } from '...'`)

**Impacto**: El bundle inicial incluye TODAS las ~50+ páginas del sitio. Esto afecta:
- Time-to-Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)

**Solución recomendada**: Usar `lazyRouteComponent` de TanStack Router para cargar rutas bajo demanda.

---

## 2. RENDERIZADOS INNECESARIOS

### React.memo() y memoización

| Técnica | Uso | Cantidad |
|---------|-----|----------|
| `React.memo()` | Poco usado | ~3 ocurrencias en componentes home |
| `useMemo()` | Uso moderado | ~15 ocurrencias en componentes de datos |
| `useCallback()` | Uso moderado | ~20 ocurrencias (event handlers, callbacks) |
| `useEffect()` | Uso controlado | ~30 ocurrencias (principalmente data fetching y suscripciones) |

### Componentes que podrían beneficiarse de memoización

| Componente | Archivo | Motivo |
|------------|---------|--------|
| MoonCalendar | `src/components/moon/MoonCalendar.tsx` | Grid 7×n celdas, se renderiza cada vez que cambia el mes |
| TarotCardGrid | Componentes tarot | 78 cartas en grid, renderizado completo en cada filtro |
| ZodiacGrid | `src/components/home/` | 12 signos, renderizado estático, podría ser memo |
| SearchResults | `src/components/search/` | Resultados de búsqueda que no cambian frecuentemente |

**Evaluación**: La memoización existente es razonable para el tamaño del proyecto. No hay abuso de `useMemo`/`useCallback`, pero algunos componentes de grids grandes se beneficiarían de `React.memo`.

---

## 3. CÓDIGO MUERTO Y ARCHIVOS ABANDONADOS

### Posible código legacy

| Ubicación | Motivo | Riesgo |
|-----------|--------|--------|
| `src/pages/HomePage.tsx` | Posiblemente redundante con `src/routes/index.tsx` | LOW |
| `src/pages/` subdirectorios | Misma estructura que `src/routes/` | LOW |

**Verificación necesaria**: Comprobar si `src/pages/` es importado desde algún lugar. Si no, es código muerto que infla el bundle.

### Imports sin uso

No se pudo realizar análisis estático completo de imports sin usar (requiere IDE o eslint --rule). El proyecto tiene ESLint configurado con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`, pero no `eslint-plugin-unused-imports`.

---

## 4. DEPENDENCIAS Y TAMAÑO DE BUNDLE

### Dependencias más pesadas (estimado)

| Dependencia | Tamaño estimado | Uso |
|-------------|----------------|-----|
| recharts | ~500KB | Gráficos en admin (solo admin, pero en bundle principal) |
| @supabase/supabase-js | ~200KB | Core |
| lucide-react | ~150KB (tree-shakeable) | Iconos |
| date-fns | ~100KB (tree-shakeable) | Fechas |
| astronomy-engine | ~80KB | Solo sistema lunar (server-side, no debería ir al cliente) |
| react-day-picker | ~60KB | Calendario admin |
| embla-carousel-react | ~30KB | Carruseles |
| zod | ~20KB | Validación |
| @tanstack/react-query | ~20KB | Data fetching |
| @tanstack/react-router | ~25KB | Router |

### Preocupaciones

| Dependencia | Problema | Solución |
|-------------|----------|----------|
| recharts (500KB) | Solo se usa en admin dashboard | Debería ser lazy-loaded (ruta admin) |
| astronomy-engine (80KB) | Es server-only, ¿se está incluyendo en bundle? | Verificar tree-shaking / server-only boundary |
| react-day-picker (60KB) | Solo admin | Lazy-load con ruta admin |
| embla-carousel-react | Solo home | Podría ser lazy-loaded |

**Sin bundle analysis ejecutado** — se recomienda `vite build --debug` o `rollup-plugin-visualizer` para verificar tamaños reales.

---

## 5. ESTRATEGIA DE CACHING

### React Query caching

| Aspecto | Configuración | Evidencia |
|---------|--------------|-----------|
| staleTime | Varía por query (30s a 5min) | `src/services/*.service.ts` |
| gcTime | Default (5 min) | No sobrescrito |
| retry | Configurado por query | `useAdminRoles.ts: retry: false` |
| refetchOnWindowFocus | Default (true) | No sobrescrito |

### Caché de server functions

- Sistema lunar: `moon_calculation_cache` en Supabase
- Search: Índice FTS materializado en `search_documents`

**Evaluación**: ✅ Estrategia de caching razonable. Sin abuso de refetching innecesario.

---

## 6. IMÁGENES Y ASSETS

### Optimización de imágenes

| Aspecto | Estado |
|---------|--------|
| Lazy loading de imágenes | ⚠️ Parcial — sin atributo `loading="lazy"` generalizado |
| WebP/AVIF | ❓ No verificado |
| Imágenes responsivas (srcset) | ❓ No verificado |
| Image CDN | ❌ No implementado |

### Iconos

- lucide-react con tree-shaking ✅
- Sin imports masivos de todos los iconos ✅
- Verificado con `scripts/check-direct-icon-imports.ts` ✅

---

## 7. CONSOLE.LOG EN PRODUCCIÓN

### Cantidad detectada: **54 ocurrencias**

Estas llamadas a `console.log` están distribuidas en:
- Componentes de UI (debugging de renderizado)
- Server functions (debugging de datos)
- Hooks (debugging de estado)
- Servicios (debugging de queries)

**Impacto**: En producción, `console.log` puede:
- Ralentizar rendimiento en ciclos de renderizado
- Filtrar datos sensibles en logs del navegador
- Aumentar ruido en herramientas de monitoreo

**Recomendación**: Eliminar todos los `console.log` o usar un wrapper condicional (`if (import.meta.env.DEV)`) o un logger como `pino`/`winston` server-side.

---

## 8. FUENTES Y TIPOGRAFÍA

### Carga de fuentes

| Fuente | Método | Impacto |
|--------|--------|---------|
| Fraunces | Google Fonts `<link>` en `__root.tsx` | Bloquea renderizado parcialmente |
| Manrope | Google Fonts `<link>` en `__root.tsx` | Bloquea renderizado parcialmente |

**Preocupación**: Google Fonts carga desde dominio externo (fonts.googleapis.com, fonts.gstatic.com). Para producción:
- Usar `@fontsource-*` self-hosted (documentado como opción en YAML 01)
- Añadir `font-display: swap` para evitar FOIT (Flash of Invisible Text)

---

## 9. ARQUITECTURA SSR

### TanStack Start + Nitro

- SSR habilitado por defecto
- `src/server.ts` configura el servidor Nitro
- Server functions se ejecutan en el servidor (no en el cliente)

**Evaluación**: ✅ SSR correctamente configurado. Las server functions reducen la carga del cliente.

---

## 10. ESTADO DE CARGA Y SKELETONS

| Módulo | Skeleton | Estado |
|--------|----------|--------|
| Horóscopos | ✅ | `HoroscopeSkeleton` |
| Tarot | ✅ | `TarotSkeleton` |
| Luna | ✅ | `MoonSkeleton` (today, calendar) |
| Editorial | ✅ | `ArticleSkeleton` |
| Búsqueda | ✅ | Estado de carga en SearchDialog |
| Home | ⚠️ | Sin skeleton claro |

**Evaluación**: ✅ Buena cobertura de skeletons para evitar layout shift (CLS).

---

## 11. RESUMEN DE MÉTRICAS DE RENDIMIENTO

| Métrica | Estado | Nota |
|---------|--------|------|
| Code-splitting | ❌ POBRE | 0% de rutas con lazy loading |
| Memoización | ⚠️ REGULAR | Uso moderado, grids grandes sin memo |
| Código muerto | ⚠️ REGULAR | `src/pages/` posiblemente legacy |
| Bundle size | ❓ DESCONOCIDO | Sin análisis de bundle |
| Caching | ✅ BUENO | React Query + caché server |
| Imágenes | ⚠️ REGULAR | Sin lazy loading generalizado |
| Fuentes | ⚠️ REGULAR | Google Fonts externo, sin swap explícito |
| Skeletons | ✅ BUENO | Cobertura en módulos principales |
| console.log | ⚠️ REGULAR | 54 ocurrencias en producción |

---

## 12. RECOMENDACIONES PRIORIZADAS

| Prioridad | Acción | Impacto estimado |
|-----------|--------|-----------------|
| **P0** | Implementar lazy loading en rutas con `lazyRouteComponent` | Reduce bundle inicial ~60-70% |
| **P1** | Ejecutar bundle analysis (`rollup-plugin-visualizer`) | Identifica dependencias pesadas |
| **P1** | Lazy-load recharts (solo admin), astronomy-engine (server-only check) | Reduce ~580KB |
| **P2** | Eliminar 54 `console.log` o wrapper condicional | Cleanup + seguridad |
| **P2** | Migrar fuentes a self-hosted (`@fontsource-*`) | Elimina dependencia externa |
| **P3** | Añadir `React.memo` a grids grandes (MoonCalendar, TarotGrid, ZodiacGrid) | Reduce re-renders |
| **P3** | Verificar y eliminar `src/pages/` si es código muerto | Reduce bundle |

---

## 13. CONCLUSIÓN DE RENDIMIENTO

### Calificación general: **POBRE (45/100)**

**El principal problema es la ausencia total de code-splitting.** Con 54 rutas cargadas estáticamente en el bundle inicial, el Time-to-Interactive se ve gravemente afectado. Este es el hallazgo más crítico de toda la auditoría.

**Lo positivo**: La arquitectura de server functions de TanStack Start ayuda a mantener la lógica pesada fuera del cliente. El caching con React Query está bien configurado. Los skeletons existen para los módulos principales.

**La corrección del code-splitting es la acción #1 prioritaria para este proyecto.**