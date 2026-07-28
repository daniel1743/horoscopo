# 08_MAPA_PANEL_ADMIN.md — MAPA DEL PANEL ADMINISTRATIVO Y EXPORTABILIDAD DE PATRONES

Este documento analiza el diseño actual del panel administrativo y especifica cómo sus patrones de autorización, control de versiones y workflow pueden reutilizarse para soportar la automatización.

---

## 1. Patrón Actual del CRUD Editorial (Fases A y B)

El panel administrativo actual vive en `src/routes/_authenticated/admin/` y se compone de:

* **Layout Protegido (`route.tsx`)**:
  * Ejecuta `getMyAdminRoles` en la fase `beforeLoad` del servidor.
  * Muestra los roles activos del usuario en la barra lateral mediante [AccountSidebar.tsx](file:///c:/Users/Lenovo/Desktop/proyectos%20desplegados%20importante/horoscopo/src/components/account/AccountSidebar.tsx).
* **Gestión de Artículos (`articulos.tsx` y `articulos.$id.tsx`)**:
  * Formularios desacoplados con validación en servidor.
  * Matriz de estados de workflow ([workflow.ts](file:///c:/Users/Lenovo/Desktop/proyectos%20desplegados%20importante/horoscopo/src/lib/admin/workflow.ts)): `draft` $\rightarrow$ `in_review` $\rightarrow$ `approved` $\rightarrow$ `published` / `archived`.
  * Snapshot automático en `content_revisions` antes de modificar filas.
  * Concurrencia optimista exigiendo `expectedVersion` en la cláusula `WHERE`.
* **Auditoría (`auditoria.tsx`)**:
  * Visor de eventos append-only de `admin_audit_log` con información de actor, rol, recurso, acción y estado.

---

## 2. Componentes y Funciones Reutilizables del Panel

```typescript
// 1. Verificación de Roles en el Servidor (src/lib/admin/admin.functions.ts)
await assertRole(context, EDITOR_ROLES); // O PUBLISHER_ROLES, APPROVER_ROLES

// 2. Registro de Auditoría Sanitizado (src/lib/admin/admin.functions.ts)
await logAdminAction({ data: { action: "publish", resourceType: "horoscope", resourceId: id } });

// 3. Matriz de Transiciones de Workflow (src/lib/admin/workflow.ts)
canTransition(currentStatus, targetStatus);
```

---

## 3. Propuesta de Extensión para Automatización

Los patrones construidos en la Fase A y B permiten extender el panel para controlar el flujo automático sin inventar nuevos layouts o esquemas de seguridad:

### A. Módulo de Horóscopos Automáticos (`/admin/horoscopos`)
* **Reutilización**:
  * Utilizar la tabla `content_workflow` asociando `resource_type = 'horoscope'`.
  * Utilizar `content_revisions` para guardar la versión generada por la IA antes de cualquier edición manual humana.
  * Reutilizar `assertRole(context, PUBLISHER_ROLES)` para autorizar la publicación desatendida del cron.

### B. Módulo de Monitoreo de Cron y Ejecucción (`/admin/automatizacion`)
* **Propuesta**:
  * Crear una vista administrativa que consulte la futura tabla `scheduled_publications` para visualizar tareas pendientes, reintentos y errores de generación.
  * Botón de acción "Ejecutar Ahora" que invoque la Server Function de generación desatendida mediante una llamada autenticada.

### C. Módulo de Reglas Astrológicas (`/admin/reglas`)
* **Propuesta**:
  * Crear un editor de orbes y ponderaciones de aspectos para ajustar la sensibilidad del `SignContextBuilder` sin tocar código.
