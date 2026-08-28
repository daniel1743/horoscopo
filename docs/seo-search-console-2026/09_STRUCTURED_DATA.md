# SEO-09A — Auditoría y arquitectura de Structured Data / JSON-LD

Fecha: 2026-08-18
Proyecto: Creovision.io
Agente: Claude Sonnet (Arquitecto SEO técnico y auditor de datos estructurados)
Modo: AUDITORIA_Y_ESPECIFICACION_SIN_IMPLEMENTACION
Estado: PASS

## 1. Objetivo

Auditar el estado real de structured data de Creovision y diseñar una implementación JSON-LD segura, mínima y verificable sin inventar datos que no existan, describiendo correctamente las entidades y páginas existentes. El objetivo NO es forzar la elegibilidad de "rich results", sino semantizar el contenido mediante el marcado correcto sin modificar la metadata, H1, titles o contenidos.

## 2. Estado heredado

Todas las fases anteriores hasta SEO-08 completadas (SEO-00 a SEO-08D). Existen páginas con protecciones explícitas de regresión:

- HARD_FREEZE: `/`, `/horoscopo`, `/tarot/carta-del-dia`, `/tarot/tres-cartas/trabajo`
- OPTIMIZADAS: `/luna`, `/tarot/tres-cartas`, `/compatibilidad/geminis/sagitario`
- Índice de breadcrumbs está oculto; FAQ real es inexistente; Perfiles editoriales reales pendientes (DEFER).

## 3. Git status

Cambios preexistentes encontrados antes de iniciar: modificaciones funcionales ajenas en `src/pages/*`, `src/components/*` y `src/routes/*`, además de scripts no-SEO. El scope de esta auditoría es 100% no destructivo: se añaden solo documentos Markdown y no se hace un commit ni reset sobre el repositorio.

## 4. JSON-LD actual

El proyecto cuenta con un helper `structuredData` en `src/config/seo.ts` y un componente de inyección por lado del cliente `StructuredData` en `src/components/seo/StructuredData.tsx`.

- Schema actuales existentes como functions: `organization`, `website`, `breadcrumb`, `article`, `faq`, `howTo`.
- NO se confirmó uso de estos helpers o del componente dentro de las rutas evaluadas. La implementación actual se encuentra latente.

## 5. SSR

Las inyecciones de `StructuredData` actuales se apoyan en un hook `useEffect`, lo cual implica Client-Side Rendering (CSR). El HTML devuelto en SSR carece de etiqueta `<script type="application/ld+json">`.
A través de `TanStack Router`, la función `head()` permite el retorno de un array `scripts`, lo que facilita la entrega estable de `application/ld+json` desde SSR.

## 6. Arquitectura propuesta

**CENTRAL_HELPER_PLUS_ROUTE_DATA**.
Para garantizar deduplicación de nodos, prevenir redundancia de query y simplificar la gestión en una sola pasada, un helper centralizado `buildJsonLd` (o adaptado en `buildMeta`) recibirá la intención semántica y datos dinámicos (`loaderData`) desde la función `head()` de cada ruta. Retornará el array serializado con la estructura del `@graph` que integra tanto el global `WebSite` como el `WebPage`/`CollectionPage` local, insertándolo vía `<script type="application/ld+json">` de TanStack en SSR.

## 7. WebSite

**IMPLEMENT**.
Se definirá el nodo `WebSite` que aparecerá en el `@graph` general.

- Campos: `@id`, `url`, `name`, `description`, `publisher`.
- `SearchAction`: NO_NEED. La búsqueda interna fue removida del sitemap (noindexed en SEO-02B), por lo que no aporta valor promocionarla en rich snippets.

## 8. Organization

**DEFER**.
Creovision actualmente funciona como una marca/proyecto. Al no existir perfiles sociales oficiales confirmados ni un logotipo legal en la directiva, se evita la invención de nodos vacíos o properties `sameAs` no respaldadas.

## 9. WebPage

**IMPLEMENT**.
Este será el nodo principal (Main Entity) de la mayoría de documentos, incluyendo el index, herramientas de Tarot, rutas dinámicas de compatibilidad y fichas lunares. Se mantendrá alineación estricta del `name` al Title/H1 y `description` al Meta Description de la ruta.

## 10. CollectionPage

**IMPLEMENT**.
Utilizado para los distintos "hubs" o repositorios de enlaces sin semántica de lectura densa o herramienta. Aplicará a `/horoscopo`, `/luna`, `/tarot` y `/tarot/cartas`.

## 11. Article

**DEFER**.
El contenido de `/guias` y `/temas` carece de publicaciones reales (solo un artículo demo). Las fichas de compatibilidad u horóscopos se modelarán más fielmente como `WebPage`. Si hubiere contenido tipo ensayo o noticia en un futuro, el nodo se adaptará.

## 12. BreadcrumbList

**DO_NOT_IMPLEMENT**.
`AppBreadcrumbs` existe en código pero devuelve `null`. Emitir BreadcrumbList contradiría la norma de consistencia entre la navegación visible y el marcado.

## 13. FAQPage

**DO_NOT_IMPLEMENT**.
No existen bloques estructurados claros de FAQ visibles y dedicados a "Preguntas Frecuentes" formales en las páginas auditadas con valor para el producto.

## 14. Horóscopo

Evaluado:

- `/horoscopo` (Hub): **CollectionPage**.
- `/horoscopo/$sign`: **WebPage**. Carece de formato editorial `Article` tradicional; no hay schema nativo de `Horoscope`.

## 15. Luna

Evaluada:

- `/luna` (Hub): **CollectionPage**.
- `/luna/hoy`, `/luna/calendario`: **WebPage**.
- `/luna/fases/$slug`: **WebPage** (consume los datos que ya provee la ruta).

## 16. Tarot

Evaluado:

- `/tarot`: **CollectionPage**.
- Herramientas `/tarot/tres-cartas`, `/tarot/tres-cartas/trabajo`, `/tarot/carta-del-dia`, `/tarot/si-o-no`: **WebPage**.

## 17. Tarot cards

Evaluado:

- `/tarot/cartas` (Librería): **CollectionPage**.
- `/tarot/cartas/$card`: **WebPage**.

## 18. Compatibilidad

Evaluada:

- `/compatibilidad`: **CollectionPage**.
- `/compatibilidad/$signA/$signB`: **WebPage**. Su intención prioritaria es funcionar como perfil relacional, el cual se alinea a una página web informativa de consulta, sin justificar `Article`.

## 19. Editorial

Como documentado previamente, no se crea `Article` en el vacío para datos inexistentes. Queda pausado hasta que haya material oficial.

## 20. @graph/@id

**Identificadores deterministas:**

- WebSite: `https://www.creovision.io/#website`
- WebPage: `[canonical_url]#webpage`
- CollectionPage: `[canonical_url]#collection`

No se crearán UUIDs aleatorios. El modelo gráfico `@graph` albergará todos los nodos requeridos bajo el mismo payload SSR para el documento.

## 21. Datos dinámicos

Los schemas que requieran datos dinámicos (Horóscopo de signo, Fase lunar, Carta del Tarot, Pareja de Compatibilidad) los consumirán directamente desde el `loaderData` capturado en la función `head()` de la ruta respectiva, el cual estará disponible por ser cargado previamente y ser requerido para la interfaz.
El helper JSON-LD solo se invoca con las properties exactas extraídas de estos datos.

## 22. Queries adicionales

**NO**.
Los datos necesarios para `WebPage` o `CollectionPage` ya se encontrarán disponibles a través de los helpers de metadata o del loader. No se añadirán peticiones de base de datos adicionales con propósitos exclusivos de JSON-LD.

## 23. Duplicación

Para eludir duplicación:

- Se eliminará el componente `StructuredData` cliente (para prevenir JSON-LD fantasma/tardío en CSR).
- El JSON-LD será generado exclusivamente y de una vez en SSR.
- Cada ruta emitirá un solo `<script>` con el JSON en su `head()`.

## 24. Protected pages

| Ruta protegida               | Schema propuesto         | Cambio visible | Riesgo |
| ---------------------------- | ------------------------ | -------------- | ------ |
| `/`                          | WebPage + WebSite        | Ninguno        | Bajo   |
| `/horoscopo`                 | CollectionPage + WebSite | Ninguno        | Bajo   |
| `/tarot/carta-del-dia`       | WebPage + WebSite        | Ninguno        | Bajo   |
| `/tarot/tres-cartas/trabajo` | WebPage + WebSite        | Ninguno        | Bajo   |

## 25. Schema matrix

| Familia/Ruta                                         | Schema recomendado | Implementar | Datos fuente    | SSR | Riesgo |
| ---------------------------------------------------- | ------------------ | ----------- | --------------- | --- | ------ |
| Global (`index`, tools)                              | WebSite            | YES         | siteConfig      | YES | Bajo   |
| Home (`/`)                                           | WebPage            | YES         | seoDefaults     | YES | Bajo   |
| Horóscopo hub (`/horoscopo`)                         | CollectionPage     | YES         | meta local      | YES | Bajo   |
| Horóscopo signo (`/horoscopo/$sign`)                 | WebPage            | YES         | params/meta     | YES | Bajo   |
| Luna hub (`/luna`)                                   | CollectionPage     | YES         | meta local      | YES | Bajo   |
| Luna fase (`/luna/fases/$slug`)                      | WebPage            | YES         | loaderData      | YES | Bajo   |
| Tarot hub (`/tarot`)                                 | CollectionPage     | YES         | meta local      | YES | Bajo   |
| Tarot herramienta (`/tarot/tres-cartas/*`)           | WebPage            | YES         | config local    | YES | Bajo   |
| Tarot cartas hub (`/tarot/cartas`)                   | CollectionPage     | YES         | meta local      | YES | Bajo   |
| Tarot carta detalle (`/tarot/cartas/$card`)          | WebPage            | YES         | loaderData.card | YES | Medio  |
| Compatibilidad hub (`/compatibilidad`)               | CollectionPage     | YES         | meta local      | YES | Bajo   |
| Compatibilidad par (`/compatibilidad/$signA/$signB`) | WebPage            | YES         | loaderData      | YES | Medio  |

## 26. P0/P1/P2

- **P0**: Borrar el sistema obsoleto/latente CSR (`StructuredData.tsx`) y migrar los helpers existentes en `seo.ts` a un creador central único para `application/ld+json`.
- **P1**: Proveer semántica básica determinista a Home y las páginas principales mediante `WebSite` y `WebPage`.
- **P2**: Implementar extensiones de hubs con `CollectionPage`.

## 27. CHANGE-09B

### CHANGE-09B-01 — Refactor del framework JSON-LD

PRIORIDAD: P0
RUTA/FAMILIA: Infraestructura SEO global
OBJETIVO: Crear un ayudante central basado en `@graph` y eliminar el CSR de structured data.
ARCHIVO: `src/config/seo.ts` y `src/components/seo/StructuredData.tsx`
SIMBOLO: `buildJsonLd` (nuevo), `structuredData` (eliminar/reformular), `StructuredData` (eliminar componente de UI).
SCHEMA_TYPE: `WebSite`, `WebPage`, `CollectionPage`
@ID: Determinista (e.g. `#website`, `#webpage`, `#collection`)
DATA_SOURCE: `input` manual.
SSR: Sí, diseñado para insertarse como Array Element dentro del `scripts` devuelto por `head()`.
PROPERTIES_EXACTAS:

- WebSite: `@id`, `url`, `name`, `description`, `publisher`. Sin SearchAction.
- WebPage/CollectionPage: `@id`, `url`, `name`, `description`, `isPartOf: { "@id": "https://www.creovision.io/#website" }`.
  CONDICIONES: El helper consolida siempre `WebSite` al lado del nodo local y envuelve el resultado en un tag script.
  NO_INCLUIR: UUIDs; FAQPage, Breadcrumbs, Organization, Article.
  NO_CAMBIAR: Metadata base, canonical original.
  TEST: Ejecutar suite SEO.
  RIESGO: Bajo (cambio estático no afecta render).
  ROLLBACK: Deshacer las eliminaciones y la inyección en head.

### CHANGE-09B-02 — Aplicación de schema a rutas protegidas y estáticas

PRIORIDAD: P1
RUTA/FAMILIA: `/`, `/horoscopo`, hubs, `/tarot/carta-del-dia`, `/tarot/tres-cartas/trabajo`
OBJETIVO: Adicionar JSON-LD a todas las rutas protegidas y herramientas estáticas utilizando `buildJsonLd`.
ARCHIVO: `src/routes/index.tsx`, `src/routes/horoscopo.index.tsx`, etc.
SIMBOLO: `head` (agregar `scripts`)
SCHEMA_TYPE: `WebPage` (o `CollectionPage` según la matriz)
@ID: Derivado del canonical local.
DATA_SOURCE: Valores estáticos de `buildMeta` o `seoDefaults`.
SSR: Sí.
PROPERTIES_EXACTAS: El `name` será el Title definido, `description` será el Meta Description.
CONDICIONES: Solo inyectar script SSR; usar la URL canónica existente.
NO_INCLUIR: Nodos adicionales no correspondientes.
NO_CAMBIAR: Códigos funcionales de página, metadata/robots.
TEST: Validar tests.
RIESGO: Bajo.
ROLLBACK: Remover `scripts` del return the `head()`.

### CHANGE-09B-03 — Aplicación de schema a rutas dinámicas dependientes de loader

PRIORIDAD: P1
RUTA/FAMILIA: `/luna/fases/$slug`, `/tarot/cartas/$card`, `/horoscopo/$sign`, `/compatibilidad/$signA/$signB`
OBJETIVO: Emitir el JSON-LD tomando los datos exactos del contenido DB cargado vía loaderData.
ARCHIVO: Archivos de las rutas dinámicas correspondientes.
SIMBOLO: `head` (agregar `scripts`)
SCHEMA_TYPE: `WebPage`
@ID: Canonical url `#webpage`.
DATA_SOURCE: `loaderData`
SSR: Sí.
PROPERTIES_EXACTAS: `name` alineado con Title; `description` alineado con Meta Description (ya extraídos del loaderData en fase 08B).
CONDICIONES: Solo si los datos están disponibles; el layout no se altera.
NO_INCLUIR: Modificaciones en consultas de base de datos.
NO_CAMBIAR: HTML renderizado.
TEST: Suite SEO indexability baseline.
RIESGO: Medio (requiere desempaquetar parámetros).
ROLLBACK: Eliminar `scripts`.

## 28. Tests

Comando baseline: `npx --yes vitest run src/config/seo-indexability.test.ts`
Resultado del baseline verificado: PASS (34 tests run y pasados).
La regla `no_fix: true` dicta que no se altera la suite durante esta auditoría.

## 29. Validación

Se validó la existencia de CSR en `JSON-LD` que debía eliminarse (SEO00-02 hallazgo original confirmado).
Queda documentado el marco de validación para Codex en SEO-09B: el SSR HTML debe contener la etiqueta `<script type="application/ld+json">` validando el formato `@graph` y previniendo colisiones.

## 30. Riesgos

El cambio requiere editar la mayoría de los `head()` definidos a lo largo de los archivos route de TanStack Router para acoplar el atributo `scripts`. Esto no afecta HTML funcional ni React nodes, por lo que el riesgo de UX es cero, pero la superficie del cambio de archivo es extensa.

## 31. Rollback

Si hubiere fallo durante SEO-09B, la estrategia de regresión exige:

- Volver atrás las firmas de `head()`.
- Restaurar `StructuredData.tsx` en el folder de componentes.

## 32. Documentación

Se elaboró exitosamente el presente archivo `09_STRUCTURED_DATA.md` y se actualiza el `README.md`.

## 33. Estado final

**PASS**. Se cerraron los specs técnicos para la arquitectura centralizada JSON-LD sin romper el contrato actual, posponiendo schemas que requerían data inexistente, y validando baseline de indexabilidad. Handoff a Codex para SEO-09B disponible.

## Implementación SEO-09B — 2026-08-19

### Arquitectura final

Se implementó la arquitectura `CENTRAL_HELPER_PLUS_ROUTE_DATA` en `src/config/seo.ts`.
El flujo final es:

- `buildJsonLd(input)` construye el payload semántico con `@context` + `@graph`.
- `serializeJsonLdForScript(payload)` serializa JSON y escapa caracteres de riesgo para evitar cierre prematuro de script.
- `buildJsonLdScript(input)` devuelve el tag para `head().scripts`.
- `buildMeta({ structuredData })` añade `scripts` solo cuando una ruta lo solicita explícitamente.

### Helper buildJsonLd

`buildJsonLd` recibe `canonical`, `name`, `description` y `pageType`.
Solo permite `WebPage` y `CollectionPage` como nodo local. El nodo global es siempre `WebSite`.

### StructuredData CSR antes/después

Antes existía `src/components/seo/StructuredData.tsx`, basado en `useEffect`, sin consumidores activos confirmados por búsqueda global.
Después se retiró el componente CSR y no queda inyección JSON-LD por cliente.

### Cómo se evitó duplicación

No se añadió JSON-LD en `__root.tsx`.
Cada ruta aprobada emite, cuando corresponde, un solo `scripts` array con un único payload lógico.
El payload contiene exactamente un `WebSite` y un nodo local.

### WebSite

El nodo global usa:

- `@type`: `WebSite`
- `@id`: `https://www.creovision.io/#website`
- `url`: `https://www.creovision.io/`
- `name`: `Creovision`
- `description`: descripción real de `siteConfig`

### WebPage

Se aplica a home, herramientas y rutas dinámicas aprobadas.
El `@id` local usa `<canonical>#webpage` y `isPartOf` apunta al website.

### CollectionPage

Se aplica a hubs aprobados: `/horoscopo`, `/luna`, `/tarot`, `/tarot/cartas` y `/compatibilidad`.
El nodo local mantiene `@id` como `<canonical>#webpage` para cumplir el contrato operativo SEO-09B.

### Rutas implementadas

Estáticas/hubs:
`/`, `/horoscopo`, `/luna`, `/luna/hoy`, `/luna/calendario`, `/tarot`, `/tarot/cartas`, `/tarot/carta-del-dia`, `/tarot/si-o-no`, `/tarot/tres-cartas`, `/tarot/tres-cartas/amor`, `/tarot/tres-cartas/decision`, `/tarot/tres-cartas/trabajo`, `/compatibilidad`.

Dinámicas:
`/horoscopo/$sign`, `/luna/fases/$slug`, `/tarot/cartas/$card`, `/compatibilidad/$signA/$signB`.

### Rutas deliberadamente excluidas

No se implementó structured data en editorial (`/guias`, `/temas`), perfiles, búsqueda, auth, legales, admin ni páginas privadas.
Tampoco se añadió JSON-LD global en root para evitar duplicación root + child.

### SSR, @graph y @id

La emisión ocurre en `head().scripts`, por lo que queda disponible en SSR.
El build generado contiene `application/ld+json`, `@graph`, `#website` y `#webpage`.

### Datos dinámicos y queries adicionales

Las rutas dinámicas reutilizan metadata ya calculada desde params o `loaderData`.
No se añadió ninguna consulta de base de datos para JSON-LD.

### Compatibilidad fallback

`/compatibilidad/$signA/$signB` conserva la política de `compatibility-indexability.ts`.
Los pares fuera de allowlist siguen con `noindex, follow`; JSON-LD no altera robots ni sitemap.

### Schemas no implementados

No se implementó `Organization`, `SearchAction`, `Article`, `BreadcrumbList`, `FAQPage`, `Product`, `Offer`, `Review`, `AggregateRating`, `LocalBusiness`, `HowTo` ni `MedicalWebPage`.

### Metadata preservada

No se cambiaron titles, descriptions, canonicales, robots, OpenGraph, Twitter metadata, H1, CTA, navegación, sitemap ni contenido visible por motivo de SEO-09B.

### Serialización segura

La suite focal cubre textos con `</script>`, `<script>`, `&` y Unicode.
La salida permanece parseable por JSON y no contiene secuencias HTML capaces de cerrar el script.

### Tests, build y typecheck

- `npx --yes vitest run src/config/structured-data.test.ts`: PASS, 5 tests.
- `npx --yes vitest run src/config/seo-indexability.test.ts`: PASS, 34 tests.
- `npm run build`: PASS.
- `npx tsc --noEmit --pretty false`: FAIL por deuda global preexistente; sin errores en archivos SEO-09B.

### Diff

Cambios SEO-09B propios:

- `src/config/seo.ts`
- `src/config/structured-data.test.ts`
- `src/components/seo/StructuredData.tsx`
- rutas públicas aprobadas por la matriz SEO-09A
- `docs/seo-search-console-2026/09_STRUCTURED_DATA.md`
- `docs/seo-search-console-2026/README.md`

El repositorio ya tenía cambios preexistentes de fases anteriores y otros módulos; no se revirtieron.

### Riesgos

Riesgo bajo en UI: no hay cambios visibles.
Riesgo residual: validación externa de Schema Markup Validator queda para SEO-09C.

### Rollback

Retirar `structuredData` de las llamadas `buildMeta`, quitar `scripts` manuales en rutas dinámicas/manuales y restaurar `src/components/seo/StructuredData.tsx` si se decide volver temporalmente al sistema CSR.

### Estado

SEO-09B queda **COMPLETADO**.
SEO-09 sigue **EN_CURSO** porque SEO-09C queda pendiente y no fue iniciado.

## SEO-09C — Revisión post-implementación — 2026-08-19

Modo: POST_IMPLEMENTATION_AUDIT_NO_CODE
Estado: PASS_CON_OBSERVACIONES
Agente: Claude Sonnet (Auditor SEO técnico independiente)

### 1. Objetivo

Verificar de forma independiente lo implementado por Codex en SEO-09B: SSR real del JSON-LD, cero duplicación, serialización segura, alineación canonical/metadata, reutilización de loaderData, cero queries extra, respeto de fallbacks noindex, ausencia de schemas no autorizados y no regresión de SEO-07/SEO-08 ni páginas protegidas. No se modifica código.

### 2. Origen leído

Leídos: `09_STRUCTURED_DATA.md` (SEO-09A y la implementación SEO-09B), `README.md`, `03_PAGINAS_PROTEGIDAS_TOP10.md`, `08_METADATA_Y_CAPAS_DE_CONTENIDO.md`.

### 3. Git status

Cambios funcionales SEO-09B: `D src/components/seo/StructuredData.tsx` (CSR eliminado); `M src/config/seo.ts` (helper nuevo); `?? src/config/structured-data.test.ts` (5 tests); `M src/routes/*` (rutas aprobadas añaden `structuredData` o `scripts`); `?? supabase/migrations/20260818233000_....sql` (marca, SEO-08D). Resto preexistente no revertido.

### 4. Implementación encontrada

| Elemento | Esperado | Encontrado | Estado |
|---|---|---|---|
| Helper central | `buildJsonLd` | `buildJsonLd` en `src/config/seo.ts` | OK |
| Serialización | función de escape | `serializeJsonLdForScript` (escapa menor, mayor, ampersand) | OK |
| Tag script | application/ld+json | `buildJsonLdScript` devuelve `{ type, children }` | OK |
| Integración | `buildMeta({ structuredData })` | `scripts` solo si `structuredData` y `canonical` | OK |
| CSR legacy | eliminado | `StructuredData.tsx` borrado (estado D) | OK |
| Dedup | sin JSON-LD en root | `__root.tsx` no emite scripts | OK |

### 5. Helper buildJsonLd

Devuelve `{ "@context": "https://schema.org", "@graph": [WebSite, nodoLocal] }`. Solo admite `WebPage` o `CollectionPage`. Identificador local = canónica con sufijo `#webpage` (patrón operativo SEO-09B, consistente con `page_id_pattern`). WebSite usa `https://www.creovision.io/#website`, `url`, `name` "Creovision" y `description` de siteConfig. Sin SearchAction, sin uuid, sin nodos prohibidos.

### 6. CSR legacy

`StructuredData.tsx` eliminado. No queda inyección por useEffect. Resultado: UNUSED_LEGACY_NO_DUPLICATION. El objeto `structuredData` (funciones organization/website/breadcrumb/article/faq/howTo) sigue definido al final de `seo.ts` pero sin consumidor y no emite nada. P2 (limpieza inerte), no duplicación.

### 7. SSR

El JSON-LD se emite vía `head().scripts` (mecanismo SSR de TanStack Router), no por useEffect. `vite build` genera SSR sin errores. `vite preview` local es limitación de infraestructura conocida (SEO-04B/04C). Decisión: SSR_STRONGLY_VERIFIED.

### 8. WebSite

Un único nodo WebSite por graph, con identificador `https://www.creovision.io/#website`, url, name y description correctos. PASS.

### 9. WebPage

Home, herramientas y rutas dinámicas aprobadas. Identificador = canónica + `#webpage`, url canónica, name alineado con title, description alineado con metadata, isPartOf hacia website. PASS.

### 10. CollectionPage

Aplicado a `/horoscopo`, `/luna`, `/tarot`, `/tarot/cartas`, `/compatibilidad`, coincidiendo con la matriz SEO-09A. PASS.

### 11. @graph

Payload único `@context + @graph` con 2 nodos (1 WebSite + 1 local). PASS.

### 12. @id

Deterministas, sin UUIDs: website y canónica + sufijo `#webpage`. PASS.

### 13. Deduplicación

Sin JSON-LD en root, sin CSR, un único script por ruta. Resultado: NONE.

### 14. Serialización segura

`serializeJsonLdForScript` reemplaza los caracteres de riesgo por escapes unicode; la suite focal verifica los textos de prueba y que el JSON siga parseable. Resultado: SAFE.

### 15. Rutas protegidas

| Ruta | JSON-LD | Resto (H1/CTA/metadata/canonical/robots) | Estado |
|---|---|---|---|
| `/` | WebPage (head) | sin cambios | OK |
| `/horoscopo` | CollectionPage (head) | sin cambios | OK |
| `/tarot/carta-del-dia` | WebPage (head) | sin cambios | OK |
| `/tarot/tres-cartas/trabajo` | WebPage (head) | sin cambios | OK |

Cambio limitado al head (solo JSON-LD).

### 16. Rutas estáticas

`/`, `/horoscopo`, `/luna`, `/luna/hoy`, `/luna/calendario` (redirect), `/tarot`, `/tarot/cartas`, `/tarot/carta-del-dia`, `/tarot/si-o-no`, `/tarot/tres-cartas`, `/tarot/tres-cartas/amor`, `/tarot/tres-cartas/decision`, `/tarot/tres-cartas/trabajo`, `/compatibilidad`. Todas emiten WebPage/CollectionPage según la matriz. PASS.

### 17. Rutas dinámicas

`/horoscopo/$sign`, `/luna/fases/$slug`, `/tarot/cartas/$card`, `/compatibilidad/$signA/$signB` — todas WebPage. PASS.

### 18. Luna

`/luna/fases/$slug` reutiliza `loaderData.content` con `getMoonPhaseHeadMetadata` (seo_title/seo_description), sin query extra, con `buildJsonLdScript`. SEO-08B intacto. PASS.

### 19. Tarot cards

`parseTarotCardParams` solo valida no-vacío; loader resuelve desde `tarotService.getCardBySlug` (DB) y `notFound()` si no existe. `as-de-copas` y `dos-de-espadas` válidos; `carta-inexistente` notFound. Sin query extra. Canonical preservado. PASS.

### 20. Horóscopo

`/horoscopo/$sign` metadata preservada, WebPage, canonical por zodiacRoute. SEO-07 links intactos en SignHoroscopePage. PASS.

### 21. Compatibilidad

`getCompatibilityPairMeta` devuelve WebPage; `buildCompatibilityPairMeta` preserva indexabilidad (allowlist indexa, resto noindex,follow). PASS.

### 22. Fallback demo

Los pares fuera de allowlist (ej. `aries/aries`) conservan noindex,follow y self-canonical. El nodo WebPage JSON-LD también se emite para demos noindex, pero no altera robots/sitemap ni revierte el noindex. P2 (limpieza opcional), no contradice la política. Sin microfase requerida.

### 23. Queries adicionales

NO_ADDITIONAL. Luna y tarot reutilizan loaderData; horóscopo y compatibilidad usan params/meta estática.

### 24. Schemas ausentes

No se emiten Organization, SearchAction, Article, BreadcrumbList, FAQPage, Product, Offer, Review, AggregateRating, LocalBusiness, HowTo ni MedicalWebPage. Verificado por suite focal e inspección de buildJsonLd.

### 25. Metadata/canonical alignment

name desde title, description desde metadata, url e id desde canonical. Sin desalineación. PASS.

### 26. SEO-08 (regresión)

Tarot cards resuelven vía tarotService; sitemap completo; seo_title/seo_description de fases activos; migración de marca presente. PASS.

### 27. SEO-07 (regresión)

`alternativePairs` filtrado; enlaces par hacia horóscopos y signo hacia compatibilidad indexable intactos. PASS.

### 28. Tests

`structured-data.test.ts` PASS (5). `seo-indexability.test.ts` PASS (34). Total 39 PASS. Sin fallos nuevos.

### 29. Build

`npm run build` PASS (client + SSR + Nitro/Vercel).

### 30. Typecheck

FAIL_PREEXISTENTE_PERMITIDO. Errores de deuda global de rutas de navegación/cuenta/moon/tarot-grid (tipos de routes/zodiac); ninguno en archivos SEO-09B.

### 31. Diff

Limitado a `seo.ts`, `structured-data.test.ts`, eliminación de `StructuredData.tsx` y los `head()` de rutas aprobadas. Sin cambios no relacionados.

### 32. Defectos encontrados

Sin defectos P0/P1. Dos observaciones P2 inertes: OBS-1 (objeto `structuredData` legacy sin consumidor) y OBS-2 (JSON-LD también emitido en demos noindex). No bloquean el cierre.

### 33. CHANGE-09C-FIX

No aplica. No existen defectos que exijan microfase posterior.

### 34. Riesgos

`vite preview` no sirve como validación de SSR local; objeto legacy puede confundir; validación externa fuera de alcance (WebPage/CollectionPage no garantizan rich result, lo cual no invalida el marcado).

### 35. Documentación

Se actualiza este archivo y `README.md`. Sin documento paralelo.

### 36. Decisiones finales

```
structured_data: PASS
ssr: SSR_STRONGLY_VERIFIED
duplication: NONE
serialization: SAFE
queries: NO_ADDITIONAL
seo09_ready_to_close: YES
```

### 37. Estado

PASS_CON_OBSERVACIONES (2 observaciones P2 no bloqueantes).

No se modificó código funcional. SEO-09 queda listo para cerrar; SEO-10 queda pendiente y no fue iniciado.