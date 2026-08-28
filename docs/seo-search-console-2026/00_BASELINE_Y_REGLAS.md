# SEO-00 — Baseline tecnico y reglas

Fecha: 2026-08-17  
Proyecto: Creovision.io  
Modo: AUDITORIA_SIN_IMPLEMENTACION  
Estado: PASS_CON_OBSERVACIONES

## 1. Resumen ejecutivo

Creovision.io usa TanStack Start con React, TypeScript, SSR/server functions, React Query y despliegue Vercel mediante Nitro. El head se genera principalmente con `head()` en rutas TanStack y la utilidad `buildMeta` de `src/config/seo.ts`.

La fuente base de URLs absolutas es `siteConfig.url = "https://www.creovision.io"` en `src/config/site.ts:10`. Sitemap, robots, canonical cuando existe, Open Graph URL cuando existe y structured data helpers heredan ese host mediante `absoluteUrl`.

Estado general:

- Dominio: producción redirige `https://creovision.io/*` a `https://www.creovision.io/*` con HTTP 308 en las pruebas ejecutadas, preservando path y query.
- Sitemap: existe ruta dinámica `src/routes/sitemap[.]xml.ts`; producción devolvió 137 `<loc>` y todas las URLs detectadas usan `www`.
- Robots: existe `public/robots.txt`, declara sitemap y host `https://www.creovision.io`.
- SSR: las páginas muestreadas entregan title, description y H1 en HTML inicial. JSON-LD no apareció en HTML inicial.
- Riesgo mayor: canonical no es universal. `buildMeta` solo emite canonical si la ruta lo pasa; `/` y `/horoscopo` no lo pasan. `/luna/fases/$slug` usa metadata manual sin canonical.

Que NO debe modificarse todavia:

- Redirects de host, canonical, sitemap, robots, slugs y metadata de paginas protegidas.
- Componentes globales `AppShell`, `SiteHeader`, `SiteFooter`, `PageHeader`, navegacion y secciones home sin revisión de impacto SEO.
- Configuración de Vercel o dominio hasta SEO-01/SEO-02.

## 2. Estado del repositorio antes de la auditoria

Branch: `feature/fase-2c-general-transit-engine`.

`git status --short` inicial:

```text
 M src/components/account/FavoriteButton.tsx
 M src/components/account/SaveReadingButton.tsx
 M src/lib/account/profile.schema.ts
 M src/pages/account/ProfilePage.tsx
 M src/routes/auth.tsx
```

Estos cambios eran preexistentes. SEO-00 no los modificó.

Advertencias:

- El repositorio estaba sucio antes de la auditoría.
- La auditoría crea únicamente Markdown dentro de `docs/seo-search-console-2026/`.
- `npx tsc --noEmit` falla por errores TypeScript globales preexistentes no relacionados directamente con SEO-00.

## 3. Mapa de arquitectura SEO

| Pieza | Evidencia | Comportamiento |
|---|---|---|
| Framework activo | `package.json`, `vite.config.ts:1-15` | TanStack Start via `@lovable.dev/vite-tanstack-config`, Nitro preset `vercel`. |
| Root route | `src/routes/__root.tsx:81` | Define meta global base, favicons, manifest, fonts y `<HeadContent />`. |
| Shell SSR | `src/routes/__root.tsx:128-140` | Renderiza `<html lang={siteConfig.locale}>`, `<head><HeadContent /></head>`, `<Scripts />`. |
| Server entry | `src/server.ts` | Wrapper SSR que delega a `@tanstack/react-start/server-entry` y normaliza errores 500. |
| Start middleware | `src/start.ts` | Registra auth attacher, error middleware y CSRF para server functions. |
| Router | `src/router.tsx` | Crea `QueryClient`, route tree y preload intent. |
| Metadata utility | `src/config/seo.ts:148-234` | `absoluteUrl` y `buildMeta` generan title, description, OG, Twitter, robots y canonical opcional. |
| Host base | `src/config/site.ts:10` | `https://www.creovision.io`. |
| Sitemap | `src/routes/sitemap[.]xml.ts:21-204` | Ruta dinámica `/sitemap.xml`, genera entries y XML con `absoluteUrl`. |
| Robots | `public/robots.txt:1-128` | Archivo estático con `Sitemap` y `Host` en `www`. |
| Vercel | `vercel.json:16-86` | Headers y crons; no redirects de host en repo. |
| JSON-LD helpers | `src/config/seo.ts:238-326`, `src/components/seo/StructuredData.tsx:16-41` | Helpers existen; componente inyecta scripts con `useEffect` cliente-only. |

## 4. Inventario de archivos relevantes

| Archivo | Responsabilidad | Activo | Riesgo | Notas |
|---|---|---:|---|---|
| `src/config/site.ts` | Config global de sitio y host base | Si | Alto | `url` define dominio absoluto `www`. |
| `src/config/seo.ts` | Builder de metadata, canonical, OG, Twitter y JSON-LD helpers | Si | Alto | Canonical solo se emite si se pasa `input.canonical`. |
| `src/routes/__root.tsx` | Head global y shell HTML SSR | Si | Alto | Afecta todas las páginas. |
| `src/routes/index.tsx` | Ruta home protegida | Si | Alto | Usa `buildMeta` sin canonical. |
| `src/routes/horoscopo.index.tsx` | Hub horóscopo protegido | Si | Alto | Usa `buildMeta` sin canonical. |
| `src/routes/tarot.carta-del-dia.tsx` | Tarot diario protegido | Si | Alto | Usa canonical `routes.tarotDaily`. |
| `src/routes/tarot.tres-cartas.trabajo.tsx` | Tarot trabajo protegido | Si | Alto | Usa canonical desde `threeCardReadings.trabajo`. |
| `src/config/three-card-readings.ts` | Config SEO tiradas tres cartas | Si | Alto | Fuente de title/description/canonical para rutas temáticas. |
| `src/routes/compatibilidad.$signA.$signB.tsx` | Ruta dinámica compatibilidad | Si | Alto | Normaliza pares con redirect interno y canonical. |
| `src/routes/luna.index.tsx` | Hub Luna | Si | Alto | Loader SSR con React Query, canonical presente. |
| `src/routes/luna.fases.$slug.tsx` | Fases lunares dinámicas | Si | Alto | Metadata manual sin canonical. |
| `src/routes/sitemap[.]xml.ts` | Sitemap dinámico | Si | Alto | Produce 137 URLs en producción. |
| `public/robots.txt` | Robots estático | Si | Medio | Bloquea `/api/`, `/_authenticated/`, `/design-system`, `/*.json$`. |
| `vercel.json` | Headers/crons | Si | Medio | No contiene redirects de host. |
| `vite.config.ts` | Config Start/Nitro | Si | Alto | Preset Vercel y entry server custom. |
| `src/components/seo/StructuredData.tsx` | Inyección JSON-LD cliente | No confirmado en uso | Medio | `rg` no encontró usos fuera del propio archivo. |
| `src/components/layout/AppShell.tsx` | Layout global | Si | Alto | Envuelve todas las páginas, header/footer/main. |
| `src/components/layout/SiteHeader.tsx` | Navegación global | Si | Medio | Links internos y acceso a búsqueda/cuenta. |
| `src/components/layout/SiteFooter.tsx` | Footer global | Si | Medio | Links internos legales/exploración. |

## 5. Modelo de metadata

### Global

`src/routes/__root.tsx:81-126` define:

- charset, viewport,
- title global fallback,
- description global fallback,
- author,
- OG title/description/type,
- Twitter card,
- theme/app metadata,
- favicons, manifest, preconnect y Google Fonts.

### Por ruta con `buildMeta`

`src/config/seo.ts:158-234` genera:

- `{ title }`,
- `description`,
- `og:title`, `og:description`, `og:type`, `og:locale`, `og:site_name`, `og:image`,
- Twitter card/title/description/image,
- author, publisher, theme-color,
- robots index/follow o noindex,
- canonical y `og:url` solo si `input.canonical` existe,
- preconnect fonts.

### Por ruta manual

Algunas rutas no usan `buildMeta` o no pasan canonical. Ejemplos:

- `/luna/fases/$slug`: `src/routes/luna.fases.$slug.tsx:32-47` define title, description, OG y Twitter manualmente, sin canonical ni robots explícito.
- rutas legales antiguas `/privacidad`, `/terminos`, `/cookies` usan metadata manual simple.

### Structured data

`src/config/seo.ts:238-326` define factories `organization`, `website`, `breadcrumb`, `article`, `faq`, `howTo`. `src/components/seo/StructuredData.tsx:16-41` inyecta JSON-LD con `useEffect`. `rg` no encontró uso activo de `StructuredData`, `useStructuredData` o `structuredData.*` fuera de sus definiciones durante esta auditoría.

## 6. SSR e indexabilidad

Comprobación HTTP a producción de HTML inicial:

| Ruta | Title SSR | Description SSR | Canonical SSR | H1 SSR | JSON-LD SSR |
|---|---:|---:|---:|---:|---:|
| `/` | Si | Si | No | Si | No |
| `/horoscopo` | Si | Si | No | Si | No |
| `/tarot/carta-del-dia` | Si | Si | Si | Si | No |
| `/tarot/tres-cartas/trabajo` | Si | Si | Si | No detectado por regex simple | No |
| `/compatibilidad/geminis/sagitario` | Si | Si | Si | Si | No |
| `/luna` | Si | Si | Si | Si | No |
| `/luna/fases/luna-creciente` | Si | Si | No | Si | No |

React Query interviene en contenido SSR cuando el loader usa `context.queryClient.ensureQueryData`, por ejemplo:

- `src/routes/compatibilidad.$signA.$signB.tsx:27-30`.
- `src/routes/luna.index.tsx:30-35`.
- `src/routes/luna.fases.$slug.tsx:49-54`.

Otras rutas usan prefetch no bloqueante en `beforeLoad`, por ejemplo:

- `src/routes/tarot.carta-del-dia.tsx:8-10`.
- `src/routes/tarot.tres-cartas.trabajo.tsx:10-12`.

## 7. Analisis WWW vs non-WWW

| Elemento | www | non-www | Evidencia | Riesgo |
|---|---|---|---|---|
| Dominio principal en codigo | Si | No | `src/config/site.ts:10` | Bajo si Vercel mantiene redirect. |
| Redirect produccion | 200 en `https://www.creovision.io/` | 308 a `https://www.creovision.io/` | `Invoke-WebRequest -Method Head -MaximumRedirection 0` | Medio: origen del redirect no está en repo. |
| Redirect path/query | 200 final | 308 conserva `/tarot/carta-del-dia?x=1` | HTTP HEAD producción | Bajo observado. |
| Canonical | Emite `www` cuando existe | No observado | `buildMeta` + HTML producción | Medio por rutas sin canonical. |
| Sitemap | 137 loc con `www` | No loc non-www detectado | `https://www.creovision.io/sitemap.xml` | Bajo. |
| OG URL | `www` cuando canonical existe | No observado | `buildMeta` `og:url` condicionado a canonical | Medio por rutas sin canonical/og:url. |
| JSON-LD | Helpers usan `www` | No observado SSR | `src/config/seo.ts:247,261,279,305` | Medio: no activo SSR. |
| Enlaces absolutos | `www` en legales/auth | No encontrados en muestra | `rg https://...creovision.io` | Bajo. |
| Configuración Vercel repo | Headers/crons, no redirects | No dominio primario | `vercel.json` | Medio: depende de configuración externa. |

No se observó riesgo de redirect loop en las pruebas realizadas: `www` respondió 200 y non-www respondió 308 hacia `www`.

## 8. Inventario de rutas SEO

| Ruta | Tipo | Metadata | Canonical | SSR | Indexable | Riesgo |
|---|---|---|---|---|---|---|
| `/` | Estática | `buildMeta` | No | Si | Si por robots meta | Alto |
| `/horoscopo` | Estática con feature gate | `buildMeta` | No | Si | Si por robots meta | Alto |
| `/horoscopo/$sign` | Dinámica | `buildMeta` | Si, por `zodiacRoute` | Si con loader | Si | Medio |
| `/tarot` | Estática | `buildMeta` | Si | Si | Si | Medio |
| `/tarot/carta-del-dia` | Estática/interactiva | `buildMeta` | Si | Si | Si | Alto |
| `/tarot/tres-cartas` | Estática/interactiva | `buildMeta` | Si | Si | Si | Alto |
| `/tarot/tres-cartas/trabajo` | Estática/interactiva | `buildMeta` + config | Si | Si | Si | Alto |
| `/compatibilidad` | Hub con loader | `buildMeta` | Si | Si | Si | Medio |
| `/compatibilidad/$signA/$signB` | Dinámica con redirect canónico | `buildMeta` | Si | Si con loader | Si | Alto |
| `/luna` | Hub con loader | `buildMeta` | Si | Si | Si | Alto |
| `/luna/hoy` | Dinámica con loader | `buildMeta` | Si | Si | Si | Medio |
| `/luna/fases/$slug` | Dinámica | Manual | No | Si con loader | Si | Alto |
| `/luna/calendario/$ym` | Dinámica | Manual/build según ruta | Si en rutas mensuales revisadas por código | Si con loader | Si | Medio |
| `/buscar` | Búsqueda | Manual | No confirmado | Cliente + API | Potencialmente indexable | Medio |
| `/_authenticated/*` | Privada | noindex | No | Protegida | No | Bajo |
| `/api/*` | API | No aplica | No aplica | No HTML | Bloqueada por robots | Bajo |

## 9. Paginas protegidas

### `/`

Archivos: `src/routes/index.tsx`, `src/pages/HomePage.tsx`, `src/config/home.ts`, `src/components/home/*`, `src/components/layout/*`.

Metadata: `buildMeta` en `src/routes/index.tsx:5-12`, sin canonical.

Dependencias compartidas: `AppShell`, `SiteHeader`, `SiteFooter`, `HomeHero`, secciones home, `routes`, feature flags.

No tocar sin revisión: title/description, H1 de `HomeHero`, orden de secciones home, navegación global, enlaces internos destacados.

### `/tarot/carta-del-dia`

Archivos: `src/routes/tarot.carta-del-dia.tsx`, `src/pages/tarot/TarotDailyPage.tsx`, `src/hooks/useTarotDeck.ts`, `src/services/tarot.service.ts`.

Metadata: `buildMeta` con canonical `routes.tarotDaily` en `src/routes/tarot.carta-del-dia.tsx:11-18`.

Dependencias: prefetch de tarot deck en `beforeLoad`, componentes tarot, layout global.

No tocar sin revisión: canonical, title/description, flujo de carta diaria, H1, carga de deck.

### `/horoscopo`

Archivos: `src/routes/horoscopo.index.tsx`, `src/pages/horoscope/HoroscopeHubPage.tsx`, `src/config/public-features.ts`, `src/config/features.ts`.

Metadata: `buildMeta` sin canonical en `src/routes/horoscopo.index.tsx:10-18`.

Dependencias: feature gate `isPublicFeatureEnabled("horoscope")`.

No tocar sin revisión: feature visibility, title/description, H1, navegación entre signos.

### `/tarot/tres-cartas/trabajo`

Archivos: `src/routes/tarot.tres-cartas.trabajo.tsx`, `src/config/three-card-readings.ts`, `src/components/tarot/experience/ThreeCardExperienceShell.tsx`.

Metadata: config `threeCardReadings.trabajo.seo` y canonical `/tarot/tres-cartas/trabajo`.

Dependencias: `tarotDeckQueryOptions`, experiencia interactiva de tres cartas, server/API de interpretación.

No tocar sin revisión: config SEO de trabajo, slug/canonical, estructura interactiva y carga de deck.

## 10. Hallazgos

### FINDING SEO00-01 — Canonical no universal en rutas relevantes

Severidad: ALTO  
Estado: Abierto  
Evidencia: HTML producción y código. `/` y `/horoscopo` no mostraron `<link rel="canonical">`; ambas rutas usan `buildMeta` sin `canonical`.  
Archivo(s): `src/routes/index.tsx`, `src/routes/horoscopo.index.tsx`, `src/config/seo.ts`  
Símbolo/función: `buildMeta`, route `head()`  
Líneas: `src/routes/index.tsx:5-12`, `src/routes/horoscopo.index.tsx:10-18`, `src/config/seo.ts:169,224-226`  
Comportamiento actual: `buildMeta` emite canonical solo cuando recibe `input.canonical`.  
Riesgo: señales canónicas incompletas en rutas con impresiones Search Console.  
Qué NO hacer todavía: no añadir canonical masivo sin revisar trailing slash, redirects y snapshots HTML.  
Recomendación: SEO-01 debe definir política canonical por tipo de ruta y aplicarla con tests.  
Fase responsable: SEO-01.

### FINDING SEO00-02 — JSON-LD no aparece en HTML inicial

Severidad: MEDIO  
Estado: Abierto  
Evidencia: HTML producción de páginas muestreadas no contiene `application/ld+json`; el componente `StructuredData` usa `useEffect`.  
Archivo(s): `src/components/seo/StructuredData.tsx`, `src/config/seo.ts`  
Símbolo/función: `StructuredData`, `useStructuredData`, `structuredData`  
Líneas: `src/components/seo/StructuredData.tsx:16-41`, `src/config/seo.ts:238-326`  
Comportamiento actual: JSON-LD helper existe, pero no se confirmó uso activo ni SSR.  
Riesgo: rich result/schema no disponible en HTML inicial.  
Qué NO hacer todavía: no inyectar JSON-LD global sin diseñar tipos por página.  
Recomendación: SEO-03/SEO-04 deben decidir schemas por página y render SSR.  
Fase responsable: SEO-03.

### FINDING SEO00-03 — Redirect de host existe en producción pero no en repo

Severidad: MEDIO  
Estado: Abierto  
Evidencia: HEAD a `https://creovision.io/` devuelve 308 hacia `https://www.creovision.io/`; `vercel.json` no tiene redirects.  
Archivo(s): `vercel.json`, configuración externa Vercel/DNS no versionada  
Símbolo/función: configuración de dominio Vercel  
Líneas: `vercel.json:16-86` contiene headers, no redirects.  
Comportamiento actual: el redirect parece gestionado fuera del repo.  
Riesgo: SEO-01 no puede auditar completamente dominio principal solo con código.  
Qué NO hacer todavía: no duplicar redirect en app sin saber configuración Vercel.  
Recomendación: SEO-01 debe pedir/verificar configuración de dominios Vercel antes de tocar redirects.  
Fase responsable: SEO-01.

### FINDING SEO00-04 — Metadata manual de fases lunares sin canonical

Severidad: ALTO  
Estado: Abierto  
Evidencia: `/luna/fases/luna-creciente` no mostró canonical en HTML; ruta usa meta manual.  
Archivo(s): `src/routes/luna.fases.$slug.tsx`  
Símbolo/función: route `head()`  
Líneas: `src/routes/luna.fases.$slug.tsx:32-47`  
Comportamiento actual: title/description/OG/Twitter se generan, canonical no.  
Riesgo: ruta observada en Search Console con impresiones queda sin self-canonical explícito.  
Qué NO hacer todavía: no corregir aislado sin política para todas las fases.  
Recomendación: SEO-01 debe normalizar canonical de fases lunares y cubrir todas las slugs.  
Fase responsable: SEO-01.

### FINDING SEO00-05 — Robots bloquea JSON públicos por patrón amplio

Severidad: MEDIO  
Estado: Abierto  
Evidencia: `public/robots.txt` contiene `Disallow: /*.json$`.  
Archivo(s): `public/robots.txt`  
Símbolo/función: regla robots  
Líneas: `public/robots.txt:104-111` aproximadamente; `Sitemap` en `120`, `Host` en `128`.  
Comportamiento actual: cualquier URL que termine en `.json` queda bloqueada para bots generales.  
Riesgo: puede bloquear recursos públicos JSON si existieran o se añadieran; revisar manifest y assets antes de cambiar.  
Qué NO hacer todavía: no eliminar regla sin inventario de endpoints/assets.  
Recomendación: SEO-02 debe auditar recursos públicos y precisar reglas robots.  
Fase responsable: SEO-02.

## 11. Hipotesis SEO

HIPOTESIS: las rutas con canonical explícito podrían tener señales más claras que rutas sin canonical.  
EVIDENCIA: `/tarot/carta-del-dia`, `/tarot/tres-cartas/trabajo`, `/luna`, `/compatibilidad/geminis/sagitario` muestran canonical; `/` y `/horoscopo` no.  
LIMITACION: Search Console tiene bajo volumen y no demuestra causalidad.  
COMO VALIDAR: tras SEO-01, comparar cobertura/canonical elegida en Search Console durante varias semanas.

HIPOTESIS: JSON-LD SSR podría mejorar elegibilidad para rich results.  
EVIDENCIA: helpers existen pero no aparecen en HTML inicial.  
LIMITACION: no toda página necesita schema y Google no garantiza rich results.  
COMO VALIDAR: implementar schema por plantilla en fase posterior, validar con Rich Results Test y monitorizar.

HIPOTESIS: la presencia de non-www en Search Console corresponde a URLs históricas o a datos antes/durante redirect.  
EVIDENCIA: producción redirige non-www a www con 308 y sitemap/robots/canonical usan www.  
LIMITACION: no se inspeccionó configuración Vercel externa ni datos históricos completos.  
COMO VALIDAR: revisar propiedad/domain settings en Vercel y evolución de canonicalización en Search Console.

## 12. Mapa de riesgos para SEO-01 y SEO-02

SEO-01 debe revisar antes de implementar:

- Dominio primario real en Vercel.
- Redirect host y trailing slash.
- Canonical por ruta estática/dinámica.
- Rutas protegidas y snapshots HTML.
- Ausencia/presencia de canonical en `/`, `/horoscopo`, `/luna/fases/*`.

SEO-02 debe revisar antes de implementar:

- Robots y bloqueo `/*.json$`.
- Cobertura sitemap vs rutas activas por feature flags.
- Rutas ocultas por `notFound` que puedan estar en sitemap.
- Estado de assets/manifest y APIs bloqueadas.

## 13. Archivos que NO deben tocarse sin autorizacion

- `src/config/site.ts`
- `src/config/seo.ts`
- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- `src/routes/horoscopo.index.tsx`
- `src/routes/tarot.carta-del-dia.tsx`
- `src/routes/tarot.tres-cartas.trabajo.tsx`
- `src/routes/compatibilidad.$signA.$signB.tsx`
- `src/routes/luna.index.tsx`
- `src/routes/luna.fases.$slug.tsx`
- `src/routes/sitemap[.]xml.ts`
- `public/robots.txt`
- `vercel.json`
- `vite.config.ts`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/SiteFooter.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/home/*`
- `src/components/tarot/experience/*`

## 14. Pruebas ejecutadas

| Prueba | Comando | Resultado | Observaciones |
|---|---|---|---|
| Estado git inicial | `git status --short` | PASS | Cambios funcionales preexistentes registrados. |
| Branch | `git branch --show-current` | PASS | `feature/fase-2c-general-transit-engine`. |
| Búsqueda arquitectura | `rg --files`, `rg -n ...` | PASS | Localizadas rutas, metadata, sitemap, robots y dominios. |
| HTTP host | `Invoke-WebRequest -Method Head -MaximumRedirection 0` | PASS | non-www 308 hacia www; www 200. |
| HTML SSR | `Invoke-WebRequest` + regex title/canonical/description/H1/JSON-LD | PASS | Title/description/H1 presentes en muestras; canonical parcial; JSON-LD ausente. |
| Sitemap producción | `Invoke-WebRequest https://www.creovision.io/sitemap.xml` | PASS | 137 `<loc>`, `www`, sin non-www detectado. |
| Robots producción | `Invoke-WebRequest https://www.creovision.io/robots.txt` | PASS | Sitemap y Host `www`. |
| Test SEO existente | `npx vitest run src/config/seo-indexability.test.ts` | PASS | 8 tests passed. Warning conocido de route test en árbol. |
| Typecheck | `npx tsc --noEmit` | FAIL_PREEXISTENTE | Falla por errores TS globales no corregidos en SEO-00. |

## 15. Estado final SEO-00

PASS_CON_OBSERVACIONES.

SEO-00 queda completado porque se inspeccionó arquitectura relevante, metadata, canonical, sitemap, robots, redirects, www/non-www, SSR, rutas dinámicas, JSON-LD y páginas protegidas; se crearon los dos Markdown requeridos y no se modificó código funcional.

Observaciones que bloquean implementación directa sin fase posterior:

- Canonical parcial.
- JSON-LD no SSR/no confirmado en uso.
- Redirect de host externo al repo.
- TypeScript global falla por deuda preexistente.
