# Diagnostico /api/tarot/interpret 500

Fecha: 2026-08-02

## Veredicto

CORRECCION REQUERIDA - CAUSA AUN NO DEMOSTRADA

No se pudo leer el log completo de la funcion en produccion desde este entorno. Por eso no queda demostrado el origen exacto del 500 productivo con stack trace, archivo, funcion y linea.

## Evidencia confirmada

- El endpoint `POST /api/tarot/interpret` ejecuta el flujo en este orden: parseo, validacion, safety check, auth opcional, cuota, consulta de carta, conversacion, prompt, proveedor IA, parseo IA, fallback.
- La cuota se ejecuta antes de consultar la carta.
- La cuota usa `ai_usage_daily` mediante `supabaseAdmin`, por lo que depende de `SUPABASE_SERVICE_ROLE_KEY`.
- `supabaseAdmin` se inicializa de forma diferida al consumir el cliente admin; si falta `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY`, falla durante la ejecucion server-side.
- El proveedor IA real del endpoint es `DEEPSEEK_API_KEY` o `LOVABLE_API_KEY`. `AI_PROVIDER_API_KEY` esta documentada, pero no es consumida por el codigo actual.
- Las migraciones locales muestran que `ai_usage_daily` existe y tiene permisos para `service_role`.
- Las migraciones locales muestran que `tarot_cards` contiene `is_demo`, `published_at`, `summary NOT NULL`, `upright_meaning NOT NULL`, `keywords NOT NULL DEFAULT []` y fila para `los-enamorados`.

## Riesgo identificado por codigo

Si `SUPABASE_SERVICE_ROLE_KEY` falta en Production, o si `ai_usage_daily` falla por permisos/esquema/conexion, el endpoint fallaba antes de cargar la carta. Como `card` seguia en `null`, el catch final no podia construir fallback y devolvia `server_error` generico.

Esto explica un 500 en produccion que no aparece en desarrollo si desarrollo tiene las variables locales correctas.

## Cambios aplicados

- `src/lib/ai/rate-limit.server.ts`
  - Ahora las fallas reales de lectura, actualizacion o insercion en `ai_usage_daily` lanzan `RateLimitStoreError`.
  - Se conserva el contrato funcional de cuota: 200 si permite, 429 si agota cuota.

- `src/routes/api/tarot/interpret.ts`
  - Se agrego seguimiento de etapa (`stage`) para separar el error original de errores dentro del fallback.
  - Se agrego logging estructurado sanitizado con etiqueta `[tarot_interpret_error]`.
  - Se agregaron eventos estructurados con etiqueta `[tarot_interpret_event]`.
  - Se agregaron headers de diagnostico visibles desde F12/Network:
    - `X-Tarot-Request-Id`
    - `X-Tarot-Stage`
    - `X-Tarot-Mode`
    - `X-Tarot-Error-Code`
  - Se evita exponer valores de secretos.
  - Si falla la cuota/configuracion, responde con codigo interno `rate_limit_config_error` en vez de ocultarlo como `server_error`.
  - Se mantiene el endpoint existente; no se creo otro endpoint.
  - Se mantiene el proveedor IA existente.
  - Se elimino el fallback local especulativo de cartas.

- `src/server/generation/tarot-fallback-generator.ts`
  - El fallback programado normaliza `summary`, `uprightMeaning`, `reversedMeaning` y `keywords`.
  - No ejecuta `split` o `slice` sobre `null` o `undefined`.
  - Si faltan datos de texto, genera una respuesta valida para el schema.

- `src/server/tarot/interpret.test.ts`
  - Se actualizaron contratos para verificar el flujo real, el error identificable de cuota y los logs sanitizados.
  - Se quitaron expectativas del fallback local especulativo.

## Codigos de error del flujo

- 400: `invalid_json`, `validation_error`, `content_unsafe`.
- 404: `card_not_found`, `card_not_published`.
- 429: `quota_exceeded`.
- 500 identificable: `supabase_public_config_missing`, `database_error`, `rate_limit_config_error`.
- 500 generico: `server_error` cuando no hay carta/input suficientes para fallback o si el fallback tambien falla.
- Fallback 200: errores de IA o parseo IA cuando ya existe carta e input validos.

## Validacion ejecutada

- `npx vitest run src/server/tarot/interpret.test.ts`: 24 tests OK.
- `npx eslint src/routes/api/tarot/interpret.ts src/server/generation/tarot-fallback-generator.ts src/server/tarot/interpret.test.ts`: OK.
- `npm run build`: OK.

## Como revisar desde F12 en produccion

Despues de desplegar estos cambios:

1. Abrir la pagina en Production.
2. Abrir DevTools / F12.
3. Ir a Network.
4. Enviar una pregunta a la guia.
5. Abrir la request `POST /api/tarot/interpret`.
6. Revisar Response Headers:
   - `X-Tarot-Stage`: etapa exacta donde respondio o fallo.
   - `X-Tarot-Mode`: `interpretation`, `conversation`, `fallback` o `error`.
   - `X-Tarot-Error-Code`: codigo interno si hubo error.
   - `X-Tarot-Request-Id`: id para cruzar con logs del servidor.

Lectura rapida:

- `X-Tarot-Mode: conversation`: respondio el mecanismo conversacional programado, por ejemplo un saludo.
- `X-Tarot-Mode: interpretation`: respondio IA y paso validacion.
- `X-Tarot-Mode: fallback`: fallo IA o parseo IA, pero el fallback programado respondio OK.
- `X-Tarot-Mode: error` + `X-Tarot-Stage: quota`: falla de cuota/configuracion, probable `SUPABASE_SERVICE_ROLE_KEY` o `ai_usage_daily`.
- `X-Tarot-Mode: error` + `X-Tarot-Stage: fallback`: tambien fallo el fallback programado.

## Pendiente para cerrar causa exacta

Leer logs de Production despues de desplegar esta instrumentacion o desde el panel de Vercel/Supabase. Buscar:

- `[tarot_interpret_error]`
- `[tarot_interpret_event]`
- `stage: "quota"`
- `RateLimitStoreError`
- `rate_limit_config_error`
- `event: "ai_response_received"`
- `event: "ai_response_validated"`
- `event: "fallback_response_built"`
- `event: "conversation_response"`

Si aparece `stage: "quota"`, revisar en Production que exista `SUPABASE_SERVICE_ROLE_KEY` y que el esquema `ai_usage_daily` coincida con la migracion. No ejecutar migraciones ni cambiar RLS sin esa evidencia.

## Acciones no realizadas

- No se ejecutaron migraciones.
- No se cambio RLS.
- No se cambio proveedor IA.
- No se creo otro endpoint.
- No se hizo `git add`, commit, push ni deploy.
- No se expusieron secretos.
