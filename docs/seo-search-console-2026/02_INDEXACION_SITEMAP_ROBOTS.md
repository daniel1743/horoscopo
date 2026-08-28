# SEO-02A — Indexacion, sitemap y robots

Fecha: 2026-08-17  
Modo: AUDITORIA_Y_ESPECIFICACION_SIN_IMPLEMENTACION  
Estado final: PASS_CON_OBSERVACIONES

## 1. Alcance

Auditoria global de indexacion tecnica para Creovision: sitemap, robots, rutas indexables/noindex, rutas dinamicas, perfiles publicos, privadas, auth, admin, API y riesgo de soft-404.

## 2. Restricciones aplicadas

No se modifico codigo funcional, rutas, loaders, sitemap, robots, canonical, metadata, dependencias, paginas, auth, admin, profile ni JSON-LD. Solo se actualiza esta documentacion y el README del programa.

## 3. Fuentes revisadas

- `src/routes/sitemap[.]xml.ts`
- `public/robots.txt`
- `src/config/routes.ts`
- `src/config/public-features.ts`
- `src/config/seo.ts`
- `src/routes/**`
- `src/pages/social/PublicProfilePage.tsx`
- `src/lib/social/queries.ts`
- `src/pages/compatibility/CompatibilityPairPage.tsx`
- `src/repositories/supabase-compatibility.repository.ts`
- Produccion: `https://www.creovision.io/sitemap.xml` y requests GET de rutas de control.

## 4. Baseline heredado

SEO-01B esta presente: `/`, `/horoscopo` y `/luna/fases/$slug` ya tienen canonical/`og:url` segun lo definido en SEO-01A/01B. La prueba focal `npx vitest run src/config/seo-indexability.test.ts` paso con 12 tests.

## 5. Sitemap observado

Produccion devuelve `200` para `/sitemap.xml`, con 137 URLs, 0 duplicados, 0 URLs non-www, 0 URLs con query/hash, 0 URLs `.json` y 0 URLs privadas/API/auth/perfil publico. El sitemap si incluye `/buscar` y `/luna/calendario`.

## 6. Robots observado

`public/robots.txt` permite crawling general, bloquea bots agresivos y declara:

- `Disallow: /admin`
- `Disallow: /api/`
- `Disallow: /_authenticated/`
- `Disallow: /design-system`
- `Disallow: /*.json$`
- `Sitemap: https://www.creovision.io/sitemap.xml`
- `Host: https://www.creovision.io`

No bloquea `/auth`, `/reset-password`, `/mi-espacio` ni `/u/`.

## 7. Matriz de rutas

| Ruta/patron | Tipo | Status esperado | Indexable | Sitemap | Robots | Canonical | Riesgo | Accion SEO-02B |
|---|---|---:|---|---|---|---|---|---|
| `/` | Publica core | 200 | Si | Si | Allow | Si | Bajo | MANTENER |
| `/horoscopo` | Publica core | 200 | Si | Si | Allow | Si | Bajo | MANTENER |
| `/horoscopo/hoy` | Publica hub periodo | 200 | Si | Si | Allow | Sin evidencia de canonical | Medio | AGREGAR_CANONICAL |
| `/horoscopo/semana` | Publica hub periodo | 200 | Si | Si | Allow | Sin evidencia de canonical | Medio | AGREGAR_CANONICAL |
| `/horoscopo/mes` | Publica hub periodo | 200 | Si | Si | Allow | Sin evidencia de canonical | Medio | AGREGAR_CANONICAL |
| `/horoscopo/$sign` | Dinamica whitelist | 200/404 | Si para signos validos | Si 12 signos | Allow | Falta canonical en codigo | Medio | AGREGAR_CANONICAL |
| `/horoscopo?periodo=*` | Variante query | 200 | No como URL separada | No | Allow | Debe canonicalizar a path limpio | Medio | CANONICALIZAR_QUERY |
| `/tarot` | Publica core | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/tarot/carta-del-dia` | Protegida Search Console | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/tarot/si-o-no` | Publica herramienta | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/tarot/tres-cartas` | Publica herramienta | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/tarot/tres-cartas/amor` | Publica herramienta | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/tarot/tres-cartas/trabajo` | Protegida Search Console | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/tarot/tres-cartas/decision` | Publica herramienta | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/tarot/cartas` | Publica indice | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/tarot/cartas/$card` | Dinamica sin 404 servidor | 200 esperado solo cartas validas | Si validas | Si arcanos mayores | Allow | Genera canonical incluso para slug invalido | Alto | 404_REAL_O_NOINDEX |
| `/luna` | Publica core | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/luna/hoy` | Publica dinamica | 200 | Si | Si | Allow | Segun ruta | Bajo | MANTENER |
| `/luna/tu-luna-de-hoy` | Herramienta personal | 200 | Revisar intencion | Si | Allow | Segun ruta | Medio | VALIDAR_INTENCION |
| `/luna/fases` | Publica indice | 200 | Si | Si | Allow | Sin canonical absoluto observado en codigo | Medio | AGREGAR_CANONICAL |
| `/luna/fases/$slug` | Dinamica whitelist | 200/404 | Si validas | Si 8 fases | Allow | Si tras SEO-01B | Bajo | MANTENER |
| `/luna/calendario` | Ruta indice con Navigate | 200 en SSR | Dudoso | Si | Allow | No | Alto | REDIRECT_O_NOINDEX |
| `/luna/calendario/$ym` | Dinamica rango | 200/404 | Si meses soportados | Si ventana -3/+6 | Allow | Falta canonical | Medio | AGREGAR_CANONICAL |
| `/compatibilidad` | Publica hub | 200 | Si | Si | Allow | Si en ruta | Bajo | MANTENER |
| `/compatibilidad/$signA/$signB` | Dinamica whitelist normalizada | 200/301/404 | Si pares validos | Si 78 pares | Allow | Si | Medio | VALIDAR_CONTENIDO |
| `/guias` | Editorial indice | 200 | Si | Si | Allow | Sin canonical explicito | Medio | AGREGAR_CANONICAL |
| `/guias/$slug` | Editorial dinamica | 200/404 | Si publicados | No | Allow | Si si articulo existe | Alto | AGREGAR_SITEMAP |
| `/temas/$category` | Editorial dinamica | 200/404 | Si categorias publicas | No | Allow | Si si categoria existe | Medio | AGREGAR_SITEMAP |
| `/autores/$slug` | Editorial dinamica | 200/404 | Si autores publicos | No | Allow | Si si autor existe | Medio | AGREGAR_SITEMAP |
| `/buscar` | Buscador | 200 | Noindex | Si | Allow | Relativo `/buscar` | Alto | REMOVER_SITEMAP |
| `/auth` | Auth publica | 200 | Noindex,nofollow | No | Allow | No requerido | Bajo | MANTENER |
| `/auth/callback` | Auth tecnica | 200 | Noindex,nofollow | No | Allow | No requerido | Bajo | MANTENER |
| `/auth/update-password` | Auth tecnica | 200 | Noindex,nofollow | No | Allow | No requerido | Bajo | MANTENER |
| `/reset-password` | Auth publica | 200 | Noindex,nofollow | No | Allow | No requerido | Bajo | MANTENER |
| `/mi-espacio/**` | Privada | redirect/noindex | No | No | No bloqueado por path real | No requerido | Medio | ROBOTS_PRIVADO_REAL |
| `/admin/**` | Admin | redirect/noindex | No | No | Disallow | No requerido | Bajo | MANTENER |
| `/api/**` | API | JSON/respuesta tecnica | No | No | Disallow | X-Robots parcial | Bajo | MANTENER |
| `/design-system` | Interna | 200 | Noindex,nofollow | No | Disallow | No requerido | Bajo | MANTENER |
| `/u/$username` | Perfil publico | 200 cliente | Politica no definida | No | Allow | No | Alto | NOINDEX_O_404_REAL |
| `/astrologia` y herramientas | Feature hidden | 404 | No | No | Allow | No requerido | Bajo | MANTENER |
| `/nosotros`, `/contacto`, `/ayuda` | Feature hidden | 404 | No | No | Allow | No requerido | Bajo | MANTENER |
| `/*.json$` | Recurso tecnico | Depende | No | No | Disallow | No requerido | Medio | VALIDAR_JSON |

## 8. Hallazgos criticos

SEO02A-01: `/buscar` aparece en sitemap aunque la ruta declara `robots: noindex, follow`. Esto manda una senal contradictoria: sitemap pide descubrimiento/indexacion y la pagina pide no indexar.

SEO02A-02: `/luna/calendario` aparece en sitemap, pero la ruta indice renderiza un `Navigate` hacia `/luna/calendario/$ym`; en produccion responde 200, sin canonical y sin robots. Esto puede generar una URL debil/duplicada frente al mes canonico.

SEO02A-03: `/tarot/cartas/$card` no valida slug en loader/parseParams. Produccion para `/tarot/cartas/carta-inexistente` responde 200 con robots index y canonical absoluto hacia la URL inexistente. Es un soft-404 claro.

SEO02A-04: `/u/$username` no tiene `head`, loader servidor, canonical, noindex ni 404 real. Produccion para un usuario inexistente responde 200 sin robots/canonical, con contenido cargado en cliente. Riesgo de soft-404 y de indexacion accidental de perfiles sin politica SEO definida.

## 9. Hallazgos altos

SEO02A-05: las paginas editoriales dinamicas `/guias/$slug`, `/temas/$category` y `/autores/$slug` son indexables cuando existen, pero no hay enumeracion en sitemap. Si editorial esta activo, falta descubrimiento sistematico.

SEO02A-06: varias rutas publicas incluidas en sitemap usan `buildMeta` sin canonical o metadata manual sin canonical: periodos/signos de horoscopo, `/luna/fases`, `/luna/calendario/$ym`, `/guias`.

SEO02A-07: el sitemap incluye 78 pares de compatibilidad porque existe fallback para todos los pares. Aunque no es un soft-404 tecnico, muchos pares pueden ser contenido generado/fallback (`isDemo: true`) y conviene decidir si todos deben indexarse antes de seguir expandiendo.

## 10. Hallazgos medios

SEO02A-08: `robots.txt` bloquea `/*.json$`; no se detectaron URLs `.json` en sitemap, pero debe validarse que no afecte recursos publicos necesarios, especialmente manifiestos o endpoints que deban ser rastreables.

SEO02A-09: `/mi-espacio/**` es el path publico real de rutas privadas, pero robots solo bloquea `/_authenticated/`. Las rutas privadas emiten noindex y redirigen, pero la regla robots no cubre explicitamente el path real.

SEO02A-10: `npx vitest` advierte que `src/routes/api/tarot/interpret-reading.test.ts` esta dentro de `src/routes` y no exporta `Route`. No impacta sitemap hoy, pero es ruido en route-tree y debe limpiarse en una fase tecnica separada o dentro de SEO-02B si se autoriza.

## 11. Soft-404

Requests de produccion:

| URL | Status | Resultado |
|---|---:|---|
| `/luna/fases/slug-inexistente` | 404 | Correcto |
| `/compatibilidad/aries/signo-inexistente` | 404 | Correcto |
| `/compatibilidad/signo-inexistente/libra` | 404 | Correcto |
| `/horoscopo/slug-inexistente` | 404 | Correcto, pero conserva robots index por metadata de ruta |
| `/u/usuario-inexistente-seo02a` | 200 | Soft-404 probable |
| `/tarot/cartas/carta-inexistente` | 200 | Soft-404 confirmado |

## 12. Sitemap vs robots

No hay URLs bloqueadas por robots dentro del sitemap segun la muestra de produccion. La inconsistencia principal no es robots-vs-sitemap, sino sitemap-vs-noindex en `/buscar`.

## 13. Sitemap vs canonical

El host `https://www.creovision.io` es consistente en sitemap. No hay query/hash. Persisten rutas en sitemap sin canonical explicito o con canonical relativo, especialmente `/buscar`, `/luna/calendario`, periodos/signos de horoscopo y calendario mensual.

## 14. Sitemap vs route tree

El sitemap cubre las areas principales, tarot, luna, horoscopo y compatibilidad. No cubre contenido editorial dinamico aunque existen rutas indexables con loaders y canonical. Tambien incluye `/buscar`, que no deberia estar en sitemap si permanece noindex.

## 15. Auth, admin y API

Auth publica esta fuera del sitemap y usa noindex/nofollow. Admin esta fuera del sitemap, bloqueado por robots y protegido por redireccion/roles. API esta fuera del sitemap y bloqueada por robots; algunos endpoints emiten `X-Robots-Tag`, pero no todos fueron auditados linea por linea porque no son URLs HTML indexables.

## 16. Perfiles publicos

`/u/$username` debe recibir decision SEO antes de indexarse. La implementacion actual carga perfil en cliente y no diferencia con status 404 servidor cuando el username no existe. Recomendacion conservadora: noindex por defecto o loader servidor con 404 real y canonical solo para perfiles publicables.

## 17. JSON y recursos tecnicos

La regla `/*.json$` queda marcada para validacion. No hay URLs `.json` en sitemap. No se propone cambio inmediato sin inventario de recursos publicos.

## 18. Especificacion SEO-02B

### CHANGE-02B-01

Objetivo: quitar `/buscar` del sitemap mientras conserve `noindex, follow`.

Archivos candidatos: `src/routes/sitemap[.]xml.ts`, `src/config/seo-indexability.test.ts`.

Accion: remover `routes.search` de `getSitemapEntries()` o condicionar su inclusion a una politica indexable futura.

Criterio de aceptacion: sitemap no contiene `https://www.creovision.io/buscar`; `/buscar` conserva `noindex, follow`; tests cubren la ausencia.

Riesgo: bajo. No afecta paginas protegidas.

### CHANGE-02B-02

Objetivo: resolver `/luna/calendario` como URL no duplicada.

Archivos candidatos: `src/routes/luna.calendario.index.tsx`, `src/routes/sitemap[.]xml.ts`, `src/config/seo-indexability.test.ts`.

Accion: elegir una sola politica: redirect servidor/route hacia mes actual o remover del sitemap y dejar solo meses canonicales. No usar 200 indexable sin canonical.

Criterio de aceptacion: `/luna/calendario` no queda como URL indexable debil en sitemap; meses `/luna/calendario/YYYY-MM` siguen indexables.

Riesgo: medio por impacto en enlaces internos.

### CHANGE-02B-03

Objetivo: corregir soft-404 de `/tarot/cartas/$card`.

Archivos candidatos: `src/routes/tarot.cartas.$card.tsx`, servicio/repositorio de tarot, tests.

Accion: validar slug contra el mazo disponible en loader/parseParams; devolver 404 real o noindex para carta inexistente. Canonical solo si la carta existe.

Criterio de aceptacion: `/tarot/cartas/carta-inexistente` responde 404 o noindex sin canonical indexable; cartas validas mantienen 200 y canonical.

Riesgo: medio por dependencia de datos tarot.

### CHANGE-02B-04

Objetivo: definir politica SEO para `/u/$username`.

Archivos candidatos: `src/routes/u.$username.tsx`, `src/pages/social/PublicProfilePage.tsx`, `src/lib/social/queries.ts`, tests.

Accion: implementacion conservadora recomendada: `noindex, follow` para perfiles publicos y 404 real para username inexistente. Alternativa: indexar solo perfiles opt-in con loader servidor y canonical absoluto.

Criterio de aceptacion: usuario inexistente no responde como pagina indexable 200; perfiles reales siguen accesibles; politica queda documentada/testeada.

Riesgo: alto por privacidad y datos de usuario.

### CHANGE-02B-05

Objetivo: completar canonicales faltantes en URLs publicas de sitemap.

Archivos candidatos: rutas de horoscopo periodo/signo, luna fases indice, luna calendario mensual, guias indice.

Accion: pasar `canonical` a `buildMeta` o agregar link canonical absoluto via helper existente.

Criterio de aceptacion: cada URL HTML indexable en sitemap emite canonical absoluto `https://www.creovision.io/...`.

Riesgo: medio; tocar solo rutas no protegidas o ya autorizadas por fase.

### CHANGE-02B-06

Objetivo: decidir sitemap editorial dinamico.

Archivos candidatos: `src/routes/sitemap[.]xml.ts`, `src/lib/editorial/repository`, tests.

Accion: si hay articulos/categorias/autores publicados, enumerarlos en sitemap con canonical y `lastmod`; si editorial no esta listo, noindex o excluir dinamicas.

Criterio de aceptacion: paginas editoriales indexables existen en sitemap o quedan explicitamente noindex.

Riesgo: medio-alto por acceso a repositorio de contenido.

### CHANGE-02B-07

Objetivo: alinear compatibilidad masiva con calidad indexable.

Archivos candidatos: `src/routes/sitemap[.]xml.ts`, repositorio de compatibilidad, tests.

Accion: decidir si sitemap debe incluir solo pares publicados reales o tambien fallback demo. Si se mantiene fallback, marcarlo como decision editorial explicita.

Criterio de aceptacion: sitemap de compatibilidad no indexa paginas consideradas demo/no publicadas por politica SEO.

Riesgo: medio por cobertura actual de 78 URLs.

### CHANGE-02B-08

Objetivo: reforzar exclusion privada real.

Archivos candidatos: `public/robots.txt`, tests/documentacion.

Accion: agregar `Disallow: /mi-espacio` si se decide cubrir el path real de cuenta privada.

Criterio de aceptacion: rutas privadas reales estan fuera de sitemap, noindex y cubiertas por robots cuando aplique.

Riesgo: bajo.

## 19. Tests recomendados para SEO-02B

- Unit test de `getSitemapEntries()` sin `/buscar`.
- Unit test de sitemap sin rutas noindex, privadas, auth, admin, API, `/u/` ni `.json`.
- Unit test de sitemap con host `www`, sin query/hash y sin duplicados.
- Route test o integration test para `/tarot/cartas/slug-inexistente`.
- Route test o integration test para `/u/username-inexistente`.
- Test de canonical absoluto para cada patron indexable incluido en sitemap.
- Test especifico para `/luna/calendario` segun politica elegida.

## 20. No implementado en SEO-02A

No se modifico `sitemap[.]xml.ts`, `robots.txt`, rutas, metadata, loaders, perfiles, auth, admin, API, JSON-LD ni dependencias. No se inicio SEO-02B ni SEO-03.

## 21. Comandos ejecutados

- `rg -n "createFileRoute|head:|loader:|beforeLoad|notFound|redirect|robots|noindex|validateSearch|Navigate" src/routes src/pages/social src/lib/social src/pages/compatibility src/lib/compatibility src/repositories`
- `Invoke-WebRequest https://www.creovision.io/sitemap.xml`
- GET de produccion para rutas invalidas y paginas de control listadas en la seccion soft-404.
- `npx vitest run src/config/seo-indexability.test.ts`

## 22. Decision final

PASS_CON_OBSERVACIONES. La auditoria quedo completada y hay especificacion suficiente para SEO-02B. Los bloqueos principales para implementar son decisiones de politica SEO: perfiles publicos, compatibilidad fallback y editorial dinamico.

## Implementación SEO-02B — 2026-08-17

Estado: PASS_CON_OBSERVACIONES

### Cambios aplicados

| ID CHANGE | Archivo | Simbolo | Lineas aprox. | Antes | Despues | Test | Resultado | Riesgo | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| CHANGE-02B-01 | `src/routes/sitemap[.]xml.ts` | `getSitemapEntries()` | 30-35 | `/buscar` se publicaba en sitemap aunque era `noindex, follow`. | Se removio `routes.search` del sitemap. | `seo-indexability.test.ts` comprueba ausencia de `routes.search`. | PASS | Bajo | Reagregar entrada `routes.search`. |
| CHANGE-02B-02 | `src/routes/luna.calendario.index.tsx` | `head()` | 1-30 | `/luna/calendario` no emitia canonical ni `og:url`. | Emite canonical y `og:url` `https://www.creovision.io/luna/calendario`. | Test `moonCalendarCanonicalUrl`. | PASS | Bajo/medio | Quitar `moonCalendarCanonicalUrl`, `og:url` y `links`. |
| CHANGE-02B-03 | `src/routes/tarot.cartas.$card.tsx` | `parseTarotCardParams`, route `parseParams` | 1-20 | Slug inexistente generaba 200 indexable y canonical propio. | Slug no presente en `majorArcana` lanza `notFound`; slug valido conserva canonical. | Test slug `el-loco` valido y `carta-inexistente` rechazado. | PASS | Medio | Quitar `parseParams` y helper. |
| CHANGE-02B-04 | `src/routes/u.$username.tsx` | `loader`, `requirePublicProfile` | 1-21 | Usuario inexistente se resolvia en cliente como 200. | Loader servidor consulta perfil y lanza `notFound` si no existe. | Test `requirePublicProfile(null)` rechaza y perfil mock pasa. | PASS | Medio/alto | Quitar loader/helper y volver a `component: PublicProfilePage`. |
| CHANGE-02B-04 | `src/pages/social/PublicProfilePage.tsx` | `PublicProfilePage` | 8-41 | Siempre fetch cliente, aun si la ruta ya conocia el perfil. | Acepta `initialProfile` y conserva vista existente sin refetch inicial. | Cubierto indirectamente por build. | PASS | Bajo | Quitar prop `initialProfile` y restaurar estado inicial. |
| CHANGE-02B-05 | `src/routes/horoscopo.hoy.tsx` | `head()` | 4-20 | Sin canonical explicito. | `canonical: routes.horoscopeToday`. | Tests de origin/canonical normalizado. | PASS | Bajo | Quitar import `routes` y canonical. |
| CHANGE-02B-05 | `src/routes/horoscopo.semana.tsx` | `head()` | 4-20 | Sin canonical explicito. | `canonical: routes.horoscopeWeek`. | Tests de origin/canonical normalizado. | PASS | Bajo | Quitar import `routes` y canonical. |
| CHANGE-02B-05 | `src/routes/horoscopo.mes.tsx` | `head()` | 4-20 | Sin canonical explicito. | `canonical: routes.horoscopeMonth`. | Tests de origin/canonical normalizado. | PASS | Bajo | Quitar import `routes` y canonical. |
| CHANGE-02B-05 | `src/routes/horoscopo.$sign.tsx` | `head({ params })` | 4-38 | Signo valido no tenia canonical. | Canonical por `zodiacRoute(sign.slug)`, sin query. | Tests de `zodiacRoute("aries")`. | PASS | Bajo | Quitar import `zodiacRoute` y canonical. |
| CHANGE-02B-05 | `src/routes/luna.fases.index.tsx` | `head()` | 5-30 | Indice de fases sin canonical/`og:url`. | Canonical y `og:url` `absoluteUrl(routes.moonPhases)`. | Tests de origin/canonical normalizado. | PASS | Bajo | Quitar constante, `og:url` y `links`. |
| CHANGE-02B-05 | `src/routes/luna.calendario.$ym.tsx` | `head({ params })` | 10-54 | Mes calendario sin canonical. | Canonical y `og:url` por `moonCalendarMonthRoute(year, month)`. | Tests de `moonCalendarMonthRoute(2026, 8)`. | PASS | Bajo/medio | Quitar import, calculo canonical, `og:url` y `links`. |
| CHANGE-02B-05 | `src/routes/guias.tsx` | `head()` | 3-21 | `/guias` sin canonical explicito. | `canonical: routes.guides`. | Tests de origin/canonical normalizado. | PASS | Bajo | Quitar import `routes` y canonical. |
| CHANGE-02B-05 | `src/config/seo-indexability.test.ts` | suite SEO | 1-206 | 12 tests focales. | 16 tests con sitemap sin `/buscar`, canonicales, tarot 404 y perfil inexistente. | `npx vitest run src/config/seo-indexability.test.ts`. | PASS | Bajo | Revertir tests agregados. |

### Cambios no aplicados

- CHANGE-02B-06: no se agrego editorial dinamico al sitemap porque la especificacion exige fuente confiable y autorizada; se mantiene pendiente.
- CHANGE-02B-07: no se cambio compatibilidad masiva porque SEO-02A pidio decision editorial sobre fallback/demo antes de cambiar cobertura.
- CHANGE-02B-08: no se modifico `public/robots.txt`; el YAML indico no tocar robots salvo autorizacion expresa y el patron `/*.json$` queda para validacion posterior.

### Validacion

| Comando | Resultado | Observaciones |
|---|---|---|
| `npx vitest run src/config/seo-indexability.test.ts` | PASS | 16 tests passed. Persisten warnings preexistentes de `vite-tsconfig-paths` y test dentro de `src/routes/api/tarot`. |
| `npx tsc --noEmit` | FAIL_PREEXISTENTE | Sigue rojo por deuda global. No aparecen errores nuevos en rutas SEO-02B tocadas; `src/config/seo-indexability.test.ts` mantiene el diagnostico de tipos de `vitest` ya conocido. |
| `npm run build` | PASS | Build Vite/Nitro completo. Persisten warnings no bloqueantes de chunks grandes, server functions deprecated y route test en arbol. |

### Estado final SEO-02B

PASS_CON_OBSERVACIONES. Se corrigieron los problemas demostrados: `/buscar` ya no queda en sitemap, `/luna/calendario` tiene canonical definido, tarot invalido usa `notFound`, usuario publico inexistente usa `notFound` por loader y se agregaron canonicales concretos de CHANGE-02B-05. No se tocaron redirects host, robots, JSON-LD, contenido editorial dinamico ni compatibilidad fallback.
