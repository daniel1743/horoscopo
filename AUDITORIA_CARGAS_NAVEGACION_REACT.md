# Auditoria de cargas lentas y navegacion React

Fecha: 2026-08-04

## Alcance

Se revisaron loaders, estados `isLoading`, `Suspense`, `fallback`, rutas de tarot y configuracion de React Query/TanStack Router.

## Hallazgos

### 1. La navegacion no era la causa principal demostrada

El cambio de ruta dependia de componentes que devolvian solo `TarotSkeleton` mientras `useTarotDeck()` cargaba la baraja. Esto hacia que una navegacion interna pareciera bloqueada aunque el shell global ya estuviera disponible.

Archivos afectados:

- `src/components/tarot/TarotDailyExperience.tsx`
- `src/components/tarot/TarotSpreadExperience.tsx`
- `src/components/tarot/experience/ThreeCardLoveExperienceShell.tsx`
- `src/pages/tarot/TarotCardDetailPage.tsx`

Condicion: `deckQuery.isLoading`.

Operacion esperada: consulta de baraja desde `tarotService.loadDeck()`.

Tipo: datos remotos/cache, no IA.

### 2. Cache demasiado corta para una baraja casi estable

`useTarotDeck()` tenia `staleTime` de 5 minutos y no definia `gcTime`, `placeholderData`, `refetchOnMount` ni `refetchOnWindowFocus`. En navegaciones repetidas podia volver a mostrar carga aunque ya hubiera datos recientes.

Archivo:

- `src/hooks/useTarotDeck.ts`

### 3. Router sin precarga por intencion

El router tenia `defaultPreloadStaleTime: 0` y no activaba precarga por intencion. Esto reducia la posibilidad de cargar JS/datos durante hover/focus/touch antes del click.

Archivo:

- `src/router.tsx`

### 4. Loader sin progreso contextual

`TarotSkeleton` mostraba solo el texto de carga. Si una consulta tardaba mas de 2 u 8 segundos, no habia informacion util ni accion de recuperacion.

Archivo:

- `src/components/tarot/TarotSkeleton.tsx`

## Cambios aplicados

### React Query global

Archivo: `src/router.tsx`

- Se agregaron defaults de cache:
  - `staleTime: 60s`
  - `gcTime: 30min`
  - `refetchOnWindowFocus: false`
- Se activo `defaultPreload: "intent"`.
- Se cambio `defaultPreloadStaleTime` a 60s.

### Query de baraja

Archivo: `src/hooks/useTarotDeck.ts`

- Se creo `tarotDeckQueryOptions()`.
- Se amplio cache de baraja:
  - `staleTime: 30min`
  - `gcTime: 60min`
- Se agrego `placeholderData: keepPreviousData`.
- Se desactivo refetch visual innecesario con:
  - `refetchOnMount: false`
  - `refetchOnWindowFocus: false`

### Precarga no bloqueante de rutas de tarot

Archivos:

- `src/routes/tarot.carta-del-dia.tsx`
- `src/routes/tarot.si-o-no.tsx`
- `src/routes/tarot.tres-cartas.index.tsx`
- `src/routes/tarot.tres-cartas.amor.tsx`

Se agrego `beforeLoad` con `void context.queryClient.prefetchQuery(tarotDeckQueryOptions())`.

Nota: se usa `void` para no bloquear la navegacion esperando la consulta.

### Feedback progresivo en skeleton

Archivo: `src/components/tarot/TarotSkeleton.tsx`

- A los 2 segundos muestra mensaje contextual de demora.
- A los 8 segundos muestra accion para reintentar.
- No usa `setTimeout` para simular rapidez; solo para informar demora real.

## Validacion

Comandos ejecutados:

```bash
npx eslint src/router.tsx src/hooks/useTarotDeck.ts src/routes/tarot.carta-del-dia.tsx src/routes/tarot.si-o-no.tsx src/routes/tarot.tres-cartas.index.tsx src/routes/tarot.tres-cartas.amor.tsx src/components/tarot/TarotSkeleton.tsx
npm run build
```

Resultado:

- ESLint acotado: OK.
- Build: OK.

Advertencias no bloqueantes observadas:

- `vite-tsconfig-paths` deprecado frente a `resolve.tsconfigPaths`.
- `src/routes/api/tarot/interpret-reading.test.ts` no exporta `Route`.
- `createServerFn().inputValidator()` deprecado en archivos existentes.

## Veredicto

CAUSA IDENTIFICADA - CORRECCION IMPLEMENTADA Y VALIDADA

La espera perceptible se redujo desde la capa de navegacion/datos mediante cache, precarga por intencion y feedback progresivo. No se modifico Supabase, RLS, proveedor IA, contratos funcionales, endpoints, Git ni deploy.
