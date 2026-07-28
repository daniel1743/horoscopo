# 01_ARCHITECTURE_IMMUTABLE.md — La Constitución del Proyecto Astral

**Versión**: 1.0
**Fecha**: 28/07/2026
**Propósito**: Definir las reglas arquitectónicas que ningún agente, desarrollador o automatización puede romper. Esta constitución prevalece sobre cualquier especificación, ticket o instrucción.

---

## REGLA 1: Separación Estricta Cliente / Servidor

### Enunciado
Toda lógica que opere sobre datos sensibles, astronomía, IA o service_role DEBE residir exclusivamente en server functions (`createServerFn`). Nunca en código cliente.

### Motivo
- La API key de OpenAI y el service_role de Supabase están aislados del cliente por diseño.
- Sin esta separación, las credenciales se expondrían al navegador.
- El motor astronómico opera con dependencias pesadas (~80KB astronomy-engine) que no deben llegar al bundle del cliente.

### Evidencia
- `SUPABASE_SERVICE_ROLE_KEY` solo en `src/integrations/supabase/client.server.ts` — importado ÚNICAMENTE vía `dynamic import()` dentro de `createServerFn`.
- `OPENAI_API_KEY` solo en server functions (`src/lib/ai/`).
- `src/server/moon/` — motor astronómico puro, nunca importado desde ningún `*.tsx` cliente.

### Consecuencia
Cualquier módulo que viole esta regla debe ser refactorizado antes de merge.

### Riesgo de incumplimiento
**CRÍTICO**: Exposición de secretos en el bundle cliente. Brecha de seguridad directa.

---

## REGLA 2: Toda Astronomía Ocurre en el Servidor

### Enunciado
Cualquier cálculo astronómico (posición lunar, fase, iluminación, signo zodiacal lunar) DEBE ejecutarse exclusivamente en `src/server/moon/`. La IA nunca calcula astronomía.

### Motivo
- La astronomía es determinista y debe tener precisión verificable (Δ ≤ 1.2 min contra USNO/NASA).
- La IA (OpenAI) es no-determinista y puede alucinar datos astronómicos.
- El contrato `MoonEngine` permite reemplazar la implementación sin afectar al resto del sistema.

### Evidencia
- `src/server/moon/MoonEngine.ts` — Interfaz del motor astronómico.
- `src/lib/moon/repository.ts` — Datos editoriales (NO astronómicos) sobre fases lunares.
- 11/11 tests de precisión verificados contra USNO/NASA (evidencia en `PERFORMANCE_AUDIT.md`).
- Separación documentada en Auditoría Maestra: "Excelente separación dato ↔ editorial en sistema lunar".

### Consecuencia
Ningún módulo de IA (Cline, Claude, ChatGPT) puede responder preguntas astronómicas basándose en su propio conocimiento. Debe consultar el MoonEngine.

### Riesgo de incumplimiento
**ALTO**: Datos astronómicos incorrectos visibles al usuario final. Pérdida de credibilidad del producto.

---

## REGLA 3: Todo Contenido Automático Pasa por Validación

### Enunciado
Cualquier contenido generado automáticamente (IA, scraping, importación) DEBE pasar por el workflow editorial (`draft → review → published`) antes de ser visible públicamente. No se publica contenido sin revisión humana o flag explícito.

### Motivo
- La IA puede generar contenido inexacto, ofensivo o desalineado con la voz editorial.
- El sistema editorial ya tiene control de concurrencia optimista (version-based updates).
- El CMS administra el ciclo de vida completo de cualquier contenido.

### Evidencia
- `src/lib/admin/articles.functions.ts` — version-based updates, double WHERE para control de concurrencia.
- Workflow de estados: `draft`, `published`, `archived`.
- `IMPLEMENTATION_GAP_REPORT.md`: "AI — rate limiting, sin multi-step advanced".

### Consecuencia
Cualquier módulo que publique contenido automático sin pasar por el workflow editorial debe ser revertido.

### Riesgo de incumplimiento
**MEDIO**: Contenido no revisado visible en producción. Riesgo reputacional.

---

## REGLA 4: Ningún Módulo Nuevo Puede Ignorar el Workflow Editorial

### Enunciado
Todo módulo que produzca contenido textual visible al público DEBE integrarse con el sistema editorial existente. No se crean sistemas de publicación paralelos.

### Motivo
- El sistema editorial ya gestiona: artículos, categorías, autores, reading time, estados (draft/published/archived).
- Duplicar la lógica de publicación crea divergencia y deuda técnica.
- La tabla `articles` y sus server functions son el single source of truth para contenido público.

### Evidencia
- `src/lib/editorial/` — Funciones editoriales centralizadas.
- `src/lib/admin/articles.functions.ts` — CRUD unificado.
- YAML 05 (Editorial): "CRUD unificado, autores, categorías, reading time".

### Consecuencia
Cualquier nuevo módulo de contenido DEBE usar las funciones editoriales existentes o justificar por escrito en `10_MASTER_DECISION_LOG.md` por qué necesita un sistema separado.

### Riesgo de incumplimiento
**ALTO**: Dos sistemas de publicación divergentes. Inconsistencia de datos. Deuda técnica compuesta.

---

## REGLA 5: Ningún Módulo Puede Duplicar Otro Existente

### Enunciado
Antes de crear cualquier componente, servicio, hook, tabla, ruta, función o migración, se DEBE verificar que no exista ya una implementación funcionalmente equivalente. La reutilización es obligatoria.

### Motivo
- Ya se detectó duplicación: `useDebounced` en 2 archivos idénticos.
- El inventario de FASE 1 cataloga más de 30 componentes reutilizables.
- Cada duplicación aumenta la superficie de bugs y el costo de mantenimiento.

### Evidencia
- `ARCHITECTURE_AUDIT.md`: "4 violaciones detectadas: duplicated useDebounced, 54 console.log, src/pages/ legacy, 4 createClient instances".
- `02_MATRIZ_REUTILIZACION.md` (FASE 1): 30+ componentes catalogados como reutilizables.
- `07_ARCHIVOS_NO_TOCAR.md` (FASE 1): 23 archivos congelados que no deben duplicarse.

### Consecuencia
Toda nueva implementación debe incluir evidencia de que se verificó el inventario existente. Ver procedimiento en `06_REUSE_FIRST_POLICY.md`.

### Riesgo de incumplimiento
**ALTO**: Codebase inflada, bugs duplicados, mantenimiento exponencial.

---

## REGLA 6: Todo Cambio Crítico Requiere Auditoría

### Enunciado
Cualquier modificación que afecte: seguridad (RLS, autenticación), arquitectura (capas, contratos), datos (esquema Supabase, migraciones) o performance (bundle, lazy loading) DEBE ser auditada antes de merge.

### Motivo
- El proyecto tiene una postura de seguridad EXCELENTE (92/100) que no debe degradarse.
- Las migraciones de Supabase son irreversibles sin backup.
- Los cambios arquitectónicos tienen efecto cascada en toda la codebase.

### Evidencia
- `SECURITY_AUDIT.md`: "4 capas de validación para roles admin, RLS en todas las tablas".
- `09_MAPA_SUPABASE.md` (FASE 1): Inventario completo de tablas, RLS y RPCs.
- 7 scripts de verificación en `scripts/` (check-compatibility-pairs, check-direct-icon-imports, etc.).

### Consecuencia
Cambios críticos sin auditoría deben ser revertidos. El agente auditor (Anti-Gravity) tiene autoridad de veto.

### Riesgo de incumplimiento
**CRÍTICO**: Degradación de seguridad, pérdida de datos, arquitectura inconsistente.

---

## REGLA 7: El Design System es Single Source of Truth Visual

### Enunciado
Todo estilo visual DEBE usar los tokens del Design System (`src/styles.css` + `src/design-system/tokens.ts`). No se permiten hardcodeos de colores, espaciados, sombras o radios.

### Motivo
- Hay 24 tokens de color, 9 estilos tipográficos, 6 radios, 4 sombras, 9 de spacing definidos.
- Se detectaron ~40+ hardcodeos que no usan los tokens.
- Sin esta regla, el modo oscuro es imposible de implementar consistentemente.
- Los tokens en CSS y TS están sincronizados (doble fuente).

### Evidencia
- `DESIGN_SYSTEM_AUDIT.md`: "~40+ fugas detectadas que deben migrarse".
- Script `scripts/check-hardcoded-styles.ts` automatiza la detección.
- `src/design-system/tokens.ts` y `src/styles.css` sincronizados.

### Consecuencia
Nuevo código con hardcodeos será rechazado en code review. Script `check-hardcoded-styles.ts` debe pasar limpiamente.

### Riesgo de incumplimiento
**MEDIO**: Modo oscuro imposible, inconsistencia visual, mantenibilidad degradada.

---

## REGLA 8: Las Migraciones de Supabase Son Inmutables una vez Aplicadas

### Enunciado
Ninguna migración ya aplicada en Supabase puede ser modificada. Los cambios de esquema requieren NUEVAS migraciones. Nunca se edita un archivo de migración existente.

### Motivo
- Las migraciones son el historial del esquema. Modificarlas rompe la trazabilidad.
- Supabase aplica migraciones secuencialmente. Editar una migración anterior causa divergencia.
- El seed de Supabase depende de que el esquema sea consistente.

### Evidencia
- `supabase/migrations/` contiene múltiples archivos secuenciales.
- `supabase/seed/` existe para datos de desarrollo.
- `09_MAPA_SUPABASE.md` (FASE 1): Inventario de todas las migraciones.

### Consecuencia
Migraciones editadas serán detectadas en auditoría. Deben crearse nuevas migraciones que corrijan el esquema incrementalmente.

### Riesgo de incumplimiento
**CRÍTICO**: Corrupción del esquema de base de datos. Pérdida de datos en producción.

---

## REGLA 9: El SEO se Gestiona de Forma Centralizada

### Enunciado
Todos los meta tags, títulos, descripciones, canonical URLs y (futuros) structured data DEBEN gestionarse a través del sistema centralizado en `src/config/seo.ts`. No se hardcodean meta tags en componentes individuales.

### Motivo
- La configuración centralizada permite cambios globales sin tocar decenas de archivos.
- Facilita la implementación de structured data, Open Graph y Twitter Cards consistentes.
- Previene duplicación de títulos/descripciones entre rutas.

### Evidencia
- `src/config/seo.ts` — Archivo de configuración SEO centralizado (verificado en Auditoría Maestra).
- `PROJECT_AUDIT_MASTER.md`: "Meta tags centralizados pero faltan structured data, sitemap, breadcrumbs".

### Consecuencia
Cualquier meta tag fuera del sistema centralizado debe ser migrado inmediatamente.

### Riesgo de incumplimiento
**MEDIO**: SEO inconsistente, duplicate meta tags, pérdida de posicionamiento.

---

## REGLA 10: El Sistema de Roles es Único e Inmutable en su Definición Core

### Enunciado
Los roles definidos (`admin`, `editor`, `author`, `user`) y su jerarquía de permisos NO pueden ser modificados sin una decisión arquitectónica documentada. Cualquier ampliación del sistema requiere nueva migración y auditoría de seguridad.

### Motivo
- 4 capas de validación para roles admin ya implementadas y auditadas.
- RLS en Supabase depende de los roles definidos.
- Cambiar la jerarquía de roles puede abrir brechas de seguridad.

### Evidencia
- `ADMIN_ROLES_AND_PERMISSIONS.md` — Documentación completa del sistema de roles.
- `SECURITY_AUDIT.md`: "4 capas de validación para roles admin".
- `ADMIN_SECURITY_CHECKLIST.md` — Checklist de verificación.

### Consecuencia
Cambios no documentados en roles serán revertidos. Nuevos roles requieren: migración, RLS, auditoría, documentación.

### Riesgo de incumplimiento
**CRÍTICO**: Escalamiento de privilegios, brechas de seguridad.

---

## REGLA 11: React Query es la Única Capa de Caché y Estado del Servidor

### Enunciado
Toda obtención de datos del servidor DEBE usar TanStack Query a través de los query options centralizados en `src/services/`. No se crean sistemas alternativos de fetch, caché o estado del servidor.

### Motivo
- Los query options ya están definidos para cada módulo (moon, horoscope, tarot, editorial, etc.).
- La caché de React Query está correctamente configurada (staleTime, gcTime por módulo).
- Duplicar la capa de fetching genera estados inconsistentes.

### Evidencia
- `src/services/` — 5 archivos de query options centralizados.
- `PERFORMANCE_AUDIT.md`: "React Query caching is well configured".
- Patrón consistente en todos los módulos: repositorio → servicio → query options → componente.

### Consecuencia
Cualquier `fetch()` directo o sistema de caché alternativo debe migrarse a TanStack Query.

### Riesgo de incumplimiento
**MEDIO**: Datos inconsistentes entre componentes, caché fragmentada, bugs de estado.

---

## MATRIZ DE REGLAS

| # | Regla | Severidad | Ámbito |
|---|-------|-----------|--------|
| 1 | Separación Cliente / Servidor | CRÍTICA | Seguridad |
| 2 | Astronomía en Server | ALTA | Corrección |
| 3 | Validación de contenido automático | MEDIA | Editorial |
| 4 | No ignorar Workflow editorial | ALTA | Arquitectura |
| 5 | No duplicar módulos | ALTA | Mantenibilidad |
| 6 | Auditoría pre-merge para cambios críticos | CRÍTICA | Gobernanza |
| 7 | Design System como single source | MEDIA | UI/UX |
| 8 | Migraciones inmutables | CRÍTICA | Datos |
| 9 | SEO centralizado | MEDIA | Marketing |
| 10 | Roles inmutables en core | CRÍTICA | Seguridad |
| 11 | React Query como única capa de datos | MEDIA | Arquitectura |

---

*Constitución generada a partir de evidencia en: PROJECT_AUDIT_MASTER.md, ARCHITECTURE_AUDIT.md, SECURITY_AUDIT.md, DESIGN_SYSTEM_AUDIT.md, PERFORMANCE_AUDIT.md, TECHNICAL_DEBT_REPORT.md, IMPLEMENTATION_GAP_REPORT.md, FINAL_PROJECT_STATUS.md, y 14 documentos FASE 1.*