# SEO-03 — Paginas protegidas top 10

Fecha: 2026-08-17  
Modo: AUDITORIA_COMPARATIVA_SIN_IMPLEMENTACION  
Estado: PASS_CON_OBSERVACIONES

## 1. Objetivo

Blindar tecnicamente las paginas con senales competitivas iniciales en Search Console y convertirlas en controles positivos para fases SEO posteriores. Esta fase no optimiza, no cambia codigo funcional y no prueba causalidad.

## 2. Contexto Search Console

| Ruta | Posicion media observada | Clasificacion |
|---|---:|---|
| `/` | 4.1 | CONTROL_POSITIVO |
| `/tarot/carta-del-dia` | 5.6 | CONTROL_POSITIVO |
| `/horoscopo` | 5.8 | CONTROL_POSITIVO |
| `/tarot/tres-cartas/trabajo` | 6.6 | CONTROL_POSITIVO |

Paginas comparativas: `/luna` para SEO-04, `/tarot/tres-cartas` para SEO-05 y `/compatibilidad/geminis/sagitario` para SEO-06.

## 3. Limitaciones de los datos

Los datos tienen bajo volumen. Toda diferencia detectada se clasifica como HECHO_TECNICO, OBSERVACION o HIPOTESIS. Causalidad demostrada: NO.

## 4. Controles positivos

Las cuatro paginas comparten tres rasgos tecnicos despues de SEO-01/02: son 200 indexables, tienen canonical `www`, y exponen una accion o ruta de avance clara. No se concluye que esos rasgos expliquen la posicion observada.

## 5. Home

## CONTROL POSITIVO P01 — Home

Ruta: `/`  
Search Console: posicion media 4.1, bajo volumen.  
Archivo de ruta: `src/routes/index.tsx`.  
Componentes: `src/pages/HomePage.tsx`, `HomeHero`, `DailyInsightSection`, `CompatibilitySection`, `FeaturedReadingsSection`, `ZodiacSelector`, `ExploreTopicsSection`, `PersonalSpaceSection`.  
Loader: ninguno en la ruta. Datos secundarios cargan en cliente desde secciones como `DailyInsightSection`.  
SSR: compone secciones estaticas desde `homeConfig`; H1 y CTAs del hero estan en render inicial.  
Metadata: title `Tarot, luna y guías simbólicas | Creovision`; description editorial; OG/Twitter via `buildMeta`.  
Canonical: `https://www.creovision.io/`.  
H1: `Tarot y luna para entender tu momento` en `HomeHero`.  
H2: secciones como `Tu momento de hoy`, `Compara cualquier pareja zodiacal`, `Elige una tirada...`; algunas usan `sr-only` junto a `SectionHeading`.  
Accion principal: `Sacar mi carta de hoy` hacia `/tarot/carta-del-dia`; secundaria hacia `/horoscopo/hoy`.  
Links entrantes: header/logo global, sitemap home, footer indirecto.  
Links salientes: tarot diario, horoscopo hoy/signos, luna personal/hoy, compatibilidad, tarot tematico, cuenta.  
Schema: no hay JSON-LD SSR detectado; helpers existen sin uso activo.  
Sitemap: si.  
Dependencias compartidas: `buildMeta`, `routes`, `homeConfig`, `Page/Container`, `Button`, `Icon`, layout global, header/footer.  
Superficie de riesgo: alta por ser landing global y depender de orden/config de secciones.  
Elementos protegidos: title, description, canonical, H1, primer bloque visible, CTA hero, orden inicial `hero -> daily_insight -> compatibility -> featured_tarot`, links principales.  
Observaciones: mezcla navegacion editorial y acciones directas; no requiere loader para mostrar valor inicial.  
Hipotesis: la combinacion de H1 claro + CTA directo + enlaces internos a verticales podria ser patron a estudiar.  
Causalidad demostrada: NO.

## 6. Carta del Día

## CONTROL POSITIVO P02 — Carta del Día

Ruta: `/tarot/carta-del-dia`  
Search Console: posicion media 5.6, bajo volumen.  
Archivo de ruta: `src/routes/tarot.carta-del-dia.tsx`.  
Componentes: `TarotDailyPage`, `PageShell`, `PageHeader`, `TarotDailyExperience`, `TarotDailyInteraction`, `TarotPositionResult`, `TarotReadingDisclaimer`.  
Loader: no bloqueante; `beforeLoad` prefetch de `tarotDeckQueryOptions()`.  
Server functions: no directas en la ruta; servicio usa repositorio Supabase.  
React Query usage: `useTarotDeck()` con stale/cache y `tarotService.getDailyCard`.  
SSR: H1, description, breadcrumbs declarados y estructura de experiencia existen; carta concreta depende de deck/query/cliente.  
Metadata: title `Carta del día · Tarot · Creovision`; description estable; OG/Twitter via `buildMeta`.  
Canonical: `https://www.creovision.io/tarot/carta-del-dia`.  
H1: `Carta del día`.  
H2: `Una carta te espera` dentro de la interaccion antes de revelar.  
Accion principal: revelar/sacar carta diaria estable del dia.  
Links entrantes: Home hero, Home daily insight, Tarot hub, NextBestAction desde otras lecturas, sitemap.  
Links salientes: breadcrumbs hacia home/tarot; despues de revelar puede enlazar a carta individual y siguientes acciones.  
Schema: no JSON-LD SSR.  
Sitemap: si.  
Dependencias compartidas: `buildMeta`, `routes.tarotDaily`, `tarotDeckQueryOptions`, `tarotService`, repositorio tarot, componentes tarot compartidos, `PageShell/PageHeader`.  
Superficie de riesgo: alta por flujo interactivo, deck y lectura persistida por fecha.  
Elementos protegidos: canonical, metadata, H1, prefetch de deck, semantica "misma carta hasta manana", accion reveal, disclaimer.  
Observaciones: pagina de intencion unica; accion inmediata visible.  
Hipotesis: experiencia cerrada de producto + contenido evergreen podria ser patron para rutas tarot.  
Causalidad demostrada: NO.

## 7. Horóscopo

## CONTROL POSITIVO P03 — Horóscopo

Ruta: `/horoscopo`  
Search Console: posicion media 5.8, bajo volumen.  
Archivo de ruta: `src/routes/horoscopo.index.tsx`.  
Componentes: `HoroscopeHubPage`, `PageShell`, `PageHeader`, `HoroscopePeriodTabs`, `SignQuickSelector`, `Icon`.  
Loader: ninguno.  
Server functions: no directas.  
React Query usage: no en hub; rutas de periodo/signo cargan datos.  
SSR: H1, cards de periodo y grilla de 12 signos se renderizan desde config/data local.  
Metadata: title `Horóscopo — Creovision`; description con diario/semanal/mensual; OG/Twitter via `buildMeta`.  
Canonical: `https://www.creovision.io/horoscopo`.  
H1: `Tendencias astrales para cada signo`.  
H2: `Elegir periodo` sr-only; `Elige tu signo` visible.  
Accion principal: elegir periodo o signo; todos los signos tienen enlaces internos.  
Links entrantes: Home hero, Home daily insight, header/footer cuando este enlazado, NextBestAction, sitemap.  
Links salientes: `/horoscopo/hoy`, `/horoscopo/semana`, `/horoscopo/mes`, 12 rutas `/horoscopo/$sign`.  
Schema: no JSON-LD SSR.  
Sitemap: si.  
Dependencias compartidas: `buildMeta`, `routes`, `zodiacRoute`, `zodiacSigns`, `horoscopePeriods`, feature flag `isPublicFeatureEnabled("horoscope")`, `PageShell/PageHeader`.  
Superficie de riesgo: alta por hub de enlaces internos a todo el cluster.  
Elementos protegidos: title, description, canonical, H1, bloque de periodos, grilla completa de signos, feature gate.  
Observaciones: pagina con intencion de hub clara y profundidad de click baja hacia signos/periodos.  
Hipotesis: la grilla completa de entidades zodiacales puede ser un control de arquitectura interna para clusters.  
Causalidad demostrada: NO.

## 8. Tarot Tres Cartas Trabajo

## CONTROL POSITIVO P04 — Tarot Tres Cartas Trabajo

Ruta: `/tarot/tres-cartas/trabajo`  
Search Console: posicion media 6.6, bajo volumen.  
Archivo de ruta: `src/routes/tarot.tres-cartas.trabajo.tsx`.  
Componentes: `ThreeCardExperienceShell`, `ThreeCardLoveExperienceShell`, `ThreeCardPositionSlots`, `TarotCardPicker`, `InteractiveThreeCardResult`, `NextBestAction`.  
Loader: no bloqueante; `beforeLoad` prefetch de `tarotDeckQueryOptions()`.  
Server functions/API: interpretacion por hooks/API de tres cartas despues de seleccion.  
React Query usage: `useTarotDeck`, `useThreeCardInterpretation`, personalizacion en `NextBestAction`.  
SSR: metadata y shell/config inicial; interaccion de cartas depende de cliente/deck.  
Metadata: desde `threeCardReadings.trabajo.seo`.  
Canonical: `https://www.creovision.io/tarot/tres-cartas/trabajo`.  
H1: proviene del shell/config tematico: `Tres cartas — Trabajo` en la experiencia.  
H2: resultado `Tu Lectura`, secciones de sintesis y siguientes acciones tras completar.  
Accion principal: seleccionar tres cartas para una lectura laboral/profesional.  
Links entrantes: Home featured tarot, Tarot hub, sitemap.  
Links salientes: NextBestAction hacia horoscopo/carta diaria, posibles links de resultado y acciones de reset.  
Schema: no JSON-LD SSR.  
Sitemap: si.  
Dependencias compartidas: `threeCardReadings`, `tarotDeckQueryOptions`, `ThreeCardExperienceShell`, `ThreeCardLoveExperienceShell`, `useThreeCardInterpretation`, `NextBestAction`.  
Superficie de riesgo: critica por config compartida entre amor/general/trabajo/decision y por dependencia del flujo interactivo.  
Elementos protegidos: slug, config `trabajo`, title/description/canonical, posiciones `situacion/desafio/accion`, intro laboral, seleccion de tres cartas, CTA de barajar/seleccionar.  
Observaciones: comparte arquitectura con otras tiradas, pero tiene intencion tematica mas especifica que `/tarot/tres-cartas`.  
Hipotesis: especificidad de intencion "trabajo" podria ser candidata a prueba para otras verticales tarot.  
Causalidad demostrada: NO.

## 9. Dependencias compartidas

| Dependencia | Paginas afectadas | Riesgo | Regla futura |
|---|---|---|---|
| `src/config/seo.ts` `buildMeta` | Todas las protegidas | CRITICAL | No cambiar salida de title/description/canonical/robots sin regresion de las 4 paginas. |
| `src/config/site.ts` | Todas | CRITICAL | Host `https://www.creovision.io` HARD_FREEZE. |
| `src/config/routes.ts` | Todas | CRITICAL | No cambiar slugs ni helpers sin pruebas sitemap/canonical. |
| `src/routes/__root.tsx` | Todas | CRITICAL | No alterar `<HeadContent />`, lang, main shell ni meta global sin snapshot. |
| `AppShell/SiteHeader/SiteFooter` | Todas | HIGH | Cambios requieren comprobar links principales y contenido visible. |
| `PageShell/PageHeader` | Carta, Horoscopo, Trabajo, comparativas | HIGH | H1/breadcrumb/layout dependen de estos componentes. |
| `AppBreadcrumbs` | Internas | MEDIUM | Actualmente retorna `null`; activar breadcrumbs visibles cambiaria estructura. |
| `homeConfig` | Home | HIGH | Orden, H1, CTA y enlaces de home salen de config. |
| `tarotDeckQueryOptions` | Carta del dia, Trabajo, Tarot general | HIGH | Cambios afectan disponibilidad de experiencias tarot. |
| `threeCardReadings` | Trabajo, Tarot general, Amor, Decision | CRITICAL | Cambios de config pueden alterar metadata, H1, posiciones y prompts. |
| `ThreeCardExperienceShell` | Trabajo y otras tres cartas | HIGH | Shell compartido; probar todas las tiradas si se toca. |
| `zodiacSigns` / `zodiacRoute` | Horoscopo y compatibilidad | HIGH | Impacta grillas, canonicales y rutas dinamicas. |
| `NextBestAction` | Trabajo, compatibilidad, signos | MEDIUM | Cambia enlaces de continuacion y dead-end risk. |
| `StructuredData` / `structuredData` | Potencialmente todas | MEDIUM | Existe pero no se usa SSR; disenar por tipo antes de activar. |

## 10. Grafo de riesgo

CRITICAL: `siteConfig.url` -> `absoluteUrl` -> `buildMeta` -> canonical/OG/sitemap.  
CRITICAL: `routes`/helpers -> enlaces internos, sitemap, canonicales y navegación.  
CRITICAL: `threeCardReadings` -> metadata y semantica de `/tarot/tres-cartas/trabajo`.  
HIGH: `PageHeader` -> H1 de paginas internas.  
HIGH: `HomeHero`/`homeConfig` -> H1 y CTAs de Home.  
HIGH: `tarotDeckQueryOptions`/`tarotService` -> disponibilidad de experiencias tarot.  
MEDIUM: `NextBestAction` -> enlaces de salida y continuidad de experiencia.  
MEDIUM: `AppBreadcrumbs` -> actualmente oculto; si se activa cambia navegación visible.

## 11. Comparación /luna

| Factor | Control positivo | Página objetivo | Diferencia | Clasificación | Reutilizable |
|---|---|---|---|---|---|
| metadata completeness | `/` y `/horoscopo` tienen title/description/canonical | `/luna` tiene title/description/canonical | Ambas completas | HECHO_TECNICO | SI |
| canonical | Home `/`, Horoscopo `/horoscopo` | `/luna` | Todos self-canonical `www` | HECHO_TECNICO | SI |
| H1 clarity | Home: momento; Horoscopo: signos | Luna: `La Luna, día a día` | Luna declara entidad clara | OBSERVACION | SI |
| semantic hierarchy | Horoscopo tiene hub periodos/signos | Luna tiene hero, snapshot, fases, facts, disclaimer | Luna tiene mas contenido tecnico/cientifico | OBSERVACION | REQUIERE_VALIDACION |
| SSR content | Home/Horoscopo mayormente config local | Luna usa loader React Query para today/upcoming | Luna depende mas de datos servidor | HECHO_TECNICO | REQUIERE_VALIDACION |
| interactive action visibility | Home CTA inmediato, Horoscopo eleccion signo | Luna CTAs `Luna de hoy` y `Calendario del mes` | Luna tambien tiene accion inmediata | OBSERVACION | SI |
| internal links | Horoscopo enlaza 12 signos | Luna enlaza fases/calendario/hoy | Cluster lunar existe pero debe protegerse | HECHO_TECNICO | SI |
| breadcrumbs | Home sin PageShell; Horoscopo breadcrumbs invisibles por AppBreadcrumbs null | Luna breadcrumbs invisibles | Sin diferencia visible | HECHO_TECNICO | NO |
| schema | No JSON-LD SSR | No JSON-LD SSR | Misma carencia | HECHO_TECNICO | REQUIERE_VALIDACION |
| page intent clarity | Home amplia; Horoscopo hub; Luna hub tecnico/simbolico | Luna combina datos y lectura simbolica | Candidata SEO-04: reforzar sin copiar | HIPOTESIS | REQUIERE_VALIDACION |

## 12. Comparación Tarot general vs Trabajo

| Factor | Control positivo | Página objetivo | Diferencia | Clasificación | Reutilizable |
|---|---|---|---|---|---|
| componente principal | Trabajo usa `ThreeCardExperienceShell` | General usa `TarotThreeCardsPage` + `ThreeCardExperienceShell` | Comparten shell interactivo | HECHO_TECNICO | SI |
| metadata builder | Trabajo usa `buildMeta` con `threeCardReadings.trabajo.seo` | General usa `buildMeta` con texto en ruta | Fuente de metadata distinta | HECHO_TECNICO | REQUIERE_VALIDACION |
| loader | Ambos hacen prefetch `tarotDeckQueryOptions` | Igual | Sin diferencia | HECHO_TECNICO | SI |
| contenido SSR | Trabajo depende de config tematica del shell | General tiene `PageHeader` explicito antes del shell | General comunica H1 en page wrapper; trabajo en shell | OBSERVACION | REQUIERE_VALIDACION |
| H1/H2 | Trabajo: foco laboral desde config | General: `Tira tus cartas` | Trabajo comunica intencion vertical | OBSERVACION | REQUIERE_VALIDACION |
| CTA inmediato | Ambos barajan/seleccionan cartas | Igual en shell | Sin diferencia principal | HECHO_TECNICO | SI |
| enlaces internos | Trabajo entra desde Home/Tarot hub/sitemap | General entra desde Tarot hub/sitemap | Trabajo tambien destacado en Home | OBSERVACION | REQUIERE_VALIDACION |
| canonical | `/tarot/tres-cartas/trabajo` | `/tarot/tres-cartas` | Ambos correctos | HECHO_TECNICO | SI |
| schema | No JSON-LD SSR | No JSON-LD SSR | Sin diferencia | HECHO_TECNICO | REQUIERE_VALIDACION |
| contenido contextual | Trabajo tiene posiciones situacion/desafio/accion | General usa influencia/mirar/paso | Diferencia semantica real | HECHO_TECNICO | REQUIERE_VALIDACION |

Respuesta critica: Trabajo y Tarot general comparten deck, shell base e interaccion; difieren en fuente de metadata, H1/contexto visible y configuracion editorial de posiciones. No hay evidencia causal de ranking.

## 13. Comparación Compatibilidad

| Factor | Control positivo | Página objetivo | Diferencia | Clasificación | Reutilizable |
|---|---|---|---|---|---|
| metadata completeness | Horoscopo y Trabajo completos | `/compatibilidad/geminis/sagitario` completo | BuildMeta con canonical | HECHO_TECNICO | SI |
| canonical | Controles self-canonical | Pair canonical normalizado por helper | Compatibilidad tambien normaliza pares | HECHO_TECNICO | SI |
| H1 clarity | Horoscopo hub y Trabajo vertical | Pair title depende de profile/fallback | Intencion entidad+entidad clara si profile existe | OBSERVACION | REQUIERE_VALIDACION |
| semantic hierarchy | Horoscopo grilla; Trabajo flujo | Pair tiene quick read, dimensiones, contextos, preguntas | Mayor profundidad editorial por secciones | OBSERVACION | REQUIERE_VALIDACION |
| SSR content | Horoscopo local, Trabajo cliente/interactivo | Pair usa loader `ensureQueryData` y `useSuspenseQuery` | Dependencia de repositorio/fallback | HECHO_TECNICO | REQUIERE_VALIDACION |
| CTA prominence | Trabajo accion interactiva | Pair selector `Prueba otra combinación` y NBA | Accion secundaria aparece despues del contenido | OBSERVACION | REQUIERE_VALIDACION |
| internal links | Horoscopo enlaza signos | Pair enlaza alternativas si existen | Alternativas dependen de data | HECHO_TECNICO | REQUIERE_VALIDACION |
| breadcrumbs | Invisibles por AppBreadcrumbs null | Invisibles | Sin diferencia visible | HECHO_TECNICO | NO |
| schema | No SSR | No SSR | Sin diferencia | HECHO_TECNICO | REQUIERE_VALIDACION |
| route depth | 1-3 segmentos | 3 segmentos dinamicos | Mayor profundidad y canonical normalizado | HECHO_TECNICO | NO |

## 14. Patrones observados

- HECHO_TECNICO: Las paginas protegidas usan canonical `www` despues de SEO-01/02.
- HECHO_TECNICO: No hay JSON-LD SSR activo en las paginas revisadas.
- OBSERVACION: Las paginas protegidas tienen una accion principal clara antes o durante el primer flujo.
- OBSERVACION: Home y Horoscopo funcionan como hubs internos; Carta del dia y Trabajo funcionan como experiencias de producto.
- HIPOTESIS: Las rutas tematicas especificas pueden beneficiarse de intencion semantica mas clara que rutas generales, pero debe probarse.

## 15. Hipótesis para fases futuras

### HYPOTHESIS SEO03-H01 — Hubs con entidades completas

Observación: `/horoscopo` lista periodos y 12 signos desde datos locales.  
Control positivo: `/horoscopo`.  
Página comparada: `/luna`.  
Diferencia: `/luna` lista fases y calendario, pero depende mas de datos dinamicos.  
Posible explicación: una grilla completa de entidades podria reforzar cluster interno.  
Evidencia disponible: codigo de `HoroscopeHubPage` y `MoonHubPage`.  
Evidencia faltante: medicion posterior a cambios y datos de cobertura.  
Cómo probar: en SEO-04, snapshot antes/despues de links/fases/acciones sin alterar canonical.  
Fase candidata: SEO-04.  
Causalidad demostrada: NO

### HYPOTHESIS SEO03-H02 — Especificidad temática en tarot

Observación: `/tarot/tres-cartas/trabajo` comunica foco laboral en metadata/config/posiciones.  
Control positivo: `/tarot/tres-cartas/trabajo`.  
Página comparada: `/tarot/tres-cartas`.  
Diferencia: general usa H1 mas amplio y posiciones genericas.  
Posible explicación: foco tematico podria alinear mejor intención de busqueda.  
Evidencia disponible: `threeCardReadings.trabajo` vs `general`.  
Evidencia faltante: query-level data y experimentacion controlada.  
Cómo probar: SEO-05 debe evaluar copy/estructura de general sin copiar trabajo.  
Fase candidata: SEO-05.  
Causalidad demostrada: NO

### HYPOTHESIS SEO03-H03 — Profundidad editorial en compatibilidad

Observación: compatibilidad pair tiene dimensiones, contextos, tips y preguntas.  
Control positivo: `/horoscopo`, `/tarot/tres-cartas/trabajo`.  
Página comparada: `/compatibilidad/geminis/sagitario`.  
Diferencia: pair depende de profile/fallback y alternativas.  
Posible explicación: contenido seccional puede ayudar si es real/publicado.  
Evidencia disponible: `CompatibilityPairPage`.  
Evidencia faltante: decision sobre fallback demo y perfiles publicados.  
Cómo probar: SEO-06 debe distinguir contenido real vs fallback antes de expandir.  
Fase candidata: SEO-06.  
Causalidad demostrada: NO

## 16. Contrato HARD_FREEZE

- Route path y canonical de `/`, `/tarot/carta-del-dia`, `/horoscopo`, `/tarot/tres-cartas/trabajo`.
- Title y description de las cuatro paginas protegidas.
- H1 de Home, Carta del Dia, Horoscopo y Trabajo.
- Primer bloque visible de HomeHero, PageHeader de Carta/Horoscopo y configuracion Trabajo.
- CTA principal de Home hero y accion interactiva tarot.
- `siteConfig.url`, `absoluteUrl`, `buildMeta` comportamiento canonical/robots.
- `threeCardReadings.trabajo` slug, seo y posiciones.
- `zodiacSigns` slugs y `zodiacRoute`.

## 17. Contrato SOFT_FREEZE

- Orden de secciones Home despues del hero.
- `PageShell`, `PageHeader`, `SiteHeader`, `SiteFooter`.
- `NextBestAction` en experiencias tarot/compatibilidad.
- `tarotDeckQueryOptions`, `tarotService`, `useTarotDeck`.
- Estilos/responsive de bloques principales.
- Activacion futura de breadcrumbs visibles.
- Introduccion de JSON-LD SSR por tipo de pagina.

## 18. Elementos OPEN

- Componentes no visibles en las cuatro paginas protegidas.
- Ajustes internos de iconos sin cambio de texto/estructura.
- Documentacion Markdown.
- Nuevos tests de regresion.
- Paginas no protegidas cuando su fase lo autorice.

## 19. Matriz de protección

| Página | Elemento | Protección | Motivo | Validación requerida |
|---|---|---|---|---|
| `/` | title/description/canonical | HARD_FREEZE | Control positivo y home canonical | Test head + sitemap |
| `/` | H1/hero/CTA | HARD_FREEZE | Primer bloque y accion principal | Snapshot SSR/visual |
| `/` | orden secciones | SOFT_FREEZE | Cambia enlaces internos y prioridad visible | Comparacion antes/despues |
| `/tarot/carta-del-dia` | metadata/canonical | HARD_FREEZE | Ruta protegida con senal | Test head |
| `/tarot/carta-del-dia` | deck/reveal/disclaimer | HARD_FREEZE | Producto principal | Test funcional de flujo |
| `/horoscopo` | metadata/canonical | HARD_FREEZE | Hub protegido | Test head |
| `/horoscopo` | periodos + 12 signos | HARD_FREEZE | Cluster interno | Test links signos/periodos |
| `/tarot/tres-cartas/trabajo` | config `trabajo` | HARD_FREEZE | Define semantica, SEO y posiciones | Test config/snapshot |
| `/tarot/tres-cartas/trabajo` | shell tres cartas | SOFT_FREEZE | Compartido con otras tiradas | Test todas las tiradas |
| Todas | `buildMeta` | HARD_FREEZE | Head/indexabilidad global | Suite SEO focal |
| Todas | `PageHeader` | SOFT_FREEZE | H1 interno compartido | Snapshot H1/description |
| Todas | JSON-LD | SOFT_FREEZE | No existe SSR hoy; agregar cambia head | Validacion Rich Results |

## 20. Tests de regresión recomendados

Implementar en fase posterior:

- Por cada pagina protegida: status 200, title no vacio, description no vacia, canonical esperado, H1 presente, robots noindex ausente, contenido principal SSR presente, CTA/accion principal presente.
- Home: links a tarot diario, horoscopo hoy, compatibilidad y tarot trabajo intactos.
- Carta del dia: deck carga, estado inicial `Una carta te espera`, reveal disponible, disclaimer presente.
- Horoscopo: enlaces a `/horoscopo/hoy`, `/semana`, `/mes` y 12 signos.
- Trabajo: ruta funciona, tres slots/posiciones de trabajo presentes, seleccion/interaccion intacta.
- Head global: `buildMeta` mantiene canonical y `og:url` iguales.

## 21. Reglas para Antigravity

Antigravity no debe recibir instrucciones abiertas sobre paginas protegidas. Cualquier cambio visual debe especificar archivo, bloque, que conservar, que agregar, que no mover, responsive esperado y pruebas de regresion. No mover H1, CTA principal ni primer bloque visible sin autorizacion.

## 22. Reglas para Codex

Codex puede tocar infraestructura compartida solo si una fase lo autoriza. Si toca `buildMeta`, `routes`, `PageHeader`, `PageShell`, `threeCardReadings`, tarot deck o zodiac data, debe ejecutar la suite SEO focal y regresion de las cuatro paginas protegidas. No resolver deuda TypeScript global dentro de una fase SEO acotada.

## 23. Riesgos

### FINDING SEO03-01 — JSON-LD SSR ausente

Tipo: HECHO_TECNICO  
Página: todas las protegidas  
Archivo: `src/components/seo/StructuredData.tsx`, `src/config/seo.ts`  
Símbolo: `StructuredData`, `structuredData`  
Evidencia: `rg` solo encuentra definiciones; no uso activo SSR.  
Impacto: no hay schema en HTML inicial.  
Protección recomendada: SOFT_FREEZE; disenar por plantilla en fase especifica.  
Riesgo de modificar: MEDIUM  
Fase futura relacionada: SEO-09

### FINDING SEO03-02 — Breadcrumbs configurados pero invisibles

Tipo: HECHO_TECNICO  
Página: internas protegidas y comparativas  
Archivo: `src/components/layout/AppBreadcrumbs.tsx`  
Símbolo: `AppBreadcrumbs`  
Evidencia: retorna `null`.  
Impacto: breadcrumbs no aportan navegacion visible/SSR aunque `PageShell` los recibe.  
Protección recomendada: SOFT_FREEZE; activarlos cambiaria estructura visible.  
Riesgo de modificar: MEDIUM  
Fase futura relacionada: SEO-04/05/06

### FINDING SEO03-03 — Trabajo y Tarot general comparten shell

Tipo: HECHO_TECNICO  
Página: `/tarot/tres-cartas/trabajo` y `/tarot/tres-cartas`  
Archivo: `ThreeCardExperienceShell`, `ThreeCardLoveExperienceShell`, `three-card-readings.ts`  
Símbolo: `ThreeCardExperienceShell`  
Evidencia: ambas rutas usan prefetch deck y shell/config de tres cartas.  
Impacto: cambio compartido puede alterar control positivo y objetivo SEO-05 simultaneamente.  
Protección recomendada: HARD_FREEZE para config trabajo; SOFT_FREEZE para shell.  
Riesgo de modificar: HIGH  
Fase futura relacionada: SEO-05

## 24. Estado SEO-03

PASS_CON_OBSERVACIONES. Se crearon fichas de las cuatro paginas protegidas, comparaciones con `/luna`, `/tarot/tres-cartas` y `/compatibilidad/geminis/sagitario`, contrato de proteccion, grafo de riesgo y tests recomendados. No se modifico codigo funcional ni se inicio SEO-04.
