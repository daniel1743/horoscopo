# Plan para reactivar Horoscopo en Home

Fecha: 2026-08-05

## Veredicto actual

No conviene reactivar Horoscopo en Home todavia como funcion publica completa.

Evidencia consultada contra Supabase usando la misma clave publica que consume la app:

- `daily`: 0 publicaciones, 0 signos.
- `weekly`: 0 publicaciones, 0 signos.
- `monthly`: 0 publicaciones, 0 signos.

El codigo de Horoscopo existe, pero esta oculto por configuracion:

- `src/config/features.ts`: `horoscope: false`.
- `src/config/public-features.ts`: `horoscope: "hidden"`.
- Rutas `/horoscopo`, `/horoscopo/hoy`, `/horoscopo/semana`, `/horoscopo/mes` y `/horoscopo/:sign` bloquean con `notFound()` mientras la feature este oculta.

## Objetivo

Mostrar nuevamente en Home los 12 signos y Horoscopo diario, semanal y mensual, pero solo cuando exista contenido real y usable para no volver a exponer pantallas vacias.

## Lote 1 - Datos requeridos

Crear o publicar contenido real para los 12 signos:

- Diario: 12 filas para la fecha actual.
- Semanal: 12 filas para el lunes ISO de la semana actual.
- Mensual: 12 filas para el primer dia del mes actual.

Campos minimos por fila:

- `sign_slug`
- `period`
- `date_for`
- `summary`
- `focus`
- `mood`
- `energy`
- `published_at`

Campos recomendados:

- `love`
- `work`
- `wellbeing`
- `lucky_number`
- `lucky_color`
- `is_demo = false`

No usar el seed demo de produccion como contenido final. Existe `supabase/seed/horoscopes-demo.sql`, pero esta marcado como demostracion.

## Lote 2 - Auditoria automatica antes de activar

Agregar una comprobacion tecnica que diga si Horoscopo esta listo:

- `daily` tiene 12 signos publicados para `referenceDateFor("daily")`.
- `weekly` tiene 12 signos publicados para `referenceDateFor("weekly")`.
- `monthly` tiene 12 signos publicados para `referenceDateFor("monthly")`.
- Ninguna fila publicada requerida tiene `summary` vacio.
- Idealmente ninguna de esas filas tiene `is_demo = true`.

Resultado esperado:

- `horoscopeReady.daily = true`
- `horoscopeReady.weekly = true`
- `horoscopeReady.monthly = true`
- `horoscopeReady.all = true`

## Lote 3 - Reactivar superficie publica

Cuando los datos esten completos:

1. Cambiar `featureFlags.horoscope` a `true`.
2. Cambiar `publicFeatureVisibility.horoscope` a `enabled`.
3. Actualizar tests de `public-features`.
4. Confirmar que aparecen:
   - Menu desktop: Horoscopo con Hoy, Semana, Mes.
   - Drawer movil: Horoscopo.
   - Bottom nav: evaluar si vuelve Horoscopo o si se mantiene Inicio/Tarot/Luna.
   - Home: seccion de signos y/o Horoscopo de hoy.
   - Busqueda: filtro Horoscopos y signos.
   - Sitemap: rutas de Horoscopo.

## Lote 4 - Home

Reactivar de forma controlada:

- `zodiac_selector: true`
- `daily_insight: true` solo si `daily` esta completo.

Propuesta de Home:

1. Mantener hero principal enfocado en Tarot, Luna y Horoscopo si la cobertura esta completa.
2. Mostrar bloque "Horoscopo de hoy" con selector de signo.
3. Mostrar los 12 signos como acceso rapido.
4. Incluir CTAs claros:
   - `Leer horoscopo de hoy`
   - `Ver semana`
   - `Ver mes`

No mostrar semanal/mensual en Home si no hay cobertura completa.

## Lote 5 - Rutas y fallback

Las rutas ya estan implementadas:

- `/horoscopo`
- `/horoscopo/hoy`
- `/horoscopo/semana`
- `/horoscopo/mes`
- `/horoscopo/:sign?periodo=hoy|semana|mes`

Ajustes recomendados antes de exponer:

- Si falta una fila individual, mostrar estado editorial claro, no error tecnico.
- Si un periodo no tiene 12 signos, no indexar ese periodo.
- En pagina de signo, diferenciar claramente Diario, Semana y Mes.

## Lote 6 - SEO, sitemap y busqueda

Cuando `horoscopeReady.all` sea true:

- Reagregar `/horoscopo`, `/horoscopo/hoy`, `/horoscopo/semana`, `/horoscopo/mes` al sitemap.
- Reagregar rutas de los 12 signos.
- Rehabilitar documentos estaticos de signos en busqueda.
- Actualizar copy global de Home/SEO a "Tarot, luna y horoscopo".

## Validacion final

Ejecutar:

- Conteo Supabase por periodo.
- Smoke runtime de 12 signos.
- Smoke de `/horoscopo/hoy`, `/horoscopo/semana`, `/horoscopo/mes`.
- Tests de `public-features`.
- ESLint acotado.
- `npm run build`.
- Capturas mobile 375, 390, 430 y desktop 1440.

## Recomendacion

Primero cargar contenido real. Despues activar Horoscopo completo en un lote pequeno. Reactivarlo ahora expondria una funcion con 0 datos publicados y volveria a crear una experiencia vacia.
