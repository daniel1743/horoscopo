# SEO-05A — Tarot Tres Cartas

Fecha: 2026-08-17  
Modo: AUDITORIA_Y_ESPECIFICACION_SIN_IMPLEMENTACION  
Estado: PASS_CON_OBSERVACIONES

## 1. Objetivo SEO-05

Diagnosticar `/tarot/tres-cartas` frente al control positivo `/tarot/tres-cartas/trabajo` y preparar una especificacion cerrada para una reparacion posterior. No se modifica codigo funcional, contenido de pagina, metadata, H1, canonical, sitemap ni componentes compartidos.

## 2. Contexto Search Console

`/tarot/tres-cartas/trabajo` aparece como pagina protegida con posicion media observada 6.6 en el periodo Search Console de 28 dias. `/tarot/tres-cartas` aparece entre paginas comparativas con senales iniciales, pero no queda clasificada como control positivo.

## 3. Limitaciones de los datos

El volumen observado es bajo. Las diferencias descritas son hechos tecnicos, observaciones o hipotesis. Causalidad demostrada: NO.

## 4. Implementación /tarot/tres-cartas

Ruta: `src/routes/tarot.tres-cartas.index.tsx`.  
Pagina: `src/pages/tarot/TarotThreeCardsPage.tsx`.  
Shell: `ThreeCardExperienceShell` con `readingSlug={threeCardReadings.general.slug}`.  
Prefetch: `tarotDeckQueryOptions()` en `beforeLoad`.  
Metadata actual: title `Tirada de Tarot de 3 cartas gratis · Creovision`; description `Baraja y elige tres cartas para una lectura general de tarot: pasado, presente y tendencia futura.`; canonical `/tarot/tres-cartas`.

## 5. Implementación /tarot/tres-cartas/trabajo

Ruta: `src/routes/tarot.tres-cartas.trabajo.tsx`.  
Shell: `ThreeCardExperienceShell` con `readingSlug="trabajo"`.  
Prefetch: `tarotDeckQueryOptions()` en `beforeLoad`.  
Metadata: sale de `threeCardReadings.trabajo.seo`, con title `Tirada de Tarot de Trabajo de 3 cartas | Creovision`, description laboral y canonical `/tarot/tres-cartas/trabajo`.

## 6. Componentes compartidos

Ambas paginas comparten `ThreeCardExperienceShell`, `ThreeCardLoveExperienceShell`, `ThreeCardPositionSlots`, `TarotCardPicker`, `InteractiveThreeCardResult`, `useTarotDeck`, `useThreeCardInterpretation`, `tarotDeckQueryOptions`, `buildMeta` y `NextBestAction`.

## 7. Comparación técnica

| Factor | General | Trabajo | Clasificacion |
|---|---|---|---|
| Ruta | Wrapper propio + shell | Ruta directa al shell | HECHO_TECNICO |
| Prefetch deck | Si | Si | HECHO_TECNICO |
| Metadata | Texto duplicado en ruta | Config central `threeCardReadings.trabajo.seo` | HECHO_TECNICO |
| Canonical | `/tarot/tres-cartas` | `/tarot/tres-cartas/trabajo` | HECHO_TECNICO |
| Shell interactivo | Compartido | Compartido | HECHO_TECNICO |
| Enlaces entrantes | Hub tarot, navegacion, sitemap | Home featured tarot, hub tarot, sitemap | OBSERVACION |

## 8. Comparación semántica

General usa posiciones `Lo que influye`, `Lo que necesitas mirar` y `Próximo paso`. Trabajo usa `Situación actual`, `Desafío u oportunidad` y `Acción recomendada`. La metadata de General habla de `pasado, presente y tendencia futura`, que no coincide con sus posiciones reales.

## 9. Primer viewport general

`TarotThreeCardsPage` muestra `PageHeader` con eyebrow `Tarot`, H1 `Tira tus cartas` y description orientada a influencia, atencion y proximo paso. Debajo entra el shell, que auto-baraja cuando el deck esta listo y muestra posiciones.

## 10. Primer viewport Trabajo

Trabajo no usa `TarotThreeCardsPage`; entra directo al shell configurado como `trabajo`. La semantica visible depende de `threeCardReadings.trabajo`: titulo `Tres cartas — Trabajo`, description laboral e intro laboral dentro de la configuracion.

## 11. Intención primaria

Decision: `primary_intent = realizar una tirada general de tarot de tres cartas para reflexionar sobre una situacion abierta`.

La pagina no debe competir como lectura laboral, amorosa o de decision. Debe funcionar como herramienta general y puerta hacia variantes tematicas.

## 12. Canibalización

Riesgo principal: bajo a medio. General y Trabajo tienen slugs, canonicales e intenciones distintas. El riesgo real no es duplicacion tecnica, sino ambiguedad semantica si General promete `pasado/presente/futuro` mientras su herramienta ejecuta `influencia/mirar/paso`.

## 13. Flujo de interacción

El flujo compartido es: carga deck, auto-baraja, muestra tres slots, el usuario selecciona tres cartas del abanico, revela progresivamente, interpreta, muestra resultado, permite guardar, preguntar sobre la lectura, hacer otra tirada y seguir con `NextBestAction`.

## 14. Significado de las tres posiciones

General:
- `Lo que influye`: energia, patron o contexto que actua sobre la situacion.
- `Lo que necesitas mirar`: punto que pide atencion u honestidad.
- `Próximo paso`: orientacion practica sin prediccion absoluta.

Trabajo:
- `Situación actual`: estado presente laboral o profesional.
- `Desafío u oportunidad`: punto de crecimiento, tension o potencial.
- `Acción recomendada`: orientacion practica y reflexiva.

## 15. Gaps

- General tiene metadata con `pasado, presente y tendencia futura`, pero UI/config no implementan esa estructura.
- H1 `Tira tus cartas` es accionable, pero no declara literalmente `Tarot de tres cartas`.
- La pagina general no explica de forma visible que su estructura no es pasado-presente-futuro.
- La metadata de General vive en la ruta, mientras la config general tambien contiene `seo`, generando doble fuente.

## 16. Experiencia post-tirada

Ambas paginas usan `InteractiveThreeCardResult`: resultado por posicion, sintesis, acciones `Guardar esta lectura`, `Preguntar sobre esta lectura`, `Hacer otra tirada` y `NextBestAction`. Para General, NBA no tematico recomienda horoscopo/carta diaria o luna segun personalizacion.

## 17. Metadata decision

`title: KEEP`  
El title actual contiene la entidad principal y la gratuidad. No requiere cambio obligatorio en SEO-05B.

`description: CHANGE`  
Debe alinearse con las posiciones reales: influencia, punto de atencion y proximo paso. No debe prometer pasado/presente/futuro si esa no es la tirada ejecutada.

## 18. H1 decision

`h1: CHANGE`  
Recomendacion para SEO-05B: cambiar el H1 general a una formulacion literal como `Tarot de tres cartas` o `Tirada de tarot de tres cartas`, manteniendo la accion en el CTA/copy cercano.

## 19. Arquitectura recomendada

`page_role: TOOL_FIRST_WITH_MINIMAL_CONTEXT`  
`structural_change: MINOR`  
`new_content: MINIMAL`

La pagina debe seguir siendo herramienta primero. Solo conviene agregar contexto minimo antes o cerca del shell para aclarar que las posiciones son influencia, mirada y proximo paso.

## 20. CTA recomendado

`primary_action = elegir tres cartas`

Mantener el flujo actual de auto-barajado y seleccion. Si se ajusta copy, la accion visible recomendada es `Elegir mis tres cartas`; `Barajar cartas` debe seguir disponible como accion secundaria/repetible del mazo.

## 21. Enlazado interno

Mantener General como destino principal desde `TarotHubPage` y navegacion. Mantener Trabajo como variante tematica desde Home y hub. Recomendacion posterior: desde General, exponer enlaces discretos a Amor, Trabajo y Decisiones sin desplazar el shell ni convertir la pagina en hub editorial.

## 22. Protección del shell compartido

`shared_shell = LOCAL_OVERRIDE_ONLY`

No tocar `ThreeCardExperienceShell`, `ThreeCardLoveExperienceShell`, seleccion, slots, resultados ni API para SEO-05B salvo regresion completa de Amor, General, Trabajo y Decision. Los cambios deben limitarse a ruta/page wrapper o config general.

## 23. CHANGE-05B para Codex

Alcance autorizado recomendado para SEO-05B:
- Cambiar solo description SEO de `/tarot/tres-cartas` para eliminar `pasado, presente y tendencia futura`.
- Cambiar H1 del wrapper general a una version literal con `Tarot de tres cartas`.
- Agregar microcopy minimo local que explique `Lo que influye`, `Lo que necesitas mirar` y `Próximo paso`.
- No tocar `/tarot/tres-cartas/trabajo`.
- No tocar shell compartido salvo que se agreguen tests de regresion para las cuatro tiradas.
- Ejecutar `npx vitest run src/config/seo-indexability.test.ts`.

## 24. Especificación SEO-05C para Antigravity

Si SEO-05B implementa cambios de copy/H1, Antigravity solo debe revisar ajuste visual local de `TarotThreeCardsPage`: espaciado del `PageHeader`, legibilidad del microcopy y convivencia con el abanico de cartas en mobile/desktop. No debe redisenar el shell, cartas, slots ni resultado.

## 25. Tests

Ejecutado: `npx vitest run src/config/seo-indexability.test.ts`.  
Resultado: 1 archivo pasado, 18 tests pasados.  
Warnings no bloqueantes: `vite-tsconfig-paths` redundante y test route `interpret-reading.test.ts` detectado por TanStack Router.

## 26. Expansión futura

`future_expansion = VALIDATE_GENERAL_FIRST`

No expandir nuevas variantes hasta corregir la consistencia semantica de General y medir. Decision y Amor ya existen como rutas/config; nuevas verticales deben esperar evidencia.

## 27. Medición

Medir por URL en Search Console: impresiones, clicks, CTR y posicion de `/tarot/tres-cartas` y `/tarot/tres-cartas/trabajo` por separado. Comparar queries que incluyan `tarot tres cartas`, `tirada tres cartas`, `pasado presente futuro` y variantes laborales, sin atribuir causalidad antes de volumen suficiente.

## 28. Riesgos

### HYPOTHESIS SEO05-H01 — Inconsistencia metadata/experiencia

Observacion: la description general promete pasado/presente/futuro, pero la config general usa influencia/mirar/paso.  
Posible impacto: mismatch de expectativa de busqueda y experiencia.  
Evidencia disponible: ruta y `threeCardReadings.general`.  
Evidencia faltante: query-level data suficiente y medicion posterior.  
Causalidad demostrada: NO

### HYPOTHESIS SEO05-H02 — H1 accionable pero poco literal

Observacion: H1 actual `Tira tus cartas` no contiene la entidad exacta `tarot tres cartas`.  
Posible impacto: menor claridad semantica en primer viewport.  
Evidencia disponible: `TarotThreeCardsPage`.  
Evidencia faltante: medicion post-cambio.  
Causalidad demostrada: NO

### HYPOTHESIS SEO05-H03 — Especificidad tematica de Trabajo

Observacion: Trabajo alinea title, description, slug, posiciones y accion laboral.  
Posible impacto: mayor ajuste a intenciones especificas.  
Evidencia disponible: `threeCardReadings.trabajo` y ruta protegida.  
Evidencia faltante: volumen suficiente y separacion por queries.  
Causalidad demostrada: NO

## 29. Rollback

Si SEO-05B reduce claridad, conversion o senales, revertir solo cambios locales de `/tarot/tres-cartas`: H1, description y microcopy. No tocar canonical, slug, shell compartido ni config de Trabajo.

## 30. Estado SEO-05A

PASS_CON_OBSERVACIONES. Auditoria y especificacion completadas sin modificar codigo funcional. SEO-05B y SEO-05C quedan pendientes.

## Decisiones finales

| Decision | Valor |
|---|---|
| page_role | TOOL_FIRST_WITH_MINIMAL_CONTEXT |
| primary_intent | realizar una tirada general de tarot de tres cartas para reflexionar sobre una situacion abierta |
| primary_action | elegir tres cartas |
| title | KEEP |
| description | CHANGE |
| h1 | CHANGE |
| structural_change | MINOR |
| new_content | MINIMAL |
| shared_shell | LOCAL_OVERRIDE_ONLY |
| future_expansion | VALIDATE_GENERAL_FIRST |

## Implementación SEO-05B — 2026-08-17

### Archivos modificados

- `src/routes/tarot.tres-cartas.index.tsx`
- `src/pages/tarot/TarotThreeCardsPage.tsx`
- `src/config/seo-indexability.test.ts`
- `src/config/three-card-readings.test.ts`
- `docs/seo-search-console-2026/05_TAROT_TRES_CARTAS.md`
- `docs/seo-search-console-2026/README.md`

### Símbolos modificados

- `tarotThreeCardsGeneralMeta`
- `tarotThreeCardsGeneralCopy`
- `TarotThreeCardsPage`
- Tests de metadata General/Trabajo y contrato de posiciones General.

### Description antes/después

Antes: `Baraja y elige tres cartas para una lectura general de tarot: pasado, presente y tendencia futura.`

Después: `Elige tres cartas para una lectura general de tarot sobre una situación abierta: influencia, qué mirar y próximo paso.`

Title y canonical permanecen intactos.

### H1 antes/después

Antes: `Tira tus cartas`

Después: `Tarot de tres cartas`

### Microcopy antes/después

Antes: no habia resumen local explícito de las tres posiciones reales fuera del `PageHeader`.

Después: `Influencia · Qué mirar · Próximo paso`

### Shell preservado

No se modificaron `ThreeCardExperienceShell`, `ThreeCardLoveExperienceShell`, `ThreeCardPositionSlots`, `TarotCardPicker`, `InteractiveThreeCardResult`, deck hook, interpretación ni NBA.

### Trabajo preservado

No se modificó `/tarot/tres-cartas/trabajo`, `threeCardReadings.trabajo`, su title, description, canonical, posiciones, layout ni flujo.

### Tests

- `npx vitest run src/config/seo-indexability.test.ts`: PASS, 20 tests.
- `npx vitest run src/config/three-card-readings.test.ts`: PASS, 24 tests.

### Build

`npm run build`: PASS.

### Typecheck

`npx tsc --noEmit --pretty false`: FAIL por deuda global preexistente. No aparecen errores nuevos en `src/pages/tarot/TarotThreeCardsPage.tsx` ni `src/routes/tarot.tres-cartas.index.tsx`. Persisten errores globales en navegación, cookies, tipos de tests/vitest, tipos de tres cartas compartidos y módulos server.

### Diff

Diff dentro del scope SEO-05B: metadata local de General, H1 local, microcopy local y tests focales. No hay diff en Trabajo ni shell compartido.

### Riesgos

El cambio reduce mismatch semántico, pero la medición SEO sigue limitada por bajo volumen. Causalidad demostrada: NO.

### Rollback

Revertir únicamente `tarotThreeCardsGeneralMeta.description`, `tarotThreeCardsGeneralCopy.h1`, `tarotThreeCardsGeneralCopy.positionSummary` y los tests añadidos en SEO-05B. No tocar Trabajo, shell compartido ni fases previas.

## Refinamiento visual SEO-05C — 2026-08-17

### Archivo funcional tocado

`src/pages/tarot/TarotThreeCardsPage.tsx`.

### Bloque exacto

Zona inicial local de `/tarot/tres-cartas`: `PageHeader`, microcopy de posiciones y margen previo a `ThreeCardExperienceShell`.

### H1

Texto preservado: `Tarot de tres cartas`. Se ajustó solo la presentación local mediante `alignment="center"` y `className="mb-0"` para evitar el margen inferior heredado de `PageHeader`.

### Microcopy

Texto/semántica preservada: `Influencia · Qué mirar · Próximo paso`. Se presenta como labels inline flexibles con separadores visuales, manteniendo `aria-label` con el microcopy completo.

### Spacing

Se compactó la relación H1/description/microcopy/picker: el margen global del `PageHeader` queda neutralizado localmente y el shell comienza con `mt-3 md:mt-5`.

### Mobile

El microcopy usa `flex-wrap`, `gap-x-2` y `gap-y-1`, evitando overflow horizontal y permitiendo que las posiciones envuelvan de forma limpia.

### Desktop

El bloque queda centrado, con ancho máximo `920px` y sin hero editorial ni espacio vertical excesivo antes de las cartas.

### Accesibilidad

Se preserva H1 semántico desde `PageHeader`. El microcopy no se vuelve interactivo, no depende solo de color y mantiene lectura accesible mediante `aria-label`.

### Picker preservado

No se modificó picker ni shell. Las cartas siguen siendo el elemento protagonista inmediatamente después del contexto mínimo.

### Trabajo preservado

No se tocó `/tarot/tres-cartas/trabajo`, `threeCardReadings.trabajo`, metadata, H1, posiciones ni flujo.

### Tests

- `npx vitest run src/config/seo-indexability.test.ts`: PASS, 20 tests.
- `npx vitest run src/config/three-card-readings.test.ts`: PASS, 24 tests.

### Build

`npm run build`: PASS.

### Typecheck

`npx tsc --noEmit --pretty false`: FAIL por deuda global preexistente. No hay errores nuevos en `src/pages/tarot/TarotThreeCardsPage.tsx`.

### Diff

Diff funcional SEO-05C limitado a presentación local de H1/microcopy/spacing previo al picker. Sin cambios en metadata, rutas, Trabajo, shell, lógica, resultado ni post-tirada.

### Rollback

Revertir únicamente las clases/markup local añadidos en `TarotThreeCardsPage`: `alignment="center"`, `mb-0`, render segmentado del microcopy y ajuste `mt-3 md:mt-5`.
