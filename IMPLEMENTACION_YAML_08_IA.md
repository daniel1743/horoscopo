# IMPLEMENTACIÓN YAML 08 — CAPA DE IA TRANSVERSAL

Continuación incremental de los YAML 01–07. Se construye únicamente la capa de
inteligencia artificial y memoria autorizada, reutilizando sistema de diseño,
navegación, rutas centralizadas, Supabase y el layout global existentes.

## 1. Alcance

- Endpoint seguro streaming `/api/ai/respond` (TanStack server route).
- Server functions autenticadas: conversaciones, memorias, preferencias, feedback.
- Chat global `/asistente` y centro de memoria `/mi-espacio/memoria`.
- Botón contextual `Interpretar con IA` en el resultado de tarot.
- Config central `src/config/ai/*` (asistente, límites, memoria, seguridad,
  recuperación, model routing).
- Prompts del sistema SERVER-ONLY (`src/lib/ai/prompts.server.ts`).
- Proveedor: Lovable AI Gateway con `LOVABLE_API_KEY` (nunca en cliente).
- Rate limiting diario por usuario / hash anónimo (cookie httpOnly + salt).
- Streaming SSE reenvuelto en cuerpo `text/plain`, metadatos en cabecera
  `X-AI-Meta`.

Fuera de alcance (queda preparado, no activado): pgvector, voz, generación de
imágenes, agentes autónomos, planes de pago, `ai_knowledge_chunks`
sincronizado.

## 2. Portabilidad

- Migración SQL versionada en `supabase/migrations/`.
- Variables estándar `SUPABASE_*` y `LOVABLE_API_KEY` (o `AI_PROVIDER_API_KEY`
  cuando se despliegue fuera de Lovable). El endpoint funciona en cualquier
  runtime Node/Workers.
- Sin filesystem persistente, sin dependencias nuevas de proveedor.
- Feature flags en `src/config/features.ts` para desactivar cualquier
  submódulo.

## 3. Base de datos

Tablas nuevas:

- `ai_conversations` (RLS por `auth.uid()`).
- `ai_messages` (RLS por `auth.uid()`).
- `ai_memories` (RLS por `auth.uid()`).
- `ai_user_preferences` (RLS por `auth.uid()`).
- `ai_feedback` (RLS por `auth.uid()`).
- `ai_usage_daily` (server-only, sin políticas; solo `service_role`).

`GRANT`s completos por tabla; anon nunca accede a datos de IA.

## 4. Reglas de seguridad implementadas

- Prompts del sistema exclusivamente en el servidor. El cliente no envía
  system prompts; el servidor los ignora si aparecen en el body.
- Ninguna clave en el bundle (grep de `LOVABLE_API_KEY` en `src/` solo
  aparece dentro de `.server.ts`).
- El cliente nunca decide límites; el servidor consume `AI_USER_DAILY_LIMIT`
  y `AI_GUEST_DAILY_LIMIT` y responde `429` con mensaje claro.
- Identidad anónima = UUID en cookie `ai_anon_id` (`HttpOnly`, `SameSite=Lax`)
  hasheada con SHA-256 + `AI_RATE_LIMIT_SALT`. La IP nunca se guarda.
- Preguntas anónimas **no** se persisten. Autenticados: mensaje + respuesta
  van a `ai_messages`, respetando RLS del usuario.
- Memorias: no se guardan automáticamente. Se crean únicamente vía
  `createMemoryFn` desde acciones explícitas del usuario.
- Contenido recuperado se envuelve con delimitadores `<<<FUENTES ... FUENTES>>>`
  y el prompt del sistema instruye ignorar cualquier instrucción interna.
- Modo tarot: el servidor sólo consulta cartas ya publicadas y NO permite a la
  IA elegir/cambiar cartas.
- Modo horóscopo/artículo: si no existe publicación, se instruye al modelo a
  decirlo abiertamente sin inventar.

## 5. Arquitectura de código

```
src/config/ai/
  index.ts | assistant.ts | limits.ts | memory.ts
  model-routing.ts | retrieval.ts | safety.ts
src/lib/ai/
  gateway.server.ts          Cliente streaming del Lovable AI Gateway
  prompts.server.ts          Prompts del sistema por modo
  retrieval.server.ts        Recuperación segura de contenido publicado
  safety.server.ts           Detección orientativa de temas sensibles
  rate-limit.server.ts       Cuotas diarias con service role
  optional-auth.server.ts    Verificación opcional de sesión Supabase
  account.functions.ts       Server functions autenticadas (conv/memoria/…)
src/routes/api/ai/respond.ts Endpoint streaming principal
src/services/ai.service.ts   Cliente fetch para streaming
src/components/ai/*          Chat, mensaje, fuentes, aviso, contextual button
src/pages/ai/*               AssistantPage, MemoryPage
src/routes/asistente.tsx
src/routes/mi-espacio.memoria.tsx
src/types/ai.ts
```

## 6. Reglas de comportamiento

- Aviso de IA visible en cada respuesta (`assistantDisclaimers.chat`).
- Botón "Detener" siempre disponible durante streaming (AbortController).
- Aviso de seguridad se muestra por encima del composer cuando el clasificador
  detecta salud/legal/financiero/peligro. No bloquea la respuesta.
- Fuentes citadas se muestran plegadas por defecto, máx. 4.
- Contador `Consultas restantes hoy` refleja `usage_remaining` del servidor.

## 7. Integración

- `TarotReadingResult` gana `ContextualAiButton` con `mode="tarot"` y contexto
  inmutable (spread + card_keys + position_keys + question opcional).
- Drawer móvil expone `Asistente` y `Memoria` bajo "Tu espacio".
- Home no se modifica.

## 8. Variables de entorno (server-side)

Ya provistas por Lovable Cloud: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`.

Opcionales (usan defaults si no se definen):
`AI_MODEL_FAST`, `AI_MODEL_REASONING`, `AI_MODEL_SAFETY`,
`AI_MAX_OUTPUT_TOKENS`, `AI_GUEST_DAILY_LIMIT`, `AI_USER_DAILY_LIMIT`,
`AI_REQUEST_TIMEOUT_MS`, `AI_RATE_LIMIT_SALT`.

## 9. Validaciones

- `bunx tsgo --noEmit`: sin errores.
- `bun run build`: éxito.
- `bun scripts/check-direct-routes.ts`: sin regresiones nuevas.
- RLS: verificado en la migración; anon no accede a ninguna tabla `ai_*`.

## 10. Congelación

Arquitectura congelada. Futuras extensiones deben:

1. Añadir modos nuevos en `assistantModes` + `buildSystemPrompt`.
2. Reutilizar `AssistantChat` con contextos nuevos, no duplicar UI.
3. Nunca mover prompts fuera de `src/lib/ai/prompts.server.ts`.
4. Nunca guardar contenido de mensajes anónimos.
5. Nunca guardar recuerdos sin acción explícita del usuario.
