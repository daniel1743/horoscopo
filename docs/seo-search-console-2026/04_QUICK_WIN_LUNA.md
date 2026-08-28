# SEO-04A — Quick win Luna

Fecha: 2026-08-17  
Modo: AUDITORIA_Y_ESPECIFICACION_SIN_IMPLEMENTACION  
Estado: PASS_CON_OBSERVACIONES

## 1. Objetivo SEO-04

Analizar exclusivamente `/luna` y disenar una intervencion minima, segura y verificable para reforzarla como hub principal del cluster lunar. Esta fase no implementa cambios.

## 2. Contexto Search Console

Ruta observada: `/luna`.  
Posicion media observada: 19.4.  
Interpretacion: oportunidad de segunda pagina con bajo volumen. No hay garantia de ranking ni causalidad demostrada.

## 3. Limitaciones de los datos

Search Console tiene muestra baja. Las decisiones se basan en arquitectura, contenido visible y coherencia interna, no en promesas de posicionamiento.

## 4. Implementación actual de /luna

Archivo real: `src/routes/luna.index.tsx`. No existe `MoonHomePage` separado; `MoonHubPage` y `MoonHubDynamic` viven inline en la ruta.

| Area | Estado actual |
|---|---|
| Ruta | `createFileRoute("/luna/")` |
| Metadata | `buildMeta` con title, description y canonical `routes.moon` |
| Loader | `ensureQueryData(moonQueries.today())` y `ensureQueryData(moonQueries.upcoming())` |
| SSR | H1, description, CTAs, snapshot lunar y proximas fases dependen de QueryClient SSR |
| Componentes | `PageShell`, `PageHeader`, `MoonTodayCard`, `NextMoonPhases`, `MoonPhaseGrid`, `MoonScientificFacts`, `MoonDisclaimer` |
| Links principales | `/luna/hoy`, `/luna/calendario`, fase actual, fases proximas y fichas de fases |

## 5. Primer viewport desktop

Orden actual: `PageHeader` con H1 y CTAs, luego bloque dinamico con `MoonTodayCard` y `Proximas fases`. En desktop es probable que H1, valor principal y CTA sean visibles antes del scroll, y que la fase actual aparezca inmediatamente debajo o dentro del primer scroll corto segun altura.

No se debe empujar `MoonTodayCard` hacia abajo con un bloque editorial largo.

## 6. Primer viewport mobile

En mobile el orden es vertical: H1, description, CTAs, luego la tarjeta de Luna de hoy. El valor principal sigue temprano, pero cualquier texto nuevo insertado antes de `MoonHubDynamic` aumentaria fatiga de scroll y podria ocultar la fase actual.

Regla visual para SEO-04C: conservar H1, CTAs y comienzo de la fase actual en el primer recorrido.

## 7. Metadata

| Campo | Valor actual | Decision |
|---|---|---|
| title | `Luna hoy, calendario y fases — Creovision` | KEEP |
| description | `Fase lunar de hoy, calendario mensual y las ocho fases del ciclo, calculadas con un motor astronómico validado.` | KEEP |
| canonical | `https://www.creovision.io/luna` via `routes.moon` | KEEP |
| og:title | generado por `buildMeta` | KEEP |
| og:description | generado por `buildMeta` | KEEP |
| og:url | canonical | KEEP |
| robots | index/follow por defecto de `buildMeta` | KEEP |
| Twitter | generado por `buildMeta` | KEEP |

No se recomienda cambiar metadata en SEO-04B.

## 8. Estructura semántica

H1 actual: `La Luna, día a día`. Decision: KEEP.

H2 actuales:

- `MoonTodayCard`: fase actual, por ejemplo `Luna creciente`.
- `Proximas fases`.
- `Las ocho fases`.
- `Datos y definiciones`.

H3 actuales:

- Fases dentro de `MoonPhaseGrid`.
- Definiciones dentro de `MoonScientificFacts`.

Observacion: el H2 dinamico de fase actual es util para "luna de hoy", pero el hub puede explicar mejor, con poco texto, como usar las tres salidas principales.

## 9. SSR

`/luna` usa loader SSR con `moonQueries.today()` y `moonQueries.upcoming()`. La fase actual y proximas fases no deben pasar a fetch cliente-only. SEO-04B debe preservar `ensureQueryData`.

## 10. Intención primaria

Intencion primaria recomendada: `luna de hoy` / `fase lunar hoy`, dentro de una pagina hub.

Rol final recomendado: `HYBRID_CURRENT_STATE_PLUS_HUB`.

Razon: `/luna` ya responde rapidamente cual es la luna actual y tambien enlaza calendario/fases. Convertirla solo en articulo general debilitaria el valor de producto; convertirla solo en landing de "luna de hoy" canibalizaria `/luna/hoy`.

## 11. Intenciones secundarias

| Intencion | Rol de /luna |
|---|---|
| `luna` amplia | PRIMARIA como hub |
| `fase lunar hoy` | SECUNDARIA fuerte con snapshot actual |
| `calendario lunar` | HUB_LINK hacia `/luna/calendario` |
| `significado luna` | HUB_LINK hacia `/luna/fases` y fase actual |
| `tu luna de hoy` | HUB_LINK / CTA hacia `/luna/tu-luna-de-hoy` |

## 12. Canibalización con otras rutas Luna

| Intención | URL primaria | Rol de /luna | Riesgo de canibalización |
|---|---|---|---|
| luna / hub lunar | `/luna` | PRIMARIA | Bajo |
| luna de hoy factual | `/luna/hoy` | SECUNDARIA | Medio si duplica todo el contenido |
| fase lunar actual | `/luna` + `/luna/hoy` | SECUNDARIA | Medio; mantener resumen y enlazar detalle |
| calendario lunar | `/luna/calendario` y meses | HUB_LINK | Bajo si no duplica calendario |
| ocho fases lunares | `/luna/fases` y `/luna/fases/$slug` | HUB_LINK | Bajo si solo resume |
| lectura personalizada | `/luna/tu-luna-de-hoy` | HUB_LINK | Bajo si CTA claro sin duplicar formulario |

## 13. Gaps de contenido

Gaps reales:

- Falta una microexplicacion SSR de "que hacer desde este hub" conectando fase actual, calendario, fases y lectura personal.
- `/luna/tu-luna-de-hoy` no aparece como CTA en `/luna`, pese a ser parte del flujo deseado.
- El enlace a calendario existe, pero no queda integrado en una arquitectura corta de decisiones.
- El significado debe resolverse por enlaces a fichas, no duplicarse como articulo.

No agregar bloques para aumentar word count.

## 14. Arquitectura recomendada

Arquitectura: `HYBRID_CURRENT_STATE_PLUS_HUB`.

La pagina debe abrir con identidad editorial y CTAs, mostrar estado lunar actual, y despues ofrecer tres caminos claros: lectura personal, calendario y fases.

## 15. Orden de secciones recomendado

SECTION-01  
objetivo: mantener identidad de pagina.  
H-level: H1 actual.  
contenido: H1, description, CTAs.  
componente actual/nuevo: `PageHeader` actual.  
ubicación: inicio.  
CTA: principal recomendado `Tu Luna de Hoy`; secundarios `Luna de hoy` y `Calendario del mes`.  
link: `/luna/tu-luna-de-hoy`, `/luna/hoy`, `/luna/calendario`.  
móvil: CTAs en 1 columna o wrap sin empujar demasiado.  
desktop: CTAs en linea.  
responsable: CODEX + ANTIGRAVITY.

SECTION-02  
objetivo: responder "fase lunar hoy" rapido.  
H-level: H2 dinamico actual.  
contenido: `MoonTodayCard` con iluminacion, edad y proxima fase.  
componente actual/nuevo: existente, mantener.  
ubicación: inmediatamente despues del header.  
CTA: `Leer sobre {fase}` actual.  
link: fase actual.  
móvil: no insertar texto largo antes.  
desktop: mantener grid con proximas fases.  
responsable: NINGUNO.

SECTION-03  
objetivo: orientar al usuario sin duplicar subrutas.  
H-level: H2 nuevo recomendado: `Explora el ciclo lunar`.  
contenido: tres tarjetas/enlaces cortos: lectura personal, calendario, fases.  
componente actual/nuevo: bloque local nuevo dentro de `luna.index.tsx`.  
ubicación: despues de `MoonHubDynamic`, antes de `Las ocho fases`.  
CTA: enlaces contextuales.  
link: `/luna/tu-luna-de-hoy`, `/luna/calendario`, `/luna/fases`.  
móvil: 1 columna, cards compactas.  
desktop: 3 columnas.  
responsable: CODEX + ANTIGRAVITY.

SECTION-04  
objetivo: mantener hub de fases.  
H-level: H2 actual `Las ocho fases`.  
contenido: intro actual + `MoonPhaseGrid`.  
componente actual/nuevo: existente.  
ubicación: despues del bloque de caminos.  
CTA: cada fase.  
link: 8 fichas de fases.  
móvil: mantener grid responsive.  
desktop: 4 columnas actual.  
responsable: NINGUNO salvo spacing.

SECTION-05  
objetivo: sostener rigor y evitar pseudociencia.  
H-level: H2 actual `Datos y definiciones`.  
contenido: `MoonScientificFacts`.  
componente actual/nuevo: existente.  
ubicación: despues de fases.  
CTA: ninguno.  
link: ninguno.  
móvil: conservar legibilidad.  
desktop: mantener.  
responsable: NINGUNO.

SECTION-06  
objetivo: disclaimer editorial.  
H-level: aside.  
contenido: `MoonDisclaimer`.  
componente actual/nuevo: existente.  
ubicación: final.  
CTA: ninguno.  
link: ninguno.  
móvil: conservar.  
desktop: conservar.  
responsable: NINGUNO.

## 16. CTA principal

CTA principal recomendado: `Conocer Tu Luna de Hoy` hacia `/luna/tu-luna-de-hoy`.

Razon: despues de conocer el estado lunar actual, la accion de mayor valor de producto es conectar esa informacion con una lectura personalizada. No duplica calendario ni fases.

## 17. CTA secundarios

Maximo 2:

- `Ver Luna de hoy` hacia `/luna/hoy`.
- `Ver calendario lunar` hacia `/luna/calendario`.

No agregar mas CTAs en el header.

## 18. Enlazado interno

| Anchor propuesto | Ubicacion | Motivo | Ya existe | Requiere Codex | Requiere Antigravity |
|---|---|---|---|---|---|
| `Conocer Tu Luna de Hoy` | Header o bloque de caminos | CTA principal de producto | No en `/luna` | Si | Si |
| `Ver Luna de hoy` | Header secundario | Delegar detalle factual | Si como `Luna de hoy` | Ajuste menor | Si si cambia orden |
| `Ver calendario lunar` | Header secundario o bloque de caminos | Delegar fechas/proximas fases | Si | Ajuste menor | Si |
| `Explorar las fases lunares` | Bloque de caminos | Delegar significado evergreen | Parcial via grid | Si | Si |
| `Leer sobre {fase actual}` | `MoonTodayCard` | Fase actual correspondiente | Si | No | No |

No disenar mas de 4 enlaces destacados nuevos/reordenados.

## 19. Componentes compartidos

| Componente | Compartido con | Riesgo | Puede tocar SEO-04 |
|---|---|---|---|
| `PageShell` | paginas internas protegidas y lunares | Alto | NO |
| `PageHeader` | `/horoscopo`, tarot, paginas internas | Alto | NO |
| `MoonTodayCard` | `/`, `/luna`, `/luna/hoy` | Alto | SOLO_VARIANTE_LOCAL si fuera imprescindible |
| `NextMoonPhases` | `/luna`, `/luna/hoy` | Medio | NO |
| `MoonPhaseGrid` | `/luna`, `/luna/fases` | Medio | NO |
| `MoonScientificFacts` | `/luna`, `/luna/hoy`, fases | Medio | NO |
| `MoonDisclaimer` | lunares | Bajo | NO |
| `Button` | global | Alto | NO |

Decision: cambios preferidos dentro de `src/routes/luna.index.tsx` con bloque local nuevo o props locales, no cambios globales.

## 20. Riesgos HARD/SOFT freeze

HARD: no tocar `/`, `/horoscopo`, `/tarot/carta-del-dia`, `/tarot/tres-cartas/trabajo`, `buildMeta`, `siteConfig.url`, rutas ni canonicales.

SOFT: `PageHeader`, `PageShell`, componentes lunares reutilizados, breadcrumbs y JSON-LD. SEO-04 no debe activar breadcrumbs globales ni JSON-LD.

## 21. Metadata decision

metadata_title: KEEP.  
metadata_description: KEEP.  
h1: KEEP.

Argumento: title, description y H1 ya representan la combinacion "luna hoy + calendario + fases". Cambiarlos en SEO-04A seria riesgo alto sin evidencia suficiente.

## 22. CHANGE-04B para Codex

### CHANGE-04B-01 — CTA principal hacia Tu Luna de Hoy

OBJETIVO: convertir `/luna/tu-luna-de-hoy` en CTA principal de `/luna` sin cambiar metadata ni H1.  
ARCHIVO: `src/routes/luna.index.tsx`  
SIMBOLO: `PageHeader actions` en `MoonHubPage`.  
ESTADO ACTUAL: CTAs: `Luna de hoy` primary y `Calendario del mes` outline.  
CAMBIO EXACTO: agregar o reordenar CTAs para que el primary sea `Conocer Tu Luna de Hoy` con `Link to={routes.moonPersonalToday}`. Mantener como secundarios maximo `Luna de hoy` y `Calendario del mes`.  
CONTENIDO/PROPS: usar `Button asChild variant="primary"` para el CTA principal; secundarios con variantes existentes.  
NO CAMBIAR: title, description, canonical, H1, loader, `MoonHubDynamic`, `MoonTodayCard`, `PageHeader` global.  
TEST: verificar render/link por prueba focal o snapshot si existe; ejecutar `npx vitest run src/config/seo-indexability.test.ts`.  
RESULTADO ESPERADO: `/luna` enlaza claramente a `/luna/tu-luna-de-hoy` sin perder enlaces a `/luna/hoy` y calendario.  
RIESGO: bajo/medio por cambio de prioridad visual.  
ROLLBACK: restaurar acciones actuales.

### CHANGE-04B-02 — Bloque local "Explora el ciclo lunar"

OBJETIVO: explicar en tres rutas el rol de hub de `/luna` sin duplicar subrutas.  
ARCHIVO: `src/routes/luna.index.tsx`  
SIMBOLO: nuevo componente local `MoonHubPathways` o bloque JSX local.  
ESTADO ACTUAL: despues de `MoonHubDynamic` salta a `Las ocho fases`; no hay bloque corto que conecte herramienta personal, calendario y fases.  
CAMBIO EXACTO: insertar despues de `MoonHubDynamic` y antes de `Las ocho fases` una section con H2 `Explora el ciclo lunar`, texto breve y tres enlaces/cards:
1. `Tu Luna de Hoy` -> `routes.moonPersonalToday`
2. `Calendario lunar` -> `routes.moonCalendar`
3. `Fases lunares` -> `routes.moonPhases`
CONTENIDO/PROPS: copy exacto recomendado:
`Usa la fase actual como punto de partida: puedes leerla en clave personal, revisar las fechas del mes o explorar el significado de cada fase.`
NO CAMBIAR: `MoonPhaseGrid`, `MoonScientificFacts`, componentes compartidos.  
TEST: link existence si hay utilidad de render; minimo `npx vitest run src/config/seo-indexability.test.ts`.  
RESULTADO ESPERADO: el hub declara caminos internos sin word count artificial.  
RIESGO: medio por impacto visual/mobile.  
ROLLBACK: quitar section local.

### CHANGE-04B-03 — Test focal de sitemap/head sin regresion

OBJETIVO: mantener identidad tecnica de `/luna`.  
ARCHIVO: `src/config/seo-indexability.test.ts`.  
SIMBOLO: suite SEO existente.  
ESTADO ACTUAL: cubre canonicales, sitemap y rutas lunares parciales.  
CAMBIO EXACTO: agregar asercion de que `routes.moon`, `routes.moonPersonalToday`, `routes.moonCalendar`, `routes.moonPhases` permanecen en sitemap y que `buildMeta({ canonical: routes.moon })` produce canonical/`og:url` de `/luna`.  
CONTENIDO/PROPS: no aplica.  
NO CAMBIAR: tests no relacionados.  
TEST: `npx vitest run src/config/seo-indexability.test.ts`.  
RESULTADO ESPERADO: PASS.  
RIESGO: bajo.  
ROLLBACK: quitar tests agregados.

## 23. Especificación SEO-04C para Antigravity

Ordenes atomicas:

1. Archivo: `src/routes/luna.index.tsx`. Componente: `MoonHubPage`. Bloque: `PageHeader actions`. Posicion: inicio de `/luna`. Anadir CTA principal `Conocer Tu Luna de Hoy`. Conservar H1 `La Luna, día a día`, description, eyebrow, y enlaces a `Luna de hoy` y `Calendario del mes`. No mover `MoonHubDynamic` debajo de contenido largo. Mobile: CTAs deben envolver sin overflow. Desktop: CTAs en fila con gap actual.

2. Archivo: `src/routes/luna.index.tsx`. Componente/bloque: nueva section local `MoonHubPathways`. Posicion exacta: despues de `SectionErrorBoundary/Suspense` que renderiza `MoonHubDynamic` y antes de `section aria-labelledby="moon-phases-heading"`. Anadir H2 `Explora el ciclo lunar`, un parrafo corto y tres items. Conservar `Las ocho fases` donde esta, solo desplazarla despues de este bloque. No eliminar `MoonTodayCard`, `NextMoonPhases`, `MoonPhaseGrid`, `MoonScientificFacts` ni `MoonDisclaimer`.

3. Visual: usar tokens existentes (`Card`, `Button`, `text-ink`, `text-ink-soft`, `bg-parchment`, `text-cosmic`, radios actuales). No introducir nuevo sistema visual, no hero nuevo, no gradientes decorativos, no imagenes nuevas.

4. Responsive esperado: mobile 1 columna, desktop 3 columnas. Spacing sugerido: `mt-10 md:mt-12`; grid `gap-4 md:grid-cols-3`. El bloque no debe hacer que el usuario pierda la fase actual antes de verla.

Estado final esperado: `/luna` conserva utilidad inmediata y gana un bloque claro de navegacion hub.

## 24. Tests

Ejecutado en SEO-04A:

```powershell
npx vitest run src/config/seo-indexability.test.ts
```

Resultado: PASS, 16 tests.

Tests recomendados para SEO-04B:

- `/luna` mantiene canonical `https://www.creovision.io/luna`.
- sitemap contiene `/luna`, `/luna/tu-luna-de-hoy`, `/luna/calendario`, `/luna/fases`.
- H1 unico `La Luna, día a día`.
- Links nuevos existen y apuntan a rutas del registro.
- Mobile no oculta la fase actual detras de un bloque editorial largo.
- Páginas protegidas `/` y `/horoscopo` sin cambios.

## 25. Medición 7/14/28

Registrar fecha de deploy de SEO-04B/04C y medir:

- Dia 0: baseline de impresiones, clicks, CTR, posicion media y queries de `/luna`.
- Dia 7: observar tendencia sin atribuir causalidad.
- Dia 14: comparar queries `luna`, `luna de hoy`, `fase lunar hoy`, `calendario lunar`.
- Dia 28: decidir mantener, ajustar o revertir.

Separar mobile y desktop si Search Console entrega datos suficientes.

## 26. Rollback

Rollback de SEO-04B/04C:

1. Restaurar CTAs actuales de `PageHeader` en `/luna`.
2. Eliminar el bloque local `MoonHubPathways`.
3. Mantener metadata/canonical/H1 intactos.
4. Reejecutar `npx vitest run src/config/seo-indexability.test.ts`.
5. No tocar componentes compartidos ni paginas protegidas.

## 27. Estado SEO-04A

PASS_CON_OBSERVACIONES.

Decisiones finales:

```yaml
page_role: HYBRID_CURRENT_STATE_PLUS_HUB
primary_intent: "luna de hoy / fase lunar hoy dentro de hub lunar"
primary_cta: "Conocer Tu Luna de Hoy"
metadata_title: KEEP
metadata_description: KEEP
h1: KEEP
structural_change: MINOR
new_content: MINIMAL
shared_components: LOCAL_VARIANT_ONLY
```

No se modifico codigo funcional. SEO-04B y SEO-04C quedan pendientes.

## Implementación SEO-04B — 2026-08-17

Estado: PASS_CON_OBSERVACIONES

### Archivos modificados

| Archivo | Símbolos modificados | Líneas aproximadas | CHANGE |
|---|---|---:|---|
| `src/routes/luna.index.tsx` | `PageHeader actions`, `MoonHubPathways`, `moonHubPathways` | 47-58, 68, 90-150 | CHANGE-04B-01, CHANGE-04B-02 |
| `src/config/seo-indexability.test.ts` | suite `SEO indexability and canonical consistency` | 40-48, 148-159 | CHANGE-04B-03 |
| `docs/seo-search-console-2026/04_QUICK_WIN_LUNA.md` | seccion implementacion | final | Documentacion |
| `docs/seo-search-console-2026/README.md` | estado fase/historial | tabla, hallazgos, historial | Documentacion |

### CHANGE-04B-01 — CTA principal hacia Tu Luna de Hoy

Antes: el CTA primario de `/luna` era `Luna de hoy` hacia `routes.moonToday`; `Calendario del mes` era secundario.  
Despues: el CTA primario es `Conocer Tu Luna de Hoy` hacia `routes.moonPersonalToday`; `Luna de hoy` y `Calendario del mes` quedan como secundarios.

Preservado: title, description, canonical, H1, loader, `MoonHubDynamic`, `MoonTodayCard`, `PageHeader` global y `PageShell` global.

### CHANGE-04B-02 — Bloque local Explora el ciclo lunar

Antes: despues del bloque dinamico de estado lunar/proximas fases, `/luna` saltaba directo a `Las ocho fases`.  
Despues: se inserto una section local `MoonHubPathways` despues de `MoonHubDynamic` y antes de `Las ocho fases`.

Contenido implementado:

- H2: `Explora el ciclo lunar`.
- Copy breve: `Usa la fase actual como punto de partida: puedes leerla en clave personal, revisar las fechas del mes o explorar el significado de cada fase.`
- Links: `Tu Luna de Hoy` hacia `routes.moonPersonalToday`, `Calendario lunar` hacia `routes.moonCalendar`, `Fases lunares` hacia `routes.moonPhases`.

No se duplico contenido de `/luna/fases`, `/luna/calendario` ni `/luna/tu-luna-de-hoy`. No se creo ruta nueva.

### CHANGE-04B-03 — Tests focales

Se agregaron dos aserciones focales en `src/config/seo-indexability.test.ts`:

- sitemap conserva `/luna`, `/luna/tu-luna-de-hoy`, `/luna/hoy`, `/luna/calendario` y `/luna/fases`;
- `buildMeta` para `/luna` conserva canonical `https://www.creovision.io/luna`, `og:url` igual e indexabilidad.

### Tests

| Comando | Resultado | Observaciones |
|---|---|---|
| `npx vitest run src/config/seo-indexability.test.ts` | PASS | 18 tests passed. Persisten warnings conocidos de `vite-tsconfig-paths` y test dentro de `src/routes/api/tarot`. |

### Build

| Comando | Resultado | Observaciones |
|---|---|---|
| `npm run build` | PASS | Build Vite/Nitro completo. Persisten warnings conocidos de chunks grandes y `createServerFn().inputValidator()` deprecated. |

### Typecheck

| Comando | Resultado | Observaciones |
|---|---|---|
| `npx tsc --noEmit` | FAIL_PREEXISTENTE | Sigue rojo por deuda global. No aparecieron errores nuevos en `src/routes/luna.index.tsx`; `src/config/seo-indexability.test.ts` mantiene el diagnostico conocido de tipos de `vitest`. |

### Regresiones

Home y Horoscopo no fueron modificados. La regresion indirecta queda cubierta por `npm run build` y por la suite SEO focal que sigue validando canonicales de `/` y `/horoscopo`.

Validacion HTTP local: `vite preview` levanto en `127.0.0.1:4174`, pero respondio 500 tambien para `/`, `/horoscopo` y `/luna` por buscar `dist/server/server.js` mientras el build Nitro genero `.vercel/output`. Se clasifico como limitacion de preview/configuracion, no como regresion SEO-04B.

### Diff

Diff SEO-04B revisado:

- `src/routes/luna.index.tsx`: cambio de prioridad de CTAs, alta de imports `Card`/`Icon`, eliminacion de import inutil `Container`, insercion local de `MoonHubPathways`.
- `src/config/seo-indexability.test.ts`: dos tests focales nuevos para hub lunar y canonical/indexabilidad.
- Markdown: documentacion de implementacion y estado.

El `git diff --stat` global incluye cambios de fases previas/preexistentes en el worktree; SEO-04B solo agrega las lineas descritas arriba.

### Riesgos

- El bloque nuevo cambia prioridad visual secundaria, aunque queda despues del estado lunar dinamico.
- SEO-04C debe revisar refinamiento visual mobile/desktop sin redisenar la pagina.
- El typecheck global sigue fallando por deuda preexistente.
- `vite preview` local no sirve como validacion SSR en este repo mientras apunte a `dist/server/server.js`.

### Rollback

Para revertir solo SEO-04B:

1. En `src/routes/luna.index.tsx`, restaurar el CTA primario `Luna de hoy` y dejar `Calendario del mes` como unico secundario.
2. Eliminar `MoonHubPathways`, `moonHubPathways` y los imports `Card`/`Icon` si quedan sin uso.
3. Quitar los dos tests agregados en `src/config/seo-indexability.test.ts`.
4. Reejecutar `npx vitest run src/config/seo-indexability.test.ts`.

### Estado final SEO-04B

PASS_CON_OBSERVACIONES. Se implemento el CTA principal, el bloque local de navegacion lunar y la cobertura focal. No se modificaron metadata, description, canonical, H1, loader, calculos astronomicos, sitemap, robots, JSON-LD, breadcrumbs, componentes globales, Home ni Horoscopo. SEO-04C queda pendiente y no fue iniciado.

## Refinamiento visual SEO-04C — 2026-08-17

Estado: PASS_CON_OBSERVACIONES

### Archivo tocado

| Archivo | Bloques tocados | Lineas aproximadas |
|---|---|---:|
| `src/routes/luna.index.tsx` | `PageHeader actions`, `moonHubPathways`, `MoonHubPathways` | 47-60, 93-168 |
| `docs/seo-search-console-2026/04_QUICK_WIN_LUNA.md` | seccion SEO-04C | final |
| `docs/seo-search-console-2026/README.md` | estado fase/historial | tabla, hallazgos, historial |

### Clases y estructura modificadas

- CTA principal: conserva label `Conocer Tu Luna de Hoy` y destino `routes.moonPersonalToday`; ahora usa `size="lg"`, icono `sparkles` y gap interno para distinguirlo como accion principal sin hacerlo gigante.
- `MoonHubPathways`: conserva heading exacto `Explora el ciclo lunar`, posicion despues del bloque dinamico y antes de `Las ocho fases`.
- Bloque local: se agrupo en contenedor discreto con `border border-ink/10`, `bg-ivory/60`, padding compacto y radio existente.
- Cards: se mantuvieron 3 caminos, con fondo discreto, `shadow-none`, hover suave, icono pequeno y texto breve.
- Focus: links de cards tienen `focus-visible:ring-2 focus-visible:ring-cosmic focus-visible:ring-offset-2`.

### Mobile

El CTA usa wrap del contenedor aprobado y el bloque mantiene una columna por defecto. El spacing se mantiene compacto (`mt-10`, `p-5`, `gap-3`) para no introducir fatiga de scroll ni mover el bloque dinamico hacia abajo.

### Desktop

`MoonHubPathways` conserva tres columnas desde `md:grid-cols-3`, con cards equilibradas, sin aspecto de dashboard ni sombras pesadas. El CTA no ocupa ancho innecesario y queda alineado con el header existente.

### Accesibilidad

Los tres caminos son `Link` semanticos, la card completa es navegable, el focus visible no depende solo de color y los textos esenciales no quedan ocultos en hover.

### Elementos preservados

No se modificaron:

- title, description, canonical, OG ni robots;
- H1 `La Luna, día a día`;
- loader ni `ensureQueryData(moonQueries.today())` / `ensureQueryData(moonQueries.upcoming())`;
- logica astronomica;
- rutas, sitemap, robots.txt, JSON-LD o breadcrumbs;
- `PageShell`, `PageHeader`, `MoonTodayCard`, `MoonPhaseGrid`, navegacion global, footer, Home u Horoscopo.

### Tests

| Comando | Resultado | Observaciones |
|---|---|---|
| `npx vitest run src/config/seo-indexability.test.ts` | PASS | 18 tests passed. Persisten warnings conocidos de `vite-tsconfig-paths` y test dentro de `src/routes/api/tarot`. |

### Build

| Comando | Resultado | Observaciones |
|---|---|---|
| `npm run build` | PASS | Build Vite/Nitro completo. Persisten warnings conocidos de chunks grandes y `createServerFn().inputValidator()` deprecated. |

### Typecheck

| Comando | Resultado | Observaciones |
|---|---|---|
| `npx tsc --noEmit` | FAIL_PREEXISTENTE | Sigue rojo por deuda global. No aparecieron errores nuevos en `src/routes/luna.index.tsx`. |

### Diff

Diff funcional revisado: corresponde a presentacion del CTA existente y refinamiento local de `MoonHubPathways`. No aparecen cambios de metadata, loader, queries, routing, logica lunar o secciones ajenas.

Nota: el `git diff --stat` global incluye cambios preexistentes y de SEO-01/02/04B ya presentes en el worktree. SEO-04C solo agrego refinamiento visual local en `src/routes/luna.index.tsx` y documentacion.

### Riesgos

- La validacion visual se hizo por revision de markup/clases y build, no por screenshot, porque `vite preview` ya quedo documentado en SEO-04B como no usable localmente: busca `dist/server/server.js` aunque el build Nitro genera `.vercel/output`.
- SEO-05 no debe iniciarse hasta autorizacion explicita.

### Rollback

Para revertir solo SEO-04C sin tocar SEO-04B:

1. Quitar icono y `size="lg"` del CTA principal si se desea volver al aspecto previo.
2. Restaurar clases simples de `MoonHubPathways`: section sin contenedor `bg-ivory/60`, `ul` con `mt-6 grid gap-4 md:grid-cols-3`, cards con `p-5` y hover basico.
3. Mantener el CTA principal, bloque `MoonHubPathways` y tests de SEO-04B.
4. Reejecutar `npx vitest run src/config/seo-indexability.test.ts` y `npm run build`.

### Estado final SEO-04C

PASS_CON_OBSERVACIONES. Se refino visualmente solo el CTA `Conocer Tu Luna de Hoy` y el bloque local `Explora el ciclo lunar`. SEO-04 queda completado. No se inicio SEO-05.
