# 00_MASTER_EXECUTION_ROADMAP.md — Hoja de Ruta Maestra

**Proyecto**: Proyecto Astral
**Versión del Roadmap**: 1.0
**Fecha**: 28/07/2026
**Propósito**: Visión única de estado, fases, hitos y ruta crítica del proyecto

---

## 1. ESTADO ACTUAL (28/07/2026)

### Completitud general: **~75%**

| Dimensión | Calificación | Puntuación |
|-----------|-------------|-----------|
| Arquitectura | BUENA | 85/100 |
| Seguridad | EXCELENTE | 92/100 |
| Design System | BUENO | 78/100 |
| Funcionalidad core | EXCELENTE | 93/100 |
| Rendimiento | POBRE | 45/100 |
| SEO | REGULAR | 55/100 |
| Testing | CRÍTICO | 5/100 |
| Código limpio | BUENO | 75/100 |
| Documentación | BUENA | 80/100 |

**Puntuación global ponderada**: 73/100

### Lo que YA funciona (módulos terminados 90-100%)
- ✅ Design System base (tokens, tipografía, variantes CVA, iconos centralizados)
- ✅ Layout principal (Navbar, Footer, Drawer mobile)
- ✅ Sistema lunar (motor astronómico, calendario, fases, contenido editorial)
- ✅ Sistema de horóscopos (diario/semanal/mensual, 12 signos)
- ✅ Sistema de tarot (carta del día, 3 cartas, sí/no, mazo completo)
- ✅ Sistema editorial / CMS (artículos, categorías, autores, reading time)
- ✅ Buscador (FTS PostgreSQL, ⌘K dialog, página de resultados)
- ✅ Auth + Account (login, registro, perfil, reset password)
- ✅ Admin editorial (CRUD artículos con workflow drafts/published/archived)
- ✅ Compatibilidad de signos (pares A-B, 78 pares)
- ✅ IA contextual (asistente con modo chat/reflection, rate limiting)

---

## 2. VISIÓN FINAL

Proyecto Astral será una plataforma astrológica completa con:

- **Rendimiento de producción**: Code-splitting, lazy loading, bundle <200KB inicial
- **SEO avanzado**: Structured data, sitemap dinámico, breadcrumbs, rich snippets
- **Cobertura de tests**: ≥70% de coverage con tests de integración + E2E + a11y
- **Experiencia completa**: Modo oscuro activado, favoritos sincronizados, analytics admin
- **CI/CD**: Pipeline automatizado con verificación pre-merge

---

## 3. MACROFASES

### FASE 1: Inventario y Gobierno ← COMPLETADA ✅
**Objetivo**: Documentar el estado real del proyecto, establecer reglas inmutables, crear roadmap maestro.
**Entregables**: 14 documentos FASE 1 + 7 auditorías + 13 documentos de gobierno.

### FASE 2: Estabilización y Rendimiento (P0)
**Objetivo**: Resolver los problemas críticos que bloquean producción.
**Duración estimada**: 25-35 horas
**Prioridad**: CRÍTICA
**Porcentaje tras completar**: ~85%

| # | Tarea | Horas | Impacto |
|---|-------|-------|---------|
| 2.1 | Code-splitting / lazy loading en 54 rutas | 4-6h | Reduce bundle inicial ~60-70% |
| 2.2 | Structured data / JSON-LD para rich snippets | 3-4h | Habilita rich results en Google |
| 2.3 | Sitemap.xml dinámico | 2-3h | Indexación completa |
| 2.4 | Eliminar 54 console.log | 1-2h | Profesionalismo + seguridad |
| 2.5 | Extraer useDebounced a src/hooks/ | 0.5h | Elimina duplicación DRY |
| 2.6 | Migrar ~40+ hardcodeos de estilos al DS | 3-4h | Mantenibilidad |
| 2.7 | Breadcrumbs | 2-3h | UX + SEO |
| 2.8 | Lazy-load recharts + react-day-picker | 2-3h | Reduce bundle admin |
| 2.9 | Bundle analysis con rollup-plugin-visualizer | 0.5h | Métrica base |
| 2.10 | Auditoría post-fase 2 | 2h | Verificación |

### FASE 3: SEO Avanzado y UX Completa
**Objetivo**: Completar la experiencia de usuario y el posicionamiento orgánico.
**Duración estimada**: 20-30 horas
**Prioridad**: ALTA
**Porcentaje tras completar**: ~90%

| # | Tarea | Horas |
|---|-------|-------|
| 3.1 | Activar modo oscuro con toggle + persistencia | 3-4h |
| 3.2 | Favoritos sincronizados con Supabase | 4-6h |
| 3.3 | Iconos personalizados de zodíaco (12 signos) | 8-12h |
| 3.4 | Migrar fuentes a self-hosted | 1-2h |
| 3.5 | Mejoras de accesibilidad (contraste, screen reader) | 4-6h |

### FASE 4: Testing y Calidad
**Objetivo**: Establecer cobertura de tests automatizados.
**Duración estimada**: 30-50 horas
**Prioridad**: ALTA
**Porcentaje tras completar**: ~95%

| # | Tarea | Horas |
|---|-------|-------|
| 4.1 | Tests de integración frontend (Vitest + Testing Library) | 12-16h |
| 4.2 | Tests E2E (Playwright) | 12-16h |
| 4.3 | Tests de accesibilidad (axe-core) | 4-6h |
| 4.4 | Tests de regresión visual (opcional: Chromatic) | 4-8h |
| 4.5 | CI/CD pipeline con GitHub Actions | 4-6h |

### FASE 5: Features Premium y Pulido Final
**Objetivo**: Funcionalidades avanzadas y preparación final para producción.
**Duración estimada**: 25-40 horas
**Prioridad**: MEDIA
**Porcentaje tras completar**: ~98%

| # | Tarea | Horas |
|---|-------|-------|
| 5.1 | Analytics dashboard de admin | 8-12h |
| 5.2 | Admin roles UI completa | 4-6h |
| 5.3 | Multi-step advanced AI | 6-8h |
| 5.4 | Monitoreo de errores (Sentry o similar) | 3-4h |
| 5.5 | Auditoría final + documentación de cierre | 4-6h |

---

## 4. HITOS PRINCIPALES

| Hito | Fase | Criterio | Fecha estimada |
|------|------|----------|----------------|
| H1: Gobierno establecido | FASE 1.5 | 13 documentos aprobados | ✅ 28/07/2026 |
| H2: Producción viable | FASE 2 | Code-splitting + SEO básico | Pendiente |
| H3: Experiencia completa | FASE 3 | Modo oscuro + favoritos + iconos | Pendiente |
| H4: Calidad asegurada | FASE 4 | ≥70% coverage + CI/CD | Pendiente |
| H5: Producto completo | FASE 5 | Todas las features + analytics | Pendiente |

---

## 5. RUTA CRÍTICA

Estos módulos BLOQUEAN el avance del resto del proyecto:

```
FASE 2.1 (Code-splitting)
  └─> FASE 2.6 (Migrar hardcodeos DS) — requiere que el bundle esté separado primero
  └─> FASE 2.8 (Lazy-load librerías) — depende de la infraestructura de lazy loading
  └─> FASE 2.9 (Bundle analysis) — requiere splitting implementado para medir

FASE 2.2 (Structured data)
  └─> FASE 3 (SEO avanzado) — los rich snippets son precondición
```

**Módulos bloqueantes identificados**:
1. **Code-splitting (2.1)** — Bloquea 2.6, 2.8, 2.9
2. **Structured data (2.2)** — Bloquea validación SEO de fases posteriores
3. **Bundle analysis (2.9)** — Bloquea métricas de rendimiento para fases 3-5

---

## 6. PRIORIDADES GLOBALES

| Prioridad | Alcance | Criterio |
|-----------|---------|----------|
| **CRÍTICA** | Code-splitting, Structured Data, Sitemap | Sin esto NO se puede ir a producción |
| **ALTA** | Eliminar console.log, Migrar hardcodeos, Breadcrumbs, useDebounced, Lazy-load | Deuda técnica que crece con cada feature nueva |
| **MEDIA** | Modo oscuro, Favoritos, Tests, CI/CD | Mejora la calidad pero no bloquea producción |
| **BAJA** | Iconos personalizados, Analytics avanzado, AI multi-step | Valor incremental, post-lanzamiento |

---

## 7. RIESGOS GLOBALES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Romper rutas durante code-splitting | MEDIA | ALTO | Implementar por lotes, verificar cada lote |
| Regresión visual al migrar hardcodeos | BAJA | MEDIO | Tests de snapshot visual post-migración |
| Incompatibilidad de dependencias al actualizar | BAJA | ALTO | Pin de versiones, bun.lock |
| Scope creep en fases avanzadas | MEDIA | MEDIO | Gobernanza estricta, Definition of Done |
| Pérdida de contexto entre fases | BAJA | MEDIO | Documentación completa en cada fase |

---

## 8. PORCENTAJES

| Fase | % Actual | % Tras Fase |
|------|----------|-------------|
| FASE 1 / 1.5 | 75% | 75% (gobierno, no features) |
| FASE 2 | 75% | ~85% |
| FASE 3 | ~85% | ~90% |
| FASE 4 | ~90% | ~95% |
| FASE 5 | ~95% | ~98% |

---

## 9. NOTAS DE GOBIERNO

- Este roadmap es vinculante para todos los agentes (Cline, Claude, Codex, Anti-Gravity)
- Cualquier desviación debe documentarse en `10_MASTER_DECISION_LOG.md`
- Las prioridades CRÍTICAS no pueden postergarse en favor de features MEDIA/BAJA
- Cada fase debe pasar el checklist `08_PHASE_ACCEPTANCE_CHECKLIST.md` antes de declararse completa

---

*Roadmap generado a partir de: Auditoría Maestra, 7 informes de auditoría, 14 documentos FASE 1.*