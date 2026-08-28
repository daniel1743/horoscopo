# SEO Search Console 2026 — Control maestro

## Objetivo del programa

Constituir un programa SEO seguro para Creovision.io basado en evidencia técnica y datos de Search Console. La regla de trabajo es auditar primero, proteger señales existentes y corregir solo en fases posteriores autorizadas.

## Baseline Search Console

Periodo observado: 28 dias.

| Métrica             | Valor |
| ------------------- | ----: |
| Clics totales       |     0 |
| Impresiones totales |   246 |
| CTR medio           |    0% |
| Posición media      |  37.1 |

Páginas con señales iniciales relevantes: `/`, `/tarot/carta-del-dia`, `/horoscopo`, `/tarot/tres-cartas/trabajo`, `/luna`, `/compatibilidad/geminis/sagitario`, `/tarot/tres-cartas`, `/luna/fases/luna-creciente`, `/compatibilidad/cancer/capricornio`.

Advertencia: el volumen es bajo. Estos datos priorizan revisión, no demuestran causalidad.

## Principio rector

PROTEGER_PRIMERO_CORREGIR_DESPUES_EXPANDIR_AL_FINAL.

No se debe cambiar canonical, redirects, metadata, sitemap, robots, slugs, rutas o contenido de páginas protegidas sin una fase explícita y revisión de impacto.

## Estado de fases

| Fase      | Estado                       | Owner                          |
| --------- | ---------------------------- | ------------------------------ |
| SEO-00    | COMPLETADO                   | Claude Sonnet                  |
| SEO-01    | COMPLETADO                   | Claude Sonnet -> Codex         |
| SEO-01A   | COMPLETADO                   | Claude Sonnet                  |
| SEO-01B   | COMPLETADO                   | Codex                          |
| SEO-02    | COMPLETADO                   | Claude Sonnet -> Codex         |
| SEO-02A   | COMPLETADO                   | Codex                          |
| SEO-02B   | COMPLETADO                   | Codex                          |
| SEO-03    | COMPLETADO                   | Claude Sonnet                  |
| SEO-04    | COMPLETADO                   | Codex + Antigravity            |
| SEO-04A   | COMPLETADO                   | Codex                          |
| SEO-04B   | COMPLETADO                   | Codex                          |
| SEO-04C   | COMPLETADO                   | Antigravity                    |
| SEO-05    | COMPLETADO                   | Claude -> Codex -> Antigravity |
| SEO-05A   | COMPLETADO                   | Codex                          |
| SEO-05B   | COMPLETADO                   | Codex                          |
| SEO-05C   | COMPLETADO                   | Codex                          |
| SEO-06    | COMPLETADO                   | Claude -> Antigravity -> Codex |
| SEO-06A   | COMPLETADO                   | Codex                          |
| SEO-06B   | COMPLETADO                   | Antigravity                    |
| SEO-06C   | COMPLETADO                   | Codex                          |
| SEO-06D   | COMPLETADO                   | Claude -> Codex                |
| SEO-06D-A | COMPLETADO                   | Codex                          |
| SEO-06D-B | COMPLETADO                   | Codex                          |
| SEO-07    | COMPLETADO                   | Claude -> Codex                |
| SEO-07A   | COMPLETADO                   | Claude Sonnet                  |
| SEO-07B   | COMPLETADO                   | Codex                          |
| SEO-08    | COMPLETADO                   | Antigravity + Codex            |
| SEO-08A   | COMPLETADO                   | Claude Sonnet                  |
| SEO-08B   | COMPLETADO_CON_OBSERVACIONES | Codex                          |
| SEO-08C   | NO_APLICA                    | Antigravity                    |
| SEO-09    | COMPLETADO                   | Claude -> Codex review         |
| SEO-09A   | COMPLETADO                   | Claude Sonnet                  |
| SEO-09B   | COMPLETADO                   | Codex                          |
| SEO-09C   | COMPLETADO                   | Claude Sonnet                  |
| SEO-10    | COMPLETADO                   | Claude Sonnet                  |
| SEO-11    | EN_CURSO                     | Claude Sonnet                  |

## Páginas protegidas

| Ruta                         | Motivo                                                | Archivos principales                                                                                                                            |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                          | Posición media observada competitiva con bajo volumen | `src/routes/index.tsx`, `src/pages/HomePage.tsx`, `src/components/home/*`, `src/components/layout/*`                                            |
| `/tarot/carta-del-dia`       | Posición media observada competitiva con bajo volumen | `src/routes/tarot.carta-del-dia.tsx`, `src/pages/tarot/TarotDailyPage.tsx`, `src/hooks/useTarotDeck.ts`                                         |
| `/horoscopo`                 | Posición media observada competitiva con bajo volumen | `src/routes/horoscopo.index.tsx`, `src/pages/horoscope/HoroscopeHubPage.tsx`                                                                    |
| `/tarot/tres-cartas/trabajo` | Posición media observada competitiva con bajo volumen | `src/routes/tarot.tres-cartas.trabajo.tsx`, `src/components/tarot/experience/ThreeCardExperienceShell.tsx`, `src/config/three-card-readings.ts` |

## Hallazgos críticos abiertos

Ver detalles completos en `00_BASELINE_Y_REGLAS.md`.

- SEO00-01: canonical ausente en rutas relevantes que usan `buildMeta` sin `canonical`.
- SEO00-02: JSON-LD existente se inyecta con `useEffect`, no aparece en HTML SSR muestreado.
- SEO00-03: `www` es consistente en código/sitemap/robots y producción redirige non-www a www, pero el redirect de host no vive en `vercel.json`; depende de configuración externa de Vercel/DNS.
- SEO00-04: algunas rutas dinámicas, como `/luna/fases/$slug`, construyen metadata manual y no emiten canonical.
- SEO00-05: `robots.txt` bloquea `/*.json$`; revisar impacto en `manifest.webmanifest` y otros JSON publicos antes de tocar.
- SEO01A-01: `https://www.creovision.io` queda recomendado como origen canónico; no versionar redirect host en SEO-01B porque producción ya redirige non-www a www y el origen es externo/no versionado.
- SEO01A-02: SEO-01B debe limitarse a agregar canonical en `/`, `/horoscopo` y `/luna/fases/$slug`, más tests focales.
- SEO01B-01: Implementación completada. Home, horóscopo y fases lunares publican canonical/`og:url` coherente con `https://www.creovision.io`; no se tocaron redirects, sitemap, robots, `site.ts`, `seo.ts` ni JSON-LD.
- SEO02A-01: Auditoría completada sin tocar código funcional. Se detectaron inconsistencias prioritarias: `/buscar` en sitemap con `noindex`, `/luna/calendario` en sitemap como URL indice con `Navigate`, soft-404 en `/tarot/cartas/$card` invalida, `/u/$username` sin política SEO/404 servidor, y sitemap editorial dinámico pendiente.
- SEO02B-01: Implementación completada. `/buscar` fue removido del sitemap; `/luna/calendario` emite canonical; tarot inválido y perfil público inexistente usan `notFound`; se añadieron canonicales concretos para rutas públicas del sitemap. No se tocaron robots, redirects host, JSON-LD, editorial dinámico ni compatibilidad fallback.
- SEO03-01: Auditoría comparativa completada sin tocar código funcional. `/`, `/tarot/carta-del-dia`, `/horoscopo` y `/tarot/tres-cartas/trabajo` quedan como controles positivos con contrato HARD_FREEZE/SOFT_FREEZE y matriz de protección en `03_PAGINAS_PROTEGIDAS_TOP10.md`.
- SEO04A-01: Auditoría y especificación completadas para `/luna`. Decisión: rol `HYBRID_CURRENT_STATE_PLUS_HUB`, metadata/H1 en `KEEP`, cambio estructural `MINOR`, contenido nuevo `MINIMAL`, componentes compartidos `LOCAL_VARIANT_ONLY`. Ver `04_QUICK_WIN_LUNA.md`.
- SEO04B-01: Implementación técnica completada para `/luna`: CTA principal `Conocer Tu Luna de Hoy`, bloque local `Explora el ciclo lunar` y tests focales. Metadata, H1, canonical y loader SSR quedaron intactos. Ver `04_QUICK_WIN_LUNA.md`.
- SEO04C-01: Refinamiento visual completado para los elementos nuevos de `/luna`. El CTA y `MoonHubPathways` quedaron mas compactos, accesibles y nativos del sistema visual sin tocar componentes compartidos ni señales SEO. Ver `04_QUICK_WIN_LUNA.md`.
- SEO05A-01: Auditoría comparativa completada para `/tarot/tres-cartas` frente al control `/tarot/tres-cartas/trabajo`. Decisión: rol `TOOL_FIRST_WITH_MINIMAL_CONTEXT`, title `KEEP`, description `CHANGE`, H1 `CHANGE`, cambio estructural `MINOR`, contenido nuevo `MINIMAL`, shell compartido `LOCAL_OVERRIDE_ONLY`. Ver `05_TAROT_TRES_CARTAS.md`.
- SEO05B-01: Implementación completada para `/tarot/tres-cartas`: description alineada con influencia/qué mirar/próximo paso, H1 `Tarot de tres cartas`, microcopy mínimo local y tests focales. No se tocaron title, canonical, Trabajo, shell compartido, picker, resultado, interpretación ni NBA. Ver `05_TAROT_TRES_CARTAS.md`.
- SEO05C-01: Refinamiento visual local completado para la zona inicial de `/tarot/tres-cartas`: encabezado centrado, margen local compactado, microcopy en labels flexibles y picker más cercano. No se tocaron metadata, Trabajo, shell compartido, picker, resultado, post-tirada ni lógica. Ver `05_TAROT_TRES_CARTAS.md`.
- SEO06A-01: Auditoría comparativa completada para `/compatibilidad/geminis/sagitario`. Decisión: rol `ANSWER_FIRST_PLUS_DEEP_DIVE`, title `KEEP`, description `CHANGE`, H1 `KEEP`, cambio estructural `MODERATE`, contenido `MODERATE`, orden inverso `SINGLE_CANONICAL_URL`, expansión `VALIDATE_GEMINIS_SAGITARIO_FIRST`. Ver `06_COMPATIBILIDAD_GEMINIS_SAGITARIO.md`.
- SEO06B-01: Implementación visual/editorial local completada para `/compatibilidad/geminis/sagitario`: respuesta inicial, amor y largo plazo condicionados a `geminis__sagitario`. No se tocaron metadata, H1, canonical, loader, datos, fallback, normalización ni componentes compartidos. Ver `06_COMPATIBILIDAD_GEMINIS_SAGITARIO.md`.
- SEO06C-01: Cierre técnico completado para `/compatibilidad/geminis/sagitario`: description específica condicional, enlaces internos verificados, orden inverso protegido por tests y fallback demo caracterizado con política futura recomendada `NOINDEX_DEMO` en fase separada. Ver `06_COMPATIBILIDAD_GEMINIS_SAGITARIO.md`.
- SEO06D-A-01: Validación arquitectónica completada para fallback demo de compatibilidad. Se aprueba la política futura `NOINDEX_DEMO` con `KEEP_200`, `NOINDEX_FOLLOW`, self-canonical, sitemap solo para pares indexables y regla SEO-07 de no enlazar con intención SEO a pares fallback demo. SEO-06D-B queda pendiente. Ver `06_COMPATIBILIDAD_GEMINIS_SAGITARIO.md`.
- SEO06D-B-01: Implementación completada de indexabilidad segura para fallback demo de compatibilidad. Se agregó allowlist técnica de pares indexables, robots `noindex,follow` para pares fuera de la allowlist, sitemap de compatibilidad limitado a pares aprobados y tests focales. Ver `06_COMPATIBILIDAD_GEMINIS_SAGITARIO.md`.
- SEO07A-01: Arquitectura de enlazado interno auditada y especificada sin modificar código. La fuente única de pares indexables es `src/config/compatibility-indexability.ts` (`INDEXABLE_COMPATIBILITY_PAIR_KEYS`, `isIndexableCompatibilityPair`, `indexableCompatibilityPairs`), seguro para cliente. Decisiones: Home/nav/footer KEEP, Luna/Tarot/Horóscopo interno SUFFICIENT, compatibilidad NEEDS_CHANGES. Hallazgos: P0 (bloque "Otras combinaciones relacionadas" en `CompatibilityPairPage` usa `getPublishedForSign` que rellena con fallback, pudiendo enlazar pares noindex) y discrepancia SEO-06C (los enlaces a `/horoscopo/$sign` documentados no existen en el código). CHANGE-07B cerrados (07B-01 P0, 07B-02/07B-03 P1, 07B-04 P2). Ver `07_ENLAZADO_INTERNO.md`.
- SEO08A-01: Auditoría de title/description/H1/capas de contenido completada sin modificar código. Decisiones: horóscopo SUFFICIENT, luna TARGETED_CHANGES, tarot TARGETED_CHANGES, compatibilidad SUFFICIENT, editorial DEFER, protected_pages KEEP_FROZEN, seo08c_needed NO. Hallazgos: P0 técnico (`/tarot/cartas/$card` solo alcanza 8 de 78 cartas por `parseParams` estático), P1 (metadata de `/luna/fases/$slug` ignora `seo_title`/`seo_description` de DB), P2 (config residual `threeCardReadings.general.seo.description` obsoleto), P1 marca "Proyecto Astral" en seed editorial demo. CHANGE-08B cerrados (08B-01 P0, 08B-02 P1, 08B-03 P2, 08B-04 P1). SEO-08C NO aplica. Ver `08_METADATA_Y_CAPAS_DE_CONTENIDO.md`.
- SEO08B-01: Implementación focal ejecutada con observaciones. `/tarot/cartas/$card` valida existencia en loader contra `tarot_cards` vía `tarotService.getCardBySlug`, sin aceptar slugs inexistentes como 200; `/luna/fases/$slug` usa `seo_title`/`seo_description` de `moon_phase_content` con fallback seguro. 08B-03 no se implementó. 08B-04 queda bloqueado parcialmente: la referencia `Proyecto Astral` vive en una migración histórica seed y requiere una migración nueva autorizada para corregir producción. Tests SEO 32 PASS, build PASS, typecheck con deuda preexistente de `vitest`. Ver `08_METADATA_Y_CAPAS_DE_CONTENIDO.md`.
- SEO08D-01: Cierre técnico completado. El sitemap dejó de depender de `majorArcana` como fuente total de cartas y ahora usa una única consulta `tarotService.getLibrary()` para enumerar cartas publicadas de `tarot_cards`; tests validan `el-loco`, `as-de-copas`, `dos-de-espadas`, exclusión de `carta-inexistente` y compatibilidad demo fuera del sitemap. Se creó una migración nueva, puntual e idempotente para `editorial_articles.slug='articulo-de-demostracion'`, corrigiendo `seo.title` y `seo.description` de `Proyecto Astral` a `Creovision` sin editar migraciones históricas. Tests SEO 34 PASS, build PASS, typecheck con deuda preexistente de `vitest`. Ver `08_METADATA_Y_CAPAS_DE_CONTENIDO.md`.

## Reglas para agentes

- No iniciar SEO-01 sin autorización externa.
- No modificar código funcional durante auditorías baseline.
- No asumir causalidad SEO a partir de Search Console con bajo volumen.
- Toda conclusión debe citar archivo, función, ruta, configuración o comando.
- No corregir errores encontrados en SEO-00; documentarlos con fase responsable.
- Antes de tocar canonical, sitemap o redirects, proteger `/`, `/tarot/carta-del-dia`, `/horoscopo` y `/tarot/tres-cartas/trabajo`.

## Historial de actualizaciones

### 2026-08-17

SEO-00 ejecutado. Se creó baseline técnico, se documentó arquitectura SEO, dominio `www`, sitemap, robots, SSR, rutas protegidas, riesgos y pruebas.

SEO-01A ejecutado. Se definió política de host/canonical/trailing/query y se preparó especificación cerrada para SEO-01B en `01_NORMALIZACION_WWW_CANONICAL.md`.

SEO-01B ejecutado. Se implementó canonical faltante en rutas autorizadas y se ampliaron tests focales; `npx vitest run src/config/seo-indexability.test.ts` pasó con 12 tests.

SEO-02A ejecutado. Se creó auditoría de indexación, sitemap, robots y soft-404 en `02_INDEXACION_SITEMAP_ROBOTS.md`; `npx vitest run src/config/seo-indexability.test.ts` pasó con 12 tests. SEO-02B queda pendiente y no fue implementado.

SEO-02B ejecutado. Se implementaron reparaciones controladas de indexabilidad y soft-404; `npx vitest run src/config/seo-indexability.test.ts` pasó con 16 tests, `npm run build` pasó y `npx tsc --noEmit` continúa fallando por deuda preexistente.

SEO-03 ejecutado. Se creó auditoría comparativa de páginas protegidas y contrato de regresión; `npx vitest run src/config/seo-indexability.test.ts` pasó con 16 tests. No se modificó código funcional ni se inició SEO-04.

SEO-04A ejecutado. Se creó diagnóstico y especificación cerrada para el quick win de `/luna`; `npx vitest run src/config/seo-indexability.test.ts` pasó con 16 tests. No se modificó código funcional ni se iniciaron SEO-04B/SEO-04C.

SEO-04B ejecutado. Se implementó el quick win técnico de `/luna`; `npx vitest run src/config/seo-indexability.test.ts` pasó con 18 tests y `npm run build` pasó. `npx tsc --noEmit` continúa fallando por deuda global preexistente. No se iniciaron SEO-04C/SEO-05.

SEO-04C ejecutado. Se refinó visualmente el CTA `Conocer Tu Luna de Hoy` y el bloque `Explora el ciclo lunar`; `npx vitest run src/config/seo-indexability.test.ts` pasó con 18 tests y `npm run build` pasó. `npx tsc --noEmit` continúa fallando por deuda global preexistente. SEO-04 queda completado y no se inició SEO-05.

SEO-05A ejecutado. Se creó diagnóstico comparativo y especificación cerrada para `/tarot/tres-cartas`; `npx vitest run src/config/seo-indexability.test.ts` pasó con 18 tests. No se modificó código funcional, no se tocaron metadata/H1/canonical en código y no se iniciaron SEO-05B/SEO-05C.

SEO-05B ejecutado. Se alineó semánticamente `/tarot/tres-cartas` con su tirada real: influencia, qué mirar y próximo paso. `npx vitest run src/config/seo-indexability.test.ts` pasó con 20 tests, `npx vitest run src/config/three-card-readings.test.ts` pasó con 24 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` continúa fallando por deuda global preexistente. No se inició SEO-05C ni SEO-06.

SEO-05C ejecutado. Se refinó visualmente solo el bloque inicial local de `/tarot/tres-cartas`; `npx vitest run src/config/seo-indexability.test.ts` pasó con 20 tests, `npx vitest run src/config/three-card-readings.test.ts` pasó con 24 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` continúa fallando por deuda global preexistente. SEO-05 queda completado y no se inició SEO-06.

SEO-06A ejecutado. Se creó auditoría semántica y arquitectura para `/compatibilidad/geminis/sagitario`; `npx vitest run src/config/seo-indexability.test.ts` pasó con 20 tests. No se modificó código funcional, metadata, H1, canonical, sitemap, DB ni componentes compartidos. SEO-06B y SEO-06C quedan pendientes.

SEO-06B ejecutado. Se implementó la arquitectura `ANSWER_FIRST_PLUS_DEEP_DIVE` local de `/compatibilidad/geminis/sagitario` con copy aprobado de SEO-06A y condición por `geminis__sagitario`. `npx vitest run src/config/seo-indexability.test.ts` pasó con 20 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` continúa fallando por deuda global preexistente, sin errores en `CompatibilityPairPage.tsx`. SEO-06C queda pendiente y no se inició.

SEO-06C ejecutado. Se implementó description específica únicamente para `/compatibilidad/geminis/sagitario`; se añadieron tests de metadata, enlaces internos, orden inverso y fallback demo. `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 24 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` continúa fallando por deuda global preexistente; no hay error en la ruta SEO-06C y `seo-indexability.test.ts` solo mantiene el error conocido de tipos de `vitest`. SEO-06 queda completado y no se inició SEO-07.

### 2026-08-18

SEO-08A ejecutado. Se creó la auditoría de titles, descriptions, H1 y capas de contenido en `08_METADATA_Y_CAPAS_DE_CONTENIDO.md`. Se conservó la metadata alineada (horóscopo/compatibilidad KEEP) y se identificaron 4 intervenciones focales para SEO-08B (cobertura tarot P0, metadata de fases lunares P1, limpieza config general P2, marca editorial demo P1). SEO-08C declarado NO_APLICA. `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 29 tests. No se modificó código funcional; SEO-08B y SEO-09 no fueron iniciados.

SEO-08B ejecutado. Se implementaron 08B-01 y 08B-02: la ficha dinámica de Tarot dejó de limitarse a la lista local de 8 cartas y valida contra la fuente runtime `tarot_cards` en loader; las fichas de fases lunares consumen `seo_title`/`seo_description` desde `loaderData.content` sin cambiar H1, contenido ni canonical. 08B-03 quedó sin implementar por instrucción explícita. 08B-04 no se aplicó funcionalmente porque el hallazgo está en una migración histórica ya aplicada y no había migración nueva autorizada; queda como bloqueo parcial justificado. `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 32 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` mantiene solo deuda preexistente filtrada de tipos de `vitest`; no hay errores en las rutas funcionales SEO-08B. SEO-09 no fue iniciado.

SEO-08D ejecutado. Se cerró el gap restante de cobertura: `GET /sitemap.xml` ahora construye las URLs de cartas desde `tarotService.getLibrary()` en una única consulta al catálogo publicado, preservando el fallback estático solo como helper testeable. Se agregó la migración `20260818233000_fix_demo_article_project_astral_brand.sql` para corregir de forma puntual el JSON SEO del artículo demo (`Proyecto Astral` -> `Creovision`) sin editar la migración histórica ni hacer replace global. `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 34 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` mantiene deuda preexistente de tipos de `vitest`; no hay errores en `sitemap[.]xml.ts`. SEO-09 no fue iniciado.

SEO-06D-A ejecutado como hardening posterior a SEO-06. Se auditó la arquitectura de fallback demo sin modificar código funcional: `isDemo` no distingue de forma fiable fila DB real vs fallback generado, `head()` actual no conoce el perfil cargado, `buildMeta({ noindex: true })` emite `noindex,nofollow`, y el sitemap enumera las 78 combinaciones posibles. Decisión: preparar SEO-06D-B para detectar fallback explícitamente, emitir `noindex,follow` solo en demos, conservar self-canonical, mantener UX 200 y excluir demos del sitemap/enlazado SEO. `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 24 tests. SEO-06D-B queda pendiente y no se inició SEO-07.

SEO-06D-B ejecutado. Se implementó una allowlist técnica de compatibilidad indexable (`geminis__sagitario`, `cancer__capricornio`, `aries__libra`), robots `noindex, follow` para pares fallback-only, self-canonical preservado y sitemap limitado a pares aprobados. `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 26 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` continúa fallando por deuda global preexistente; no hay errores en los archivos funcionales SEO-06D-B. SEO-07 queda pendiente y no se inició.

SEO-07A ejecutado. Se auditó y especificó la arquitectura de enlazado interno sin modificar código funcional. La fuente única de pares indexables queda verificada como `src/config/compatibility-indexability.ts` (segura para cliente). Decisiones: `home_navigation=KEEP`, `global_nav=KEEP`, `footer=KEEP`, `moon_cluster=SUFFICIENT`, `tarot_cluster=SUFFICIENT`, `horoscope_cluster=SUFFICIENT` (interno) + cambio cross-cluster signo→compat, `compatibility_cluster=NEEDS_CHANGES`, `compatibility_pair_source=REUSE_INDEXABLE_COMPATIBILITY_PAIR_KEYS`, `protected_page_changes=MINIMAL`. Se cierran CHANGE-07B-01 (P0: filtrar `alternativePairs` indexables), 07B-02 (P1: enlaces par→horóscopos de signo, cerrando discrepancia SEO-06C), 07B-03 (P1: enlace signo→compat indexable) y 07B-04 (P2: hub garantizado). `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 26 tests (baseline). Ver `07_ENLAZADO_INTERNO.md`.

SEO-07B ejecutado. Se implementaron solo CHANGE-07B-01, 07B-02 y 07B-03: filtrado de alternativas de compatibilidad a pares indexables, enlaces contextuales desde páginas de par hacia horóscopos de signo y enlace condicional desde páginas de signo hacia su compatibilidad indexable. La lógica deriva de `compatibility-indexability.ts` mediante `compatibility-internal-links.ts`; no se duplicó la lista de pares y no se implementó CHANGE-07B-04. `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 29 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` mantiene deuda global preexistente; no hay errores en los archivos funcionales SEO-07B.

SEO-09A ejecutado. Auditoría de JSON-LD y diseño de la arquitectura. Se definió usar un helper centralizado para retornar tags `<script>` en las llamadas a `head()`, permitiendo SSR puro, identificadores deterministas (WebSite, WebPage, CollectionPage) y ausencia de queries adicionales a DB (reutilizando `loaderData`). Tests baseline ejecutados y pasando. No se modificó código. SEO-09B queda pendiente para implementación (Codex).

SEO-09B ejecutado. Se implementó JSON-LD SSR con `buildJsonLd`, `serializeJsonLdForScript` y `buildJsonLdScript` en `src/config/seo.ts`, eliminando el componente CSR latente `StructuredData.tsx`. Las rutas aprobadas emiten un único script `application/ld+json` con `@context` + `@graph` compuesto por `WebSite` y un nodo local `WebPage` o `CollectionPage`, con IDs deterministas `https://www.creovision.io/#website` y `<canonical>#webpage`. No se añadieron schemas no aprobados ni queries DB. `npx --yes vitest run src/config/structured-data.test.ts` pasó con 5 tests, `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 34 tests y `npm run build` pasó. `npx tsc --noEmit --pretty false` continúa fallando por deuda global preexistente, sin errores en archivos SEO-09B. SEO-09C queda pendiente y no fue iniciado.

### 2026-08-19

SEO-09C ejecutado. Revisión independiente post-implementación sin modificar código. Verificado: SSR real del JSON-LD vía `head().scripts` (SSR_STRONGLY_VERIFIED), cero duplicación (sin root, sin CSR, un script por ruta), serialización segura, alineación canonical/metadata, reutilización de loaderData, cero queries extra, ausencia de schemas prohibidos (Organization/SearchAction/Article/BreadcrumbList/FAQPage/Product/Review/AggregateRating/LocalBusiness/HowTo/MedicalWebPage), fallbacks noindex no revertidos y no regresión de SEO-07/SEO-08 ni páginas protegidas. Decisiones: `structured_data=PASS`, `seo09_ready_to_close=YES`. Dos observaciones P2 inertes (objeto `structuredData` legacy sin consumidor y JSON-LD también emitido en demos noindex). No se requirió microfase FIX. `npx --yes vitest run src/config/structured-data.test.ts` pasó con 5 tests y `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 34 tests; `npm run build` pasó. SEO-09 queda COMPLETADO; SEO-10 pendiente y no iniciado. Ver `09_STRUCTURED_DATA.md`.

SEO-10 ejecutado. Auditoría final de cierre técnico sin modificar código. Revisión de extremo a extremo (canonical/www, robots, sitemap, indexabilidad, soft-404, metadata, páginas protegidas, Luna, Tarot 78 cartas, Compatibilidad demo/noindex, enlazado interno, Structured Data SSR, editorial). Resultado: 0 P0, 0 P1, 3 P2 no bloqueantes (objeto `structuredData` legacy sin consumidor; JSON-LD en demos noindex; config residual `threeCardReadings.general.seo.description`). Hallazgo histórico SEO-00-04 resuelto (canonical presente en `/`, `/horoscopo`, `/luna/fases/$slug`). Decisiones: `technical_readiness=READY_WITH_P2`, `seo11_ready=YES`. No se atribuye mejora de ranking/CTR. `npx --yes vitest run src/config/seo-indexability.test.ts` pasó con 34 tests y `npx --yes vitest run src/config/structured-data.test.ts` pasó con 5 tests; `npm run build` pasó. SEO-10 COMPLETADO; SEO-11 PENDIENTE y no iniciado. Ver `10_AUDITORIA_FINAL.md`.

SEO-11 ejecutado (apertura de medición, `MEASUREMENT_BASELINE_NO_CODE`). Se creó `11_MEDICION_SEARCH_CONSOLE.md` con las 24 secciones requeridas: objetivo, estado técnico heredado, fecha Día 0 (2026-08-19), baseline histórico, baseline Día 0 (registrado `PENDIENTE_DE_CAPTURA_MANUAL` por ausencia de acceso directo a Search Console), páginas y queries prioritarias, controles observacionales, indexación, sitemap coverage, Tarot 78, Luna, Compatibilidad, Structured Data, device split, Día 7/14/28, señales, incidentes, decisiones, próxima iteración y estado. Se definió congelamiento de cambios Día 0→Día 14 con `NO SEO CHANGES` y `code_policy=NONE`. No se modificó código funcional. Estado de la fase: `EN_CURSO` (no se marca COMPLETADO hasta evaluar Día 28).
