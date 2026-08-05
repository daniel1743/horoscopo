# Auditoria de Superficie Publica - Creovision

Fecha: 2026-08-04

## Objetivo

Reducir el producto publico a funciones realmente utilizables, manteniendo el codigo interno para modulos futuros pero evitando que aparezcan en navegacion, home, footer, busqueda, sitemap o SEO publico.

## Superficie publica habilitada

- Home: `/`
- Tarot: `/tarot`
- Carta del dia: `/tarot/carta-del-dia`
- Si o no: `/tarot/si-o-no`
- Tres cartas general: `/tarot/tres-cartas`
- Tirada de Amor: `/tarot/tres-cartas/amor`
- Biblioteca de tarot: `/tarot/cartas`
- Detalle de carta: `/tarot/cartas/:card`
- Luna: `/luna`
- Luna de hoy: `/luna/hoy`
- Calendario lunar: `/luna/calendario`
- Fases lunares: `/luna/fases`
- Guias: `/guias`
- Busqueda: `/buscar`
- Legales: privacidad, terminos, cookies y aviso de responsabilidad

## Superficie retirada del producto publico

- Horoscopo y rutas de periodo/signo.
- Astrologia y subrutas incompletas.
- Compatibilidad y detalle de parejas.
- Mi espacio/cuenta en enlaces publicos.
- Asistente en enlaces publicos.
- Paginas informativas placeholder: nosotros, ayuda y contacto.
- Tarot del Trabajo y Tarot de Decisiones en home.
- Ruta inexistente `/tarot/tiradas`.

## Cambios aplicados

- Se creo `src/config/public-features.ts` como fuente central para decidir que funciones estan `enabled`, `coming_soon` u `hidden`.
- La navegacion principal, drawer movil, bottom nav y footer filtran rutas ocultas desde esa configuracion.
- La home dejo de vender horoscopo, astrologia y compatibilidad como producto activo; ahora comunica tarot, luna y guias.
- Las tarjetas destacadas de tiradas filtran elementos ocultos y el CTA general apunta a `/tarot`, no a `/tarot/tiradas`.
- El sitemap se limita a rutas publicas habilitadas y agrega la Tirada de Amor.
- La busqueda oculta filtros no publicados y filtra resultados/sugerencias dinamicas de horoscopo, astrologia y compatibilidad.
- Las rutas ocultas principales lanzan `notFound()` para responder 404.
- El SEO global y el SEO de home se alinearon con tarot, luna y guias.

## Evidencia de datos/runtime usada

- `tarot_cards` publicado: 78 cartas detectadas.
- `editorial_articles` publicado: al menos 1 guia detectada.
- `horoscopes` publicado: 0 registros detectados.
- `compatibility_profiles` publicado: 3 registros detectados, insuficiente para exponer el modulo como producto completo.
- `moon_content`: no existe; el modulo lunar usa otra fuente implementada en codigo.

## Validacion ejecutada

- `npx vitest run src/config/public-features.test.ts`: OK, 3 tests.
- `npx eslint` acotado a archivos modificados de superficie publica: OK.
- `npm run build`: OK.
- Smoke local parcial:
  - Rutas habilitadas de Tarot, Luna y Guias: 200.
  - Rutas ocultas `/horoscopo`, `/astrologia`, `/compatibilidad`, `/asistente`, `/nosotros`, `/ayuda`, `/contacto`: 404.
  - `/` devolvio `ERR` en el barrido automatico local; el build de produccion compilo la home correctamente. Conviene revisar con navegador si se quiere validar hidratacion visual exacta.

## Warnings no bloqueantes observados

- `vite-tsconfig-paths` ahora puede sustituirse por `resolve.tsconfigPaths`.
- `src/routes/api/tarot/interpret-reading.test.ts` no exporta `Route`; TanStack avisa que no lo incluye en el route tree.
- Varias funciones siguen usando `createServerFn().inputValidator()`, API marcada como deprecated por TanStack.

## Veredicto

APROBADO - SUPERFICIE PUBLICA REDUCIDA A FUNCIONES UTILIZABLES, SIN GIT, PUSH NI DEPLOY.
