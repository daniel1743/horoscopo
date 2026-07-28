# 09_MAPA_SUPABASE.md — MAPA DE BASE DE DATOS Y RLS EN SUPABASE

Este documento realiza un inventario completo de la estructura relacional, funciones de Postgres, políticas RLS e índices configurados en las migraciones de Supabase.

---

## 1. Inventario de Tablas de Base de Datos

| Tabla | Dominio | RLS Activa | Lectura Pública | Escritura | Migración |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `profiles` | Usuarios | Sí | No (Solo dueño) | Dueño (`auth.uid() = id`) | Initial |
| `user_roles` | Permisos | Sí | No (Propio rol) | Solo `service_role` | Initial |
| `admin_audit_log` | Seguridad | Sí | No (Solo admins) | Append-only via `service_role` / RPC | Initial |
| `editorial_articles` | Editorial | Sí | Sí (Publicados) | Roles editores | Initial / Revision |
| `editorial_authors` | Editorial | Sí | Sí | Roles editores | Initial |
| `editorial_categories` | Taxonomía | Sí | Sí | Roles editores | Initial |
| `content_workflow` | Estado CMS | Sí | No | Roles del panel | Revision |
| `content_revisions` | Versiones | Sí | No | Append-only editores | Revision |
| `horoscopes` | Astrología | Sí | Sí (Publicados) | Solo `service_role` / editores | Initial |
| `tarot_cards` | Cartomancia | Sí | Sí | Solo `service_role` / editores | Initial |
| `moon_phase_content` | Astronomía | Sí | Sí | Solo `service_role` / editores | Initial |
| `compatibility_profiles` | Parejas | Sí | Sí | Solo `service_role` / editores | Initial |
| `search_documents` | Buscador | Sí | Sí (Publicados) | Solo `service_role` / editores | Initial |
| `ai_conversations` | Asistente IA | Sí | No (Solo dueño) | Dueño | Initial |
| `ai_messages` | Asistente IA | Sí | No (Solo dueño) | Dueño | Initial |
| `ai_memories` | Asistente IA | Sí | No (Solo dueño) | Dueño | Initial |

---

## 2. Enums y Funciones Especiales de Postgres

### A. Enums de Postgres
* `public.app_role`: `'super_admin'`, `'admin'`, `'editor'`, `'reviewer'`, `'media_manager'`.
* `public.workflow_state`: `'draft'`, `'in_review'`, `'changes_requested'`, `'approved'`, `'published'`, `'archived'`.

### B. Funciones SQL Sanitizadas (`SECURITY DEFINER`)
* `public.has_role(_user_id uuid, _role app_role)`: Retorna booleano consultando `user_roles`. (REVOKED FROM PUBLIC/anon).
* `public.has_admin_role(_user_id uuid, _roles text[])`: Retorna booleano consultando si el usuario posee algún rol en la lista. (REVOKED FROM PUBLIC/anon).
* `public.current_user_has_role(_roles text[])`: Invoca `has_admin_role(auth.uid(), _roles)`. (REVOKED FROM PUBLIC/anon).
* `public.search_site(...)`: Función RPC que ejecuta búsqueda vectorizada full-text en `search_documents`.

---

## 3. Tablas Propuestas para Ampliación Futura (Fase 2+)

> **ADVERTENCIA**: Ninguna de estas tablas se ha creado en esta fase (Modo Read-Only).

1. **`scheduled_publications`**:
   * Para orquestar publicaciones diferidas mediante Supabase Cron.
   * Campos: `id`, `resource_type`, `resource_id`, `run_after`, `status`, `attempts`, `error_log`.
2. **`ai_generation_logs`**:
   * Para medir consumo de tokens y respuestas de la IA.
   * Campos: `id`, `sign_slug`, `period`, `tokens_used`, `prompt_version`, `model_name`, `created_at`.
