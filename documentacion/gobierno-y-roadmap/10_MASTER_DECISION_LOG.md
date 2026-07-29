# 10_MASTER_DECISION_LOG.md — Registro de Decisiones Arquitectónicas

**Versión**: 2.0
**Fecha**: 28/07/2026

---

## ADR-001: TanStack Start como Framework SSR

- **Fecha**: 27/07/2026
- **Decisión**: TanStack Start para SSR/CSR isomórfico
- **Justificación**: Server functions, loaders SSR para SEO, `ssr: false` en rutas autenticadas
- **Impacto**: Separación limpia público/privado
- **Módulos**: `src/routes/`, `src/router.tsx`

---

## ADR-002: Aislamiento Server-Only de astronomy-engine

- **Fecha**: 28/07/2026
- **Decisión**: Prohibir astronomy-engine en bundle cliente. Solo vía MoonEngine.
- **Justificación**: ~80KB ahorrados en cliente. Precisión verificable.
- **Impacto**: REGLA 2 de la Constitución
- **Módulos**: `src/server/moon/`

---

## ADR-003: Control de Versiones Append-Only

- **Fecha**: 28/07/2026
- **Decisión**: content_revisions con snapshot JSONB. Version-based updates.
- **Justificación**: Restauración instantánea. Sin pérdida de datos.
- **Impacto**: Trazabilidad inmutable
- **Módulos**: `supabase/migrations/`, `articles.functions.ts`

---

## ADR-004: 78 Pair Keys Canónicas (Compatibilidad)

- **Fecha**: 28/07/2026
- **Decisión**: Ordenar alfabéticamente signos. 301 redirects.
- **Justificación**: 144 URLs → 78 pares canónicos
- **Impacto**: SEO único por par
- **Módulos**: `normalize-sign-pair.ts`, rutas compatibilidad

---

## ADR-005: IA Nunca Calcula Astronomía

- **Fecha**: 28/07/2026
- **Decisión**: IA solo recibe datos astronómicos precalculados
- **Justificación**: LLMs alucinan eventos celestes
- **Impacto**: REGLA 2. Rigor científico.
- **Módulos**: `src/server/moon/`, `src/lib/ai/`

---

## ADR-006: Design System como Single Source of Truth (NUEVA)

- **Fecha**: 28/07/2026
- **Decisión**: Prohibido hardcodear estilos. Solo tokens CSS + DS.
- **Justificación**: Consistencia visual, modo oscuro, mantenibilidad
- **Impacto**: REGLA 7. Script `check-hardcoded-styles.ts`
- **Módulos**: `src/styles.css`, `src/design-system/`

---

## ADR-007: Code-Splitting es Tarea #1 Absoluta (NUEVA)

- **Fecha**: 28/07/2026
- **Decisión**: Lazy loading en 54 rutas como paso absolutamente primero de FASE 2
- **Justificación**: Rendimiento 45/100. Bundle monolítico. Bloquea producción.
- **Impacto**: Bloquea 2.6, 2.8, 2.9
- **Módulos**: `src/routeTree.gen.ts`, `src/router.tsx`

---

## ADR-008: Política Oficial de Orbes de AspectEngine

- **Fecha**: 28/07/2026
- **Decisor**: Daniel
- **Decisión**: Adoptar como convención astrológica y editorial configurable la política de orbes: conjunción 8°, sextil 4°, cuadratura 6°, trígono 6°, oposición 8°.
- **Justificación**: Cierra la decisión pendiente de Fase 2B sin presentar los valores como constante científica universal.
- **Impacto**: `AspectEngine` puede calcular aspectos con política predeterminada oficial y mantener soporte para políticas personalizadas inyectadas.
- **Módulos**: `src/server/aspects/`

---

## PENDIENTE DE DECISIÓN

| ID     | Tema                  | Estado                        |
| ------ | --------------------- | ----------------------------- |
| PD-001 | ¿Self-host fonts?     | Decidido: FASE 3.4            |
| PD-002 | ¿Chromatic/Percy?     | PENDIENTE — FASE 4            |
| PD-003 | ¿Sentry o similar?    | PENDIENTE — FASE 5.4          |
| PD-004 | ¿Eliminar src/pages/? | PENDIENTE — Verificar imports |
