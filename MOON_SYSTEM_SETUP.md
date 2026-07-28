# MOON_SYSTEM_SETUP.md

Guía para instalar y operar el sistema lunar de Proyecto Astral **fuera** de
Lovable (Supabase autogestionado + hosting propio como Vercel/Cloudflare).

## 1. Dependencias

```bash
npm install astronomy-engine     # MIT, 2.1.x
# El proyecto ya incluye @supabase/supabase-js, @tanstack/react-query,
# @tanstack/react-router y @tanstack/react-start.
```

## 2. Variables de entorno

| Variable | Ámbito | Uso |
| -------- | ------ | --- |
| `VITE_SUPABASE_URL` | cliente | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | cliente | anon key para RLS público |
| `SUPABASE_URL` | server | mismo valor en el runtime del server |
| `SUPABASE_SERVICE_ROLE_KEY` | server | requerido para escribir en `moon_calculation_cache` |

El motor astronómico **no** necesita ninguna API key.

## 3. Migración SQL

Aplica la migración `supabase/migrations/20240327000000_moon_system.sql`
usando la CLI oficial:

```bash
supabase migration up            # local
supabase db push                 # remoto
```

Crea:
- `public.moon_phase_content` (contenido editorial por fase, con RLS público
  para filas `published` y escritura restringida a `admin`/`editor`).
- `public.moon_calculation_cache` (server-only, sin políticas → solo
  `service_role` puede acceder; RLS bloquea el resto por diseño).
- Seed inicial: 8 fases publicadas marcadas como `is_demo=true`.

## 4. Test de precisión del motor

Antes de un release, ejecuta el runner portable:

```bash
bun run scripts/check-moon-accuracy.ts
# o, con Node:
npx tsx scripts/check-moon-accuracy.ts
```

Debe pasar las 11 comprobaciones (efemérides USNO ± 2 min, snapshot no NaN,
calendario mensual con 4 fases mayores).

## 5. Reemplazo del motor

Si necesitas usar otra librería (Meeus, NASA JPL, servicio remoto…):

1. Implementa `MoonEngine` (`src/server/moon/moon-engine.ts`).
2. Devuelve exactamente los tipos de `src/types/moon.ts`.
3. Cambia el import de `astronomyMoonEngine` en
   `src/lib/moon/moon.functions.ts`.
4. Añade fixtures adicionales si tu motor cambia el rango de precisión.
5. Vuelve a ejecutar el runner.

Ningún componente de UI toca el motor directamente.

## 6. Caché

La caché es opcional y aún **no** está activada en el pipeline: cada request
recalcula. Para activarla:

1. Añade `getSupabaseAdmin()` en `moon.functions.ts` mediante import dinámico
   (`await import('@/integrations/supabase/client.server')`).
2. Antes de calcular, llama `readCache` con `cache_key = engineVersion + '|' + tipo + '|' + rango + '|' + tz`.
3. Tras calcular, guarda con `writeCache` (`expires_at` = fin del día siguiente
   para snapshot, +7 días para calendario, +30 días para eventos).

La caché se auto-limpia mediante `expires_at`; para GC físico, programa un
`DELETE FROM moon_calculation_cache WHERE expires_at < now()` en pg_cron.

## 7. Zona horaria

`src/config/moon.ts` exporta `MOON_SITE_TIMEZONE = "Europe/Madrid"`.
Cambia a la zona objetivo del sitio; toda la agrupación por día y el
formateo de fechas se ajustan automáticamente.

## 8. Contenido editorial

Cualquier admin/editor puede reemplazar el contenido demo directamente en
`moon_phase_content`. Marca las filas curadas con `is_demo = false` cuando
estén listas; los avisos de "contenido de demostración" desaparecen
automáticamente.
