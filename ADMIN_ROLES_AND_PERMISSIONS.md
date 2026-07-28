# ADMIN_ROLES_AND_PERMISSIONS.md

Roles administrativos del Proyecto Astral. Fuente única de definición:
`src/lib/admin/roles.ts` + enum `public.app_role` en Supabase.

## Roles disponibles

| Rol | Puede publicar | Puede aprobar | Puede editar contenido | Puede gestionar medios | Puede otorgar roles | Puede leer auditoría |
|---|---|---|---|---|---|---|
| `super_admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `editor` | ❌ | ❌ | ✅ (borradores) | ❌ | ❌ | ❌ |
| `reviewer` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `media_manager` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

## Reglas invariantes

1. **Los roles NO se guardan en `profiles`.** Sólo en `public.user_roles`.
2. **Nadie puede autoasignarse un rol.** RLS revoca INSERT/UPDATE/DELETE en `user_roles` para `authenticated` y `anon`. Sólo `service_role` (script server-only o server function con verificación previa) puede escribir.
3. **La autorización se aplica en 4 capas:**
   - UI: ocultar controles con `useAdminRoles()`.
   - Ruta: `beforeLoad` llama `getMyAdminRoles` y redirige si no autorizado.
   - Servidor: cada server fn admin llama `assertRole()` al inicio del handler.
   - RLS: policies en Supabase usan `public.has_admin_role(auth.uid(), ARRAY[...])`.
4. **Roles enviados por el cliente NO son confiables.** Se ignoran; siempre se releen desde `user_roles` en el servidor.
5. **No hay emails hard-coded** que otorguen rol. El script `scripts/grant-super-admin.ts` recibe el email por argumento.
6. **`SUPABASE_SERVICE_ROLE_KEY` nunca se envía al navegador.** Sólo se lee dentro de handlers server-only vía `@/integrations/supabase/client.server`.

## Rutas y comprobaciones actuales (Fase A)

| Ruta | Guard cliente | Guard servidor | RLS |
|---|---|---|---|
| `/admin` (layout) | `beforeLoad` → `getMyAdminRoles` | requireSupabaseAuth + `assertRole(ADMIN_PANEL_ROLES)` cuando se añadan acciones | Policies por tabla |
| `/admin` (dashboard) | Hereda del layout | — | — |
| `/mi-espacio` | Enlace "Administración" oculto si no hay rol | — | — |

## Ampliación futura (fases B–E)

- Fase B: `EDITOR_ROLES` para crear/editar borradores; `APPROVER_ROLES` para aprobar; `PUBLISHER_ROLES` para publicar.
- Fase D: `MEDIA_ROLES` para subir/eliminar medios.
- Fase C: `PUBLISHER_ROLES` para programar publicación.

Cada acción sensible debe registrar un evento en `admin_audit_log` con `assertRole` + `logAdminAction`.
