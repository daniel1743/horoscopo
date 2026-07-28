# ADMIN_PREFLIGHT_REPORT.md — YAML 13

Reporte obligatorio previo a construir el panel administrativo.
Este documento congela lo detectado en el esquema real y en la base de código antes de introducir cambios.

## 1. Tablas detectadas (fuentes de verdad reutilizables)

| Tabla | Estado | Columna `status` | `published_at` | `updated_at` | Notas |
|---|---|---|---|---|---|
| `editorial_articles` | ✅ | ENUM `editorial_status` (`draft`,`published`,`archived`) | ✅ | ✅ | Fuente de artículos. `seo jsonb`, `content jsonb`. |
| `editorial_authors` | ✅ | — | — | ✅ | Autores editoriales. |
| `editorial_categories` | ✅ | — | — | ✅ | Taxonomía. |
| `horoscopes` | ✅ | usa `published_at`; período ENUM | ✅ | ✅ | Sin `status` textual, publicación por fecha. |
| `tarot_cards` | ✅ | TEXT (`published`/`draft`/`archived`) | ✅ | ✅ | — |
| `moon_phase_content` | ✅ | TEXT | ✅ | ✅ | — |
| `compatibility_profiles` | ✅ | TEXT | ✅ | ✅ | Pair único (78 combinaciones canónicas). |
| `search_documents` | ✅ | — | — | — | Derivado; se sincroniza al publicar/archivar. |
| `profiles` | ✅ | — | — | ✅ | NO contiene rol. |
| `user_roles` | ✅ | ENUM `app_role` = `{admin, editor}` | — | — | Falta ampliar el enum. |

> **Ninguna tabla debe duplicarse.** El panel administrará estas mismas tablas mediante adaptadores.

## 2. Enum de roles

- Enum actual `public.app_role`: `admin`, `editor`.
- YAML 13 requiere: `super_admin`, `admin`, `editor`, `reviewer`, `media_manager`.
- **Migración necesaria:** `ALTER TYPE app_role ADD VALUE` para los tres nuevos valores (idempotente con `IF NOT EXISTS`).

## 3. Autenticación y sesión

- Cliente único: `src/integrations/supabase/client.ts`.
- Middleware server: `requireSupabaseAuth` en `src/integrations/supabase/auth-middleware.ts` (inyecta `context.supabase`, `userId`, `claims`).
- Cliente admin server-only: `src/integrations/supabase/client.server.ts` (usar solo tras verificar rol).
- Hook cliente: `src/hooks/useSession.ts`.
- Layout gate: `src/routes/_authenticated/route.tsx` (integration-managed).

## 4. Función SQL existente

- `public.has_role(_user_id uuid, _role app_role) → boolean` (SECURITY DEFINER, STABLE, `search_path=public`). Reutilizable. Se añadirá helper `has_admin_role(uuid, text[])`.

## 5. Repositorios / servicios existentes

- `src/repositories/`: `search`, `tarot`, `compatibility` (+ Supabase impls).
- `src/services/`: `ai`, `compatibility`, `moon`, `search`, `tarot`.
- No existe repo de `articles`/`authors`/`categories`/`horoscopes`/`moon_phase_content` — el panel tendrá adaptadores administrativos que consulten Supabase server-side (nunca desde componentes).
- Sincronización del buscador: `src/server/search/search-index.service.ts` (`syncSearchDocument`, `removeSearchDocument`). **Reutilizar en publicación/archivo.**

## 6. Validadores centrales

- Zod schemas dispersos en `src/config/forms/` (formularios de perfil, newsletter). Los módulos de contenido no tienen validador Zod centralizado aún — el YAML 13 requiere crearlos por módulo (uno por adaptador) para BLOCKER/warning.

## 7. UI reutilizable

- Componentes shadcn en `src/components/ui/`: `button`, `dialog`, `dropdown-menu`, `table`, `form`, `input`, `textarea`, `select`, `badge`, `toast` (sonner), `alert-dialog`.
- Layout público: `SiteHeader`, `AppShell`, `Footer` — **no se tocan**.
- `PageContainer` = `Container` de `src/components/layout/Container.tsx`.

## 8. Storage

- **No hay buckets creados.** Se creará bucket privado `media` (JPEG/PNG/WebP/AVIF, ≤ 8 MB).

## 9. Feature flags

- `src/config/features.ts` presente. Se añadirán: `adminPanel`, `adminAIEditorial=false`, `scheduledPublication=true`.

## 10. Migraciones necesarias

1. Extender `app_role` con `super_admin`, `reviewer`, `media_manager`.
2. Añadir columna `granted_by` a `user_roles` (opcional según YAML) + índice único (ya existe).
3. Crear `has_admin_role(uuid, text[])` y `current_user_has_role(text[])`.
4. Crear `content_workflow` (estado + slug del recurso + snapshot mínimo + `assignee_id`, `due_at`, `version`).
5. Crear `content_revisions` (append-only; snapshot JSONB del recurso).
6. Crear `content_audit_log` (append-only; nunca guarda cuerpo del contenido).
7. Crear `media_assets` (referencia a Storage `media/`).
8. Crear `media_usages` (referencia contadora para bloquear borrado en uso).
9. Crear `scheduled_publications` (cola idempotente con `attempts`, `next_attempt_at`, `run_after`).
10. Añadir columna `version integer NOT NULL DEFAULT 1` a las 5 tablas de contenido (concurrencia optimista). **Solo si YAML 13 se acepta**; se hace en migración separada para permitir rollback.
11. Bucket privado `media` + policies `storage.objects` (solo miembros con rol admin).

## 11. Archivos que se modificarán

- `src/config/features.ts` (flags admin).
- `src/config/navigation.ts` (**no** añadir admin al menú público; sólo un enlace condicional en Mi Espacio si el usuario tiene rol).
- `src/routes/_authenticated/admin/*` (nuevas rutas).
- `src/routes/api/admin/*` (server routes protegidas).
- `src/routes/api/public/hooks/publish-scheduled.ts` (cron).
- `src/integrations/supabase/types.ts` (regenerado tras migración).

## 12. Riesgos de compatibilidad

- **Añadir valores al enum `app_role`** requiere `COMMIT` intermedio en Postgres antes de usarlos. Se ejecutará en migración propia, separada del uso posterior.
- **`ALTER TABLE ... ADD COLUMN version`** en tablas con datos: seguro con `DEFAULT 1 NOT NULL`.
- **Cambiar el enum** puede requerir regenerar `types.ts` — el proyecto lo hace automáticamente tras aplicar la migración.
- **RLS actual permisiva de lectura pública** en algunas tablas — las escrituras admin usarán `has_admin_role()` en policies dedicadas, sin abrir lectura.
- **`published_at + status`** conviven: el servicio de publicación debe actualizar ambos y sincronizar `search_documents` en la misma transacción lógica.

## 13. Plan por fases (recomendado para ejecutar con seguridad)

El YAML 13 mide ~3420 líneas y describe un sistema completo. Para evitar regresiones se propone construirlo en fases incrementales, cada una validada (lint, typecheck, RLS, seguridad):

### Fase A — Fundación de acceso y auditoría (esta primera entrega)
- Extensión del enum `app_role` con los 5 valores.
- Función `has_admin_role`, `current_user_has_role`.
- Tabla `content_audit_log` + repositorio.
- Layout `_authenticated/admin` + guard server (redirige si no hay rol admin/super_admin/editor/reviewer/media_manager).
- Dashboard vacío con conteos por módulo.
- Documentación base (`ADMIN_ROLES_AND_PERMISSIONS.md`, `ADMIN_SECURITY_CHECKLIST.md`, `ADMIN_SYSTEM_SETUP.md`).

### Fase B — Gestión editorial de artículos + revisiones + concurrencia
- CRUD server functions para `editorial_articles` con `version` (optimistic locking).
- Tabla `content_revisions` con snapshot + comparación/restauración (no publica).
- Adaptador central (registro) para futuros módulos.

### Fase C — Workflow + publicación programada + sync buscador
- Tabla `content_workflow` + `scheduled_publications`.
- Endpoint cron `/api/public/hooks/publish-scheduled` protegido por `CRON_SECRET`.
- Servicio de publicación que sincroniza `search_documents`.

### Fase D — Biblioteca de medios
- Bucket privado `media` + `media_assets` + `media_usages`.
- UI de subida (tipos MIME estrictos, 8 MB) + bloqueo de borrado en uso.

### Fase E — Módulos restantes (tarot, horóscopos, luna, compatibilidad) mediante adaptadores + preview privado.

## 14. Reglas invariantes durante toda la ejecución

- **Ningún componente consulta Supabase directamente** — siempre repositorio o server function.
- **Autorización en 4 capas**: UI + route guard + server middleware + RLS.
- **Auditoría append-only** sin cuerpos completos ni secretos.
- **Nunca publicar contenido con BLOCKER**; warnings sólo ignorables por `admin`/`super_admin` con motivo registrado.
- **No reconstruir** tokens, layout público, Home, buscador, auth ni módulos existentes.

---

**Estado actual:** listo para iniciar Fase A tras confirmación del usuario sobre el plan por fases o instrucción de proceder de otra manera.
