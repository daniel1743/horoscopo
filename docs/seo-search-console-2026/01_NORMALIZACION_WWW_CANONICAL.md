# SEO-01 — Normalización WWW y Canonical

Fecha: 2026-08-17  
Subfase: SEO-01A  
Modo: ANALISIS_Y_ESPECIFICACION_SIN_IMPLEMENTACION  
Estado: PASS_CON_OBSERVACIONES

## 1. Objetivo

Definir la política técnica cerrada para normalizar identidad de URL en Creovision.io:

- host canónico,
- canonical por ruta,
- trailing slash,
- query params,
- sitemap,
- robots,
- Open Graph URL,
- URLs de JSON-LD.

SEO-01A no implementa cambios. Su salida es una especificación para SEO-01B.

## 2. Dependencias del baseline SEO-00

SEO-01A parte del baseline en `00_BASELINE_Y_REGLAS.md` y lo contrastó contra el código actual.

Evidencias confirmadas:

| Tema | Evidencia actual |
|---|---|
| Framework | `package.json`, `vite.config.ts` indican TanStack Start + Vite + Nitro preset `vercel`. |
| Host base | `src/config/site.ts` define `siteConfig.url = "https://www.creovision.io"`. |
| URL helper | `src/config/seo.ts` define `absoluteUrl(pathOrUrl)`. |
| Metadata builder | `src/config/seo.ts` define `buildMeta(input)`. |
| Canonical opcional | `buildMeta` solo agrega canonical si recibe `input.canonical`. |
| Sitemap | `src/routes/sitemap[.]xml.ts` usa `absoluteUrl(entry.path)`. |
| Robots | `public/robots.txt` declara `Sitemap` y `Host` con `www`. |
| Redirect repo | `vercel.json` contiene headers/crons, no redirect host. |
| JSON-LD | `src/config/seo.ts` tiene factories; `src/components/seo/StructuredData.tsx` inyecta con `useEffect`; no afecta directamente SEO-01. |

Cambios funcionales preexistentes al inicio de SEO-01A:

```text
 M src/components/account/FavoriteButton.tsx
 M src/components/account/SaveReadingButton.tsx
 M src/lib/account/profile.schema.ts
 M src/pages/account/ProfilePage.tsx
 M src/routes/auth.tsx
?? docs/
```

## 3. Estado actual del host

El origen técnico recomendado y ya usado internamente es:

```text
https://www.creovision.io
```

Evidencia:

- `src/config/site.ts`: `url: "https://www.creovision.io"`.
- `public/robots.txt`: `Sitemap: https://www.creovision.io/sitemap.xml`.
- `public/robots.txt`: `Host: https://www.creovision.io`.
- `src/routes/sitemap[.]xml.ts`: sitemap construye `<loc>` con `absoluteUrl`.
- Producción observada en SEO-00: `https://creovision.io/*` devuelve 308 a `https://www.creovision.io/*`; `www` responde 200.

Respuesta Q01: si, `https://www.creovision.io` debe establecerse como origen canónico definitivo para SEO-01, porque código, sitemap, robots y comportamiento productivo convergen en `www`.

## 4. Origen conocido o desconocido del redirect

Respuesta Q02: el origen exacto del redirect non-www -> www es EXTERNO/NO VERSIONADO.

Clasificación de posibilidades:

| Capa | Resultado | Evidencia |
|---|---|---|
| `vercel.json` | No encontrado | Solo contiene `headers` y `crons`; no `redirects` ni `rewrites`. |
| Middleware app | No encontrado para host | `src/start.ts` y `src/server.ts` no implementan redirect host. |
| TanStack/Nitro | No evidenciado en repo | `vite.config.ts` solo configura preset Vercel y server entry. |
| Vercel domain configuration | Probable | Producción redirige 308 sin definición versionada. |
| DNS/provider | Posible | No verificable desde repo. |
| Otra capa | Posible | No verificable desde repo. |

## 5. Política de dominio recomendada

Política:

```yaml
canonical_origin: "https://www.creovision.io"
protocol: "https"
host: "www.creovision.io"
non_www: "debe redirigir a www antes de indexación"
http: "debe redirigir a https"
repo_redirect_policy: "no duplicar mientras producción ya redirija y el origen sea externo/no versionado"
```

No se recomienda cambiar `siteConfig.url` en SEO-01B. Ya tiene el valor correcto.

## 6. Estado actual de canonical

Mecanismo:

- `buildMeta` recibe `canonical?: string`.
- Si existe, calcula `absoluteUrl(input.canonical)`.
- Agrega `<link rel="canonical" href="...">`.
- Agrega `og:url` con el mismo valor.
- Si no existe, no emite canonical ni `og:url`.

Esto está probado por `src/config/seo-indexability.test.ts`, especialmente:

- "uses self canonical and matching og:url when canonical is provided",
- "does not silently point og:url to home when canonical is missing".

## 7. Matriz de rutas con/sin canonical

| Ruta | Metadata source | Canonical actual | Canonical esperado | SSR | Acción SEO-01B |
|---|---|---|---|---|---|
| `/` | `src/routes/index.tsx` + `buildMeta` | Ausente | `https://www.creovision.io/` | Si | AGREGAR |
| `/horoscopo` | `src/routes/horoscopo.index.tsx` + `buildMeta` | Ausente | `https://www.creovision.io/horoscopo` | Si | AGREGAR |
| `/tarot/carta-del-dia` | `src/routes/tarot.carta-del-dia.tsx` + `buildMeta` | Presente | `https://www.creovision.io/tarot/carta-del-dia` | Si | NINGUNA |
| `/tarot/tres-cartas` | `src/routes/tarot.tres-cartas.index.tsx` + `buildMeta` | Presente | `https://www.creovision.io/tarot/tres-cartas` | Si | NINGUNA |
| `/tarot/tres-cartas/trabajo` | `src/routes/tarot.tres-cartas.trabajo.tsx` + config | Presente | `https://www.creovision.io/tarot/tres-cartas/trabajo` | Si | NINGUNA |
| `/compatibilidad/geminis/sagitario` | `src/routes/compatibilidad.$signA.$signB.tsx` + `compatibilityRoute` | Presente | `https://www.creovision.io/compatibilidad/geminis/sagitario` | Si | NINGUNA |
| `/compatibilidad/cancer/capricornio` | `src/routes/compatibilidad.$signA.$signB.tsx` + `compatibilityRoute` | Presente esperado | `https://www.creovision.io/compatibilidad/cancer/capricornio` | Si | NINGUNA |
| `/luna` | `src/routes/luna.index.tsx` + `buildMeta` | Presente | `https://www.creovision.io/luna` | Si | NINGUNA |
| `/luna/fases/luna-creciente` | `src/routes/luna.fases.$slug.tsx` manual | Ausente | `https://www.creovision.io/luna/fases/luna-creciente` | Si | AGREGAR |

## 8. Causa técnica de canonical faltante

Respuesta Q09:

La causa no es de TanStack Start ni de SSR. Es contractual dentro de la utilidad SEO:

```ts
const canonical = input.canonical ? absoluteUrl(input.canonical) : undefined;
...
if (canonical) {
  meta.push({ property: "og:url", content: canonical });
}
...
if (canonical) {
  links.push({ rel: "canonical", href: canonical });
}
```

Por tanto:

- rutas que llaman `buildMeta({ ..., canonical: routes.x })` tienen canonical y `og:url`;
- rutas que llaman `buildMeta` sin `canonical` no tienen canonical ni `og:url`;
- rutas que construyen metadata manual deben agregar `links` manualmente o migrar a `buildMeta`.

## 9. Política canonical propuesta

### Regla general

Toda ruta pública indexable debe emitir self-canonical absoluto con:

```text
https://www.creovision.io + pathname canonico
```

### Rutas estáticas

Usar `routes.*` como fuente de path.

Ejemplo:

```yaml
route: "/horoscopo"
canonical: "https://www.creovision.io/horoscopo"
source_path: "routes.horoscope"
```

### Rutas dinámicas

Usar helper canónico de ruta, no concatenar strings ad hoc si ya existe helper.

Ejemplos:

```yaml
route: "/compatibilidad/geminis/sagitario"
source_path: "compatibilityRoute(params.signA, params.signB)"
canonical: "https://www.creovision.io/compatibilidad/geminis/sagitario"
```

```yaml
route: "/luna/fases/luna-creciente"
source_path: "moonPhaseRoute(meta.slug)"
canonical: "https://www.creovision.io/luna/fases/luna-creciente"
```

### Normalización

| Dimensión | Política |
|---|---|
| Lowercase | Slugs y paths canónicos deben ser lowercase. Las rutas existentes ya usan slugs lowercase. |
| Trailing slash | Canonical sin trailing slash excepto home `/`. |
| Encoding | No introducir encoding manual; usar helpers actuales con slugs ya normalizados. |
| Duplicate slash | No generar; paths vienen de `routes`/helpers. |
| WWW | Siempre `www.creovision.io`. |
| HTTP | Canonical siempre `https`. |

## 10. Política de trailing slash

Respuesta Q07:

La política explícita propuesta es:

- home: `https://www.creovision.io/`;
- todas las demás rutas: sin slash final.

Razón:

- `routes.home` es `/`;
- el registro de rutas usa paths sin slash final (`/horoscopo`, `/luna`, `/tarot/carta-del-dia`);
- sitemap actual emite paths desde `routes` y helpers sin slash final salvo home;
- producción puede resolver rutas TanStack con definiciones tipo `/horoscopo/`, pero la identidad publicada debe ser el path registrado sin slash final.

SEO-01B no debe implementar redirects de trailing slash. Solo debe emitir canonical consistente.

## 11. Query parameters y canonical

Respuesta Q06:

Política:

- query params no forman parte del canonical para las rutas SEO actuales;
- hashes nunca forman parte del canonical porque no se envían al servidor y no deben representarse en `<link rel="canonical">`;
- parámetros de tracking (`utm_*`, `gclid`, etc.) deben ignorarse;
- filtros de `/buscar` no deben convertirse en canonical indexable en SEO-01B;
- rutas parametrizadas deben canonicalizar solo path normalizado, no query.

Ejemplos:

| URL solicitada | Canonical esperado |
|---|---|
| `/horoscopo?utm_source=x` | `https://www.creovision.io/horoscopo` |
| `/tarot/carta-del-dia?x=1` | `https://www.creovision.io/tarot/carta-del-dia` |
| `/compatibilidad/sagitario/geminis` | Redirect a `/compatibilidad/geminis/sagitario`; canonical final `https://www.creovision.io/compatibilidad/geminis/sagitario` |
| `/luna/fases/luna-creciente#contenido` | `https://www.creovision.io/luna/fases/luna-creciente` |

## 12. Coherencia con sitemap

Sitemap ya usa:

```ts
absoluteUrl(entry.path)
```

La política canonical debe seguir exactamente esa identidad:

- mismo origin `https://www.creovision.io`;
- mismo path de `routes`/helpers;
- sin query;
- sin trailing slash salvo `/`;
- slugs lowercase.

SEO-01B debe ampliar tests para comprobar que las rutas corregidas tienen canonical igual a `absoluteUrl(path)` y que sitemap contiene el mismo `<loc>`.

## 13. Coherencia con robots

Robots ya declara:

```text
Sitemap: https://www.creovision.io/sitemap.xml
Host: https://www.creovision.io
```

El patrón `Disallow: /*.json$` no pertenece a SEO-01. No modifica identidad canónica de rutas HTML y debe pasar a SEO-02.

SEO-01B no debe modificar `public/robots.txt`.

## 14. Coherencia con Open Graph

`buildMeta` ata `og:url` al canonical. Esa decisión es correcta para SEO-01: cuando canonical existe, `og:url` debe ser idéntico.

Política:

- toda ruta pública indexable corregida con `buildMeta` debe tener `og:url` igual al canonical;
- rutas manuales corregidas deben mantener la misma regla;
- no usar `og:url` distinto por campaña, query o variante.

## 15. Coherencia con JSON-LD

Respuesta Q08:

La misma fuente de origin (`siteConfig.url`) sí debe alimentar canonical, sitemap, OG y URLs de JSON-LD. Sin embargo, no se debe crear un helper semánticamente único para todo si cada caso requiere estructura distinta.

Política:

- `absoluteUrl(path)` puede seguir siendo helper común de URL absoluta.
- canonical y `og:url` deben representar la URL principal de la página.
- sitemap `<loc>` debe representar URLs descubiertas/indexables.
- JSON-LD debe usar URLs absolutas de entidades (`WebSite.url`, `Organization.url`, breadcrumbs, article image), pero su render SSR pertenece a SEO-03/SEO-09.

JSON-LD no bloquea SEO-01B. No modificar `StructuredData` ni factories JSON-LD en SEO-01B salvo que el documento externo de SEO-01B lo autorice explícitamente.

## 16. Archivos candidatos a modificación en SEO-01B

Solo estos archivos quedan autorizables para SEO-01B:

| Archivo | Motivo |
|---|---|
| `src/routes/index.tsx` | Agregar canonical home usando `routes.home`. |
| `src/routes/horoscopo.index.tsx` | Agregar canonical hub horóscopo usando `routes.horoscope`. |
| `src/routes/luna.fases.$slug.tsx` | Agregar canonical dinámico por fase, preferiblemente con `buildMeta` o `links` equivalente. |
| `src/config/seo-indexability.test.ts` | Ampliar tests existentes de canonical/OG/sitemap. |

Condicional:

| Archivo | Condición |
|---|---|
| `src/config/seo.ts` | Solo si SEO-01B decide centralizar una opción explícita mínima, pero la recomendación primaria es no tocarlo. |

## 17. Archivos que SEO-01B NO debe modificar

- `src/config/site.ts`
- `src/routes/sitemap[.]xml.ts`
- `public/robots.txt`
- `vercel.json`
- `vite.config.ts`
- `src/routes/__root.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/horoscope/HoroscopeHubPage.tsx`
- `src/pages/tarot/TarotDailyPage.tsx`
- `src/components/home/*`
- `src/components/layout/*`
- `src/components/tarot/experience/*`
- `src/components/seo/StructuredData.tsx`
- cualquier archivo de Supabase o server functions

## 18. Plan de implementación exacto para Codex

### CHANGE-01B-01 — Canonical home

OBJETIVO: agregar self-canonical y `og:url` a `/` sin tocar title, description, H1, layout ni contenido.  
ARCHIVO: `src/routes/index.tsx`  
SIMBOLO: `meta = buildMeta(...)`  
ESTADO ACTUAL: `buildMeta` se llama sin `canonical`.  
CAMBIO EXACTO: importar `routes` desde `@/config/routes` y agregar `canonical: routes.home` al objeto de `buildMeta`.  
NO CAMBIAR: title, description, `HomePage`, componentes home, root route.  
RAZON: `buildMeta` ya emite canonical/`og:url` cuando recibe canonical; home es ruta protegida y solo requiere identidad URL.  
TEST: ampliar `src/config/seo-indexability.test.ts` para comprobar canonical home esperado `absoluteUrl(routes.home)`.  
RESULTADO ESPERADO: HTML SSR de `/` contiene `<link rel="canonical" href="https://www.creovision.io/">` y `og:url` igual.  
RIESGO: bajo si solo se añade canonical; alto si se toca copy/layout.  
ROLLBACK: quitar `canonical: routes.home` y el import de `routes`.

### CHANGE-01B-02 — Canonical horóscopo hub

OBJETIVO: agregar self-canonical a `/horoscopo`.  
ARCHIVO: `src/routes/horoscopo.index.tsx`  
SIMBOLO: route `head()`  
ESTADO ACTUAL: `buildMeta` se llama sin `canonical`.  
CAMBIO EXACTO: importar `routes` desde `@/config/routes` si no existe y agregar `canonical: routes.horoscope` al objeto de `buildMeta`.  
NO CAMBIAR: title, description, feature gate, `HoroscopeHubPage`, H1, navegación de signos.  
RAZON: `routes.horoscope` coincide con sitemap y con path canónico sin trailing slash.  
TEST: comprobar que `buildMeta({ canonical: routes.horoscope })` produce canonical/`og:url` `absoluteUrl(routes.horoscope)`.  
RESULTADO ESPERADO: HTML SSR de `/horoscopo` contiene canonical `https://www.creovision.io/horoscopo`.  
RIESGO: bajo si se limita a canonical.  
ROLLBACK: quitar `canonical: routes.horoscope` y el import si quedó sin uso.

### CHANGE-01B-03 — Canonical fases lunares dinámicas

OBJETIVO: agregar canonical determinista a `/luna/fases/$slug`.  
ARCHIVO: `src/routes/luna.fases.$slug.tsx`  
SIMBOLO: route `head({ params })`  
ESTADO ACTUAL: metadata manual sin `links` canonical y sin `og:url`.  
CAMBIO EXACTO: dentro de `head`, cuando exista `meta`, calcular `const canonical = meta ? moonPhaseRoute(meta.slug) : undefined`; usar `buildMeta` con `title`, `description`, `canonical`, `type: "article"` o agregar manualmente `links: [{ rel: "canonical", href: absoluteUrl(moonPhaseRoute(meta.slug)) }]` y `og:url` equivalente. La recomendación primaria es migrar el bloque manual a `buildMeta` para mantener OG/Twitter/robots consistentes.  
NO CAMBIAR: loader, `parseParams`, contenido, H1, `MoonPhasePage`, navegación prev/next.  
RAZON: las fases son rutas dinámicas indexables; el path canónico ya existe vía `moonPhaseRoute(meta.slug)`.  
TEST: agregar cobertura para `moonPhaseRoute("luna-creciente")` con `absoluteUrl(...)`; idealmente test de route head si el patrón local lo permite.  
RESULTADO ESPERADO: HTML SSR de `/luna/fases/luna-creciente` contiene canonical `https://www.creovision.io/luna/fases/luna-creciente` y `og:url` igual.  
RIESGO: medio: cambiar metadata manual a `buildMeta` puede añadir robots/theme/author/preconnect y alterar tags existentes. Si se busca mínima superficie, agregar solo canonical + `og:url` manualmente.  
ROLLBACK: restaurar el bloque `head` manual anterior sin `links` canonical.

### CHANGE-01B-04 — Tests de coherencia canonical

OBJETIVO: evitar regresiones en host/canonical/sitemap.  
ARCHIVO: `src/config/seo-indexability.test.ts`  
SIMBOLO: suite `SEO indexability and canonical consistency`  
ESTADO ACTUAL: cubre canonical cuando se provee, sitemap host, rutas tarot y compatibilidad; no cubre home/horóscopo/fases lunares.  
CAMBIO EXACTO: agregar tests unitarios para:

- `absoluteUrl(routes.home) === "https://www.creovision.io/"`;
- canonical/`og:url` para `routes.home`;
- canonical/`og:url` para `routes.horoscope`;
- canonical/`og:url` para `moonPhaseRoute("luna-creciente")`;
- sitemap contiene `routes.home`, `routes.horoscope`, `moonPhaseRoute("luna-creciente")`.

NO CAMBIAR: tests no relacionados ni snapshots inexistentes.  
RAZON: el typecheck global falla por deuda preexistente; los tests focales son la forma más clara de aislar SEO-01B.  
TEST: `npx vitest run src/config/seo-indexability.test.ts`.  
RESULTADO ESPERADO: tests SEO pasan y validan host `www`.  
RIESGO: bajo.  
ROLLBACK: revertir los tests agregados.

### CHANGE-01B-05 — No versionar redirect host

OBJETIVO: evitar duplicar un redirect ya activo fuera del repo.  
ARCHIVO: ninguno.  
SIMBOLO: no aplica.  
ESTADO ACTUAL: producción redirige non-www -> www con 308; `vercel.json` no contiene redirect.  
CAMBIO EXACTO: no modificar `vercel.json`, `src/server.ts`, `src/start.ts` ni middleware para host redirect.  
NO CAMBIAR: configuración de Vercel versionada.  
RAZON: duplicar una capa no identificada puede crear loops, dobles redirects o divergencias entre Vercel UI y repo.  
TEST: prueba externa de solo lectura en preview/producción: non-www debe redirigir una vez a www preservando path/query.  
RESULTADO ESPERADO: política documentada, sin cambio funcional.  
RIESGO: medio si producción pierde configuración externa en el futuro; mitigación: documentar en SEO-01B que el origen es externo/no versionado.  
ROLLBACK: no aplica.

## 19. Plan de pruebas

### Pruebas unitarias/focales

SEO-01B debe ejecutar:

```powershell
npx vitest run src/config/seo-indexability.test.ts
```

Debe verificar:

- `buildMeta` genera canonical correcto cuando se provee path;
- canonical usa `https://www.creovision.io`;
- `og:url` coincide con canonical;
- sitemap usa el mismo origin;
- rutas corregidas tienen path esperado.

### Pruebas de TypeScript

Ejecutar:

```powershell
npx tsc --noEmit
```

Criterio:

- no declarar el proyecto verde si falla;
- comparar errores con baseline preexistente;
- confirmar que no aparezcan errores nuevos en archivos tocados por SEO-01B.

### Pruebas route-level/SSR

En preview o producción:

| Ruta | Verificar |
|---|---|
| `/` | canonical `https://www.creovision.io/`, `og:url` igual |
| `/horoscopo` | canonical `https://www.creovision.io/horoscopo`, `og:url` igual |
| `/luna` | sin regresión, canonical existente |
| `/luna/fases/luna-creciente` | canonical nuevo correcto |
| `/tarot/carta-del-dia` | sin regresión |
| `/tarot/tres-cartas/trabajo` | sin regresión |
| `/compatibilidad/geminis/sagitario` | sin regresión |

### Pruebas host

Comandos de solo lectura equivalentes a:

```powershell
Invoke-WebRequest -Uri "https://creovision.io/tarot/carta-del-dia?x=1" -Method Head -MaximumRedirection 0
Invoke-WebRequest -Uri "https://www.creovision.io/tarot/carta-del-dia?x=1" -Method Head -MaximumRedirection 0
```

Resultado esperado:

- non-www: 308 a `https://www.creovision.io/tarot/carta-del-dia?x=1`;
- www: 200;
- sin loop;
- path y query preservados.

## 20. Rollback

Rollback por cambio:

- CHANGE-01B-01: quitar canonical home e import de `routes`.
- CHANGE-01B-02: quitar canonical horóscopo e import de `routes`.
- CHANGE-01B-03: restaurar `head()` manual de fases sin canonical o quitar `links`/`og:url` agregado.
- CHANGE-01B-04: quitar tests añadidos.
- CHANGE-01B-05: no aplica porque no hay cambio.

Rollback global:

1. Revertir solo los archivos tocados por SEO-01B.
2. No tocar cambios preexistentes del usuario.
3. Reejecutar `npx vitest run src/config/seo-indexability.test.ts`.
4. Verificar que producción o preview mantiene redirect host externo.

## 21. Riesgos

| Riesgo | Nivel | Mitigación |
|---|---|---|
| Duplicar redirect host existente | Alto | No modificar `vercel.json` ni middleware en SEO-01B. |
| Tocar páginas protegidas más allá de canonical | Alto | Cambios exactos solo en objetos `buildMeta` o `head`. |
| Cambiar metadata visible o intención SEO | Alto | Prohibido cambiar title/description/H1/copy. |
| Introducir trailing slash inconsistente | Medio | Usar `routes`/helpers existentes. |
| JSON-LD fuera de SSR | Medio | Fuera de alcance SEO-01; pasar a SEO-03/SEO-09. |
| Robots `/*.json$` | Medio | Fuera de alcance SEO-01; pasar a SEO-02. |
| Typecheck global rojo | Medio | Comparar errores preexistentes vs nuevos; usar tests focales. |

## 22. Decisiones pendientes

No bloquean SEO-01B:

- Confirmar en Vercel UI/domain settings qué capa origina el 308 non-www -> www.
- Definir en SEO-02 política robots para `/*.json$`.
- Definir en SEO-03/SEO-09 JSON-LD SSR por tipo de página.
- Decidir si más rutas no protegidas deben recibir canonical en fases posteriores.

Bloquea SEO-01B si cambia antes de implementar:

- Si producción deja de redirigir non-www -> www.
- Si `siteConfig.url` cambia.
- Si se introduce un redirect versionado en `vercel.json` por otro agente.

## 23. Estado SEO-01A

PASS_CON_OBSERVACIONES.

HOST_REDIRECT_REPO_POLICY:

```yaml
decision: NO
evidence:
  - "Producción ya redirige non-www -> www con HTTP 308 según SEO-00."
  - "siteConfig.url, sitemap y robots usan https://www.creovision.io."
  - "vercel.json no contiene redirects; el origen es externo/no versionado."
rationale: |
  No se debe duplicar un redirect ya funcional en una capa no identificada.
  SEO-01B debe limitarse a canonical y coherencia de identidad URL dentro del head.
implementation_if_yes: |
  No aplica en SEO-01B. Si en el futuro se decide versionarlo, primero hay que confirmar
  configuración de dominio Vercel y retirar o coordinar la capa externa para evitar doble redirect.
risk_if_duplicated: |
  Doble redirect, loop, divergencia entre configuración Vercel UI y repo, o comportamiento distinto
  entre preview y producción.
```

Respuesta Q03: NO.

Respuesta Q10: la mínima modificación necesaria es agregar canonical explícito en `/`, `/horoscopo` y `/luna/fases/$slug`, más tests focales. No cambiar host, sitemap, robots, redirects ni arquitectura de metadata.

## Implementación SEO-01B — 2026-08-17

### Archivos tocados

| Archivo | Símbolos tocados | Líneas aproximadas | Cambio exacto |
|---|---|---:|---|
| `src/routes/index.tsx` | `meta = buildMeta(...)` | 4-10 | Se importó `routes` y se agregó `canonical: routes.home`. |
| `src/routes/horoscopo.index.tsx` | route `head()` | 4-16 | Se importó `routes` y se agregó `canonical: routes.horoscope`. |
| `src/routes/luna.fases.$slug.tsx` | route `head({ params })` | 21-50 | Se importó `absoluteUrl`, se calculó `absoluteUrl(moonPhaseRoute(meta.slug))`, se agregó `og:url` y `links` canonical. |
| `src/config/seo-indexability.test.ts` | suite `SEO indexability and canonical consistency` | 3-142 | Se agregaron tests de origin `www`, query/hash ausentes, trailing slash, `og:url` y sitemap para home, horóscopo y `luna-creciente`. |

### Antes

- `/` usaba `buildMeta` sin `canonical`, por lo que no emitía canonical ni `og:url`.
- `/horoscopo` usaba `buildMeta` sin `canonical`, por lo que no emitía canonical ni `og:url`.
- `/luna/fases/$slug` construía metadata manual y no emitía canonical ni `og:url`.
- El test focal SEO cubría canonical cuando se proveía, tarot, compatibilidad y sitemap, pero no home/horóscopo/fases.

### Después

- `/` publica canonical absoluto esperado: `https://www.creovision.io/`.
- `/horoscopo` publica canonical absoluto esperado: `https://www.creovision.io/horoscopo`.
- `/luna/fases/{slug}` publica canonical absoluto determinista sin query/hash/trailing slash: `https://www.creovision.io/luna/fases/{slug}`.
- `og:url` queda coherente con canonical en las tres superficies corregidas.
- No se modificaron title, description, H1, copy, layout, loader, contenido ni navegación.

### Tests

| Prueba | Comando | Resultado | Observaciones |
|---|---|---|---|
| Test SEO focal | `npx vitest run src/config/seo-indexability.test.ts` | PASS | 12 tests passed. Mantiene warnings existentes de `vite-tsconfig-paths` y route test en árbol. |
| Typecheck comparativo | `npx tsc --noEmit` | FAIL_PREEXISTENTE | 90 diagnósticos globales. En archivos tocados solo aparece `src/config/seo-indexability.test.ts(1,38)` por tipos de `vitest`, ya documentado como deuda preexistente. |

### Diff

Diff revisado archivo por archivo:

- `src/routes/index.tsx`: solo import de `routes` y `canonical: routes.home`.
- `src/routes/horoscopo.index.tsx`: solo import de `routes` y `canonical: routes.horoscope`.
- `src/routes/luna.fases.$slug.tsx`: solo import de `absoluteUrl`, cálculo canonical, `og:url` y `links` canonical.
- `src/config/seo-indexability.test.ts`: solo import de `moonPhaseRoute` y tests focales nuevos.

No hubo cambios en:

- `src/config/site.ts`
- `src/config/seo.ts`
- `src/routes/sitemap[.]xml.ts`
- `public/robots.txt`
- `vercel.json`
- `vite.config.ts`
- root route/layouts
- JSON-LD helpers
- componentes compartidos no autorizados

### Riesgos restantes

- El redirect non-www -> www sigue en capa externa/no versionada; no se duplicó en repo por decisión SEO-01A.
- El typecheck global sigue rojo por deuda preexistente ajena a SEO-01B.
- JSON-LD SSR y robots `/*.json$` siguen fuera de alcance y deben abordarse en fases posteriores.

### Rollback

Para revertir SEO-01B sin afectar cambios ajenos:

1. Quitar `canonical: routes.home` y el import `routes` de `src/routes/index.tsx`.
2. Quitar `canonical: routes.horoscope` y el import `routes` de `src/routes/horoscopo.index.tsx`.
3. Quitar import `absoluteUrl`, cálculo `canonical`, `og:url` y `links` de `src/routes/luna.fases.$slug.tsx`.
4. Quitar los tests agregados y el import `moonPhaseRoute` de `src/config/seo-indexability.test.ts`.

### Estado

PASS_CON_OBSERVACIONES.

SEO-01B cumple los criterios de aceptación funcionales: canonical faltante implementado en archivos autorizados, tests focales pasando, sin cambios de redirect/sitemap/robots/dominio/JSON-LD/copy/layout. La observación restante es el typecheck global rojo por deuda preexistente.
