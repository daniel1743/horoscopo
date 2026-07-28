# IMPLEMENTACION_YAML_13_ADMIN.md

Bitácora incremental del panel administrativo. Se actualiza al final de cada fase.

---

## Fase A — Fundación segura ✅

### Objetivo
Establecer el esquema de roles, funciones de autorización, auditoría append-only, layout `/admin` protegido en 4 capas y el mecanismo bootstrap del primer super_admin. Sin CRUD editorial, sin métricas falsas.

### Migración aplicada
`20240328000000_admin_infrastructure.sql` (mediante `supabase--migration`):

- `ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin' | 'reviewer' | 'media_manager'`.
- `ALTER TABLE user_roles ADD COLUMN granted_by uuid REFERENCES auth.users`.
- Endurecimiento RLS de `user_roles`: SELECT propio, INSERT/UPDATE/DELETE revocados a `authenticated`/`anon`.
- Funciones `has_admin_role(uuid, text[])` y `current_user_has_role(text[])` SECURITY DEFINER, `search_path=public`, EXECUTE revocado a PUBLIC y concedido sólo a `authenticated`+`service_role`.
- Tabla `admin_audit_log` append-only con índices por actor, recurso y acción.
- Policy SELECT en `admin_audit_log` restringida a `admin`/`super_admin`.

### Archivos creados
- `ADMIN_PREFLIGHT_REPORT.md` — inspección del esquema real previa a cambios.
- `src/lib/admin/roles.ts` — registro central de roles y grupos autorizados.
- `src/lib/admin/admin.functions.ts` — server functions `getMyAdminRoles`, `logAdminAction`, helper `assertRole`.
- `src/hooks/useAdminRoles.ts` — hook cliente para ocultar UI.
- `src/routes/_authenticated/admin/route.tsx` — layout con `beforeLoad` server-side + navegación admin.
- `src/routes/_authenticated/admin/index.tsx` — dashboard vacío (sin métricas falsas).
- `scripts/grant-super-admin.ts` — script server-only para bootstrap (email por argumento, sin hard-coded).
- Docs: `ADMIN_ROLES_AND_PERMISSIONS.md`, `ADMIN_SECURITY_CHECKLIST.md`, `ADMIN_SYSTEM_SETUP.md`.

### Archivos modificados
- `src/config/features.ts` — flags `adminPanel: true`, `adminAIEditorial: false`, `scheduledPublication: false`.
- `src/components/account/AccountSidebar.tsx` — enlace "Administración" condicional (icono `settings`).

### Pruebas / validación
- **Typecheck**: `bunx tsgo --noEmit` → sin errores.
- **Migración**: aplicada sin errores. Warnings del linter documentados como intencionales en `ADMIN_SECURITY_CHECKLIST.md` (append-only por diseño; SECURITY DEFINER intencionalmente llamable por autenticados; extensiones en public pre-existentes).
- **Autorización manual** (verificable):
  - Usuario anónimo visita `/admin` → gate `_authenticated` redirige a `/auth`.
  - Usuario autenticado sin rol visita `/admin` → `beforeLoad` server fn devuelve `roles=[]`, redirige a `/mi-espacio`.
  - Usuario con rol admin/super_admin → accede al dashboard; los roles se muestran.
  - Ningún usuario puede insertar en `user_roles` desde el navegador (INSERT revocado a `authenticated`).

### Pendientes reales
- Prueba end-to-end de UI del dashboard (queda por hacer al terminar Fase B, cuando exista contenido para validar el sidebar completo).
- Gestión de roles vía UI (queda para Fase F o posterior; por ahora sólo por script).

---

## Fase B — CRUD editorial de artículos ✅

### Objetivo
Reutilizar `editorial_articles` para permitir gestión editorial completa: listado paginado, crear/editar borradores, workflow, revisiones con snapshot/comparación/restauración, concurrencia optimista (version + updated_at), preview privado noindex + no-store, y auditoría de todas las acciones. Sin medios, sin cron, sin IA editorial.

### Migración aplicada
`20240328000001_admin_editorial_workflow.sql`:

- `editorial_articles.version integer NOT NULL DEFAULT 1` (concurrencia optimista).
- Tabla `content_workflow` con estados `draft | in_review | changes_requested | approved | published | archived`, `assignee_id`, `updated_by`, `notes`, `UNIQUE (resource_type, resource_id)` y trigger `set_updated_at`.
- Tabla `content_revisions` append-only con snapshot JSONB, `note`, `created_by`, `UNIQUE (resource_type, resource_id, version)`.
- Policies RLS: SELECT restringido a roles admin (super_admin/admin/editor/reviewer); INSERT/UPDATE restringidos según capacidad; sin políticas DELETE/UPDATE en `content_revisions` (append-only).
- Policy `Admin members can manage articles` sobre `editorial_articles` para ALL a roles editores; lectura pública existente intacta.

### Archivos creados
- `src/lib/admin/workflow.ts` — estados, etiquetas y matriz de transiciones válidas.
- `src/lib/admin/articles.functions.ts` — server functions con `assertRole`, snapshots, verificación `version = expected`, auditoría interna.
- `src/routes/_authenticated/admin/articulos.tsx` — listado paginado con filtros por estado y búsqueda.
- `src/routes/_authenticated/admin/articulos.nuevo.tsx` — formulario de nuevo borrador.
- `src/routes/_authenticated/admin/articulos.$id.tsx` — edición completa + botones de workflow + publicación (con override motivado) + historial de revisiones con restauración.
- `src/routes/_authenticated/admin/articulos.$id.preview.tsx` — vista previa privada noindex/no-store que reutiliza `ArticleContentRenderer`.
- `src/routes/_authenticated/admin/auditoria.tsx` — visor de auditoría (sólo admin/super_admin).

### Archivos modificados
- `src/routes/_authenticated/admin/route.tsx` — navegación admin incluye Artículos y Auditoría.

### Pruebas / validación
- **Typecheck**: `bunx tsgo --noEmit` → sin errores.
- **Migración**: aplicada sin errores. Warnings del linter son los mismos pre-existentes (documentados en `ADMIN_SECURITY_CHECKLIST.md`).
- **Concurrencia optimista**: `adminUpdateArticle`, `adminPublishArticle` y `adminRestoreRevision` exigen `expectedVersion`; el UPDATE se filtra con `.eq("version", expected)` y devuelve `CONFLICT` si 0 filas o si la lectura previa muestra otro número.
- **Revisiones**: cada UPDATE guarda snapshot ANTES; restaurar guarda snapshot del estado actual antes de sobrescribir, fuerza `status='draft'` y `workflow_state='draft'` (nunca publica).
- **Publicación**: requiere `workflow_state='approved'` o motivo obligatorio; se auditan ambos casos con `override: true|false` y `reason` truncada.
- **Preview privado**: cuelga de `_authenticated/admin`, meta `robots: noindex,nofollow,noarchive`, `httpEquiv: cache-control no-store`, banner permanente indicando que es privado.
- **Auditoría**: cada acción sensible (create, update, transition, publish, restore) llama `audit(...)` con metadata sanitizada.

### Warnings BLOCKER controlados
- Slug inválido → `BLOCKER: slug inválido`.
- Título < 3 chars o excerpt < 20 chars → `BLOCKER`.
- Contenido no-JSON o no-array → `BLOCKER` antes de intentar guardar.
- Transición no permitida por la matriz → `BLOCKER`.
- Publicación sin `approved` y sin `overrideReason` → `BLOCKER`.

### Pendientes reales
- Editor visual de bloques (hoy JSON crudo). Corresponde a fase de UX editorial dedicada.
- Diff visual entre revisiones (hoy sólo listado y restauración; el snapshot completo está disponible vía `adminGetRevision` para construir el diff más adelante).
- Gestión de usuarios/roles vía UI (sigue siendo sólo por script bootstrap).
- No se han añadido pruebas automatizadas de concurrencia (dos updates simultáneos); las invariantes están cubiertas por la doble verificación (lectura + WHERE version=$expected).

### Fases no ejecutadas (según instrucción explícita del usuario)
Fase C (workflow avanzado + cron + sync buscador), Fase D (medios + Storage) y Fase E (adaptadores restantes: tarot, horóscopos, luna, compatibilidad) quedan expresamente fuera de esta entrega y se abordarán en iteraciones siguientes.

