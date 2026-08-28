# SEO-07A — Arquitectura de enlazado interno de Creovision

Fecha: 2026-08-18
Modo: AUDITORIA_Y_ESPECIFICACION_SIN_IMPLEMENTACION
Estado: PASS_CON_OBSERVACIONES
Agent: Claude Sonnet (Arquitecto SEO de enlazado interno)

> Regla de oro de esta fase:
> NO CAMBIAR CÓDIGO. Esta fase decide qué enlaces ayudan y cuáles no.
> La implementación corresponde a SEO-07B (Codex).

---

## 1. Objetivo

Diseñar una arquitectura controlada de enlazado interno para mejorar descubrimiento,
relación temática, profundidad de navegación, distribución de autoridad interna y
continuidad de usuario, **sin** convertir el sitio en una red artificial de enlaces.

Se auditan los 5 hubs (`/`, `/horoscopo`, `/luna`, `/tarot`, `/compatibilidad`) y sus
páginas hijas prioritarias. Se identifica quién debe recibir autoridad, desde dónde, con
qué anchor y qué páginas **NO** deben recibir enlaces SEO (los fallback demo noindex de
SEO-06D).

Fases previas cerradas: SEO-00 a SEO-06D.

---

## 2. Estado heredado

| Fase    | Estado     |
| ------- | ---------- |
| SEO-00  | COMPLETADO |
| SEO-01  | COMPLETADO |
| SEO-02  | COMPLETADO |
| SEO-03  | COMPLETADO |
| SEO-04  | COMPLETADO |
| SEO-05  | COMPLETADO |
| SEO-06  | COMPLETADO |
| SEO-06D | COMPLETADO |

- Páginas protegidas (HARD/SOFT freeze, contrato SEO-03):
  `/`, `/tarot/carta-del-dia`, `/horoscopo`, `/tarot/tres-cartas/trabajo`.
- Páginas optimizadas: `/luna`, `/tarot/tres-cartas`, `/compatibilidad/geminis/sagitario`.
- Pares de compatibilidad indexables (SEO-06D-B): `geminis__sagitario`,
  `cancer__capricornio`, `aries__libra`.
- Política demo: `noindex,follow`, self-canonical, excluidos del sitemap.

Frontera obligatoria heredada de SEO-06D:
Solo los pares de `INDEXABLE_COMPATIBILITY_PAIR_KEYS` pueden ser destinos SEO indexables.
Cualquier par que solo resuelva por fallback demo permanece 200 + `noindex,follow` y NO
debe recibir enlaces internos creados con propósito SEO.

---

## 3. Inventario de hubs

| Hub            | Ruta              | Rol                                       | Estado enlazado                                                 |
| -------------- | ----------------- | ----------------------------------------- | --------------------------------------------------------------- |
| Home           | `/`               | Landing global + hub de verticales        | HARD_FREEZE. Ya enlaza a tarot, horóscopo, luna, compatibilidad |
| Horóscopo      | `/horoscopo`      | Hub de horóscopo                          | Enlaza 12 signos + 3 periodos. Sin conexión con compatibilidad  |
| Luna           | `/luna`           | HUB_LUNAR (HYBRID_CURRENT_STATE_PLUS_HUB) | SEO-04 ya lo cerró. Clúster lunar bien conectado                |
| Tarot          | `/tarot`          | Hub de tarot                              | Enlaza carta del día, sí/no, tres cartas + variantes            |
| Compatibilidad | `/compatibilidad` | Hub de compatibilidad                     | Selector de producto + pares publicados de DB                   |

---

## 4. Inventario de páginas prioritarias

| Ruta                                    | Rol actual                  |
| --------------------------------------- | --------------------------- |
| `/`                                     | Landing global (protegida)  |
| `/horoscopo`                            | Hub horóscopo (protegida)   |
| `/horoscopo/hoy` `/semana` `/mes`       | Vistas globales por periodo |
| `/horoscopo/$sign` (12)                 | Vista por signo             |
| `/luna`                                 | Hub lunar (optimizada)      |
| `/luna/hoy`                             | Luna de hoy factual         |
| `/luna/calendario`                      | Calendario lunar            |
| `/luna/fases` + `/luna/fases/$slug` (8) | Fases lunares               |
| `/luna/tu-luna-de-hoy`                  | Lectura lunar personalizada |
| `/tarot`                                | Hub tarot                   |
| `/tarot/carta-del-dia`                  | Carta del día (protegida)   |
| `/tarot/tres-cartas`                    | Tirada general (optimizada) |
| `/tarot/tres-cartas/trabajo`            | Tirada trabajo (protegida)  |
| `/tarot/tres-cartas/amor` `/decision`   | Tiradas temáticas           |
| `/tarot/si-o-no`                        | Sí o no                     |
| `/compatibilidad`                       | Hub compatibilidad          |
| `/compatibilidad/geminis/sagitario`     | Par indexable (optimizado)  |
| `/compatibilidad/cancer/capricornio`    | Par indexable               |
| `/compatibilidad/aries/libra`           | Par indexable               |

Otras rutas indexables relevantes (no ampliar la fase a cada URL): `/tarot/cartas` (biblioteca)
y `/tarot/cartas/$card` (fichas individuales); `/guias` y `/temas` (editorial). Se documentan
pero no reciben refuerzo específico en SEO-07A.

---

## 5. Clasificación A/B/C/DO_NOT_PUSH

| Ruta                                                 | Prioridad   | Rol                         | Razón                              | Recibe enlaces                      | Emite enlaces                            |
| ---------------------------------------------------- | ----------- | --------------------------- | ---------------------------------- | ----------------------------------- | ---------------------------------------- |
| `/`                                                  | PRIORITY_A  | Landing global              | Protegida; distribuye a verticales | Nav/logo + sitemap                  | A tarot, horóscopo, luna, compatibilidad |
| `/horoscopo`                                         | PRIORITY_A  | Hub horóscopo               | Protegida; hub claro               | Nav + Home + footer? (ver §15)      | 12 signos + 3 periodos                   |
| `/luna`                                              | PRIORITY_A  | HUB_LUNAR                   | Optimizada SEO-04                  | Nav + Home                          | 4 subrutas + 8 fases                     |
| `/tarot/tres-cartas`                                 | PRIORITY_A  | TOOL_FIRST                  | Optimizada SEO-05                  | Nav + Tarot hub + Home              | NBA (horóscopo/carta)                    |
| `/compatibilidad/geminis/sagitario`                  | PRIORITY_A  | ANSWER_FIRST_PLUS_DEEP_DIVE | Optimizada SEO-06                  | Sitemap + hub (DB) + Home selector  | Alternativas + NBA                       |
| `/horoscopo/hoy` `/semana` `/mes`                    | PRIORITY_B  | Hijas de hub                | Descubrimiento por periodo         | Hub horóscopo + nav dropdown        | Sign anchors                             |
| `/horoscopo/$sign` (12)                              | PRIORITY_B  | Entidades zodiacales        | Cluster interno                    | Hub horóscopo + Home ZodiacSelector | Period tabs + prev/next + NBA            |
| `/tarot/carta-del-dia`                               | PRIORITY_B  | Producto diario             | Protegida                          | Home hero + Tarot hub + NBA         | NBA (horóscopo/carta)                    |
| `/tarot/tres-cartas/trabajo`                         | PRIORITY_B  | Tirada trabajo              | Protegida                          | Home featured + Tarot hub + nav     | NBA                                      |
| `/tarot/tres-cartas/amor` `/decision`                | PRIORITY_B  | Tiradas temáticas           | Indexables                         | Home featured + Tarot hub           | NBA                                      |
| `/luna/hoy` `/calendario` `/fases` `/tu-luna-de-hoy` | PRIORITY_B  | Hijas hub lunar             | Cluster lunar                      | Hub `/luna`                         | Retorno vía nav/breadcrumb               |
| `/tarot`                                             | PRIORITY_B  | Hub tarot                   | Hub                                | Nav + Home ("Ver tarot")            | A todas sus hijas                        |
| `/compatibilidad`                                    | PRIORITY_B  | Hub compatibilidad          | Selector                           | Nav                                 | Selector + pares publicados              |
| `/compatibilidad/cancer/capricornio` `/aries/libra`  | PRIORITY_B  | Pares indexables            | P2: reforzar desde hub/signos      | Sitemap + hub (DB)                  | Alternativas + NBA                       |
| `/luna/fases/$slug` (8)                              | PRIORITY_C  | Fichas fase                 | Indexables sin refuerzo especial   | Hub `/luna` (grid) + `/luna/fases`  | Retorno a `/luna/fases`                  |
| `/tarot/si-o-no`                                     | PRIORITY_C  | Herramienta simple          | Indexable                          | Tarot hub                           | NBA (tres cartas/carta)                  |
| `/tarot/cartas` `/tarot/cartas/$card`                | PRIORITY_C  | Biblioteca                  | Indexables                         | Tarot hub + NBA                     | Retorno biblioteca                       |
| Pares fallback demo (cualquier otro par)             | DO_NOT_PUSH | UX de producto              | noindex,follow                     | **Nunca por SEO**                   | N/A                                      |
| `/buscar`                                            | DO_NOT_PUSH | noindex                     | Excluida sitemap                   | N/A                                 | N/A                                      |

---

## 6. Orphan analysis

| Ruta                                                 | Links entrantes detectados                                                                  | Riesgo de aislamiento | Acción                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `/compatibilidad/cancer/capricornio`, `/aries/libra` | Sitemap + hub (via DB `featured`) + Home selector (dinámico). No enlace estático editorial. | Medio                 | P2: exponer desde signos relacionados cuando el par sea natural (§12)  |
| `/tarot/si-o-no`                                     | Solo Tarot hub                                                                              | Bajo-medio            | P2/NONE: ya es herramienta secundaria                                  |
| `/tarot/cartas/$card` (78)                           | Biblioteca + NBA "Explorar esta carta" + sitemap                                            | Medio (son 78)        | NONE ahora; no ampliar fase                                            |
| `/luna/fases/$slug` (8)                              | Hub `/luna` (grid) + `/luna/fases`                                                          | Bajo                  | NONE                                                                   |
| `/tarot/tres-cartas`                                 | Nav + Tarot hub hero + sitemap                                                              | Bajo                  | NONE                                                                   |
| `/compatibilidad/geminis/sagitario`                  | Sitemap + Home selector + hub (si DB lo devuelve)                                           | Bajo-medio            | P1: reforzar desde `/horoscopo/geminis` y `/horoscopo/sagitario` (§12) |
| Pares de signo en compatibilidad                     | Nav/NBA                                                                                     | Ninguno relevante     | VER §12: falta vínculo signo↔compat indexable                          |

Riesgo principal: los tres pares indexables de compatibilidad dependen de sitemap + selector dinámico
y no tienen vínculo editorial estático desde sus páginas de signo. Esto los deja como "islas"
relativas dentro del clúster zodiacal.

---

## 7. Click depth

Estimación de profundidad desde Home (asumiendo nav global con dropdowns):

| Ruta                                                 | Click depth aprox. | Deseado | Problema                       |
| ---------------------------------------------------- | ------------------ | ------- | ------------------------------ |
| `/`                                                  | 0                  | 0       | —                              |
| `/horoscopo`                                         | 1                  | 1       | OK (nav + Home)                |
| `/horoscopo/hoy` `/semana` `/mes`                    | 1-2                | 1-2     | OK (nav dropdown)              |
| `/horoscopo/$sign`                                   | 1-2                | 1-2     | OK (Home ZodiacSelector + hub) |
| `/luna`                                              | 1                  | 1       | OK                             |
| `/luna/hoy` `/calendario` `/fases` `/tu-luna-de-hoy` | 1-2                | 1-2     | OK                             |
| `/tarot`                                             | 1                  | 1       | OK                             |
| `/tarot/carta-del-dia`                               | 1                  | 1       | OK (Home hero)                 |
| `/tarot/tres-cartas`                                 | 1-2                | 1-2     | OK (nav dropdown)              |
| `/tarot/tres-cartas/trabajo` `/amor` `/decision`     | 1-2                | 1-2     | OK (Home featured)             |
| `/tarot/si-o-no`                                     | 2                  | 2       | OK                             |
| `/tarot/cartas/$card`                                | 3                  | 2-3     | Aceptable                      |
| `/compatibilidad`                                    | 1                  | 1       | OK                             |
| `/compatibilidad/geminis/sagitario`                  | 2                  | 2       | OK por selector/Hub            |

Principio: no forzar que todo esté a 1 clic. Priorizar hubs. La profundidad actual es
razonable; el gap no es de profundidad sino de **relación temática** (signo ↔ compatibilidad).

---

## 8. Home

Protección: HARD_FREEZE.

Enlaces actuales (componente → destino → anchor):

| Componente              | Destino                       | Anchor                    |
| ----------------------- | ----------------------------- | ------------------------- |
| HomeHero primary        | `/tarot/carta-del-dia`        | "Sacar mi carta de hoy"   |
| HomeHero secondary      | `/horoscopo/hoy`              | "Ver mi horóscopo de hoy" |
| ZodiacSelector          | `/horoscopo/$sign` (12)       | símbolo + nombre          |
| DailyInsightSection     | `/horoscopo/$sign`            | "Leer mi horóscopo"       |
| DailyInsightSection     | `/luna/tu-luna-de-hoy`        | "Consultar mi luna"       |
| DailyInsightSection     | `/luna/hoy`                   | "Ver Luna de hoy"         |
| DailyInsightSection     | `/tarot/carta-del-dia`        | "Carta del día"           |
| CompatibilitySection    | par elegido (selector)        | "Ver compatibilidad"      |
| FeaturedReadingsSection | `/tarot`                      | "Ver tarot"               |
| FeaturedReadingsSection | `/tarot/tres-cartas/amor`     | "Comenzar tirada"         |
| FeaturedReadingsSection | `/tarot/tres-cartas/trabajo`  | "Comenzar tirada"         |
| FeaturedReadingsSection | `/tarot/tres-cartas/decision` | "Comenzar tirada"         |
| PersonalSpaceSection    | `/mi-espacio`                 | "Abrir mi espacio"        |

Decisión: KEEP. Home ya cubre tarot diario, horóscopo hoy, horóscopo por signo, luna,
compatibilidad (selector) y tiradas temáticas. No hay gap crítico que justifique tocar una
página HARD_FREEZE.

`home_navigation: KEEP`.

---

## 9. Horóscopo

### Hub `/horoscopo`

- Enlaza `HoroscopePeriodTabs` + 3 cards de periodo (`/horoscopo/hoy`, `/semana`, `/mes`)
  con anchor `Ver hoy` / `Ver semana` / `Ver mes`.
- Enlaza los 12 signos mediante `zodiacRoute(s.slug)` con anchor `s.name` (y símbolo). Sección "Elige tu signo".
- NO enlaza compatibilidad, luna ni tarot. Es correcto: es un hub de horóscopo.

### Signo `/horoscopo/$sign`

- `HoroscopePeriodTabs` (linkMode sign): enlaza periodos del propio signo.
- Nav prev/next: enlaza signo anterior/siguiente.
- `SignQuickSelector`: enlaza los 12 signos.
- NBA (`source: horoscope`): Carta del Día / Tu Luna de Hoy.

### Periodo `/horoscopo/hoy|semana|mes`

- `HoroscopeCard` enlaza a cada signo vía `zodiacRoute`.
- `SignQuickSelector` enlaza los 12 signos.

### Pregunta especial: ¿enlazar signos hacia compatibilidades indexables?

Sí, tiene sentido cuando la pareja está publicada/indexable. Es la conexión natural más
valiosa pendiente:

- `/horoscopo/geminis` → `/compatibilidad/geminis/sagitario`
- `/horoscopo/sagitario` → `/compatibilidad/geminis/sagitario`
- `/horoscopo/cancer` → `/compatibilidad/cancer/capricornio`
- `/horoscopo/capricornio` → `/compatibilidad/cancer/capricornio`
- `/horoscopo/aries` → `/compatibilidad/aries/libra`
- `/horoscopo/libra` → `/compatibilidad/aries/libra`

Restricción: solo si la pareja está en `INDEXABLE_COMPATIBILITY_PAIR_KEYS`.

`horoscope_cluster: SUFFICIENT`. La conexión signo→compat indexable es un cambio
cross-cluster (ver §13 y CHANGE-07B-03), no una deficiencia del clúster interno.

---

## 10. Luna

Estado actual (SEO-04B/04C ya implementado):

- Header CTAs:
  - `Conocer Tu Luna de Hoy` (primary) → `/luna/tu-luna-de-hoy`
  - `Luna de hoy` → `/luna/hoy`
  - `Calendario del mes` → `/luna/calendario`
- `MoonHubPathways` (bloque local): 3 caminos → `/luna/tu-luna-de-hoy`, `/luna/calendario`, `/luna/fases`.
- `MoonHubDynamic`: `MoonTodayCard` (enlaza `/luna/hoy` y fase actual), `NextMoonPhases`,
  enlace `Ver todas en el calendario →` → `/luna/calendario`.
- `MoonPhaseGrid`: 8 fichas → `/luna/fases/$slug`.

Conclusión: el clúster lunar ya está correctamente conectado (hub→hijas) después de SEO-04.
Las hijas retornan vía nav global (breadcrumb visible está desactivado globalmente).

`moon_cluster: SUFFICIENT`. No agregar enlaces adicionales.

---

## 11. Tarot

### Hub `/tarot`

- CTA principal `Elegir mis tres cartas` → `/tarot/tres-cartas`.
- Variantes temáticas: `Amor` → `/tarot/tres-cartas/amor`, `Trabajo` → `/tarot/tres-cartas/trabajo`,
  `Decisiones` → `/tarot/tres-cartas/decision`.
- Acciones rápidas: `Carta del día` → `/tarot/carta-del-dia`, `Sí o no` → `/tarot/si-o-no`.
- `Biblioteca` → `/tarot/cartas`.

### Carta del Día `/tarot/carta-del-dia`

- `TarotDailyExperience` → `TarotPositionResult` con NBA (`source: tarot_daily`): horóscopo/carta.
- Sin enlace explícito a tres cartas ni retorno a hub (breadcrumb null).
- Protegida HARD_FREEZE; no tocar.

### Tres Cartas `/tarot/tres-cartas`

- `TarotThreeCardsPage` + `ThreeCardExperienceShell`.
- Sin enlaces estáticos a amor/trabajo/decision (solo vía Tarot hub).
- Post-tirada: `InteractiveThreeCardResult` con NBA (`source: tarot_three_cards`):
  Horóscopo de hoy / Carta del Día (o personalizado).

### Trabajo `/tarot/tres-cartas/trabajo`

- Protegida HARD_FREEZE. Comparte shell. NBA `source: tarot_three_cards`, `tarotTopic: trabajo`.
- Sin retorno explícito a general/hub (breadcrumb null).

### Preguntas

- ¿General debe enlazar a Trabajo? → NO en primer viewport (first_viewport_rule). La tirada no
  debe ser interrumpida. La variante ya está en Home featured + Tarot hub.
- ¿Trabajo debe enlazar a General? → NO necesario; riesgo de tocar shell compartido.
- ¿Carta del Día debe conducir a Tres Cartas? → El NBA actual conduce a horóscopo/carta; una
  transición a "Tres Cartas" sería aceptable como acción secundaria post-experiencia, pero no
  es prioritaria.

`tarot_cluster: SUFFICIENT`. No tocar shell compartido. No añadir navegación antes de la acción.

---

## 12. Compatibilidad

### Hub `/compatibilidad`

- `CompatibilityPairSelector` (product exploration; puede construir 78 pares).
- `Combinaciones publicadas` desde `compatibilityQueries.featured(6)` →
  `repo.getPublishedPairs(6)` (solo filas DB reales, sin fallback).

### Página de par `/compatibilidad/$signA/$signB`

- `CompatibilityPairSelector` (product exploration).
- `Otras combinaciones relacionadas` desde `loadPairPage` → `alternativePairs`.
  ⚠️ `alternativePairs` se construye con `getPublishedForSign(...)`, que **rellena con
  fallback** (`buildFeaturedFallbackCompatibilityProfiles`) cuando hay pocas filas DB.
  → Este bloque puede enlazar a pares fallback demo (noindex) con intención SEO. RIESGO P0.
- NBA (`source: compatibility`): horóscopo del signo del usuario o `/horoscopo`.
- NO enlaza a `/horoscopo/$signA` ni `/horoscopo/$signB`.

### Hallazgo de discrepancia (importante)

La documentación SEO-06C (CHANGE-06C-02) afirma que `CompatibilityPairPage` ya enlaza a
`/horoscopo/geminis`, `/horoscopo/sagitario` y `/compatibilidad`. **El código actual NO
contiene esos enlaces.** `CompatibilityPairPage.tsx` no importa `zodiacRoute` ni emite ningún
enlace `Horóscopo de ...`. Solo emite:

- `EmptyProfileState` → `/compatibilidad` y `/guias` (solo en estado vacío).
- `alternativePairs` → otros pares.
- selector (product exploration).

Acción: documentar la discrepancia y crear CHANGE-07B-02 para cerrar el gap real.

`compatibility_cluster: NEEDS_CHANGES`.

---

## 13. Cross-cluster links

Evaluación de conexiones naturales entre clústeres:

| Conexión                                   | ¿Existe?                  | Justificación                                  | Decisión       |
| ------------------------------------------ | ------------------------- | ---------------------------------------------- | -------------- |
| Compatibilidad → Horóscopo de cada signo   | NO (discrepancia SEO-06C) | Conecta entidad par con entidades individuales | YES (P1)       |
| Horóscopo signo → Compatibilidad indexable | NO                        | Intención natural al leer un signo             | YES (P1)       |
| Luna → Tu Luna de Hoy                      | SÍ (SEO-04)               | CTA principal                                  | KEEP           |
| Tarot General → Trabajo                    | NO (solo vía hub/Home)    | No interrumpir herramienta                     | NO_CHANGE      |
| Carta del Día → Tres Cartas                | Parcial (vía NBA)         | Next-best-action                               | OPTIONAL/LATER |
| Home → hubs                                | SÍ                        | Hub distribution                               | KEEP           |
| Compatibilidad hub → pares indexables      | Parcial (DB)              | Solo si DB devuelve filas                      | P2             |

No construir una malla donde todo enlace con todo. Las dos conexiones de mayor valor son
**signo ↔ compatibilidad indexable** (ambas direcciones).

---

## 14. NBA

`NextBestAction` (componente) + `getNextBestAction` (config). Mapeo fuente → NBA:

| Página                    | NBA actual                                                | NBA propuesta | Cambio necesario                            |
| ------------------------- | --------------------------------------------------------- | ------------- | ------------------------------------------- |
| Signo/Horóscopo           | Carta del Día / Tu Luna de Hoy (o Descubrir mi Luna)      | KEEP          | NO                                          |
| Luna (`LunarReadingForm`) | Horóscopo de hoy / Guardar lectura                        | KEEP          | NO                                          |
| Carta del Día             | Horóscopo de hoy (o signo) / Explorar esta carta          | KEEP          | NO                                          |
| Tres Cartas               | Horóscopo de hoy / Carta del Día (personalizado por tema) | KEEP          | NO                                          |
| Sí/No                     | Tres Cartas (decision) / Carta del Día                    | KEEP          | NO                                          |
| Compatibilidad            | Ver mi horóscopo de hoy (signo) / Probar otra combinación | KEEP          | NO (la NBA ya regresa al clúster horóscopo) |
| Fase lunar                | Descubrir mi Luna de Hoy                                  | KEEP          | NO                                          |

Conclusión: NBA ya es el mecanismo de continuidad correcto. **No añadir nuevas secciones de
enlaces** donde la NBA ya cumple la función post-experiencia. Los enlaces nuevos de SEO-07B
deben ser contextuales (dentro del contenido) o de retorno a hubs, no duplicar NBA.

---

## 15. Navegación global

- Desktop (`DesktopNavigation` ← `desktopPrimary`): Horóscopo (Hoy/Semana/Mes), Tarot
  (Carta del día/Sí o no/Tres cartas/Tirada de Amor), Astrología, Compatibilidad, Luna
  (Luna de hoy/Calendario lunar), Guías.
- Mobile bottom (`mobileBottomPrimary`): Inicio, Horóscopo, Tarot, Luna, Yo.
- Drawer (`drawerGroups`): Explorar (Horóscopo, Tarot, Astrología, Compatibilidad, Luna,
  Guías), Tu espacio, Aprender, Legal.
- Footer (`footerConfig`): Explorar (Tarot, Luna), Aprender, Tu espacio, Legal.
  Más enlaces duros: Contacto/Privacidad/Cookies/Términos.

Todos los hubs están presentes en desktop + drawer. Compatibilidad y Horóscopo están en
desktop nav y drawer, pero NO en el footer (`footerConfig` "Explorar" solo tiene Tarot y Luna).

Decisión: `global_nav: KEEP`. No asumir que más enlaces globales = mejor SEO. No hay gap
crítico: los hubs ya son alcanzables en un clic.

Decisión: `footer: KEEP`. Añadir Horóscopo/Compatibilidad al footer sería redundante con la
nav y contraviene "no convertir el footer en lista de keywords". Se registra como observación,
no como cambio.

---

## 16. Anchors

Política de anchors para SEO-07B (categorías):

- NATURAL_VARIANT (preferido): `Ver el horóscopo de Géminis`, `Explorar las fases lunares`,
  `Hacer una tirada de tres cartas`, `Ver compatibilidad de Géminis y Sagitario`.
- EXACT_OR_CLOSE (ocasional): `Compatibilidad Géminis y Sagitario`.
- BRANDED_OR_NAV (cuando corresponde): `Horóscopo`, `Tarot`, `Luna`, `Compatibilidad`.
- GENERIC (evitar): `clic aquí`, `leer más`.

Ejemplos a usar en CHANGE-07B:

| Origen → Destino                                             | Anchor exacto propuesto              |
| ------------------------------------------------------------ | ------------------------------------ |
| `/compatibilidad/geminis/sagitario` → `/horoscopo/geminis`   | `Horóscopo de Géminis`               |
| `/compatibilidad/geminis/sagitario` → `/horoscopo/sagitario` | `Horóscopo de Sagitario`             |
| `/horoscopo/geminis` → `/compatibilidad/geminis/sagitario`   | `Compatibilidad Géminis y Sagitario` |

Patrones prohibidos: repetir la misma keyword en cada enlace; enlaces ocultos; anchors
artificiales; bloques tipo SEO footer; 20 enlaces seguidos.

---

## 17. Compatibilidad indexable vs demo

Fuente única verificada: `src/config/compatibility-indexability.ts`.

- `INDEXABLE_COMPATIBILITY_PAIR_KEYS` = `["aries__libra", "cancer__capricornio",
"geminis__sagitario"]`.
- `isIndexableCompatibilityPair(signOne, signTwo)`.
- `indexableCompatibilityPairs()`.

Naturaleza del módulo:

- ES puro (constantes + funciones).
- Importa solo `src/types/compatibility` (tipos) y
  `src/lib/compatibility/normalize-sign-pair` (`createPairKey`, `normalizeSignPair`).
- No importa Supabase ni código server-only.
- **Seguro para importar en cliente.** No hay riesgo de importar código server en cliente.

Búsqueda de duplicación: la constante aparece definida una única vez en
`compatibility-indexability.ts`; sus usos son el test SEO, la ruta de compatibilidad y el
sitemap. NO hay listas hardcodeadas duplicadas de los 3 pares en otros archivos.

`compatibility_pair_source: REUSE_INDEXABLE_COMPATIBILITY_PAIR_KEYS`.

⚠️ Riesgo adicional detectado: `loadPairPage` construye `alternativePairs` con
`getPublishedForSign` que rellena con fallback. En consecuencia, el bloque
`Otras combinaciones relacionadas` de `CompatibilityPairPage` puede enlazar a pares
fallback demo (noindex) con intención SEO. SEO-07B debe filtrar `alternativePairs` por
`isIndexableCompatibilityPair`.

---

## 18. Riesgos de componentes compartidos

| Componente                                                                | Compartido con                | Política                               | Riesgo                             |
| ------------------------------------------------------------------------- | ----------------------------- | -------------------------------------- | ---------------------------------- |
| `NextBestAction` / `getNextBestAction`                                    | Múltiples verticales          | DO_NOT_TOUCH (o REQUIRES_REVIEW)       | Alto                               |
| `navigation.ts` (`desktopPrimary`, `mobileBottomPrimary`, `drawerGroups`) | Header, drawer, footer        | DO_NOT_TOUCH                           | Alto                               |
| `footerConfig`                                                            | Footer global                 | DO_NOT_TOUCH                           | Medio                              |
| `PageShell` / `PageHeader` / `AppBreadcrumbs`                             | Internas + protegidas         | DO_NOT_TOUCH (breadcrumb retorna null) | Alto                               |
| `threeCardReadings` + `ThreeCardExperienceShell`                          | Trabajo/Amor/General/Decisión | DO_NOT_TOUCH                           | Crítico                            |
| `CompatibilityPairPage`                                                   | Todas las combinaciones       | LOCAL_OVERRIDE                         | Alto (pero cambio local es viable) |
| `compatibilityQueries` / `loadPairPage`                                   | Hub + pair                    | SAFE_WITH_REGRESSION                   | Alto                               |
| `supabaseCompatibilityRepository` / `getPublishedForSign`                 | Pair alternatives             | REQUIRES_REVIEW                        | Alto (origina el riesgo P0)        |
| `compatibility-indexability.ts`                                           | SEO-06D, sitemap, SEO-07B     | REUSE (fuente única)                   | Bajo                               |
| `zodiacRoute` / `compatibilityRoute` / `routes`                           | Todo                          | DO_NOT_TOUCH                           | Crítico                            |

Principio: preferir cambios locales (dentro de `CompatibilityPairPage` y `SignHoroscopePage`)
a modificar componentes compartidos o infraestructura.

---

## 19. Matriz origen → destino

| Origen                                 | Destino                              | Tipo                  | Anchor                                | Ubicación                           | Prioridad | Implementar |
| -------------------------------------- | ------------------------------------ | --------------------- | ------------------------------------- | ----------------------------------- | --------- | ----------- |
| `/compatibilidad/*` (pair page)        | `/compatibilidad`                    | CHILD_TO_HUB          | (botón en EmptyState actual)          | estado vacío                        | —         | NO          |
| `/compatibilidad/geminis/sagitario`    | `/horoscopo/geminis`                 | CONTEXTUAL            | `Horóscopo de Géminis`                | cerca del final, antes del selector | P1        | YES         |
| `/compatibilidad/geminis/sagitario`    | `/horoscopo/sagitario`               | CONTEXTUAL            | `Horóscopo de Sagitario`              | cerca del final, antes del selector | P1        | YES         |
| `/compatibilidad/*` (alternativePairs) | solo pares indexables                | RELATED_CONTENT       | título/summary del par                | "Otras combinaciones relacionadas"  | P0        | YES         |
| `/horoscopo/geminis`                   | `/compatibilidad/geminis/sagitario`  | CONTEXTUAL            | `Compatibilidad Géminis y Sagitario`  | bloque discreto post-lectura        | P1        | YES         |
| `/horoscopo/sagitario`                 | `/compatibilidad/geminis/sagitario`  | CONTEXTUAL            | `Compatibilidad Géminis y Sagitario`  | bloque discreto post-lectura        | P1        | YES         |
| `/horoscopo/cancer`                    | `/compatibilidad/cancer/capricornio` | CONTEXTUAL            | `Compatibilidad Cáncer y Capricornio` | bloque discreto post-lectura        | P1        | YES         |
| `/horoscopo/capricornio`               | `/compatibilidad/cancer/capricornio` | CONTEXTUAL            | `Compatibilidad Cáncer y Capricornio` | bloque discreto post-lectura        | P1        | YES         |
| `/horoscopo/aries`                     | `/compatibilidad/aries/libra`        | CONTEXTUAL            | `Compatibilidad Aries y Libra`        | bloque discreto post-lectura        | P1        | YES         |
| `/horoscopo/libra`                     | `/compatibilidad/aries/libra`        | CONTEXTUAL            | `Compatibilidad Aries y Libra`        | bloque discreto post-lectura        | P1        | YES         |
| `/compatibilidad` hub                  | 3 pares indexables                   | HUB_TO_CHILD          | título del par                        | "Combinaciones publicadas"          | P2        | LATER       |
| Home                                   | hubs                                 | GLOBAL_NAV/CONTEXTUAL | varios                                | secciones                           | —         | NO          |
| Tarot hub                              | variantes                            | HUB_TO_CHILD          | Amor/Trabajo/Decisiones               | hero card                           | —         | NO          |
| Luna hub                               | subrutas                             | HUB_TO_CHILD          | Conocer Tu Luna de Hoy, etc.          | header + pathways                   | —         | NO          |
| Footer                                 | Horóscopo/Compatibilidad             | GLOBAL_NAV            | —                                     | footer                              | NO_CHANGE | NO          |

---

## 20. P0 / P1 / P2

| CHANGE | Desde                                    | Hacia                              | Tipo                          | Prioridad | Riesgo                  |
| ------ | ---------------------------------------- | ---------------------------------- | ----------------------------- | --------- | ----------------------- |
| 07B-01 | CompatibilityPairPage (alternativePairs) | filtra a indexables                | RELATED_CONTENT (fix noindex) | P0        | Bajo-medio (local)      |
| 07B-02 | CompatibilityPairPage                    | `/horoscopo/$signA` + `$signB`     | CONTEXTUAL                    | P1        | Bajo (local)            |
| 07B-03 | SignHoroscopePage                        | par indexable que incluya el signo | CONTEXTUAL                    | P1        | Bajo-medio (local)      |
| 07B-04 | Compatibility hub                        | 3 pares indexables garantizados    | HUB_TO_CHILD                  | P2        | Medio (fuente dinámica) |

NO_CHANGE:

- Home (HARD_FREEZE)
- Navegación global (KEEP)
- Footer (KEEP)
- Clúster Luna (SUFFICIENT)
- Clúster Tarot (SUFFICIENT)
- Clúster Horóscopo interno (SUFFICIENT)

---

## 21. CHANGE-07B (especificación cerrada para Codex)

> Cada enlace futuro debe tener origen, destino, anchor, ubicación y motivo.
> No enviar a Codex instrucciones abiertas tipo "mejora el enlazado interno".

### CHANGE-07B-01 — Filtrar alternativas de compatibilidad a pares indexables

OBJETIVO: evitar que el bloque "Otras combinaciones relacionadas" enlace a pares fallback demo
(noindex) con intención SEO.
DESDE: `CompatibilityPairPage` (bloque `alternativePairs`).
HACIA: solo pares de `INDEXABLE_COMPATIBILITY_PAIR_KEYS`.
TIPO_DE_LINK: RELATED_CONTENT (corrección, no link nuevo).
ARCHIVO: `src/pages/compatibility/CompatibilityPairPage.tsx`.
SIMBOLO: `CompatibilityPairPage` (render de `alternativePairs`).
UBICACION_EXACTA: sección `compat-alt` (líneas ~216-238) y/o derivación de datos desde
`loadPairPage`. Recomendado: filtro local en el render, sin tocar el servicio/repositorio.
ANCHOR_EXACTO: no aplica (se conservan `p.title` / `p.summary`).
ESTADO_ACTUAL: `alternativePairs` viene de `getPublishedForSign(...)` que rellena con fallback
(`buildFeaturedFallbackCompatibilityProfiles`), pudiendo incluir pares demo noindex.
CAMBIO_EXACTO: filtrar `alternativePairs` antes de pintar:
`safeAlternativePairs = alternativePairs.filter((p) => isIndexableCompatibilityPair(p.signA, p.signB))`
y renderizar esa lista.
COMPONENTE_COMPARTIDO: importar `isIndexableCompatibilityPair` desde
`@/config/compatibility-indexability` (módulo cliente-safe, ver §17).
NO_CAMBIAR: servicio `compatibility.service.ts`, repositorio, fallback, selector, NBA, metadata.
TEST: render de un par demo no muestra alternativas no indexables; los pares indexables sí pueden aparecer.
RIESGO: bajo-medio. Cambio local.
ROLLBACK: eliminar filtro.

### CHANGE-07B-02 — Enlaces contexto a horóscopos de signo desde el par de compatibilidad

OBJETIVO: cerrar la discrepancia de SEO-06C y conectar la entidad par con las entidades signo.
DESDE: `CompatibilityPairPage`.
HACIA: `/horoscopo/$signA` y `/horoscopo/$signB` (usar `zodiacRoute(normalized.sign_a/sign_b)`).
TIPO_DE_LINK: CONTEXTUAL.
ARCHIVO: `src/pages/compatibility/CompatibilityPairPage.tsx`.
SIMBOLO: `CompatibilityPairPage`.
UBICACION_EXACTA: cerca del final, tras `CompatibilityContextsList` y antes del selector
`Prueba otra combinación`, en un bloque corto (p. ej. heading `También puedes mirar cada signo
por separado` o dos enlaces discretos).
ANCHOR_EXACTO: `Horóscopo de Géminis`, `Horóscopo de Sagitario` (dinámicos según
`metaA.name` / `metaB.name`). Se recomienda `Horóscopo de ${metaA.name}` y `Horóscopo de ${metaB.name}`.
ESTADO_ACTUAL: no existen esos enlaces (SEO-06C los documentó como existentes; el código no los tiene).
CAMBIO_EXACTO: agregar dos `Link` usando `zodiacRoute(normalized.sign_a)` y
`zodiacRoute(normalized.sign_b)`.
COMPONENTE_COMPARTIDO: ninguno (local). Usar `zodiacRoute` de `@/config/routes`.
NO_CAMBIAR: selector, alternatives (salvo CHANGE-07B-01), NBA, metadata.
TEST: presencia de enlaces válidos a `/horoscopo/geminis` y `/horoscopo/sagitario` en el par objetivo;
regresión en `cancer/capricornio` y `aries/libra`.
RIESGO: bajo (local).
ROLLBACK: eliminar bloque.

### CHANGE-07B-03 — Enlace contexto desde página de signo a compatibilidad indexable

OBJETIVO: conectar cada signo con su par de compatibilidad indexable publicado.
DESDE: `SignHoroscopePage` (solo para signos con par indexable).
HACIA: el par indexable que incluya ese signo.
TIPO_DE_LINK: CONTEXTUAL.
ARCHIVO: `src/pages/horoscope/SignHoroscopePage.tsx`.
SIMBOLO: `SignHoroscopePage`.
UBICACION_EXACTA: tras el `article` del horóscopo y antes o después de la nav prev/next,
o como bloque discreto cerca del final.
ANCHOR_EXACTO: `Compatibilidad Géminis y Sagitario` (patrón:
`Compatibilidad ${metaA.name} y ${metaB.name}`).
Mapeo:

- `geminis` ↔ `sagitario` → `/compatibilidad/geminis/sagitario`
- `cancer` ↔ `capricornio` → `/compatibilidad/cancer/capricornio`
- `aries` ↔ `libra` → `/compatibilidad/aries/libra`
  ESTADO_ACTUAL: no existe conexión signo → compatibilidad.
  CAMBIO_EXACTO: derivar el par indexable para `sign.slug` desde `indexableCompatibilityPairs()`
  en una constante/helper local (no nueva lista hardcodeada independiente) y pintar un `Link`
  condicional usando `compatibilityRoute(pair.signA, pair.signB)`.
  COMPONENTE_COMPARTIDO: ninguno (local). Usar `indexableCompatibilityPairs` y `compatibilityRoute`.
  NO_CAMBIAR: `/horoscopo` hub, metadata, tabs, prev/next, NBA de signo.
  TEST: signo `geminis` enlaza a `/compatibilidad/geminis/sagitario`; signo sin par indexable
  (p. ej. `tauro`) no enlaza nada; destinos existen.
  RIESGO: bajo-medio (local).
  ROLLBACK: eliminar bloque condicional.

### CHANGE-07B-04 — Garantizar visibilidad de los 3 pares indexables desde el hub (P2, LATER)

OBJETIVO: asegurar que `/compatibilidad` siempre exponga los 3 pares indexables aunque la DB
devuelva menos filas.
DESDE: `CompatibilityHubPage`.
HACIA: 3 pares de `INDEXABLE_COMPATIBILITY_PAIR_KEYS`.
TIPO_DE_LINK: HUB_TO_CHILD.
ARCHIVO: `src/pages/compatibility/CompatibilityHubPage.tsx` (o servicio con regresión).
SIMBOLO: `CompatibilityHubPage` / `compatibilityQueries.featured`.
UBICACION_EXACTA: sección `compat-featured`.
ESTADO_ACTUAL: `featured(6)` usa `getPublishedPairs` (solo DB real, sin fallback). Si DB tiene
pocas filas, el hub puede no mostrar los pares indexables.
CAMBIO_EXACTO: si se implementa, mezclar/mostrar `indexableCompatibilityPairs()` como respaldo
o lista garantizada, preservando el selector libre.
COMPONENTE_COMPARTIDO: `compatibilityQueries` (SAFE_WITH_REGRESSION).
NO_CAMBIAR: selector (product exploration), metadata, canonical.
TEST: hub muestra al menos los 3 indexables; no muestra demos.
RIESGO: medio (fuente dinámica/DB). Clasificación P2; puede esperar.
ROLLBACK: restaurar solo-DB.

---

## 22. Tests

Mandatorios (diseño):

- route_validity: todos los destinos de 07B existen (usar `routes`, `zodiacRoute`,
  `compatibilityRoute`); test de `compatibilityRoute` y `zodiacRoute`.
- protected_pages: Home, `/horoscopo`, `/tarot/carta-del-dia`, `/tarot/tres-cartas/trabajo`
  intactos. Verificar que 07B no toca esos archivos.
- compatibility: solo pares de `INDEXABLE_COMPATIBILITY_PAIR_KEYS` se usan en links SEO;
  fallback demos NO aparecen en bloques SEO (`alternativePairs` filtrado).
- regression: `npx --yes vitest run src/config/seo-indexability.test.ts` → PASS (baseline 26).

Opcionales:

- test de link presence en `CompatibilityPairPage` (enlaces a signos) si hay utilidad de render.
- test de link presence en `SignHoroscopePage` (enlace a par indexable) si procede.

Nota: no mezclar structured data (SEO-09) ni reescritura de titles/descriptions/copy (SEO-08)
con esta fase.

---

## 23. Riesgos

1. **alternativePairs con fallback demo (P0)**: bloque "Otras combinaciones relacionadas"
   puede enlazar pares noindex. Se resuelve con CHANGE-07B-01.
2. **Discrepancia SEO-06C**: enlaces a signo en `CompatibilityPairPage` están documentados
   pero no existen. Se resuelve con CHANGE-07B-02.
3. **Tocar shell tarot compartido**: prohibido. Lo cambios se limitan a compatibilidad y signo.
4. **Tocar páginas protegidas**: prohibido. Home, `/horoscopo` (hub), `/tarot/carta-del-dia`,
   `/tarot/tres-cartas/trabajo` no se modifican en SEO-07B.
5. **OverrideTypeScript global**: deuda preexistente; no resolver en esta fase.
6. **Doble fuente de pares indexables**: mitigado; se reutiliza `compatibility-indexability.ts`.
   No crear una segunda lista de 3 pares en otro archivo.

---

## 24. Rollback

Rollback global de SEO-07B (cuando Codex implemente):

1. Revertir `CompatibilityPairPage` (quitar filtro de `alternativePairs` y bloque de enlaces a signos).
2. Revertir `SignHoroscopePage` (quitar bloque de enlace a compatibilidad).
3. Revertir `CompatibilityHubPage` si se aplicó 07B-04.
4. No revertir fases previas (SEO-04/05/06/06D).
5. Reejecutar `npx --yes vitest run src/config/seo-indexability.test.ts`.

---

## 25. Estado SEO-07A

PASS_CON_OBSERVACIONES.

Decisiones finales:

| Decisión                  | Valor                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| home_navigation           | KEEP                                                               |
| global_nav                | KEEP                                                               |
| footer                    | KEEP                                                               |
| moon_cluster              | SUFFICIENT                                                         |
| tarot_cluster             | SUFFICIENT                                                         |
| horoscope_cluster         | SUFFICIENT                                                         |
| compatibility_cluster     | NEEDS_CHANGES                                                      |
| compatibility_pair_source | REUSE_INDEXABLE_COMPATIBILITY_PAIR_KEYS                            |
| protected_page_changes    | MINIMAL (solo compatibilidad y signo; páginas protegidas intactas) |

Estado fases:

- SEO-07A: COMPLETADO.
- SEO-07B: COMPLETADO.
- SEO-08: PENDIENTE.

No se modificó código funcional en SEO-07A.

---

## 26. SEO-07B — Implementación controlada — 2026-08-18

Modo: IMPLEMENTACION_CERRADA.  
Estado: PASS_CON_OBSERVACIONES.

### Alcance implementado

Se implementaron exclusivamente los cambios autorizados:

- CHANGE-07B-01: `alternativePairs` en `CompatibilityPairPage` se filtra con
  `filterIndexableAlternativePairs(...)`, que deriva su decisión de
  `isIndexableCompatibilityPair(...)`.
- CHANGE-07B-02: `CompatibilityPairPage` añade enlaces contextuales a
  `Horóscopo de ${metaA.name}` y `Horóscopo de ${metaB.name}` usando `zodiacRoute(...)`.
- CHANGE-07B-03: `SignHoroscopePage` añade un enlace contextual condicional a la compatibilidad
  indexable del signo usando `getIndexableCompatibilityPairForSign(...)` y
  `compatibilityRoute(...)`.

CHANGE-07B-04 permanece P2/LATER y no fue implementado.

### Archivos modificados

- `src/config/compatibility-internal-links.ts`
- `src/pages/compatibility/CompatibilityPairPage.tsx`
- `src/pages/horoscope/SignHoroscopePage.tsx`
- `src/config/seo-indexability.test.ts`
- `docs/seo-search-console-2026/07_ENLAZADO_INTERNO.md`
- `docs/seo-search-console-2026/README.md`

### Fuente única de pares enlazables

No se creó una segunda lista hardcodeada de pares. El nuevo helper
`src/config/compatibility-internal-links.ts` reutiliza:

- `isIndexableCompatibilityPair(...)`
- `indexableCompatibilityPairs()`

ambos desde `src/config/compatibility-indexability.ts`.

### Validación

`npx --yes vitest run src/config/seo-indexability.test.ts` — PASS, 29 tests.

`npm run build` — PASS en ejecución capturada.

`npx tsc --noEmit --pretty false` — FAIL preexistente permitido. El filtro aplicado no muestra
errores en `src/config/compatibility-internal-links.ts`,
`src/pages/compatibility/CompatibilityPairPage.tsx` ni
`src/pages/horoscope/SignHoroscopePage.tsx`; se mantiene el error conocido de tipos de `vitest`
en `src/config/seo-indexability.test.ts`.

### No modificado

No se modificaron Home, `/horoscopo` hub, Tarot, Luna, navegación global, footer,
NextBestAction, PageShell, PageHeader global, metadata, title, description, canonical, sitemap,
robots, JSON-LD, repositorio de compatibilidad, fallback ni selector de producto.
