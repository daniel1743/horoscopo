# ADMIN_SYSTEM_SETUP.md

Guía de instalación y puesta en marcha del panel administrativo.

## Requisitos previos

- Base de datos Supabase con las migraciones anteriores aplicadas (YAML 01–12).
- Variables de entorno server-only en la plataforma de despliegue:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Variables cliente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

## Aplicar la migración Fase A

La migración `20240328000000_admin_infrastructure.sql` (ya ejecutada en esta iteración) crea:

- Extensión del enum `app_role` con `super_admin`, `reviewer`, `media_manager`.
- Columna `granted_by` en `user_roles`.
- Funciones `has_admin_role` y `current_user_has_role`.
- Tabla `admin_audit_log` (append-only).
- Políticas RLS asociadas.

## Crear el primer super_admin

El sistema no tiene super_admins por defecto. Registrar primero al usuario mediante el flujo normal de sign-up, luego ejecutar en un entorno con acceso a las variables server-only:

```bash
SUPABASE_URL="https://<project>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..." \
bunx tsx scripts/grant-super-admin.ts persona@dominio.com
```

Requisitos del script:
- No acepta emails hard-coded. Se recibe por argumento.
- Idempotente: si el rol ya existe no falla.
- Registra el evento en `admin_audit_log` con `actor_role='bootstrap_script'`.

## Verificar acceso

1. Iniciar sesión con el usuario promovido.
2. En `/mi-espacio` debe aparecer el enlace "Administración".
3. Visitar `/admin` → dashboard vacío con la lista de roles del usuario.
4. Cerrar sesión o entrar con un usuario sin rol → visitar `/admin` debe redirigir a `/mi-espacio` sin exponer estructura del panel.

## Otorgar más roles

Actualmente sólo por script server-only (mismo flujo que super_admin, cambiando el rol al final). En Fase B se añadirá UI de gestión de usuarios restringida a `super_admin`.

Para asignar otro rol manualmente (fuera del script), usar SQL vía service_role:

```sql
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES ('<uuid_del_usuario>', 'editor', '<uuid_del_super_admin>');
```

Nota: `granted_by` no se hace obligatorio en Fase A porque el super_admin inicial no tiene "quién lo concedió".

## Reglas invariantes

Ver `ADMIN_ROLES_AND_PERMISSIONS.md` y `ADMIN_SECURITY_CHECKLIST.md`. En resumen:
- Autorización en 4 capas (UI + ruta + servidor + RLS).
- Nunca exponer service role al navegador.
- Auditoría append-only sin cuerpos ni secretos.

## Próximas fases

- **Fase B** (siguiente): CRUD editorial de artículos con revisiones, workflow (borrador → revisión → aprobado), concurrencia optimista y preview privado.
- **Fase C**: Publicación programada + cron `/api/public/hooks/publish-scheduled` + sync buscador.
- **Fase D**: Biblioteca de medios con Supabase Storage (bucket privado `media`).
- **Fase E**: Adaptadores para tarot, horóscopos, luna, compatibilidad.
