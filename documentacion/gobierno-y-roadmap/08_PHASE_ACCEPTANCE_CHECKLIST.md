# 08_PHASE_ACCEPTANCE_CHECKLIST.md — Checklist de Aceptación de Fase

**Versión**: 2.0
**Fecha**: 28/07/2026
**Propósito**: Checklist oficial que debe completarse y aprobarse antes de declarar cerrada cualquier fase de desarrollo.

---

## SECCIÓN 1: VERIFICACIÓN DE TIPADO Y BUILD

- [ ] `bun run build` ejecutado — Resultado: **0 errores**.
- [ ] `npx tsc --noEmit` ejecutado — Resultado: **0 errores**.
- [ ] ESLint ejecutado — Resultado: **0 errores bloqueantes**.
- [ ] `grep -r "console.log" src/` — Solo dentro de `if (import.meta.env.DEV)` o 0 resultados.

---

## SECCIÓN 2: AUDITORÍA DE SEGURIDAD

- [ ] Búsqueda de `SUPABASE_SERVICE_ROLE_KEY` en código cliente — Resultado: **0 hallazgos**.
- [ ] Búsqueda de `OPENAI_API_KEY` en código cliente — Resultado: **0 hallazgos**.
- [ ] Verificación de validación Zod en todas las nuevas server functions.
- [ ] RLS configurado en todas las tablas nuevas (si aplica).
- [ ] Service role solo usado vía `dynamic import()` dentro de `createServerFn`.

---

## SECCIÓN 3: VERIFICACIÓN DE ARQUITECTURA

- [ ] Separación Cliente/Servidor respetada (REGLA 1).
- [ ] Toda astronomía en `src/server/` (REGLA 2).
- [ ] Ningún módulo nuevo duplica otro existente (REGLA 5).
- [ ] `NO_RECONSTRUIR.md` respetado (0 violaciones).
- [ ] Patrón de capas mantenido: config → types → repositorios → servicios → componentes → rutas.

---

## SECCIÓN 4: DESIGN SYSTEM Y ESTILOS

- [ ] `bun scripts/check-hardcoded-styles.ts` — Resultado: **0 hardcodeos introducidos**.
- [ ] `bun scripts/check-direct-icon-imports.ts` — Resultado: **0 imports directos de lucide-react**.
- [ ] `bun scripts/check-duplicate-layout.ts` — Resultado: **sin layouts duplicados**.
- [ ] Todos los estilos usan tokens del Design System (REGLA 7).

---

## SECCIÓN 5: DOCUMENTACIÓN Y TRAZABILIDAD

- [ ] Cambios documentados en `10_MASTER_DECISION_LOG.md`.
- [ ] `00_MASTER_EXECUTION_ROADMAP.md` actualizado con tareas completadas.
- [ ] Blueprint del módulo en `04_MODULE_BLUEPRINTS.md` revisado.
- [ ] `07_DEFINITION_OF_DONE.md` verificado (6 pilares cumplidos).

---

## SECCIÓN 6: REUTILIZACIÓN

- [ ] Procedimiento `06_REUSE_FIRST_POLICY.md` seguido.
- [ ] Evidencia de verificación de no-duplicación adjunta.
- [ ] Si se creó algo nuevo: justificación en `10_MASTER_DECISION_LOG.md`.

---

## SECCIÓN 7: PRUEBAS (según fase)

- [ ] `bun scripts/check-compatibility-pairs.ts` — 78 pares correctos.
- [ ] `bun scripts/check-moon-accuracy.ts` — Precisión lunar verificada.
- [ ] Tests de integración pasan (FASE 4+).
- [ ] Tests E2E pasan (FASE 4+).

---

## FIRMA DEL AUDITOR

| Campo | Valor |
|-------|-------|
| **Fase** | [COMPLETAR] |
| **Auditor** | [COMPLETAR] |
| **Fecha** | [COMPLETAR] |
| **Resultado** | [APROBADO / RECHAZADO] |
| **Bloqueadores** | [Listar o Ninguno] |

---

*Checklist derivado de: PROJECT_AUDIT_MASTER.md, SECURITY_AUDIT.md, DESIGN_SYSTEM_AUDIT.md, 13_CRITERIOS_DE_ACEPTACION_FUTUROS.md (FASE 1).*
