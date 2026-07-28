# 00_RESUMEN_EJECUTIVO.md — INVENTARIO Y PREPARACIÓN PARA AUTOMATIZACIÓN

## 1. Estado General del Sistema

Proyecto Astral cuenta con una base arquitectónica sólida y madura (86/100 en calidad técnica, 82% en completitud de sitio público). La aplicación está construida sobre React 19, TanStack Start (SSR/CSR isomórfico), Tailwind CSS v4, Supabase (RLS endurecido) y `astronomy-engine` (v2.1.19).

Sin embargo, el sistema actual está diseñado primordialmente para la **operación editorial manual e interactiva del visitante**. La preparación para una operación autónoma mediante IA y motores astronómicos automáticos se evalúa en:

```text
PORCENTAJE DE PREPARACIÓN PARA AUTOMATIZACIÓN: 68%
```

---

## 2. Principales Fortalezas para Automatización

1. **Aislamiento Astronómico Server-Only**:
   - `src/server/moon/astronomy-moon-engine.ts` encapsula `astronomy-engine` mediante la interfaz `MoonEngine`. Esto permite ampliar los cálculos planetarios sin contaminar el bundle cliente ni rehacer la UI.
2. **Normalización Canónica y Algoritmos Deterministas**:
   - `src/lib/compatibility/normalize-sign-pair.ts` garantiza que las 144 combinaciones zodiacales se reduzcan a exactamente 78 claves canónicas únicas (`pair_key`), evitando duplicidad en URLs o lecturas de IA.
   - `src/lib/tarot/card-selection.ts` implementa selección diaria determinista vía hash FNV-1a y sorteos interactivos libres de sesgo mediante `crypto.getRandomValues`.
3. **Flujo Administrativo y Auditoría Append-Only**:
   - Las migraciones `20260728003613_e7391bad-a9ca-4b95-92e5-fffafe68131e.sql` establecieron tablas de control de versiones `content_revisions`, estados de flujo `content_workflow` y auditoría `admin_audit_log`.

---

## 3. Principales Carencias y Brechas

1. **Motor de Aspectos y Transitología Inexistente**:
   - Actualmente solo se calcula la posición e iluminación de la Luna. No existen wrappers ni servicios para calcular aspectos planetarios (conjunciones, trígonos, cuadraturas), orbes, casas astrológicas ni ingresos de los 10 cuerpos celestes principales.
2. **Generador Editorial de IA Inexistente**:
   - El sistema de IA existente en `src/routes/api/ai/respond.ts` es un **asistente conversacional de consulta**. No existe un motor que genere horóscopos masivos estructurados, valide unicidad o redacte guías de forma autónoma.
3. **Ausencia de Orquestación y Cron Jobs**:
   - El flag `scheduledPublication` en `src/config/features.ts` está en `false`. No existe cola de tareas (`scheduled_publications`), triggers de tiempo ni ejecutores automáticos.
4. **Falta de Adaptadores CRUD en Administración**:
   - El panel administrativo actual (`src/routes/_authenticated/admin/`) solo gestiona artículos (`editorial_articles`). No existen adaptadores para gestionar horóscopos, tarot ni fases lunares desde la administración.

---

## 4. Piezas Críticas Reutilizables

* **`astronomyMoonEngine`**: `src/server/moon/astronomy-moon-engine.ts` (Base para extender cálculos planetarios).
* **`normalizeSignPair`**: `src/lib/compatibility/normalize-sign-pair.ts` (Validación de parejas).
* **`requireSupabaseAuth` & `assertRole`**: `src/integrations/supabase/auth-middleware.ts` y `src/lib/admin/admin.functions.ts` (Autorización de ejecuciones).
* **`supabaseSearchRepository`**: `src/repositories/supabase-search.repository.ts` (Buscador unificado).

---

## 5. Recomendaciones del Siguiente Paso

1. **Mantener la arquitectura intacta**: No reestructurar `src/components/`, `src/services/` ni `src/repositories/`.
2. **Construir los nuevos motores en `src/server/astrology/`**: Extender `astronomy-engine` en módulos server-only independientes.
3. **Diseñar el contrato `SignContextBuilder`**: Crear la fuente de verdad estructurada antes de enviar cualquier prompt a la IA.
