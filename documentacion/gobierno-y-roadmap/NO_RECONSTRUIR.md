# NO_RECONSTRUIR.md — Catálogo de Piezas Inmutables Congeladas

**Versión**: 2.0
**Fecha**: 28/07/2026
**Propósito**: Responder de forma taxativa: **¿Qué piezas del proyecto NO deben volver a implementarse jamás?** Cualquier intento de crear un sistema paralelo o reemplazar una de las piezas aquí catalogadas constituye una violación grave de la arquitectura (REGLA 5 de `01_ARCHITECTURE_IMMUTABLE.md`).

---

## PIEZAS CONGELADAS (12)

### 1. Sistema de Roles y Permisos (`user_roles`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `supabase/migrations/`, `src/lib/admin/roles.ts`, `src/lib/admin/admin.functions.ts` |
| **Quién la utiliza** | Guards de rutas `/admin`, Server Functions administrativas |
| **Por qué debe reutilizarse** | 4 capas de validación. Función SQL `has_admin_role` sanitizada. Crear otro sistema introduciría brechas de seguridad. |
| **Evidencia** | `SECURITY_AUDIT.md`, `ADMIN_ROLES_AND_PERMISSIONS.md` |

---

### 2. Workflow Editorial (`content_workflow`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `supabase/migrations/`, `src/lib/admin/workflow.ts` |
| **Quién la utiliza** | CRUD de artículos, panel `/admin/articulos` |
| **Por qué debe reutilizarse** | Matriz oficial: `draft → in_review → approved → published → archived`. Todo módulo de contenido DEBE usar esta tabla (REGLA 4). |
| **Evidencia** | `PROJECT_AUDIT_MASTER.md`, `ARCHITECTURE_AUDIT.md` |

---

### 3. Sistema de SEO Centralizado (`buildMeta`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `src/config/seo.ts` |
| **Quién la utiliza** | Las 54 rutas de la aplicación |
| **Por qué debe reutilizarse** | Open Graph, Twitter Cards, meta tags uniformes. REGLA 9: SEO centralizado. |
| **Evidencia** | `PROJECT_AUDIT_MASTER.md` |

---

### 4. Design System y Tokens CSS

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `src/styles.css`, `src/design-system/tokens.ts`, `src/design-system/typography.ts`, `src/design-system/component-variants.ts` |
| **Quién la utiliza** | ~80+ componentes en `src/components/` |
| **Por qué debe reutilizarse** | 24 tokens de color, 9 estilos tipográficos, 6 radios, 4 sombras. REGLA 7. Sin esto, modo oscuro imposible. |
| **Evidencia** | `DESIGN_SYSTEM_AUDIT.md` |

---

### 5. React Query — Capa de Caché y Estado del Servidor

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `src/services/` (moon, horoscope, tarot, editorial, search) |
| **Quién la utiliza** | Todos los componentes con datos del servidor |
| **Por qué debe reutilizarse** | REGLA 11: única capa de caché. Cualquier `fetch()` directo debe migrarse. |
| **Evidencia** | `PERFORMANCE_AUDIT.md`, `ARCHITECTURE_AUDIT.md` |

---

### 6. Auditoría Administrativa (`admin_audit_log`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `supabase/migrations/`, `src/lib/admin/admin.functions.ts` (`logAdminAction`) |
| **Quién la utiliza** | Panel `/admin/auditoria`, Server Functions de escritura |
| **Por qué debe reutilizarse** | Registro inmutable append-only. Automatizaciones deben loguear con actor `system`. |
| **Evidencia** | `SECURITY_AUDIT.md` |

---

### 7. Buscador Unificado (`search_documents`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `src/server/search/`, `src/services/search.service.ts`, RPC `search_site` |
| **Quién la utiliza** | Ruta `/buscar`, SearchDialog (K) |
| **Por qué debe reutilizarse** | FTS PostgreSQL con UI completa. Contenido indexable usa `syncSearchDocument`. |
| **Evidencia** | `PROJECT_AUDIT_MASTER.md`, `SEARCH_SYSTEM_SETUP.md` |

---

### 8. CRUD Editorial y Versionamiento Optimista

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `src/lib/admin/articles.functions.ts`, `src/lib/editorial/` |
| **Quién la utiliza** | Panel `/admin/articulos`, página pública de artículo |
| **Por qué debe reutilizarse** | `WHERE version = $expectedVersion`. Workflow completo. |
| **Evidencia** | `ARCHITECTURE_AUDIT.md` |

---

### 9. Control de Versiones y Snapshots (`content_revisions`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `supabase/migrations/`, `articles.functions.ts` |
| **Quién la utiliza** | Visor de revisiones del panel admin |
| **Por qué debe reutilizarse** | Snapshot JSONB previo a cada modificación. Restauración instantánea. |
| **Evidencia** | `ADMIN_PREFLIGHT_REPORT.md`, ADR-003 |

---

### 10. Motor Lunar (`astronomyMoonEngine`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `src/server/moon/astronomy-moon-engine.ts`, contrato `MoonEngine` |
| **Quién la utiliza** | `moon.functions.ts`, MoonCalendar, MoonPhaseVisual |
| **Por qué debe reutilizarse** | 11/11 tests de precisión (Δ ≤ 1.2 min vs USNO/NASA). REGLA 2. |
| **Evidencia** | `PERFORMANCE_AUDIT.md`, `scripts/check-moon-accuracy.ts` |

---

### 11. Normalizador de Compatibilidad Zodiacal (`normalizeSignPair`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `src/lib/compatibility/normalize-sign-pair.ts` |
| **Quién la utiliza** | `compatibility.service.ts`, rutas de compatibilidad |
| **Por qué debe reutilizarse** | 78 claves canónicas únicas. Sin esto, SEO duplicado 144 URLs. |
| **Evidencia** | ADR-004, `scripts/check-compatibility-pairs.ts` |

---

### 12. Selección de Tarot Criptográfica (`card-selection.ts`)

| Campo | Detalle |
|-------|---------|
| **Dónde está** | `src/lib/tarot/card-selection.ts` |
| **Quién la utiliza** | Tarot diario, sí/no, tres cartas, mazo completo |
| **Por qué debe reutilizarse** | FNV-1a para estabilidad diaria. `crypto.getRandomValues` sin sesgo. |
| **Evidencia** | `src/lib/tarot/card-selection.ts` |

---

## MATRIZ DE DEPENDENCIAS

| Pieza | Consumidores directos | Riesgo si se reemplaza |
|-------|----------------------|----------------------|
| Roles | Admin, Auth | Escalamiento de privilegios |
| Workflow | Editorial, Admin | Contenido sin revisión publicado |
| SEO | 54 rutas | Pérdida de posicionamiento |
| Design System | ~80+ componentes | Modo oscuro imposible |
| React Query | Componentes con datos | Caché fragmentada |
| Auditoría | Admin, Server Functions | Sin trazabilidad |
| Buscador | Búsqueda, Header | Dos motores divergentes |
| CRUD Editorial | Admin artículos | Colisiones de edición |
| Snapshots | Historial de cambios | Sin capacidad de restaurar |
| MoonEngine | Luna, Calendario | Datos astronómicos incorrectos |
| Compatibilidad | Pares de signos | SEO duplicado 144 URLs |
| Tarot | Experiencias de tarot | Tiradas inconsistentes |

---

*Catálogo derivado de: 07_ARCHIVOS_NO_TOCAR.md (FASE 1), Auditoría Maestra, 01_ARCHITECTURE_IMMUTABLE.md.*