# IMPLEMENTACION_YAML_10_LUNA.md

## Objetivo (YAML 10)
Sistema lunar completo: Luna de hoy, calendario mensual, próximas fases y
páginas editoriales de las ocho fases del ciclo. Datos astronómicos
provenientes de un motor validado, separados por completo del contenido
editorial. Portable fuera de Lovable: nada específico de Lovable Cloud.

## Arquitectura

```
src/
  types/moon.ts                       Contrato de dominio (MoonSnapshot, MoonCalendarDay, MoonPhaseEvent, MoonEditorialContent, MoonCacheEntry)
  config/
    moon.ts                           Registro central de fases, timezone, locale, rango del calendario, feature keys, formatos
    moon-science.ts                   Copy científico neutro (definiciones y distinción dato vs. símbolo)
  server/moon/
    moon-engine.ts                    Interfaz MoonEngine (contrato reemplazable)
    astronomy-moon-engine.ts          Implementación con astronomy-engine (MIT, v2.1.19)  ← SERVER-ONLY
    __fixtures__/known-phases.ts      Efemérides USNO / NASA para tests
    moon-engine.test.ts               Suite de precisión (11 comprobaciones)
  lib/moon/
    timezone.ts                       Utilidades Intl (client-safe, sin deps)
    format.ts                         Formateadores ES-Madrid centralizados
    repository.ts                     Contenido editorial (Supabase, RLS público)
    cache.repository.ts               Caché server-only (service_role)
    moon.functions.ts                 createServerFn: getMoonToday, getMoonCalendar, getUpcomingMoonEvents
  services/moon.service.ts            queryOptions únicos para la UI (moonQueries.today, calendar, upcoming, contentByPhase, allContent)
  components/moon/
    MoonPhaseVisual.tsx               SVG neutro (proporciones respetadas)
    MoonTodayCard.tsx                 Tarjeta Luna de hoy (compact / full)
    NextMoonPhases.tsx                Lista de próximos eventos mayores
    MoonMonthNavigation.tsx           Navegación mes anterior/siguiente
    MoonCalendar.tsx                  Cuadrícula + Dialog por día
    MoonPhaseGrid.tsx                 Grid de las 8 fases
    MoonScientificFacts.tsx           Cuatro definiciones neutras
    MoonDisclaimer.tsx                Aviso de distinción dato/símbolo
    MoonSkeleton.tsx                  Estados de carga (today, calendar)
    MoonUnavailableState.tsx          Fallback cuando falla el motor
  routes/
    luna.tsx                          /luna (hub)
    luna.hoy.tsx                      /luna/hoy
    luna.calendario.tsx               /luna/calendario  → redirect al mes actual
    luna.calendario.$ym.tsx           /luna/calendario/YYYY-MM
    luna.fases.tsx                    /luna/fases (índice)
    luna.fases.$slug.tsx              /luna/fases/[slug]
  components/home/MoonTodaySection.tsx  Home: reemplaza mock por servicio real
  components/SectionErrorBoundary.tsx   ErrorBoundary reutilizable (Suspense-safe)
scripts/check-moon-accuracy.ts        Runner portable: `bun run scripts/check-moon-accuracy.ts`
supabase/migrations/20240327... .sql  Tablas moon_phase_content + moon_calculation_cache + seed
```

## Motor astronómico
- **Librería**: [`astronomy-engine`](https://github.com/cosinekitty/astronomy) 2.1.19, MIT.
- **Precisión declarada por el autor**: longitudes eclípticas de la Luna ≤ 1' arc (≈ 0.017°).
- **Precisión verificada aquí** contra efemérides USNO (11 comprobaciones):
  - Búsqueda de fases mayores 2000–2025: Δ ≤ 1.2 minutos en todas las muestras.
  - Snapshot consistente en fechas arbitrarias.
  - Calendario mensual: 31 días y 4 eventos mayores para enero 2024.
- **Limitaciones documentadas**:
  - Cálculos geocéntricos (sin corrección topocéntrica por ubicación del observador).
  - No calcula orto/ocaso lunar → feature `moonriseMoonset` desactivada.
  - No calcula signo lunar zodiacal → feature `moonZodiacSign` desactivada.
- **Reemplazable**: cualquier implementación que cumpla `MoonEngine` (ver
  `src/server/moon/moon-engine.ts`) puede sustituirla sin tocar la UI.

## Separación dato ↔ editorial
| Plano | Origen | Se puede publicar libremente | Se puede reformular |
| ----- | ------ | --------------------------- | ------------------- |
| Astronómico | `astronomyMoonEngine` (server-only) | Sí | No, es dato |
| Editorial | `moon_phase_content` (Supabase, RLS público) | Solo `published` | Sí |
| Caché | `moon_calculation_cache` (server-only) | No | No |

Ningún componente hace clasificación local de fases, cálculos astronómicos ni
inventa fechas. Todo pasa por `moonQueries.*`.

## Timezone y calendario
- Zona central del sitio: `Europe/Madrid` (definida en `src/config/moon.ts` y
  reutilizada por `siteConfig.timezone`).
- Los días del calendario se agrupan por el día civil en esa zona, calculado
  con `Intl.DateTimeFormat` (portable, sin deps).
- Rango soportado: `hoy ± 10 años`. URLs canónicas: `/luna/calendario/YYYY-MM`.
- `/luna/calendario` redirige al mes actual (misma zona).

## Datos generados/persistidos
- Cliente: solo cachea (React Query) `snapshot`, `calendar` mensual,
  `eventos próximos`, y `contenido editorial`.
- Supabase: `moon_phase_content` con contenido demo publicado para las 8
  fases (marcado `is_demo=true`).
- Nada de datos del visitante se almacena. La caché de cálculos es
  server-only y no contiene información personal.

## Accesibilidad y responsive
- Navegación por teclado en calendario (`role="grid"`, cada día es `<button>`).
- Diálogo Radix por día con `DialogTitle`/`DialogDescription`.
- SVG lunar `role="img"` con `aria-label` que incluye porcentaje de iluminación.
- Layouts diseñados desde 320 px (grid 7 columnas, tarjetas apilables).

## IA y favoritos
- La página de fase incluye un `ContextualAiButton` (modo `reflection`,
  contexto `none`) para ampliar la lectura simbólica.
- Los flags `moonAiExplanation`, `moonFavorites` y `moonHistory` en
  `config/moon.ts` apuntan a los flags globales (`aiAssistant`,
  `accountBasic`). Cambios de política se hacen desde un solo sitio.

## Validaciones realizadas
- `bun run scripts/check-moon-accuracy.ts` → **11/11 pasan**, Δ ≤ 1.2 min.
- `bun x tsgo --noEmit` → sin errores.
- `bun run build:dev` → build cliente + SSR ok.
- `curl /luna/hoy`, `/luna/calendario/2026-01`, `/luna/fases/luna-llena` → 200 OK.
- Centralización: se mantienen los mismos patrones (`rounded-[var(--radius-card)]`)
  que el resto del proyecto; sin nuevos hex ni imports directos de lucide.

## Estructura congelada
Las interfaces (`MoonEngine`, `MoonSnapshot`, `MoonCalendarDay`,
`MoonEditorialContent`) constituyen el contrato inmutable del sistema
lunar. Cualquier cambio requiere una nueva iteración documentada.
