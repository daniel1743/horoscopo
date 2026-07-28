# 07_DEFINITION_OF_DONE.md — Definición de "Terminado" (Definition of Done)

**Versión**: 2.0
**Fecha**: 28/07/2026
**Propósito**: Establecer el estándar oficial para declarar que un módulo, tarea o fase está REALMENTE terminado. No se acepta "compila" o "funciona en local" como criterio suficiente.

---

## 1. CRITERIOS OBLIGATORIOS (6 PILARES)

Para que un módulo o fase sea declarado COMPLETADO, debe satisfacer TODOS los siguientes pilares:

```text
[1. Cero Errores] ──> [2. Auditoría Aprobada] ──> [3. Pruebas Superadas]
                                                          │
[6. Sin Deuda Nueva] <── [5. Reutilización Respetada] <── [4. Documentación Actualizada]
```

---

### Pilar 1: Cero Errores de Compilación y Tipado

- `bun run build` debe ejecutarse con **0 errores**.
- `npx tsc --noEmit` (o `bun tsc --noEmit`) debe ejecutarse con **0 errores**.
- ESLint no debe reportar errores bloqueantes.
- Cero `console.log` sin wrapper `import.meta.env.DEV` en código de producción.

### Pilar 2: Auditoría Aprobada

- El agente auditor asignado (Anti-Gravity para cambios críticos, Cline/Claude/Codex para revisiones entre pares) debe emitir un informe de revisión **sin bloqueadores**.
- Para cambios críticos (seguridad, arquitectura, esquema, performance): Anti-Gravity es el único que puede aprobar.
- El informe de auditoría debe registrarse en `10_MASTER_DECISION_LOG.md`.

### Pilar 3: Pruebas Superadas

- **Scripts de verificación** (mínimo obligatorio):
  - `bun scripts/check-hardcoded-styles.ts` — 0 nuevos hardcodeos
  - `bun scripts/check-direct-icon-imports.ts` — 0 imports directos de lucide-react
  - `bun scripts/check-compatibility-pairs.ts` — 78 pares canónicos correctos
- **Tests automatizados** (cuando apliquen):
  - Tests de integración (FASE 4+)
  - Tests E2E (FASE 4+)
- **Validación manual** para cambios visuales: comparación pre/post en light mode.

### Pilar 4: Documentación Actualizada

- Si el módulo introduce nuevos tipos Zod → actualizar `src/types/`.
- Si el módulo introduce nuevas rutas → verificar que `src/config/seo.ts` las contemple.
- Si el módulo introduce nueva tabla Supabase → documentar en `09_MAPA_SUPABASE.md` (FASE 1).
- La tarea completada debe marcarse en `00_MASTER_EXECUTION_ROADMAP.md`.

### Pilar 5: Reutilización Respetada

- Verificación de que NO se crearon duplicados de: componentes UI, hooks, servicios, repositorios, tablas.
- Evidencia de que se siguió el procedimiento en `06_REUSE_FIRST_POLICY.md`.
- Si se creó algo nuevo, debe estar justificado en `10_MASTER_DECISION_LOG.md`.
- `NO_RECONSTRUIR.md` no fue violado.

### Pilar 6: Sin Deuda Técnica Crítica Nueva

- No se introdujeron hardcodeos de estilos fuera del Design System.
- No se introdujeron imports de `astronomy-engine` en código cliente.
- No se introdujeron referencias a `SUPABASE_SERVICE_ROLE_KEY` en código cliente.
- No se introdujeron `console.log` en producción.
- No se crearon rutas sin SEO (meta tags, title, description).

---

## 2. CRITERIOS ESPECÍFICOS POR TIPO DE TAREA

### Para tareas de código (2.1-2.9, 3.1-3.5):

| Criterio | Umbral |
|----------|--------|
| Build exitoso | 0 errores |
| Scripts de verificación | Todos pasan |
| Criterios del blueprint | 100% cumplidos |
| Revisión de pares | Sin bloqueadores |

### Para migraciones de Supabase:

| Criterio | Umbral |
|----------|--------|
| Migración aplicada en local | Sin errores |
| RLS configurado | Para todas las tablas nuevas |
| Rollback documentado | En el PR |
| Aprobación de Anti-Gravity | Explícita |

### Para tests (4.1-4.5):

| Criterio | Umbral |
|----------|--------|
| Coverage | ≥70% (líneas) |
| Tests pasan | 100% |
| Sin dependencia de red | Supabase mockeado |
| CI integrado | Tests corren en pipeline |

---

## 3. LO QUE NUNCA CUENTA COMO "TERMINADO"

- ❌ "Compila en mi máquina"
- ❌ "Funciona en local"
- ❌ "Ya casi está, solo falta testear"
- ❌ "No probé todas las rutas, pero debería funcionar"
- ❌ "Los console.log son para debug, los quito después"
- ❌ "El hardcodeo es temporal"

---

## 4. CIERRE DE FASE

Una fase solo se considera terminada cuando:
1. Todas las tareas de la fase cumplen el DoD individual.
2. La auditoría de fase (2.10, 3.6, 4.6, 5.5) es aprobada por Anti-Gravity.
3. El `08_PHASE_ACCEPTANCE_CHECKLIST.md` está completamente marcado.
4. El porcentaje en `00_MASTER_EXECUTION_ROADMAP.md` está actualizado.

---

*Definition of Done derivada de: PROJECT_AUDIT_MASTER.md, FINAL_PROJECT_STATUS.md, 13_CRITERIOS_DE_ACEPTACION_FUTUROS.md (FASE 1).*
