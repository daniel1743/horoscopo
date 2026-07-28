# 06_REUSE_FIRST_POLICY.md — Política de Reutilización Primero

**Versión**: 2.0
**Fecha**: 28/07/2026
**Propósito**: Establecer el procedimiento obligatorio de verificación de reutilización antes de autorizar cualquier nueva implementación.

---

## PRINCIPIO FUNDAMENTAL

> **REUTILIZACIÓN PRIMERO**. Antes de crear cualquier artefacto nuevo, se DEBE verificar que no exista uno funcionalmente equivalente. La carga de la prueba recae sobre quien propone la creación.

---

## 1. PROCEDIMIENTO OBLIGATORIO

### Antes de crear cualquier NUEVO:

| Artefacto | Verificar en | Herramienta |
|-----------|-------------|-------------|
| **Componente UI** | `src/components/ui/` + `src/components/{domain}/` | `list_files` + `grep` por nombre funcional |
| **Hook** | `src/hooks/` | `list_files src/hooks/` |
| **Servicio (query options)** | `src/services/` | `list_files src/services/` |
| **Repositorio** | `src/repositories/` | `list_files src/repositories/` |
| **Server Function** | `src/lib/{module}/` | `grep -r "createServerFn" src/lib/` |
| **Ruta** | `src/routes/` | `list_files src/routes/` |
| **Tabla Supabase** | `supabase/migrations/` | `grep "CREATE TABLE" supabase/migrations/` |
| **Función RPC** | `supabase/migrations/` | `grep "CREATE OR REPLACE FUNCTION" supabase/migrations/` |
| **Configuración** | `src/config/` | `list_files src/config/` |
| **Tipo Zod** | `src/types/` | `list_files src/types/` |
| **Panel Admin** | `src/routes/admin/` | Revisar `08_MAPA_PANEL_ADMIN.md` (FASE 1) |
| **Migración** | `supabase/migrations/` | `ls supabase/migrations/` |

### Checklist de verificación obligatoria:

- [ ] ¿Existe ya un componente/hook/servicio/tabla con funcionalidad equivalente?
- [ ] ¿Puede extenderse el existente en lugar de crear uno nuevo?
- [ ] ¿Está el existente en `02_MATRIZ_REUTILIZACION.md` (FASE 1)?
- [ ] ¿Está el existente en `07_ARCHIVOS_NO_TOCAR.md` (FASE 1)?
- [ ] Si es nuevo: ¿está justificado en `10_MASTER_DECISION_LOG.md`?
- [ ] Si es nuevo: ¿respeta el patrón de capas (config → types → repositorios → servicios → componentes → rutas)?

---

## 2. CATÁLOGO DE COMPONENTES REUTILIZABLES

### Componentes UI (shadcn + propios) — NUNCA duplicar

| Componente | Ubicación | Variantes |
|------------|-----------|-----------|
| Button | `src/components/ui/button.tsx` | primary, secondary, dark, premium, ghost, link + aliases |
| Card | `src/components/ui/card.tsx` | default, elevated, interactive, dark, premium |
| Badge | `src/components/ui/badge.tsx` | neutral, violet, premium, rose, blue |
| Input | `src/components/ui/input.tsx` | default, dark |
| Icon | `src/components/ui/icon.tsx` | Sistema centralizado vía `src/config/icons.ts` |
| Dialog | `src/components/ui/dialog.tsx` | Radix |
| Sheet/Drawer | `src/components/ui/drawer.tsx` | vaul |
| Skeleton | `src/components/ui/skeleton.tsx` | Carga |
| SearchDialog | `src/components/search/SearchDialog.tsx` | ⌘K |
| Navbar | `src/components/layout/Navbar.tsx` | Navegación principal |
| Footer | `src/components/layout/Footer.tsx` | Pie de página |
| Breadcrumbs | `src/components/layout/Breadcrumbs.tsx` | (FASE 2.7) |

### Hooks — NUNCA duplicar

| Hook | Ubicación |
|------|-----------|
| useDebounced | `src/hooks/useDebounced.ts` (después de 2.5) |
| useRecentSearches | `src/hooks/` |
| useToast | `src/hooks/` |

### Servicios (TanStack Query) — NUNCA duplicar

| Servicio | Ubicación |
|----------|-----------|
| Moon queries | `src/services/moon.ts` |
| Horoscope queries | `src/services/horoscope.ts` |
| Tarot queries | `src/services/tarot.ts` |
| Editorial queries | `src/services/editorial.ts` |
| Search queries | `src/services/search.ts` |

### Repositorios — NUNCA duplicar

| Repositorio | Ubicación |
|-------------|-----------|
| Moon repository | `src/repositories/moon.repository.ts` |
| Horoscope repository | `src/repositories/horoscope.repository.ts` |
| Editorial repository | `src/repositories/editorial.repository.ts` |

---

## 3. EVIDENCIA REQUERIDA PARA NUEVAS IMPLEMENTACIONES

Antes de mergear cualquier PR que cree un nuevo artefacto, el PR DEBE incluir:

```
## Verificación de Reutilización

- [ ] Verifiqué en `src/components/ui/` — No existe componente equivalente
- [ ] Verifiqué en `src/hooks/` — No existe hook equivalente
- [ ] Verifiqué en `src/services/` — No existe query equivalente
- [ ] Verifiqué en `src/repositories/` — No existe repositorio equivalente
- [ ] Verifiqué en `supabase/migrations/` — No existe tabla/función equivalente
- [ ] Justificación en 10_MASTER_DECISION_LOG.md: [link o entrada]
- [ ] El nuevo artefacto respeta el patrón de capas
```

---

## 4. MATRIZ DE REUTILIZACIÓN FUTURA

| Módulo futuro | Componentes a reutilizar | Riesgo si se duplica |
|---------------|-------------------------|---------------------|
| Code-Splitting (2.1) | TanStack Router `lazyRouteComponent` | Implementación custom inestable |
| Structured Data (2.2) | `src/config/seo.ts` | SEO inconsistente |
| Sitemap (2.3) | `src/data/zodiac.ts`, repositorio editorial | URLs incorrectas o duplicadas |
| Modo Oscuro (3.1) | Tokens en `src/styles.css`, Navbar existente | Dark mode inconsistente |
| Favoritos Sync (3.2) | Auth system, RLS pattern, localStorage hook | Pérdida de datos, bugs de merge |
| Iconos Zodiaco (3.3) | Sistema centralizado `<Icon />` | Inconsistencia visual, imports directos |
| Tests (4.1-4.4) | Zod schemas existentes, seed de Supabase | Tests desconectados de la realidad |
| CI/CD (4.5) | Scripts en `scripts/` | Falsos positivos/negativos |

---

## 5. SANCIONES POR INCUMPLIMIENTO

| Violación | Consecuencia |
|-----------|-------------|
| Duplicación de componente | Revertir y refactorizar usando el existente |
| Duplicación de hook | Revertir y extraer a `src/hooks/` |
| Duplicación de tabla/función | Revertir migración |
| Hardcodeo de estilos | Rechazado por `check-hardcoded-styles.ts` |
| Creación sin evidencia | PR rechazado automáticamente |

---

*Política de reutilización derivada de: 02_MATRIZ_REUTILIZACION.md, 07_ARCHIVOS_NO_TOCAR.md (FASE 1), REGLA 5 de 01_ARCHITECTURE_IMMUTABLE.md.*