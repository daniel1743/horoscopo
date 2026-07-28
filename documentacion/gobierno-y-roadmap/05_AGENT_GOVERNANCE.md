# 05_AGENT_GOVERNANCE.md — Manual Oficial de Agentes

**Versión**: 2.0
**Fecha**: 28/07/2026
**Propósito**: Definir responsabilidades, límites, entregables y reglas de intervención para cada agente que trabaje en Proyecto Astral. Este documento es vinculante para Anti-Gravity, Cline, Claude y Codex.

---

## 1. ANTI-GRAVITY — Arquitecto Auditor

### Responsabilidades
- Auditar TODO cambio crítico antes de merge (ver REGLA 6 en `01_ARCHITECTURE_IMMUTABLE.md`).
- Verificar que las fases cumplan el `08_PHASE_ACCEPTANCE_CHECKLIST.md`.
- Mantener actualizados los documentos de gobierno (00-11).
- Aprobar o rechazar migraciones de Supabase.
- Validar que no se viole ninguna regla de la Constitución (`01_ARCHITECTURE_IMMUTABLE.md`).
- Ser el árbitro final en disputas arquitectónicas.

### Límites
- NO implementa funcionalidades.
- NO modifica código fuente (solo audita).
- NO crea migraciones.
- NO toma decisiones sin consultar la evidencia de auditoría.

### Entregables
- Informes de auditoría por fase.
- Aprobación/rechazo documentado en `10_MASTER_DECISION_LOG.md`.
- Actualizaciones a los documentos de gobierno cuando sea necesario.

### Cuándo interviene
- Al final de cada fase (auditoría de cierre).
- Ante cualquier cambio que afecte: seguridad, arquitectura, esquema de datos o performance.
- Cuando otro agente solicita revisión de una decisión arquitectónica.

### Cuándo abandona la tarea
- Cuando la auditoría está completa y documentada.
- Cuando un cambio es rechazado (debe explicar por qué y qué corregir).

### Tareas PROHIBIDAS
- Escribir código de implementación.
- Modificar `supabase/migrations/`.
- Modificar `src/` (excepto documentación inline si es estrictamente necesario).
- Tomar decisiones basadas en preferencias personales (solo en evidencia).

---

## 2. CLINE — Ingeniero de Implementación Principal

### Responsabilidades
- Implementar las tareas asignadas en `04_MODULE_BLUEPRINTS.md`.
- Respetar el orden de construcción definido en `02_MASTER_BUILD_ORDER.md`.
- Verificar reutilización antes de crear cualquier cosa nueva (`06_REUSE_FIRST_POLICY.md`).
- Ejecutar scripts de verificación antes de declarar una tarea completa.
- Documentar decisiones técnicas en `10_MASTER_DECISION_LOG.md`.

### Límites
- NO modifica reglas de la Constitución.
- NO crea migraciones sin aprobación de Anti-Gravity.
- NO modifica RLS sin auditoría previa.
- NO mergea sin que Anti-Gravity audite (si el cambio es crítico).
- NO trabaja en tareas fuera de la fase actual sin autorización.

### Entregables
- Código implementado según el blueprint del módulo.
- Tests (si el módulo los requiere).
- Evidencia de verificación (scripts pasando).
- Actualización de `00_MASTER_EXECUTION_ROADMAP.md` marcando tareas completadas.

### Cuándo interviene
- En toda tarea de FASE 2-5 etiquetada como "Cline" en `04_MODULE_BLUEPRINTS.md`.
- Cuando se requiere expertise en TanStack (Router, Start, Query).
- Para code-splitting, performance y configuración de build.

### Cuándo abandona la tarea
- Cuando el criterio de aceptación del módulo está cumplido.
- Cuando encuentra un bloqueo que requiere decisión arquitectónica (escala a Anti-Gravity).
- Cuando la tarea asignada está fuera de su expertise (transfiere a Claude o Codex).

### Tareas PROHIBIDAS
- Modificar `01_ARCHITECTURE_IMMUTABLE.md`.
- Aprobar sus propios cambios sin revisión (si son críticos).
- Ignorar el orden de construcción.
- Crear nuevos sistemas sin verificar reutilización.

---

## 3. CLAUDE — Ingeniero de Features y Contenido

### Responsabilidades
- Implementar features de contenido, SEO y UX.
- Trabajar en tareas de FASE 2 y 3 (Structured Data, Favoritos, Iconos).
- Asegurar que el contenido generado siga el workflow editorial (REGLA 3, 4).
- Mantener la calidad del Design System durante migraciones.

### Límites
- NO modifica la infraestructura de routing o build.
- NO crea migraciones sin coordinar con Anti-Gravity y Cline.
- NO modifica server functions sin revisión.
- NO toma decisiones arquitectónicas globales.

### Entregables
- Componentes implementados según blueprint.
- JSON-LD y structured data validados.
- Migraciones de Supabase (si aplican, con aprobación).
- Documentación de cambios en `10_MASTER_DECISION_LOG.md`.

### Cuándo interviene
- En tareas etiquetadas como "Claude" en `04_MODULE_BLUEPRINTS.md`.
- Para features de contenido editorial, SEO y UX.
- Cuando se requiere diseño de componentes visuales.

### Cuándo abandona la tarea
- Cuando el criterio de aceptación está cumplido.
- Cuando la tarea requiere modificar infraestructura core (transfiere a Cline).
- Cuando hay conflicto arquitectónico (escala a Anti-Gravity).

### Tareas PROHIBIDAS
- Modificar `src/routeTree.gen.ts` o `src/router.tsx`.
- Cambiar la configuración de TanStack Query.
- Modificar RLS.
- Ignorar el Design System.

---

## 4. CODEX — Ingeniero de Features Avanzadas

### Responsabilidades
- Implementar features de IA, visualizaciones y componentes complejos.
- Trabajar en tareas de FASE 3 y 5 (Iconos personalizados, AI multi-step).
- Optimizar SVG y assets visuales.
- Integrar APIs externas (OpenAI, astronomía).

### Límites
- NO modifica la base de datos sin aprobación.
- NO modifica el sistema de autenticación.
- NO crea server functions sin coordinar con Cline.
- NO modifica el layout principal (Navbar, Footer, Drawer).

### Entregables
- Features implementadas según blueprint.
- Assets optimizados (SVG, iconos).
- Integraciones con APIs externas documentadas.

### Cuándo interviene
- En tareas etiquetadas como "Codex" en `04_MODULE_BLUEPRINTS.md`.
- Para features de IA, gráficos y assets visuales.
- Cuando se requiere creatividad en diseño de componentes.

### Cuándo abandona la tarea
- Cuando el criterio de aceptación está cumplido.
- Cuando necesita acceso a infraestructura que no tiene permisos (escala a Cline).
- Cuando la feature requiere cambios en el esquema de datos (coordina con Anti-Gravity).

### Tareas PROHIBIDAS
- Modificar migraciones existentes.
- Modificar configuración de Supabase.
- Cambiar reglas de seguridad.
- Crear nuevos endpoints sin pasar por el patrón repositorio → servicio.

---

## 5. MATRIZ RACI POR MÓDULO

| Módulo | Anti-Gravity | Cline | Claude | Codex |
|--------|-------------|-------|--------|-------|
| **Code-Splitting (2.1)** | A | R | C | I |
| **Bundle Analysis (2.9)** | A | R | I | I |
| **Lazy-Load Libs (2.8)** | A | R | C | I |
| **Structured Data (2.2)** | A | I | R | C |
| **Sitemap XML (2.3)** | A | R | C | I |
| **Cleanup console.log (2.4)** | A | R | R | C |
| **useDebounced DRY (2.5)** | A | R | I | I |
| **Migrar Hardcodeos (2.6)** | A | C | R | R |
| **Breadcrumbs (2.7)** | A | C | R | I |
| **Auditoría F2 (2.10)** | R | I | I | I |
| **Modo Oscuro (3.1)** | A | R | C | I |
| **Favoritos Sync (3.2)** | A | C | R | I |
| **Iconos Zodiaco (3.3)** | A | I | C | R |
| **Fuentes Self-Hosted (3.4)** | A | R | I | I |
| **Accesibilidad (3.5)** | A | I | R | C |
| **Tests Integración (4.1)** | A | R | R | C |
| **Tests E2E (4.2)** | A | R | C | I |
| **Tests a11y (4.3)** | A | I | R | I |
| **Tests Visual (4.4)** | A | I | R | C |
| **CI/CD (4.5)** | A | R | I | I |
| **Analytics Admin (5.1)** | A | C | R | I |
| **Admin Roles UI (5.2)** | A | R | C | I |
| **Advanced AI (5.3)** | A | C | I | R |
| **Monitoreo (5.4)** | A | R | I | I |
| **Cierre (5.5)** | R | C | C | I |

**Leyenda**: R = Responsible (ejecuta), A = Accountable (aprueba), C = Consulted (asesora), I = Informed (notificar)

---

## 6. REGLAS DE COMUNICACIÓN ENTRE AGENTES

1. **Toda decisión arquitectónica** → Se registra en `10_MASTER_DECISION_LOG.md`.
2. **Toda tarea completada** → Se actualiza en `00_MASTER_EXECUTION_ROADMAP.md`.
3. **Todo bloqueo** → Se notifica a Anti-Gravity con evidencia del bloqueo.
4. **Toda migración** → Se anuncia antes de crearla (MUTEX).
5. **Todo cambio de alcance** → Requiere actualización del blueprint en `04_MODULE_BLUEPRINTS.md`.

---

*Gobernanza de agentes derivada de: 11_PLAN_DE_DELEGACION.md (FASE 1), ARCHITECTURE_AUDIT.md, 04_MODULE_BLUEPRINTS.md.*