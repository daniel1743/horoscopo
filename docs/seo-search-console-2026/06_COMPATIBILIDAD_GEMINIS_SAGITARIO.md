# SEO-06A — Compatibilidad Géminis + Sagitario

Fecha: 2026-08-17  
Modo: AUDITORIA_Y_ESPECIFICACION_SIN_IMPLEMENTACION  
Estado: PASS_CON_OBSERVACIONES

## 1. Objetivo SEO-06

Auditar `/compatibilidad/geminis/sagitario` y diseñar una intervención segura para responder mejor a la intención `Géminis y Sagitario`, sin implementar cambios y sin crear nuevas combinaciones.

## 2. Search Console

Ruta objetivo: `/compatibilidad/geminis/sagitario`.  
Impresiones observadas: 73.  
Posición media observada: 38.0.

| Query | Posición media observada |
|---|---:|
| `geminis y sagitario` | 31.9 |
| `sagitario y geminis` | 31.4 |
| `sagitario geminis` | 37.0 |
| `geminis y sagitario juntos` | 37.4 |
| `compatibilidad geminis y sagitario` | 41.8 |

Google ya relaciona la URL con el cluster correcto. No se concluye que Google no entienda la página.

## 3. Limitaciones

El volumen sigue siendo bajo. Las observaciones no demuestran causalidad SEO. Toda recomendación debe validarse por medición posterior.

## 4. Arquitectura actual

Ruta: `src/routes/compatibilidad.$signA.$signB.tsx`.  
Página: `src/pages/compatibility/CompatibilityPairPage.tsx`.  
Hub: `src/routes/compatibilidad.index.tsx` y `CompatibilityHubPage`.  
Servicio: `src/services/compatibility.service.ts`.  
Repositorio: `src/repositories/supabase-compatibility.repository.ts`.  
Normalización: `src/lib/compatibility/normalize-sign-pair.ts`.  
Route helper: `src/lib/compatibility/route-helpers.ts`.

La ruta valida signos, normaliza orden y redirige cualquier orden no canónico. Luego `loader` usa `ensureQueryData(compatibilityQueries.pair(...))`.

## 5. Data source

Fuente principal: tabla Supabase `compatibility_profiles`.  
Columnas mapeadas: `title`, `summary`, `dynamic_label`, `relationship_dynamic`, `dimensions`, `strengths`, `challenges`, `communication_tips`, `contexts`, `reflection_questions`, `misconceptions`, `seo_title`, `seo_description`, `is_demo`, `published_at`.

La migración `supabase/migrations/20260728001017_336aadc0-b1d8-450f-be52-69008c80a8e6.sql` inserta `geminis__sagitario` con `status='published'` e `is_demo=true`.

## 6. SSR

La ruta usa loader con React Query y `useSuspenseQuery` en la página. El contenido principal debería estar disponible en render inicial cuando el loader resuelve. No hay JSON-LD SSR activo en esta fase.

## 7. Metadata

Metadata actual en ruta, no desde `profile.seoTitle`:

- Title: `Géminis y Sagitario: compatibilidad simbólica · Creovision`
- Description: `Lectura editorial de la dinámica entre Géminis y Sagitario: comunicación, ritmo emocional y áreas de crecimiento.`
- Canonical: `https://www.creovision.io/compatibilidad/geminis/sagitario`
- OG/Twitter: generados por `buildMeta` desde title/description/canonical.
- Robots: `index, follow` por defecto de `buildMeta`.

## 8. H1/headings

H1 actual: `Géminis y Sagitario: curiosidad y horizonte`, desde `profile.title`.  
Eyebrow: `Polaridad complementaria`.  
H2/H3 principales:

- `Dinámica entre signos` como `sr-only`.
- `Dimensiones editoriales`.
- H3 de dimensiones: Comunicación, Ritmo emocional, Vida cotidiana, Atracción, Manejo de diferencias, Crecimiento.
- `Puntos de encuentro`.
- `Puntos a integrar`.
- `Sugerencias de comunicación`.
- `Cómo puede vivirse en distintos contextos`.
- Contextos: En una relación, En la amistad, En la colaboración.
- `Preguntas para reflexionar`.
- `Qué no debería asumirse`.
- `Prueba otra combinación`.
- `Otras combinaciones relacionadas` si hay alternativas.

## 9. Primer viewport

Primer viewport actual entrega H1, summary y una lectura rápida con tres items: Energía, Potencial y Cuida. Es útil, pero la respuesta directa a `¿son compatibles?` queda implícita en `Polaridad complementaria`, no formulada como respuesta inmediata.

Riesgo UX: la página empieza con buena identidad, pero no ofrece una sentencia clara tipo `Sí, pueden funcionar si...` antes del detalle.

## 10. Contenido actual

Contenido versionado para `geminis__sagitario`:

- Summary: dos formas de explorar el mundo; conversación como terreno común.
- Relationship dynamic: Géminis observa detalles y Sagitario busca sentidos amplios.
- Dimensiones: comunicación, ritmo emocional, vida cotidiana, atracción, conflicto, crecimiento.
- Fortalezas: diálogo constante, apertura al cambio, curiosidad.
- Desafíos: continuidad, evitación emocional, superficialidad si no se profundiza.
- Tips: conversaciones importantes, promesas cotidianas, nombrar sentimientos.
- Contextos: amor, amistad, colaboración.
- Preguntas y misconceptions.

## 11. Especificidad del contenido

| Sección | Clasificación | Evidencia | Riesgo de genericidad |
|---|---|---|---|
| H1/title DB | PAIR_SPECIFIC | Nombra Géminis + Sagitario y eje curiosidad/horizonte | Bajo |
| Summary | PAIR_SPECIFIC | conexiones cercanas vs grandes trayectos | Bajo |
| Quick read | TEMPLATE_TEXT + PAIR_SPECIFIC | labels fijos, valores desde DB | Medio |
| Relationship dynamic | PAIR_SPECIFIC | detalle vs sentido amplio | Bajo |
| Dimensiones | SIGN_SPECIFIC + TEMPLATE_TEXT | labels fijos; interpretaciones DB | Medio |
| Fortalezas/desafíos | PAIR_SPECIFIC | diálogo, cambio, evasión emocional | Bajo |
| Contextos | SIGN_SPECIFIC | romántico/amistad/colaboración con rasgos del par | Medio |
| Misconceptions | GENERIC_ASTROLOGY | libertad/curiosidad aplican al par, pero son amplias | Medio |
| Selector otra combinación | TEMPLATE_TEXT | selector global | Bajo |

## 12. Intenciones

| Intención | Importancia | Página la responde | Calidad actual | Acción recomendada |
|---|---|---|---|---|
| `geminis y sagitario` | PRIMARY | Sí | PARTIAL | Añadir respuesta inicial clara y bloque answer-first |
| `sagitario y geminis` | PRIMARY | Sí por redirect canónico | PARTIAL | Mantener URL única, incluir formulación natural inversa en copy |
| `compatibilidad geminis y sagitario` | PRIMARY | Sí | PARTIAL | Reforzar compatibilidad general y amor |
| `geminis y sagitario juntos` | SECONDARY | Parcialmente | PARTIAL | Expandir convivencia/ritmo cotidiano |
| `geminis sagitario amor` | SECONDARY | Sí en contexto romántico | WEAK | Expandir amor sin bloque largo |
| `geminis sagitario pareja` | SECONDARY | Parcialmente | WEAK | Añadir pareja/largo plazo dentro de amor |
| `geminis sagitario amistad` | SECONDARY | Sí | PARTIAL | Mantener/expandir poco |
| `geminis sagitario sexualidad` | OPTIONAL | No | ABSENT | Optional, no prioritaria |
| variantes de género | OPTIONAL | No | ABSENT | DO_NOT_TARGET |

## 13. Amor

Estado actual: existe contexto `romantic`, pero es breve: `Alegre y expansiva. Requiere trabajar sostenimiento y compromisos concretos.`

Acción recomendada: EXPAND. Añadir un bloque corto `En el amor` que explique atracción mental, libertad, dificultad con rutina y necesidad de acuerdos concretos. No convertir en contenido explícito ni determinista.

## 14. Comunicación

Estado actual: STRONG. Comunicación tiene rating 5 y varias menciones. Gap: falta una traducción práctica inmediata de por qué funciona y dónde falla.

Acción recomendada: KEEP + microexpandir con una frase answer-first: `Su mejor punto suele ser la conversación; el riesgo es usar humor o ideas para evitar lo emocional.`

## 15. Fortalezas

Estado actual: STRONG. Fortalezas son específicas y coherentes con queries.

Acción recomendada: KEEP. No añadir más listas salvo reorganización visual.

## 16. Conflictos

Estado actual: PARTIAL. Los conflictos existen, pero convendría agruparlos con solución práctica: continuidad, evasión emocional, superficialidad.

Acción recomendada: EXPAND de forma moderada dentro de un bloque `Dónde pueden chocar`.

## 17. Amistad/química/otros

Amistad: PARTIAL, útil y natural. Acción: EXPAND mínimo.  
Química/atracción: PARTIAL, ya existe dimensión `Atracción`. Acción: KEEP o microcopy.  
Sexualidad: OPTIONAL. Decisión: `OPTIONAL`, no necesaria para SEO-06B inicial.  
Convivencia/largo plazo: WEAK. Acción: ADD como parte de `Vida cotidiana y largo plazo`, no como sección extensa.

## 18. Orden Géminis-Sagitario vs Sagitario-Géminis

La app normaliza por orden zodiacal. `sagitario/geminis` no debe existir como URL canónica independiente: `beforeLoad` detecta orden no canónico y lanza `redirect` hacia `/compatibilidad/geminis/sagitario`.

Decisión: `order_reversal_policy = SINGLE_CANONICAL_URL`.

Recomendación: incluir una frase natural en contenido visible que pueda cubrir ambas formulaciones: `Busques Géminis y Sagitario o Sagitario y Géminis, la dinámica es la misma: aire mutable y fuego mutable se encuentran en conversación, movimiento y libertad.`

## 19. Fallback combinaciones

Para signos válidos sin perfil Supabase, `getByPairKey` devuelve `buildFallbackCompatibilityProfile(...)`, con `isDemo=true`, `status='published'`, contenido genérico y 200. El sitemap actualmente genera todas las combinaciones con `compatibilityRoute`.

Riesgo: soft-404 editorial/thin content para combinaciones sin perfil curado. No corregir en SEO-06A.

## 20. Hub /compatibilidad

Existe `/compatibilidad`, indexable, con canonical y loader `compatibilityQueries.featured(6)`. Cumple función de selector y lista de combinaciones publicadas. Si Supabase devuelve pocos perfiles, el hub lista solo esos; no usa fallback para `getPublishedPairs`.

Recomendación: mantener hub como entrada, pero agregar desde la ficha objetivo un enlace contextual de vuelta a `/compatibilidad` y asegurar que el hub destaque combinaciones reales.

## 21. Enlazado interno

Propuestas:

| Anchor | Location | Reason | Existing/new | Responsible |
|---|---|---|---|---|
| `Ver compatibilidad entre signos` | final o selector | retorno al hub | Existing route, new link si no basta selector | ANTIGRAVITY |
| `Horóscopo de Géminis` | bloque post-answer o NBA contextual | conecta entidad principal | New | CODEX |
| `Horóscopo de Sagitario` | bloque post-answer o NBA contextual | cubre entidad secundaria | New | CODEX |
| `Probar otra combinación` | ya existe | tarea principal secundaria | Existing | NONE |
| `Cáncer y Capricornio` / `Aries y Libra` | alternativas si DB las devuelve | evita dead-end con pares reales | Existing dynamic | NONE |

No crear red masiva ni listar todas las combinaciones.

## 22. NBA

NBA actual para `source: "compatibility"`:

- Si hay personalización con signo solar: `Ver mi horóscopo de hoy` al signo del usuario.
- Si no: `Mira qué energía acompaña hoy a tu signo` hacia `/horoscopo`.
- Secundario: `Probar otra combinación`.

Recomendación SEO-06C: permitir contexto `signA/signB` o `userSign` en `CompatibilityPairPage` para sugerir `Horóscopo de Géminis` y/o `Horóscopo de Sagitario` cuando no hay signo personal. No cambiar NBA global sin tests.

## 23. Metadata decision

Title: `KEEP`. Incluye ambos signos y compatibilidad simbólica.  
Description: `CHANGE`. Es correcta pero genérica; no incorpora amor/pareja ni la respuesta más buscada.  
H1: evaluado en sección 24.

Description propuesta: `Compatibilidad entre Géminis y Sagitario: cómo conectan en amor, comunicación y amistad, dónde chocan y qué puede ayudarles a funcionar.`

Riesgo: bajo si el contenido se expande antes o junto al cambio. Test: `buildMeta` debe conservar canonical y `og:url`.

## 24. H1 decision

H1: `KEEP`.

Motivo: `Géminis y Sagitario: curiosidad y horizonte` identifica la pareja y aporta ángulo específico. No conviene degradarlo a keyword exacta genérica si el title/meta ya cubren compatibilidad.

## 25. Arquitectura recomendada

`page_role = ANSWER_FIRST_PLUS_DEEP_DIVE`.  
`primary_intent = entender si Géminis y Sagitario son compatibles y cómo funciona esa relación en amor, comunicación, amistad y conflictos`.  
`structural_change = MODERATE`.  
`content_change = MODERATE`.

Orden recomendado: respuesta breve, quick read, dinámica, amor/comunicación/conflictos, dimensiones, contextos, preguntas, selector.

## 26. Contenido recomendado

SECTION-01  
NAME: Respuesta inicial  
PURPOSE: responder rápido si funcionan.  
STATUS: NEW_REQUIRED  
HEADING: `¿Géminis y Sagitario son compatibles?`  
CONTENT: `Sí, pueden tener una compatibilidad alta cuando la libertad, la conversación y el movimiento tienen espacio. Géminis aporta agilidad mental y Sagitario amplitud de visión; el desafío aparece cuando ambos evitan sostener conversaciones emocionales o compromisos cotidianos.`  
LOCATION: bajo PageHeader, antes de quick read.  
INTERNAL_LINK: ninguno.  
CTA: ninguno.  
MOBILE: bloque compacto.  
DESKTOP: ancho contenido, no card gigante.  
RESPONSIBLE: ANTIGRAVITY.

SECTION-02  
NAME: Amor y pareja  
PURPOSE: cubrir intención amor/pareja.  
STATUS: EXISTING_EXPAND  
HEADING: `Géminis y Sagitario en el amor`  
CONTENT: `En pareja, esta combinación suele sentirse ligera, curiosa y estimulante. La atracción crece cuando hay conversación, planes nuevos y permiso para cambiar de ritmo. Para que no quede solo en entusiasmo, necesitan acuerdos concretos: qué se promete, qué se sostiene y cómo se habla cuando algo incomoda.`  
LOCATION: antes de contextos o dentro de contextos.  
INTERNAL_LINK: ninguno.  
CTA: ninguno.  
MOBILE: texto corto.  
DESKTOP: una columna.  
RESPONSIBLE: ANTIGRAVITY.

SECTION-03  
NAME: Dónde conectan / dónde chocan  
PURPOSE: reorganizar strengths/challenges.  
STATUS: EXISTING_REORDER  
HEADING: mantener `Puntos de encuentro` y `Puntos a integrar`.  
CONTENT: usar DB actual.  
LOCATION: antes de dimensiones si se busca respuesta primero.  
INTERNAL_LINK: ninguno.  
CTA: ninguno.  
MOBILE: dos bloques apilados.  
DESKTOP: dos columnas.  
RESPONSIBLE: ANTIGRAVITY.

SECTION-04  
NAME: Vida cotidiana y largo plazo  
PURPOSE: responder continuidad/relación real.  
STATUS: NEW_REQUIRED  
HEADING: `Vida cotidiana y largo plazo`  
CONTENT: `El punto delicado no suele ser la falta de interés, sino la continuidad. Si cada plan cambia demasiado, la relación puede perder suelo. Les ayuda convertir la libertad en acuerdos simples: fechas, tareas, límites y tiempos para hablar sin escapar hacia otra idea.`  
LOCATION: después de conflictos o dimensiones.  
INTERNAL_LINK: opcional a horóscopos de signos.  
CTA: ninguno.  
MOBILE: compacto.  
DESKTOP: bloque simple.  
RESPONSIBLE: ANTIGRAVITY.

SECTION-05  
NAME: Enlaces a signos  
PURPOSE: enlazado interno útil.  
STATUS: NEW_REQUIRED  
HEADING: `También puedes mirar cada signo por separado`  
CONTENT: links a Géminis y Sagitario.  
LOCATION: cerca del final, antes de selector.  
INTERNAL_LINK: `/horoscopo/geminis`, `/horoscopo/sagitario`.  
CTA: links textuales o botones discretos.  
MOBILE: dos enlaces apilados.  
DESKTOP: inline.  
RESPONSIBLE: CODEX.

## 27. Componentes compartidos

| Componente | Compartido con | Política | Riesgo |
|---|---|---|---|
| `CompatibilityPairPage` | todas las combinaciones | LOCAL_OVERRIDE | Alto |
| `CompatibilityDimensionsList` | todas las combinaciones | DO_NOT_TOUCH | Medio |
| `CompatibilityContextsList` | todas las combinaciones | DO_NOT_TOUCH | Medio |
| `CompatibilityPairSelector` | hub y pair pages | DO_NOT_TOUCH | Medio |
| `compatibilityQueries` | hub/pair | SAFE_WITH_REGRESSION | Alto |
| `supabaseCompatibilityRepository` | todo compatibilidad/search | DO_NOT_TOUCH | Alto |
| `normalizeSignPair` | canonical/redirect/sitemap | DO_NOT_TOUCH | Crítico |
| `buildMeta` | global | DO_NOT_TOUCH | Crítico |
| `NextBestAction` | múltiples verticales | REQUIRES_REVIEW | Alto |

## 28. Especificación SEO-06B Antigravity

Objetivo: reorganizar visualmente contenido existente y añadir bloques exactos de respuesta sin tocar data source, metadata, rutas ni componentes compartidos.

Cambios atómicos:

1. Archivo: `src/pages/compatibility/CompatibilityPairPage.tsx`. Bloque: dentro de `{profile ? ...}` antes del quick read. Añadir sección local answer-first con H2 `¿Géminis y Sagitario son compatibles?` y copy exacto de SECTION-01. Mostrar solo cuando `normalized.pair_key === "geminis__sagitario"`.
2. Archivo: mismo. Bloque: antes de `CompatibilityContextsList`. Añadir sección local `Géminis y Sagitario en el amor` con copy exacto de SECTION-02, solo para par objetivo.
3. Archivo: mismo. Bloque: después de strengths/challenges o dimensiones. Añadir `Vida cotidiana y largo plazo` con copy exacto de SECTION-04, solo para par objetivo.
4. Conservar H1, PageHeader, quick read, dimensions, selector, alternatives y NBA.
5. Mobile: bloques compactos, no hero, no imágenes, no cards anidadas.
6. Desktop: ancho legible, sin dashboard, sin decoración nueva.

No modificar `/compatibilidad/cancer/capricornio`, `/compatibilidad/aries/libra` por contenido específico. No inventar astrología adicional.

## 29. CHANGE-06C Codex

### CHANGE-06C-01 — Metadata description dinámica para par objetivo

OBJETIVO: alinear description con contenido expandido.  
ARCHIVO: `src/routes/compatibilidad.$signA.$signB.tsx`.  
SIMBOLO: `head`.  
ESTADO ACTUAL: description genérica para todos los pares.  
CAMBIO EXACTO: si `params.signA === "geminis" && params.signB === "sagitario"`, usar description propuesta en sección 23; resto sin cambios.  
DATA SOURCE: local route params.  
COPY/PROPS: description exacta propuesta.  
NO CAMBIAR: title, canonical, redirect, loader.  
TEST: metadata de geminis/sagitario y canonical; regresión cancer/capricornio.  
RESULTADO ESPERADO: description más alineada con queries.  
RIESGO: bajo.  
ROLLBACK: remover branch condicional.

### CHANGE-06C-02 — Enlaces internos a horóscopos de signos

OBJETIVO: conectar entidades Géminis y Sagitario.  
ARCHIVO: `src/pages/compatibility/CompatibilityPairPage.tsx`.  
SIMBOLO: `CompatibilityPairPage`.  
ESTADO ACTUAL: no enlaza a `/horoscopo/geminis` ni `/horoscopo/sagitario`.  
CAMBIO EXACTO: agregar bloque local de enlaces usando `zodiacRoute(normalized.sign_a)` y `zodiacRoute(normalized.sign_b)` cerca del final.  
DATA SOURCE: normalized + metadata de signos.  
COPY/PROPS: `Horóscopo de Géminis`, `Horóscopo de Sagitario`.  
NO CAMBIAR: selector, alternatives, NBA.  
TEST: links válidos.  
RESULTADO ESPERADO: mejor continuidad interna.  
RIESGO: bajo.  
ROLLBACK: eliminar bloque.

### CHANGE-06C-03 — Tests de orden inverso y fallback

OBJETIVO: proteger canonical y registrar riesgo fallback.  
ARCHIVO: `src/config/seo-indexability.test.ts` o test específico compatibilidad.  
SIMBOLO: tests nuevos.  
ESTADO ACTUAL: test cubre `compatibilityRoute("geminis","sagitario")`.  
CAMBIO EXACTO: agregar test de `compatibilityRoute("sagitario","geminis") === "/compatibilidad/geminis/sagitario"` y test de signos inválidos.  
DATA SOURCE: route helpers.  
NO CAMBIAR: producción.  
TEST: suite SEO.  
RESULTADO ESPERADO: redirect/canonical protegido.  
RIESGO: bajo.  
ROLLBACK: remover tests.

### CHANGE-06C-04 — Política indexable de fallback demo

OBJETIVO: definir si pares fallback deben entrar en sitemap/indexación.  
ARCHIVO: `src/routes/sitemap[.]xml.ts`, repositorio o config futura.  
ESTADO ACTUAL: sitemap genera todos los pares, aunque muchos pueden ser fallback/demo.  
CAMBIO EXACTO: NO implementar en SEO-06C salvo autorización explícita. Crear solo test/documentación si se autoriza.  
DATA SOURCE: `existsPublishedPair` o lista publicada real.  
NO CAMBIAR: en SEO-06 inicial.  
RIESGO: alto por cobertura de 78 URLs.  
ROLLBACK: restaurar generación actual.

## 30. Tests

Ejecutado en SEO-06A: `npx vitest run src/config/seo-indexability.test.ts`.  
Resultado: PASS, 20 tests.

Diseño futuro:

- `/compatibilidad/geminis/sagitario` canonical esperado.
- `compatibilityRoute("sagitario","geminis")` normaliza a `/compatibilidad/geminis/sagitario`.
- H1 único para par objetivo.
- Description específica si SEO-06C la cambia.
- Enlaces a `/horoscopo/geminis` y `/horoscopo/sagitario`.
- Regresión de `/compatibilidad/cancer/capricornio` y `/compatibilidad/aries/libra`.
- Registro de comportamiento para par fallback no curado.

## 31. Escalado futuro

Decisión: `expansion = VALIDATE_GEMINIS_SAGITARIO_FIRST`.

No crear 78/144 combinaciones nuevas. Antes de escalar, validar si un par real con demanda mejora tras respuesta inicial, organización y enlaces internos.

## 32. Medición

Target: `/compatibilidad/geminis/sagitario`.  
Control routes: `/compatibilidad/cancer/capricornio`, `/compatibilidad/aries/libra`.

Checkpoints: día 0, 7, 14, 28.  
Métricas: impresiones, clicks, CTR, posición media, queries, mobile, desktop.

Queries de seguimiento: `geminis y sagitario`, `sagitario y geminis`, `sagitario geminis`, `geminis y sagitario juntos`, `compatibilidad geminis y sagitario`.

## 33. Riesgos

### HYPOTHESIS SEO06-H01 — Respuesta inicial insuficiente

Observación: el primer viewport identifica la pareja, pero no responde explícitamente si son compatibles.  
Evidencia: `PageHeader` + quick read actual.  
Posible impacto: menor satisfacción para búsquedas answer-first.  
Evidencia faltante: métricas post-cambio y comportamiento de usuario.  
Cómo validar: añadir bloque answer-first y medir queries objetivo.  
Causalidad demostrada: NO

### HYPOTHESIS SEO06-H02 — Contenido demo/fallback limita confianza

Observación: perfil objetivo está publicado pero `is_demo=true`; otros pares pueden servirse por fallback.  
Evidencia: migración seed y repositorio fallback.  
Posible impacto: riesgo de thin/generic content en cluster compatibilidad.  
Evidencia faltante: estado remoto actual y coverage real de DB.  
Cómo validar: auditar `compatibility_profiles` remoto y decidir política de indexación.  
Causalidad demostrada: NO

### HYPOTHESIS SEO06-H03 — Falta de enlaces a entidades zodiacales

Observación: la ficha no enlaza a `/horoscopo/geminis` ni `/horoscopo/sagitario`.  
Evidencia: `CompatibilityPairPage`.  
Posible impacto: menor integración de cluster signos/compatibilidad.  
Evidencia faltante: medición de crawl/clicks internos.  
Cómo validar: añadir enlaces discretos y medir.  
Causalidad demostrada: NO

## 34. Rollback

SEO-06B: remover únicamente bloques locales de respuesta inicial, amor y largo plazo.  
SEO-06C: revertir description condicional y enlaces internos.  
No tocar canonical, normalización, sitemap, DB, hub global ni componentes compartidos.

## 35. Estado SEO-06A

PASS_CON_OBSERVACIONES. Auditoría y especificación completadas sin modificar código funcional. SEO-06B y SEO-06C quedan pendientes.

## Decisiones finales

| Decisión | Valor |
|---|---|
| page_role | ANSWER_FIRST_PLUS_DEEP_DIVE |
| primary_intent | entender si Géminis y Sagitario son compatibles y cómo funciona esa relación en amor, comunicación, amistad y conflictos |
| title | KEEP |
| description | CHANGE |
| h1 | KEEP |
| structural_change | MODERATE |
| content_change | MODERATE |
| order_reversal_policy | SINGLE_CANONICAL_URL |
| gender_variants | DO_NOT_TARGET |
| sexuality_content | OPTIONAL |
| expansion | VALIDATE_GEMINIS_SAGITARIO_FIRST |

## Implementación SEO-06B — 2026-08-17

### Archivos modificados

- `src/pages/compatibility/CompatibilityPairPage.tsx` (único archivo funcional tocado).

### Bloques implementados

Todos condicionados a `normalized.pair_key === "geminis__sagitario"` (condición local, sin afectar otras combinaciones).

- Answer-first: `¿Géminis y Sagitario son compatibles?` (SECTION-01).
- Amor: `Géminis y Sagitario en el amor` (SECTION-02).
- Largo plazo: `Vida cotidiana y largo plazo` (SECTION-04).

### Copy utilizado

Copy exacto aprobado por SEO-06A (secciones 26 / SECTION-01, SECTION-02, SECTION-04). No se inventó contenido astrológico nuevo.

### Respuesta inicial

Bloque `answer-first` ubicado bajo `PageHeader`, antes del quick read, con estilo sobrio integrado al sistema (no alert, no semáforo, no score).

### Amor

Bloque corto de una columna, párrafo único. Sin subsecciones redundantes ni variantes de género.

### Comunicación

Sección `Sugerencias de comunicación` se conservó intacta (KEEP). Contacto no se reescribió.

### Conflictos

Se conservaron `Puntos de encuentro` y `Puntos a integrar` (strengths/challenges desde DB). No se añadieron listas de defectos ni lenguaje determinista.

### Largo plazo

Bloque simple de una columna, tono condicional/reflexivo.

### Links

No se añadieron enlaces nuevos en SEO-06B. Los enlaces a `/horoscopo/geminis` y `/horoscopo/sagitario` (SECTION-05) son responsabilidad de Codex en SEO-06C y no se implementaron aquí.

### Mobile

Bloques compactos: answer-first en card ligera, amor/largo plazo como párrafos con borde izquierdo discreto. Sin hero, sin imágenes, sin cards anidadas.

### Desktop

Ancho de lectura controlado (`max-w-[68ch]`), una columna, sin dashboard ni decoración nueva.

### Accesibilidad

H2 semánticos, `aria-labelledby` con `id` generados por `slugifyHeading`, un único H1 preservado, links semánticos, sin `div` clickeable.

### Componentes compartidos preservados

No se modificaron `CompatibilityDimensionsList`, `CompatibilityContextsList`, `CompatibilityPairSelector`, `compatibilityQueries`, repositorio, `normalizeSignPair`, `buildMeta`, ni `NextBestAction`. La intervención es una variante local dentro de `CompatibilityPairPage`.

### Tests

`npx vitest run src/config/seo-indexability.test.ts` — PASS, 20 tests.

### Build

`npm run build` — PASS.

### Typecheck

`npx tsc --noEmit --pretty false` — FAIL preexistente permitido (91 errores de deuda global). Ninguno menciona `CompatibilityPairPage.tsx`; no hay errores nuevos atribuibles a SEO-06B.

### Diff

`src/pages/compatibility/CompatibilityPairPage.tsx` +76/-1. Cada línea funcional corresponde a una orden explícita de SEO-06A (sección 28). No se tocaron metadata, repository, loader, Supabase, normalización, fallback ni otras combinaciones.

### Rollback

Retirar la constante `GEMINI_SAGITTARIUS_PAIR_KEY`, la constante `GEMINI_SAGITTARIUS_EDITORIAL_COPY`, la variable `isGeminiSagittarius`, los tres bloques condicionales y la función `GeminiSagittariusEditorialBlock` + `slugifyHeading`. Preservar el resto del contenido preexistente.

## Implementación SEO-06C — 2026-08-17

Fecha de ejecución: 2026-08-18.

### CHANGE-06C-01 resultado

Estado: IMPLEMENTADO.

Se agregó metadata local testable para la ruta `src/routes/compatibilidad.$signA.$signB.tsx` mediante:

- `GEMINI_SAGITTARIUS_META_DESCRIPTION`
- `getCompatibilityPairMeta(signA, signB)`

La description específica se aplica únicamente cuando `signA === "geminis" && signB === "sagitario"`.

### Description antes/después

Antes:

`Lectura editorial de la dinámica entre Géminis y Sagitario: comunicación, ritmo emocional y áreas de crecimiento.`

Después:

`Compatibilidad entre Géminis y Sagitario: cómo conectan en amor, comunicación y amistad, dónde chocan y qué puede ayudarles a funcionar.`

Title y canonical conservan el contrato previo.

### CHANGE-06C-02 enlaces

Estado: VERIFIED_NO_CHANGE.

En `CompatibilityPairPage` ya existen enlaces condicionados a `geminis__sagitario` hacia:

- `/horoscopo/geminis`
- `/horoscopo/sagitario`
- `/compatibilidad`

Los destinos se validaron en tests usando `zodiacRoute("geminis")`, `zodiacRoute("sagitario")` y `routes.compatibility`. No se modificó el bloque visual ni los anchors.

### CHANGE-06C-03 orden inverso

Estado: TEST_ONLY.

Se añadió cobertura para confirmar que:

- `normalizeSignPair("geminis", "sagitario").pair_key === "geminis__sagitario"`
- `normalizeSignPair("sagitario", "geminis")` produce el mismo resultado
- `compatibilityRoute("sagitario", "geminis") === "/compatibilidad/geminis/sagitario"`
- la canonical absoluta final usa `https://www.creovision.io/compatibilidad/geminis/sagitario`

No se modificó la normalización ni el `beforeLoad`.

### CHANGE-06C-04 fallback

Estado: CARACTERIZADO_SIN_IMPLEMENTAR_POLITICA.

La arquitectura actual mantiene:

- signos inválidos: `beforeLoad` lanza `notFound()`
- pareja válida sin perfil: `supabaseCompatibilityRepository.getByPairKey` cae a `buildFallbackCompatibilityProfile`
- fallback: `status = "published"`, `isDemo = true`, metadata demo y contenido genérico
- sitemap: mantiene generación actual; no se tocó en SEO-06C

Caso determinista usado para caracterización: `aries__aries` como pareja válida construida por fallback local. No se consultó ni alteró Supabase.

### FALLBACK_FUTURE_POLICY

```yaml
current_behavior: "Parejas válidas sin fila publicada pueden recibir fallback demo con status published e isDemo true; la ruta puede responder 200 si el loader resuelve ese fallback."
seo_risk: "Riesgo de páginas indexables con contenido genérico o thin content si el sitemap/rutas exponen muchas combinaciones sin perfil editorial real."
recommendation: "NOINDEX_DEMO"
rationale: "Mantiene utilidad exploratoria del producto sin presentar contenido demo como landing SEO plena. Es menos disruptivo que NOT_FOUND_IF_UNPUBLISHED y evita indexar páginas no curadas."
migration_risk: "Medio: requiere definir cómo detectar demo/fallback en metadata o loader sin afectar perfiles reales ni combinaciones ya publicadas."
needs_separate_phase: true
```

### Archivos tocados

- `src/routes/compatibilidad.$signA.$signB.tsx`
- `src/config/seo-indexability.test.ts`
- `docs/seo-search-console-2026/06_COMPATIBILIDAD_GEMINIS_SAGITARIO.md`
- `docs/seo-search-console-2026/README.md`

### Símbolos

- `GEMINI_SAGITTARIUS_META_DESCRIPTION`
- `getCompatibilityPairMeta`
- tests focales en `SEO indexability and canonical consistency`

### Tests

Comando: `npx --yes vitest run src/config/seo-indexability.test.ts`.

Resultado esperado: PASS.

Cobertura añadida:

- description específica solo para `geminis__sagitario`
- title y canonical preservados
- controles `cancer__capricornio` y `aries__libra` con description previa
- orden inverso normalizado
- links internos SEO-06B válidos
- fallback demo caracterizado
- signo inválido caracterizado por excepción

### Build

Comando: `npm run build`.

Resultado esperado: PASS.

### Typecheck

Comando: `npx tsc --noEmit --pretty false`.

Resultado: FAIL_PREEXISTENTE_PERMITIDO.

No se registraron errores en `src/routes/compatibilidad.$signA.$signB.tsx`. `src/config/seo-indexability.test.ts` sigue reportando `Cannot find module 'vitest'`, deuda de tooling ya existente en la suite de tests y no introducida por los casos SEO-06C.

### Tooling Vitest

`vitest` no está disponible como binario local en `node_modules/.bin` en esta instalación. Se usa `npx --yes vitest ...` sin instalar dependencias ni tocar `package.json`.

### Regresiones

No se cambiaron H1, title, canonical, loader, repository, Supabase, fallback, sitemap, robots, JSON-LD, componentes compartidos ni contenido SEO-06B.

### Diff

Cada línea funcional corresponde a:

- CHANGE-06C-01: description condicional y función testable
- CHANGE-06C-02: tests de destinos internos
- CHANGE-06C-03: tests de orden inverso
- CHANGE-06C-04: test/documentación de fallback

### Riesgos

La política futura del fallback requiere una fase separada. Implementar `NOINDEX_DEMO` necesitaría acceso a información de perfil/fallback en metadata o una decisión de producto sobre qué páginas demo deben existir públicamente.

### Rollback

Revertir únicamente:

- `GEMINI_SAGITTARIUS_META_DESCRIPTION`
- `getCompatibilityPairMeta`
- el uso de `getCompatibilityPairMeta` en `head`
- los tests SEO-06C añadidos
- esta sección documental y el cierre SEO-06C del README

No revertir SEO-06B ni fases previas.

## SEO-06D-A — Política de fallback demo — 2026-08-18

Modo: AUDITORIA_CORTA_Y_ESPECIFICACION_SIN_IMPLEMENTACION.  
Estado: PASS_CON_OBSERVACIONES.

### Objetivo

Validar si la política futura recomendada en SEO-06C (`NOINDEX_DEMO`) es correcta para páginas de compatibilidad generadas únicamente por fallback demo, antes de SEO-07 y antes de aumentar enlazado interno hacia el cluster.

No se modificó código funcional, sitemap, robots, Supabase, canonical ni fallback.

### Arquitectura verificada

- Ruta: `src/routes/compatibilidad.$signA.$signB.tsx`
- Metadata: `head({ params })` usa `getCompatibilityPairMeta(params.signA, params.signB)` y `buildMeta(...)`
- Validación/orden: `beforeLoad` valida signos con `isZodiacSign`, normaliza con `normalizeSignPair` y redirige orden no canónico
- Loader: `context.queryClient.ensureQueryData(compatibilityQueries.pair(...))`
- Servicio: `loadPairPage` carga perfil principal y alternativas
- Repositorio: `supabaseCompatibilityRepository.getByPairKey`
- Fallback: `buildFallbackCompatibilityProfile`
- Sitemap: `getSitemapEntries()` enumera el hub y las 78 combinaciones zodiacales con `compatibilityRoute(...)`

### Cómo nace el fallback

Flujo para pareja válida:

1. `beforeLoad` valida que ambos signos existan.
2. `normalizeSignPair` produce `sign_a`, `sign_b`, `pair_key` y `canonical_path`.
3. `loader` ejecuta `compatibilityQueries.pair`.
4. `loadPairPage` llama a `repo.getByPairKey(normalized.pair_key)`.
5. `supabaseCompatibilityRepository.getByPairKey` consulta Supabase por `pair_key`.
6. Si Supabase devuelve fila, se usa `mapCompatibilityProfileRow`.
7. Si no hay fila, se llama `buildFallbackCompatibilityProfile(signOne, signTwo)`.

El fallback no es una ruta separada: es una respuesta de datos para una pareja válida sin perfil editorial encontrado.

### Cómo se determina isDemo

`isDemo` puede venir de dos fuentes:

- DB: `mapCompatibilityProfileRow` asigna `isDemo: row.is_demo`.
- Fallback: `buildFallbackCompatibilityProfile` siempre asigna `isDemo: true`.

Conclusión: `isDemo === true` no distingue de forma fiable entre "fila real demo" y "fallback generado". Distingue "contenido demo" frente a "contenido no demo", pero no la fuente.

Actualmente existe evidencia documentada de que `geminis__sagitario` fue insertado con `is_demo=true` en migración, aunque es una página objetivo ya tratada como perfil publicado/control de SEO-06. Por tanto, usar solo `profile.isDemo` para `noindex` podría marcar accidentalmente noindex a perfiles reales o curados.

### Perfiles reales

Clase: `REAL_PUBLISHED_PROFILE`.

Ejemplos protegidos:

- `geminis__sagitario`
- `cancer__capricornio`
- `aries__libra`

Decisión: deben permanecer `200`, `index,follow`, self-canonical, presentes en sitemap solo si se decide mantenerlas como páginas editoriales reales. No deben verse afectadas por una política basada únicamente en `isDemo`.

### Demo fallback

Clase: `VALID_PAIR_DEMO_FALLBACK`.

Ejemplo de análisis local: `aries__aries` si no existe fila real.

Comportamiento actual:

- HTTP: 200 si la página resuelve con fallback
- Contenido: genérico construido por signos/elementos/modalidad
- `isDemo`: true
- `status`: published
- canonical: self-canonical por `compatibilityRoute`
- robots actual: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- sitemap: potencialmente incluido, porque el sitemap enumera todas las combinaciones

Decisión validada: conviene mantener la experiencia disponible para usuario, pero no tratarla como landing SEO indexable.

### Orden inverso

Clase: `REVERSED_VALID_PAIR`.

Ejemplo: `/compatibilidad/sagitario/geminis`.

`beforeLoad` normaliza y redirige a `/compatibilidad/geminis/sagitario`. Esta clase no debe recibir metadata propia ni convertirse en segunda landing. Política: `REDIRECT`.

### Signos inválidos

Clase: `INVALID_SIGN_OR_INVALID_ROUTE`.

Si `signA` o `signB` no pasan `isZodiacSign`, `beforeLoad` lanza `notFound()`. Política: `NOT_FOUND`. No hay motivo para cambiar esta conducta en SEO-06D.

### Metadata lifecycle

`head()` se calcula desde params de ruta y actualmente no conoce si el loader terminó usando fila DB o fallback. La metadata condicional de SEO-06C solo distingue `geminis/sagitario` por params, no por perfil.

Implicación: implementar `noindex` para fallback sin consulta adicional requiere mover o exponer una señal fiable desde el mismo dato que ya carga el loader, o garantizar que `head()` pueda reutilizar query cache / loader data sin repetir Supabase.

Si `head()` no puede acceder al resultado de `ensureQueryData`, habría dos caminos:

- consulta adicional en metadata para detectar si existe fila real
- cambio de arquitectura para que la metadata dependa de datos ya cargados

La opción preferida para SEO-06D-B debe ser reutilizar datos ya necesarios por la página, no duplicar la consulta.

### Robots actual

`buildMeta` solo acepta `noindex?: boolean`.

- `noindex` ausente/false produce `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- `noindex: true` produce `noindex, nofollow`

La política recomendada para demos es `noindex,follow`, no `noindex,nofollow`. Por tanto, SEO-06D-B no debe resolverlo con `buildMeta({ noindex: true })` salvo que se acepte perder `follow`, lo cual no está recomendado.

### Matriz obligatoria

| Clase | HTTP | Contenido | isDemo | Canonical | Robots deseado | Sitemap | Acción |
|---|---:|---|---|---|---|---|---|
| REAL_PUBLISHED_PROFILE | 200 | Editorial real/curado desde DB | Puede ser true o false | Self canonical | index,follow | Sí, si está publicado real | INDEX |
| VALID_PAIR_DEMO_FALLBACK | 200 | Fallback genérico | true | Self canonical | noindex,follow | No debería aparecer | NOINDEX |
| REVERSED_VALID_PAIR | Redirect | No renderiza documento propio | N/A | Canonical del orden oficial | N/A | No URL separada | REDIRECT |
| INVALID_SIGN_OR_INVALID_ROUTE | 404/notFound | No renderiza compatibilidad válida | N/A | N/A | N/A | No | NOT_FOUND |

### Política recomendada

FALLBACK_INDEX_POLICY: `NOINDEX_DEMO`  
demo_http_status: `KEEP_200`  
demo_robots: `NOINDEX_FOLLOW`  
demo_canonical: `SELF_CANONICAL`  
real_profiles: `KEEP_INDEXABLE`  
sitemap_change: `CHANGE_REQUIRED`  
additional_db_query: `UNKNOWN` hasta confirmar capacidad de `head()` para reutilizar loader/query cache; objetivo de implementación: `NO`.

Justificación:

- Mantiene la experiencia de producto para cualquier pareja válida.
- Evita indexar contenido genérico no curado.
- Preserva señales canonicales limpias y no canonicaliza demos hacia el hub ni hacia otra pareja.
- Reduce riesgo antes de SEO-07, que aumentará enlazado interno.

### Canonical demo

Si una URL demo queda `200 + noindex,follow`, debe conservar self-canonical.

No se recomienda canonicalizar demos hacia `/compatibilidad` ni hacia otra pareja porque:

- la URL representa una combinación válida concreta
- el contenido visible corresponde a esa pareja
- canonicalizar hacia el hub sería una señal confusa
- canonicalizar hacia otra pareja sería incorrecto

La exclusión de índice debe resolverse con robots, no con canonical artificial.

### Sitemap

El sitemap actual no consulta Supabase ni lista solo perfiles publicados reales. Enumera las 78 combinaciones posibles:

```ts
for (let i = 0; i < zodiacSigns.length; i += 1) {
  for (let j = i; j < zodiacSigns.length; j += 1) {
    entries.push({ path: compatibilityRoute(...) })
  }
}
```

Conclusión: actualmente puede introducir URLs que solo resuelven como fallback demo. Esto confirma que SEO-06D-B debe incluir cambio de sitemap, pero no se implementa en SEO-06D-A.

Política futura: sitemap de compatibilidad debe enumerar solo perfiles reales/publicados aptos para indexación, o una lista allowlist equivalente si no se quiere consultar DB en sitemap.

### Coste/queries

Riesgo principal: repetir una query Supabase solo para metadata.

Evaluación:

- `loader` ya necesita consultar `getByPairKey`.
- `head()` actual no consume perfil.
- `existsPublishedPair` existe y podría detectar fila real, pero sería una consulta adicional si se usa desde metadata.
- `getPublishedPairs` existe para pares reales, pero no se usa en sitemap para generar compatibilidad.

Preferencia: `additional_db_query = NO`, reutilizando el resultado de `compatibilityQueries.pair` o rediseñando una función de carga única que entregue data + metadata. Si TanStack Router no permite esto en `head()` con la arquitectura actual, marcar `YES_JUSTIFIED` solo para una consulta liviana y testeada, pero no como primera opción.

### Riesgos

- Marcar accidentalmente noindex a `geminis__sagitario`, `cancer__capricornio` o `aries__libra` si se usa `isDemo` como único criterio.
- Usar `buildMeta({ noindex: true })` y emitir `noindex,nofollow` cuando la política aprobada es `noindex,follow`.
- Repetir consultas Supabase en `head()` y duplicar coste por request.
- Desincronizar metadata SSR y contenido si metadata y loader detectan fuente de datos por caminos distintos.
- Cambiar sitemap sin una fuente fiable de perfiles reales.

### Tests requeridos

- `geminis__sagitario` conserva `index,follow` y canonical.
- `cancer__capricornio` conserva `index,follow` y canonical.
- `aries__libra` conserva `index,follow` y canonical.
- Una pareja válida sin perfil real emite `noindex,follow`, conserva `200` y self-canonical.
- `sagitario/geminis` redirige/no genera documento indexable duplicado.
- Signo inválido conserva `notFound`.
- Sitemap no contiene pares demo/fallback.
- Sitemap sí contiene pares reales/publicados permitidos.
- `buildMeta` o helper nuevo permite `noindex,follow` sin alterar páginas protegidas.

### Regla heredada por SEO-07

SEO-07 no debe crear enlaces internos SEO hacia combinaciones que solo resuelven como fallback demo.

Permitido:

- enlazar a hub `/compatibilidad`
- enlazar a perfiles reales/publicados permitidos
- permitir que el selector de usuario navegue a una pareja demo como experiencia de producto

No permitido:

- bloques editoriales, hubs, footers, recomendaciones o enlaces contextuales SEO hacia pares no curados/fallback

### CHANGE-06D-B-01 — Detección fiable real vs fallback

OBJETIVO: distinguir perfil DB real de fallback generado sin depender únicamente de `isDemo`.  
ARCHIVO: `src/repositories/supabase-compatibility.repository.ts`, `src/services/compatibility.service.ts` o tipos de compatibilidad.  
SIMBOLO: `getByPairKey`, `loadPairPage`, tipo `CompatibilityPageData`.  
ESTADO ACTUAL: el repositorio devuelve `CompatibilityProfile` tanto para DB como para fallback; ambos pueden tener `isDemo=true`.  
CAMBIO EXACTO: añadir una señal explícita de fuente, por ejemplo `profileSource: "database" | "fallback"` o `isFallbackProfile: boolean`, derivada en el repositorio/servicio en el mismo flujo de carga.  
COMO_DETECTAR_DEMO: fallback solo cuando `fetchByPairKey(pairKey)` devuelve `null`; no usar `isDemo` como criterio único.  
METADATA_RESULTANTE: perfiles DB reales conservan index; fallback queda candidato a noindex.  
NO_CAMBIAR: contenido, canonical, normalización, Supabase, status DB, `is_demo` DB.  
TEST: DB/mock real con `is_demo=true` sigue considerado real; fallback queda marcado como fallback.  
RIESGO: medio por cambio de contrato de datos.  
ROLLBACK: quitar señal nueva y volver al contrato actual.

### CHANGE-06D-B-02 — Robots metadata condicional noindex,follow

OBJETIVO: emitir `noindex,follow` solo para fallback demo.  
ARCHIVO: `src/routes/compatibilidad.$signA.$signB.tsx` y, si es necesario, `src/config/seo.ts`.  
SIMBOLO: `head`, `buildMeta` o helper local de robots.  
ESTADO ACTUAL: `head()` no conoce fallback y `buildMeta({ noindex: true })` emite `noindex,nofollow`.  
CAMBIO EXACTO: generar robots condicional `noindex, follow` para `isFallbackProfile === true`; conservar `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` para perfiles reales.  
COMO_DETECTAR_DEMO: usar la señal de CHANGE-06D-B-01, no `profile.isDemo` aislado.  
METADATA_RESULTANTE: fallback 200 con self-canonical y `noindex,follow`.  
NO_CAMBIAR: title, H1, canonical, contenido SEO-06B, fallback UX.  
TEST: fallback contiene robots `noindex, follow`; perfiles reales no contienen noindex.  
RIESGO: alto si se toca `buildMeta` global; preferir helper acotado o extensión con regresión global.  
ROLLBACK: restaurar robots actual y quitar rama condicional.

### CHANGE-06D-B-03 — Sitemap solo con perfiles indexables

OBJETIVO: evitar que el sitemap introduzca URLs que solo resuelven como fallback demo.  
ARCHIVO: `src/routes/sitemap[.]xml.ts`.  
SIMBOLO: `getSitemapEntries`.  
ESTADO ACTUAL: genera las 78 combinaciones posibles localmente.  
CAMBIO EXACTO: reemplazar enumeración masiva por fuente de perfiles reales/publicados o allowlist validada; si se requiere async/DB, diseñar `getSitemapEntries` compatible con el handler actual.  
COMO_DETECTAR_DEMO: excluir todo par sin fila real/publicada apta; no usar fallback.  
METADATA_RESULTANTE: sitemap solo descubre páginas indexables.  
NO_CAMBIAR: hub `/compatibilidad`, rutas de horóscopo/tarot/luna, robots.txt.  
TEST: sitemap contiene `geminis/sagitario`, `cancer/capricornio`, `aries/libra` si están aprobados; no contiene par demo elegido.  
RIESGO: medio/alto por pasar de lista estática a fuente dinámica o allowlist.  
ROLLBACK: restaurar bucle de 78 pares.

### CHANGE-06D-B-04 — Tests de orden, invalidación y controles

OBJETIVO: blindar que la política no cree duplicados ni afecte controles.  
ARCHIVO: `src/config/seo-indexability.test.ts` o suite focal de compatibilidad.  
SIMBOLO: tests de metadata/sitemap/normalización.  
ESTADO ACTUAL: SEO-06C cubre canonical, orden inverso, links y fallback local, pero no robots `noindex,follow` real.  
CAMBIO EXACTO: agregar tests de robots para real vs fallback, sitemap sin demos, reversed redirect/canonical, signo inválido.  
COMO_DETECTAR_DEMO: usar mocks o helper de fuente de perfil de CHANGE-06D-B-01.  
METADATA_RESULTANTE: asserts explícitos de `index,follow` y `noindex,follow`.  
NO_CAMBIAR: tests de fases previas salvo extensión focal.  
TEST: `npx --yes vitest run src/config/seo-indexability.test.ts`.  
RIESGO: bajo.  
ROLLBACK: remover tests añadidos.

### CHANGE-06D-B-05 — Regla de enlazado interno para SEO-07

OBJETIVO: proveer a SEO-07 una fuente segura de pares enlazables.  
ARCHIVO: config/helper nuevo o repositorio existente, según diseño final.  
SIMBOLO: `getIndexableCompatibilityPairs` o equivalente.  
ESTADO ACTUAL: navegación puede construir cualquier par con `compatibilityRoute`; sitemap también enumera todos.  
CAMBIO EXACTO: exponer solo pares reales/publicados aptos para enlaces SEO; mantener selector libre para UX.  
COMO_DETECTAR_DEMO: excluir `isFallbackProfile`; no excluir por `isDemo` DB automáticamente.  
METADATA_RESULTANTE: SEO-07 enlaza solo a páginas indexables.  
NO_CAMBIAR: selector del usuario, canonical, fallback UX.  
TEST: helper incluye controles reales y excluye demo.  
RIESGO: medio por dependencia futura de SEO-07.  
ROLLBACK: retirar helper/regla y volver a enlaces manuales controlados.

### Decisiones finales SEO-06D-A

| Decisión | Valor |
|---|---|
| FALLBACK_INDEX_POLICY | NOINDEX_DEMO |
| demo_http_status | KEEP_200 |
| demo_robots | NOINDEX_FOLLOW |
| demo_canonical | SELF_CANONICAL |
| real_profiles | KEEP_INDEXABLE |
| sitemap_change | CHANGE_REQUIRED |
| additional_db_query | UNKNOWN, con objetivo NO |
| seo07_link_rule | No enlazar internamente con intención SEO a pares fallback demo |

### Comando de validación

`npx --yes vitest run src/config/seo-indexability.test.ts`

Resultado: PASS, 24 tests.

## SEO-06D-B — Implementación de indexabilidad segura para fallback demo — 2026-08-18

Modo: IMPLEMENTACION_TECNICA_CERRADA.  
Estado: PASS_CON_OBSERVACIONES.

### Objetivo

Implementar la política validada en SEO-06D-A:

- perfiles de compatibilidad aprobados: `index,follow`
- pares que solo deben resolver como fallback demo: `noindex,follow`
- UX demo disponible con `200`
- self-canonical preservado
- sitemap limitado a pares indexables
- SEO-07 recibe una fuente reutilizable de pares enlazables

No se cambió Supabase, repository, fallback, normalización, canonical, H1, contenido SEO-06B ni selector de usuario.

### Archivos modificados

- `src/config/compatibility-indexability.ts`
- `src/routes/compatibilidad.$signA.$signB.tsx`
- `src/routes/sitemap[.]xml.ts`
- `src/config/seo-indexability.test.ts`
- `docs/seo-search-console-2026/06_COMPATIBILIDAD_GEMINIS_SAGITARIO.md`
- `docs/seo-search-console-2026/README.md`

### CHANGE-06D-B-01 — Detección fiable real vs fallback

Estado: IMPLEMENTADO_CON_ALLOWLIST.

Se creó `src/config/compatibility-indexability.ts` con:

- `INDEXABLE_COMPATIBILITY_PAIR_KEYS`
- `isIndexableCompatibilityPair(signOne, signTwo)`
- `indexableCompatibilityPairs()`

La decisión técnica evita usar `profile.isDemo` como criterio único, porque `isDemo` puede venir de DB o fallback. En esta fase, la fuente fiable para indexación es una allowlist explícita de pares aprobados:

- `geminis__sagitario`
- `cancer__capricornio`
- `aries__libra`

Esta solución no agrega consultas DB y protege los tres controles pedidos.

### CHANGE-06D-B-02 — Robots metadata condicional noindex,follow

Estado: IMPLEMENTADO.

En `src/routes/compatibilidad.$signA.$signB.tsx` se agregó `buildCompatibilityPairMeta(signA, signB)`.

Resultado:

- si `isIndexableCompatibilityPair(...)` es true, se conserva robots `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- si es false, se reemplaza solo el meta robots por `noindex, follow`

No se usó `buildMeta({ noindex: true })`, porque ese helper emite `noindex,nofollow` y SEO-06D-A aprobó `noindex,follow`.

### CHANGE-06D-B-03 — Sitemap solo con perfiles indexables

Estado: IMPLEMENTADO.

En `src/routes/sitemap[.]xml.ts`, la sección de compatibilidad dejó de enumerar las 78 combinaciones posibles. Ahora agrega solo `indexableCompatibilityPairs()`.

Se mantiene el hub `/compatibilidad` en sitemap.

### CHANGE-06D-B-04 — Tests de orden, invalidación y controles

Estado: IMPLEMENTADO.

Se añadieron tests en `src/config/seo-indexability.test.ts` para:

- `geminis__sagitario`, `cancer__capricornio` y `aries__libra` indexables
- `aries__aries` como par fallback-only con robots `noindex, follow`
- self-canonical preservado para demo
- sitemap limitado a pares indexables
- orden inverso `sagitario/geminis` reconocido como indexable por normalización
- demo excluido del sitemap

### CHANGE-06D-B-05 — Regla de enlazado interno para SEO-07

Estado: IMPLEMENTADO_COMO_FUENTE_TECNICA.

SEO-07 debe usar `indexableCompatibilityPairs()` o `isIndexableCompatibilityPair(...)` para crear enlaces internos SEO hacia compatibilidad.

Regla:

- enlaces SEO: solo pares de `INDEXABLE_COMPATIBILITY_PAIR_KEYS`
- selector de usuario: puede seguir construyendo cualquier pareja válida con `compatibilityRoute`

### Robots resultantes

| Par | Robots | Canonical |
|---|---|---|
| `geminis__sagitario` | index,follow | `/compatibilidad/geminis/sagitario` |
| `cancer__capricornio` | index,follow | `/compatibilidad/cancer/capricornio` |
| `aries__libra` | index,follow | `/compatibilidad/aries/libra` |
| `aries__aries` | noindex,follow | `/compatibilidad/aries/aries` |

### Sitemap resultante

Incluye:

- `/compatibilidad`
- `/compatibilidad/aries/libra`
- `/compatibilidad/cancer/capricornio`
- `/compatibilidad/geminis/sagitario`

Excluye pares no aprobados para indexación, por ejemplo:

- `/compatibilidad/aries/aries`

### Coste/queries

`additional_db_query = NO`.

La implementación no consulta Supabase para metadata ni sitemap. La decisión se basa en una allowlist explícita, revisable y segura para SEO-07.

### Riesgos

- Si se publica un nuevo perfil real en DB, no será indexable ni entrará al sitemap hasta agregarlo a `INDEXABLE_COMPATIBILITY_PAIR_KEYS`.
- La allowlist es conservadora: reduce riesgo de indexar demos, pero requiere mantenimiento editorial.
- No resuelve una futura política dinámica basada en DB; queda como mejora posterior si se necesita.

### Tests

Comando: `npx --yes vitest run src/config/seo-indexability.test.ts`.

Resultado: PASS, 26 tests.

### Build

Comando: `npm run build`.

Resultado: PASS.

### Typecheck

Comando: `npx tsc --noEmit --pretty false`.

Resultado: FAIL_PREEXISTENTE_PERMITIDO.

No se registraron errores en `src/config/compatibility-indexability.ts`, `src/routes/compatibilidad.$signA.$signB.tsx` ni `src/routes/sitemap[.]xml.ts`. `src/config/seo-indexability.test.ts` mantiene el error conocido de tipos de `vitest`.

### Rollback

Revertir únicamente:

- `src/config/compatibility-indexability.ts`
- import y uso de `isIndexableCompatibilityPair` en `src/routes/compatibilidad.$signA.$signB.tsx`
- `buildCompatibilityPairMeta`
- cambio de sitemap desde `indexableCompatibilityPairs()` al bucle de 78 pares
- tests SEO-06D-B añadidos
- esta sección documental y el estado SEO-06D-B del README

No revertir SEO-06B, SEO-06C ni cambios ajenos.
