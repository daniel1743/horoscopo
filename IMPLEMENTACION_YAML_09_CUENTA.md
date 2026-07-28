# IMPLEMENTACIÓN YAML 09 — CUENTA Y MI ESPACIO

Continuación incremental de YAML 01–08. Introduce autenticación con Supabase
Auth y el área privada **Mi espacio** sin duplicar infraestructura ya existente
(design system, layout, home, editorial, tarot, horóscopos, IA).

## 1. Alcance
- Registro, login, logout, confirmación de correo, recuperación y
  actualización de contraseña.
- Perfil, favoritos, lecturas de tarot guardadas voluntariamente, historial de
  actividad, privacidad, exportación y eliminación de cuenta.
- Reutiliza tablas del YAML 08 (`ai_conversations`, `ai_messages`,
  `ai_memories`, `ai_user_preferences`). No las recrea.

## 2. Base de datos (migración `20240326000000_account_system.sql`)
Tablas nuevas en `public` con RLS estricta, políticas por `auth.uid()` y GRANTs
para `authenticated` + `service_role`:

- `profiles` (`id → auth.users(id)`, `display_name`, `avatar_url`, `bio`,
  `preferred_sign`, `city`, `birth_date`).
- `user_privacy_settings` (banderas `activity_tracking_enabled`,
  `save_readings_allowed`, `ai_personalization_enabled`, `newsletter_opt_in`).
- `user_favorites` (favoritos por `item_type`/`item_ref`).
- `saved_tarot_readings` (solo se guarda con acción explícita; almacena
  `spread_type`, `cards`, `interpretation`, `note`. **Nunca la pregunta**).
- `user_activity_history` (solo tipos discretos: nada de texto libre).

Trigger `handle_new_user` (`SECURITY DEFINER`) crea `profiles` y
`user_privacy_settings` al registrarse. Se revocan permisos y se limita
`EXECUTE` para evitar abuso.

## 3. Capa de datos y servicios
- `src/lib/account/repository.ts`: acceso vía cliente Supabase autenticado,
  RLS aplica. `logActivity` respeta el switch de privacidad.
- `src/lib/account/account.functions.ts`:
  - `exportAccountFn`: exporta perfil + tablas propias en JSON.
  - `deleteAccountFn`: borra datos y llama a `supabaseAdmin.auth.admin.deleteUser`
    dentro del handler (**service role nunca en el navegador**). El `userId`
    proviene del token verificado por `requireSupabaseAuth`, jamás del body.

## 4. Enrutamiento
- Guardián en `src/routes/_authenticated/route.tsx` (`ssr:false`,
  `beforeLoad` → `getUser()`, redirige a `/auth`).
- Públicas: `/auth`, `/auth/callback`, `/reset-password`.
- Privadas (`/_authenticated/mi-espacio/*`): resumen, perfil, favoritos,
  lecturas, historial, privacidad, configuración, memoria (IA YAML 08).

## 5. UI
- Layout compartido: `AccountShell`, `AccountSidebar` (leen `accountNav` desde
  `src/config/mi-espacio.ts`).
- Primitivas reutilizables: `FavoriteButton`, `SaveReadingButton` (acción
  explícita: nunca guarda automáticamente).
- Páginas en `src/pages/account/`: `AccountDashboardPage`, `ProfilePage`,
  `FavoritesPage`, `SavedReadingsPage`, `HistoryPage`, `PrivacySettingsPage`,
  `AccountSettingsPage`, `AuthPage`, `AuthCallbackPage`, `ResetPasswordPage`.
- `SiteHeader` reflejа el estado de sesión (etiqueta “Mi espacio” cuando hay
  usuario, “Ingresar” cuando no) mediante `useSession`. No se rehace el
  layout ni la navegación.

## 6. Privacidad y seguridad
- Ningún endpoint acepta `user_id` desde el body.
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa dentro del handler de
  `deleteAccountFn`.
- Las lecturas de tarot requieren acción explícita del usuario.
- El historial se puede desactivar y borrar; nunca almacena texto libre.
- No se duplican datos del YAML 08; la memoria IA sigue viviendo en sus
  tablas (`ai_memories`, `ai_user_preferences`).
- Rutas privadas emiten `robots: noindex,nofollow`.

## 7. Portabilidad
- Solo Supabase estándar (Auth + Postgres + RLS). Ninguna función exclusiva
  de Lovable Cloud.
- Migraciones versionadas en `supabase/migrations/`.
- Variables estándar: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## 8. Validación
- `bunx tsgo --noEmit`: ✅
- `npm run build`: ✅
- Rutas privadas verificadas: redirect a `/auth` sin sesión.
- Aislamiento entre usuarios: garantizado por RLS (`auth.uid() = user_id`).
- Responsive validado a 320px / 768px / 1280px vía `AccountShell` grid
  (`lg:grid-cols-[260px_1fr]`).

## 9. Congelamiento
La arquitectura de autenticación y Mi espacio queda congelada:
- No modificar `src/integrations/supabase/*` autogenerado.
- No aceptar `user_id` desde el cliente.
- No introducir tablas paralelas de usuarios o memoria IA.
- Cualquier extensión debe pasar por `repository.ts` y respetar RLS.
