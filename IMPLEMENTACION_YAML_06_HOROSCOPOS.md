# YAML 06 — Sistema de horóscopos y signos (congelado)

Sistema diario/semanal/mensual para los doce signos. Supabase es la única
fuente de verdad para las publicaciones; los signos siguen viviendo en
`src/data/zodiac-signs.ts`. Implementación 100% portable: solo
`@supabase/supabase-js` estándar y variables `VITE_SUPABASE_*`.

## Base de datos

Migración: `supabase/migrations/*_horoscopes.sql`.

- Enum `public.horoscope_period` (`daily`, `weekly`, `monthly`).
- Tabla `public.horoscopes`:
  - `sign_slug`, `period`, `date_for` (unique juntos).
  - `summary`, `focus`, `mood`, `energy` (1–5 CHECK).
  - `love`, `work`, `wellbeing`, `lucky_number`, `lucky_color`.
  - `is_demo`, `published_at`, `created_at`, `updated_at`.
- Índices: `(sign_slug, period, date_for DESC)`, `(period, date_for DESC)`, `(published_at DESC)`.
- Trigger `set_updated_at` reutilizado.

### RLS

- Lectura pública: solo filas con `published_at IS NOT NULL AND published_at <= now()` (anon + authenticated).
- Lectura y escritura completas: roles `admin` / `editor` a través de `public.has_role`.
- Escritura pública: bloqueada.
- Sin exposición de `service_role` al cliente.

### Seed de demostración

- Archivo versionado: `supabase/seed/horoscopes-demo.sql`.
- 12 entradas `daily` para `CURRENT_DATE`, `is_demo = true`.
- `ON CONFLICT (sign_slug, period, date_for) DO NOTHING`.
- No se ejecuta automáticamente en producción; correr a mano en dev.

## Capa TypeScript

- Tipos: `src/types/horoscope.ts` (`HoroscopePeriod`, `HoroscopeEntry`).
- Config central: `src/config/horoscope.ts`
  - `horoscopePeriods`, `getPeriodByKey`, `getPeriodBySlug`, `signHoroscopePath`.
  - Utilidades deterministas: `toDateKey`, `startOfIsoWeek`, `startOfMonth`, `referenceDateFor`, `formatPeriodLabel`.
- Repositorio: `src/lib/horoscope/repository.ts` (única capa que habla con Supabase).
  - `getLatestHoroscope`, `getHoroscopeForDate`, `listHoroscopesForCurrentPeriod`, `listRecentHoroscopes`.
  - Nunca consultado directamente desde componentes; se accede vía loader o `useQuery`.

## Rutas y páginas

Se retiró el placeholder `src/routes/horoscopo.tsx`. Nuevas rutas planas:

| Ruta | Archivo | Página |
| --- | --- | --- |
| `/horoscopo` | `src/routes/horoscopo.index.tsx` | `HoroscopeHubPage` |
| `/horoscopo/hoy` | `src/routes/horoscopo.hoy.tsx` | `HoroscopePeriodPage period="daily"` |
| `/horoscopo/semana` | `src/routes/horoscopo.semana.tsx` | `HoroscopePeriodPage period="weekly"` |
| `/horoscopo/mes` | `src/routes/horoscopo.mes.tsx` | `HoroscopePeriodPage period="monthly"` |
| `/horoscopo/$sign` | `src/routes/horoscopo.$sign.tsx` | `SignHoroscopePage` (search `?periodo=hoy\|semana\|mes`) |

Todas las rutas:
- SEO con `buildMeta` central.
- `errorComponent` y (donde aplica) `notFoundComponent`.
- Loader que llama al repositorio; los componentes no tocan Supabase.

## Componentes

Reutilizados: `PageShell`, `PageHeader`, `Container`, `Icon`, `Button`, breadcrumbs, footer, AppShell.

Nuevos, exclusivos del módulo:
- `src/components/horoscope/HoroscopeCard.tsx`
- `src/components/horoscope/HoroscopePeriodTabs.tsx`
- `src/components/horoscope/SignQuickSelector.tsx`

Home:
- `DailyHoroscopeCard` ahora usa `useQuery` + `getLatestHoroscope` como fuente real; si Supabase no devuelve nada, cae con gracia al mock de `home-content`.
- El CTA enlaza a `zodiacRoute(signSlug)` en lugar de la vista global.
- No se rediseñó ninguna otra sección de la Home.

## Estados soportados

- Loading: mientras el loader resuelve; en Home, el mock actúa como fallback.
- Empty: mensaje editorial en tarjetas y detalle si no hay publicación.
- Error: `errorComponent` centralizado por ruta.
- 404: `notFoundComponent` en `/horoscopo/$sign` para slugs inexistentes.

## Portabilidad (Vercel u otro host)

1. Copiar `.env.example` a `.env` y definir:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
2. Aplicar migraciones: `supabase db push` o `psql < supabase/migrations/*.sql`.
3. (Opcional dev) `psql -f supabase/seed/horoscopes-demo.sql`.
4. `npm install && npm run build`.
5. Desplegar `dist/` como cualquier app TanStack Start.

No se usan Edge Functions ni ninguna primitiva exclusiva de Lovable Cloud.

## Validación ejecutada

- `npx tsgo --noEmit` — 0 errores.
- `npm run lint` — 0 errores (6 warnings pre-existentes de shadcn).
- `npm run build` — OK.
- `npm run check:centralization` — sin regresiones (mismos warnings tolerados que en YAML 05).
- Smoke test HTTP: `/horoscopo`, `/horoscopo/hoy`, `/horoscopo/semana`, `/horoscopo/mes`, `/horoscopo/aries`, `/horoscopo/aries?periodo=semana` responden 200.

## Congelación

- No modificar tokens, tipografías, AppShell, navbar, footer, editorial, tarot, luna o compatibilidad.
- Toda mutación del contenido de horóscopos pasa por Supabase (admin/editor), nunca por el cliente público.
- Nuevas vistas deben consumir `src/lib/horoscope/repository.ts`; los componentes no importan `@/integrations/supabase/client` directamente.
- Cambios de esquema exigen nueva migración versionada + actualización de tipos y repositorio en el mismo commit.
