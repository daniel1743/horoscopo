# ADMIN_SECURITY_CHECKLIST.md

Lista de verificación de seguridad del panel administrativo. Revisar en cada fase.

## Fase A — Verificado

- [x] Enum `app_role` extendido con `super_admin`, `reviewer`, `media_manager` (migración idempotente).
- [x] `user_roles.granted_by` opcional para trazabilidad.
- [x] RLS `user_roles`: sólo SELECT propio para `authenticated`; INSERT/UPDATE/DELETE revocados; `service_role` es el único que escribe.
- [x] `has_admin_role(uuid, text[])` y `current_user_has_role(text[])` con `SECURITY DEFINER`, `SET search_path = public`, `EXECUTE` revocado a PUBLIC.
- [x] `admin_audit_log` append-only: SELECT restringido a admin/super_admin; sin políticas INSERT/UPDATE/DELETE para clientes.
- [x] `logAdminAction` sanitiza metadata (bloquea claves con `password/token/secret/api_key/authorization/cookie/service_role`; limita profundidad y tamaño ≤ 2 KB).
- [x] Layout `/admin` verifica rol vía server fn antes de renderizar; redirige a `/mi-espacio` si no autorizado.
- [x] Enlace "Administración" en `AccountSidebar` sólo visible si `useAdminRoles().hasAny(ADMIN_PANEL_ROLES)`.
- [x] `SUPABASE_SERVICE_ROLE_KEY` nunca importado a nivel de módulo en archivos client-reachable.
- [x] Script `grant-super-admin.ts` no contiene emails hard-coded; requiere email por argumento y las variables server-only por entorno.
- [x] Ningún rol es asignable desde el cliente.

## Reglas permanentes (aplican a todas las fases)

- No confiar en roles enviados por el cliente.
- No exponer `SUPABASE_SERVICE_ROLE_KEY` ni prompts/keys internos.
- No guardar en auditoría: contraseñas, tokens, claves, preguntas de IA, memorias, cuerpo completo del contenido.
- Ocultar UI ≠ proteger la acción. Siempre verificar en el servidor.
- Nunca ejecutar `INSERT INTO storage.buckets` o `UPDATE storage.buckets` desde código: usar herramientas dedicadas.
- Nunca publicar contenido con incidencias BLOCKER. Los warnings sólo pueden ignorarse por `admin`/`super_admin` con motivo registrado en auditoría (Fase B+).

## Warnings del linter aceptados por diseño (Fase A)

- **INFO — RLS enabled no policy** en `user_roles`/`admin_audit_log` para acciones INSERT/UPDATE/DELETE: intencional. Las tablas son append-only o sólo modificables por `service_role`; la ausencia de policies bloquea a `authenticated`/`anon`.
- **WARN — Extension in public** (`pg_trgm`, `unaccent`): pre-existentes del sistema de buscador (YAML 12). Se dejan porque migrarlas rompe `search_documents.search_vector`.
- **WARN — SECURITY DEFINER function callable by authenticated**: intencional. `has_admin_role` y `current_user_has_role` deben ser llamables por usuarios autenticados para funcionar en policies; su cuerpo sólo lee `user_roles` y devuelve boolean. Se revoca `EXECUTE` a `PUBLIC`/`anon`.

## Pendientes por fase (para revisar más adelante)

- Fase B: verificar concurrencia optimista (`version` + `updated_at`), preview privado con `Cache-Control: no-store`, revisiones que restauran a borrador (nunca publican).
- Fase C: `CRON_SECRET` como shared secret; idempotencia + `max_attempts` en `scheduled_publications`; validación de contenido antes de publicar; sync buscador transaccional.
- Fase D: MIME whitelist (JPEG/PNG/WebP/AVIF), rechazo de SVG/HTML, límite 8 MB, bucket privado, bloqueo de borrado si `media_usages.count > 0`.
- Fase E: cada adaptador aplica `assertRole` y `logAdminAction`.
