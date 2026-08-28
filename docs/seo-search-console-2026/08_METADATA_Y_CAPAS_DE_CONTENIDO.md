# SEO-08A — Auditoría de titles, descriptions y capas de contenido

Fecha: 2026-08-18
Modo: AUDITORIA_Y_ESPECIFICACION_SIN_IMPLEMENTACION
Estado: PASS_CON_OBSERVACIONES
Agent: Claude Sonnet (Arquitecto SEO editorial y auditor semántico)

> Regla de oro de esta fase:
> NO CAMBIAR CÓDIGO. Auditar, conservar lo que funciona y priorizar únicamente gaps demostrables.
> La implementación corresponde a SEO-08B (Codex). SEO-08C (Antigravity) solo si existe trabajo visual/editorial.

---

## 1. Objetivo

Auditar title, meta description, H1 y capas editoriales de las rutas públicas prioritarias de Creovision tras SEO-00…SEO-07, identificando únicamente gaps demostrables de:

- intención,
- claridad,
- diferenciación,
- alineación metadata-contenido,
- contenido insuficiente,
- contenido redundante,
- jerarquía semántica.

No se reescribe por estilo. No se reabren páginas protegidas/optimizadas salvo problema concreto probado.

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
| SEO-07  | COMPLETADO |

Páginas protegidas (HARD/SOFT freeze, contrato SEO-03): `/`, `/tarot/carta-del-dia`, `/horoscopo`, `/tarot/tres-cartas/trabajo`.

Páginas optimizadas: `/luna`, `/tarot/tres-cartas`, `/compatibilidad/geminis/sagitario`.

Pares de compatibilidad indexables (SEO-06D-B): `aries__libra`, `cancer__capricornio`, `geminis__sagitario`.

---

## Metodología

- Se leyó íntegra la documentación SEO previa (README + 03/04/05/06/07) y se tomó `git status --short` antes y después, registrando los cambios preexistentes.
- Se auditó la fuente real de metadata (`seo.ts` `buildMeta`, `head()` de cada ruta, configs editoriales `horoscope.ts` / `moon.ts` / `three-card-readings.ts` / `compatibility.ts` / `editorial.ts`, helpers `routes.ts`) y los contenidos SSR/DB por familia (repositorios y migraciones seed).
- Por cada ruta se verificó: title y description exactos, canonical, robots, H1 y su fuente, intro, intención, capas ANSWER/DEPTH/ACTION y su orden. Las longitudes de titles/descriptions están dentro de rangos convencionales y ningún cambio se recomienda por longitud.
- Para las familias dinámicas (12 signos, 8 fases, 78 cartas, pares de compatibilidad) se evaluó la plantilla y la fuente de diferenciación antes de recomendar cambios URL por URL.
- Toda decisión KEEP/CHANGE/REVIEW_LATER, P0/P1/P2, SUFFICIENT/GAP y responsable (CODEX/ANTIGRAVITY/CLAUDE_REVIEW/NONE) se fundamenta en evidencia de archivo/código/seed, con causalidad de ranking NO demostrada (volumen bajo).

---

## 3. Git status

Al iniciar SEO-08A (`git status --short`) el worktree ya contenía cambios preexistentes de fases previas y trabajo no-SEO. No se introdujo ningún cambio funcional en SEO-08A.

Cambios preexistentes relevantes (no atribuibles a esta fase):

- `M src/routes/*` (horóscopo, luna, tarot, compatibilidad, sitemap, guías, index, etc.)
- `?? docs/` (documentación SEO previa)
- `?? src/config/compatibility-indexability.ts` (SEO-06D-B)
- `?? src/config/compatibility-internal-links.ts` (SEO-07B)
- Múltiples `M` en `src/pages/*`, `src/components/account/*`, `src/lib/*` (trabajo ajeno a SEO).

SEO-08A solo agrega al cierre: `docs/seo-search-console-2026/08_METADATA_Y_CAPAS_DE_CONTENIDO.md` y actualiza `README.md`.

---

## 4. Fuente real de metadata

- `src/config/seo.ts` — `buildMeta()` es la fuente única de meta tags (title, description, og, twitter, canonical, robots). HARD_FREEZE por SEO-03.
- `src/config/seo.ts` — `seoDefaults` (título/descripción por defecto con "2026", keywords estratégicas y "carta astral/ascendente"). Por defecto global; solo `seoDefaults.defaultDescription` se consume como fallback en `buildMeta` cuando una ruta no pasa `description`.
- `src/config/seo.ts` — `seoTemplates` (templates por keyword) está definido pero **no es usado por ninguna ruta**. Dead code.
- `src/config/site.ts` — `siteConfig.name = "Creovision"`, `siteConfig.url = "https://www.creovision.io"`, `siteConfig.locale = "es-ES"`, `siteConfig.description` (editorial).
- `src/routes/__root.tsx` — `<html lang={siteConfig.locale}>` = `es-ES` (correcto). El title/document base es hardcoded `"Creovision — Tarot, luna y guías simbólicas"`; no hay `titleTemplate` global aplicado.
- `src/config/routes.ts` — registro `routes` + helpers dinámicos `zodiacRoute`, `moonPhaseRoute`, `tarotCardRoute`, `categoryRoute`, `articleRoute`, etc.
- Configs editoriales por familia: `src/config/horoscope.ts`, `src/config/moon.ts`, `src/config/three-card-readings.ts`, `src/config/compatibility.ts`, `src/config/editorial.ts`.

Conclusión: la metadata de cada ruta es, salvo excepciones señaladas abajo, correcta, específica y alineada con el contenido real. No hay campaña de reescritura necesaria.

---

## 5. Matriz global

| Ruta                                 | Title  | Description  | H1   | Contenido       | Prioridad      | Responsable   |
| ------------------------------------ | ------ | ------------ | ---- | --------------- | -------------- | ------------- |
| `/horoscopo/hoy`                     | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/horoscopo/semana`                  | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/horoscopo/mes`                     | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/horoscopo/$sign`                   | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/luna/hoy`                          | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/luna/calendario`                   | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/luna/fases`                        | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/luna/fases/$slug`                  | CHANGE | CHANGE       | KEEP | SUFFICIENT      | P1             | CODEX         |
| `/luna/tu-luna-de-hoy`               | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/tarot`                             | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/tarot/si-o-no`                     | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/tarot/tres-cartas/amor`            | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/tarot/tres-cartas/decision`        | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/tarot/cartas`                      | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/tarot/cartas/$card`                | KEEP   | REVIEW_LATER | KEEP | SUFFICIENT *    | P0 (cobertura) | CODEX         |
| `/compatibilidad`                    | KEEP   | KEEP         | KEEP | SUFFICIENT      | NO_CHANGE      | NONE          |
| `/compatibilidad/cancer/capricornio` | KEEP   | REVIEW_LATER | KEEP | SUFFICIENT      | P2             | CLAUDE_REVIEW |
| `/compatibilidad/aries/libra`        | KEEP   | REVIEW_LATER | KEEP | SUFFICIENT      | P2             | CLAUDE_REVIEW |
| `/guias`                             | KEEP   | KEEP         | KEEP | SUBSTANTIAL_GAP | P1 (defer)     | CODEX         |
| `/temas/$category`                   | KEEP   | KEEP         | KEEP | SUBSTANTIAL_GAP | P1 (defer)     | CODEX         |

`*` Contenido único real por carta en DB, pero solo 8 de 78 son alcanzables por `parseParams` (ver §10.3).

---

## 6. Horóscopo

Decision final: **SUFFICIENT**.

| Ruta                | Title (verbatim)                      | Description (verbatim)                                                         | H1 (verbatim / fuente)                                          |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `/horoscopo/hoy`    | `Horóscopo de hoy — Creovision`       | `Tendencia diaria por signo, con foco, ánimo y energía.`                       | `Horóscopo de hoy` (config `horoscopePeriods.daily.label`)      |
| `/horoscopo/semana` | `Horóscopo de la semana — Creovision` | `Panorama semanal con las claves para cada signo.`                             | `Horóscopo de la semana` (config `weekly.label`)                |
| `/horoscopo/mes`    | `Horóscopo del mes — Creovision`      | `Lectura mensual con los tránsitos más relevantes.`                            | `Horóscopo del mes` (config `monthly.label`)                    |
| `/horoscopo/$sign`  | `${name} — Horóscopo · Creovision`    | `Horóscopo diario, semanal y mensual para ${name}, con foco, ánimo y energía.` | `${sign.name} — ${def.label.toLowerCase()}` (SignHoroscopePage) |

Fuente de contenido: `src/lib/horoscope/repository.ts` (`getLatestHoroscope`). Los `horoscopePeriods` (label/description) viven en `src/config/horoscope.ts` y son la fuente única del H1/description de las vistas Hoy/Semana/Mes.

- Title/H1/description de Hoy/Semana/Mes: relación clara, sin stuffing, sin promesas falsas. KEEP.
- `/horoscopo/$sign`: la metadata es **suficientemente específica** (incluye el nombre del signo) y el H1 refleja signo + periodo. La description "diario, semanal y mensual" describe fielmente los tabs que la página ofrece. No hay gap demostrable.
- Capas: ANSWER (resumen + foco/ánimo/energía del signo), DEPTH (Amor/Trabajo/Bienestar + número/color), ACTION (compatibilidad destacada + NBA + prev/next + selector de signo). El orden es adecuado.

---

## 7. Luna

Decision final: **TARGETED_CHANGES** (solo metadata de ficha de fase).

| Ruta                | Title                              | Description                                                                                                 | H1                    | Estado            |
| ------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------- | ----------------- |
| `/luna/hoy`         | `Luna de hoy — Creovision`         | `Fase, iluminación, edad lunar y próxima fase mayor calculadas para hoy con un motor astronómico validado.` | `Luna de hoy`         | KEEP              |
| `/luna/fases`       | `Las 8 fases lunares — Creovision` | `Índice completo de las ocho fases del ciclo lunar: astronomía y lectura simbólica.`                        | `Las 8 fases lunares` | KEEP              |
| `/luna/fases/$slug` | `${meta.label} — Creovision`       | `${meta.label}: astronomía y lectura simbólica en Creovision.`                                              | `${meta.label}`       | CHANGE (metadata) |

`/luna` queda protegida/optimizada (SEO-04) y no se reabre. `/luna/calendario` y `/luna/tu-luna-de-hoy` no presentan gap.

### Hallazgo (P1) — `/luna/fases/$slug` ignora `seo_title`/`seo_description`

La ficha de fase genera metadata parametrizada débil desde el label:

- title: `Luna creciente — Creovision`
- description: `Luna creciente: astronomía y lectura simbólica en Creovision.`

Sin embargo la tabla `moon_phase_content` (fuente de contenido de la misma página) contiene campos `seo_title`/`seo_description` ya curados y más ricos, por ejemplo:

- `seo_title`: `Luna creciente | Significado y ciclo`
- `seo_description`: `Astronomía y lectura simbólica de la Luna creciente en el ciclo sinódico.`

El contenido de cada fase es **genuinamente único** (summary, meaning, preguntas, sugerencias, misconceptions específicas por fase, ver `supabase/migrations/20260727234835_...sql`). No es thin content: cada ficha tiene ~5 secciones curadas. El único gap es que la metadata no aprovecha el copy editorial ya disponible en DB.

Resolución a nivel plantilla (no URL por URL): en `head()` de `src/routes/luna.fases.$slug.tsx` usar `loaderData.content.seo_title`/`seo_description` cuando existan. Ver CHANGE-08B-02.

---

## 8. Tarot

Decision final: **TARGETED_CHANGES** (cobertura de `/tarot/cartas/$card` P0 + limpieza config P2).

| Ruta                          | Title                                        | Description                                                                                                         | H1                                                                                                                                                | Estado                       |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `/tarot`                      | `Tarot · Creovision`                         | `Lecturas simbólicas de tarot para reflexionar con calma: carta del día, consulta sí o no y tirada de tres cartas.` | `¿Qué quieres explorar hoy?`                                                                                                                      | KEEP                         |
| `/tarot/si-o-no`              | `Tarot sí o no · Creovision`                 | `Una consulta orientativa del tarot que sugiere avance, cautela o la necesidad de observar más antes de decidir.`   | (PageHeader TarotYesNoPage)                                                                                                                       | KEEP                         |
| `/tarot/tres-cartas/amor`     | `Tirada de Tarot del Amor de 3 cartas        | Creovision`                                                                                                         | `Explora tu situación amorosa con una tirada de tres cartas enfocada en tu mundo emocional, la dinámica afectiva y una orientación para avanzar.` | `Tres cartas — Amor`         | KEEP |
| `/tarot/tres-cartas/decision` | `Tirada de Tarot para Decisiones de 3 cartas | Creovision`                                                                                                         | `Una lectura para reflexionar antes de decidir: qué impulsa la decisión, qué debes considerar, y un criterio para elegir.`                        | `Tres cartas — Decisión`     | KEEP |
| `/tarot/cartas`               | `Biblioteca de cartas · Tarot · Creovision`  | `Explora los Arcanos Mayores publicados con su significado, palabras clave y preguntas para reflexionar.`           | (TarotLibraryPage)                                                                                                                                | KEEP                         |
| `/tarot/cartas/$card`         | `${name} · Tarot · Creovision`               | `Significado simbólico y palabras clave de la carta ${name}.`                                                       | `${card.name}`                                                                                                                                    | KEEP metadata / P0 cobertura |

`/tarot/tres-cartas` (general) y `/tarot/tres-cartas/trabajo` y `/tarot/carta-del-dia` están fuera de este alcance (optimizadas/protegidas). No se tocan.

Amor y Decisión reflejan correctamente su producto real: su `seo.description` coincide con las posiciones configuradas (amor: mundo emocional/dinámica/orientación; decision: impulso/consideración/criterio). KEEP.

### Hallazgo (P0 técnico) — `/tarot/cartas/$card` inaccesible para 70 de 78 cartas

`src/routes/tarot.cartas.$card.tsx` valida el slug con:

```ts
parseParams: (raw) => {
  if (!getTarotBySlug(raw.card)) throw notFound();
  return raw;
};
```

`getTarotBySlug` lee `src/data/tarot-cards.ts`, que solo contiene **8 Arcanos Mayores**. El contenido real de la carta (`TarotCardDetailPage`) consulta `tarotService.getCardBySlug` → Supabase `tarot_cards`, donde existe el mazo completo de **78 cartas**. Las 70 cartas restantes tienen datos publicados en DB pero el router las rechaza con `notFound()` antes de llegar a la página.

- Impacto: contenido único/útil que existe en DB no es alcanzable ni indexable; la biblioteca `/tarot/cartas` (que sí enlaza/lista cartas desde DB) puede enlazar a URLs que el router devuelve 404.
- Tipo: problema de cobertura de plantilla dinámica, no de una URL concreta.
- Regla aplicada: resolver a nivel plantilla/config (fuente completa de slugs válidos), no carta por carta. Documentado como P0 técnico para Codex (CHANGE-08B-01). No se corrige ni se modifica sitemap/robots aquí.

### Hallazgo (P2) — doble fuente de metadata para tirada general

La ruta general ya usa `tarotThreeCardsGeneralMeta` (description corregida en SEO-05B). Pero `src/config/three-card-readings.ts` → `threeCardReadings.general.seo.description` sigue con el texto obsoleto `pasado, presente y tendencia futura` (la description que SEO-05B corrigió). Hoy no se renderiza (la ruta usa la versión corregida), pero es una fuente de verdad desincronizada que vuelve a prometer una estructura que el producto no ejecuta. Limpieza de config P2 (CHANGE-08B-03).

---

## 9. Compatibilidad

Decision final: **SUFFICIENT** (los tres pares indexables tienen contenido editorial real).

| Ruta                                 | Title                                                         | Description                                                                                                                            | H1                                            | Estado               |
| ------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------- |
| `/compatibilidad`                    | `Compatibilidad entre signos · Creovision`                    | `Esta lectura no decide si una relación funcionará. Te ayuda a observar diferencias, coincidencias y formas posibles de comunicación.` | `Explora la dinámica entre dos signos`        | KEEP                 |
| `/compatibilidad/geminis/sagitario`  | `Géminis y Sagitario: compatibilidad simbólica · Creovision`  | (específica condicional SEO-06C)                                                                                                       | `Géminis y Sagitario: curiosidad y horizonte` | PROTEGIDA/OPTIMIZADA |
| `/compatibilidad/cancer/capricornio` | `Cáncer y Capricornio: compatibilidad simbólica · Creovision` | `Lectura editorial de la dinámica entre Cáncer y Capricornio: comunicación, ritmo emocional y áreas de crecimiento.`                   | `Cáncer y Capricornio: cuidado y estructura`  | KEEP                 |
| `/compatibilidad/aries/libra`        | `Aries y Libra: compatibilidad simbólica · Creovision`        | `Lectura editorial de la dinámica entre Aries y Libra: comunicación, ritmo emocional y áreas de crecimiento.`                          | `Aries y Libra: impulso y equilibrio`         | KEEP                 |

`getCompatibilityPairMeta` (ruta `$signA.$signB`) genera: title `${nameA} y ${nameB}: compatibilidad simbólica · Creovision`; description específica solo para `geminis__sagitario`, genérica para el resto. `buildCompatibilityPairMeta` aplica `noindex, follow` a pares fuera de `INDEXABLE_COMPATIBILITY_PAIR_KEYS`.

Cancer/Capricornio y Aries/Libra: la migración seed (`20260728001017_...sql`) inserta para ambos `status='published'`, con title/summary/relationshipDynamic/dimensiones (ratings + interpretations)/strengths/challenges/communication_tips/contexts/reflection_questions/misconceptions **específicos por par**. No son fallback demo: son perfiles editoriales reales.

Diferenciación frente a Géminis/Sagitario: Géminis/Sagitario añade tres bloques extra condicionados por `pair_key === "geminis__sagitario"` (answer-first "¿son compatibles?", amor, largo plazo). Cancer/Capricornio y Aries/Libra no tienen esos bloques, pero sí responden la intención (summary + "Polaridad complementaria" + relationshipDynamic + secciones profundas). El answer-first explícito es un refuerzo de Géminis/Sagitario, no una carencia que haga thin a los otros dos.

Criterio anti mass-optimization: la description genérica de Cancer/Aries es correcta y alineada (no promete estructura falsa). Especificarla por par "podría mejorar", pero sin señal Search Console concreta para esos pares no constituye gap demostrable. Se registra como REVIEW_LATER P2, no como cambio inmediato.

---

## 10. Editorial

Decision final: **DEFER** (no existe contenido editorial real; no se inventa).

| Ruta               | Title                        | Description                                                                                           | H1                     | Estado                          |
| ------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------- |
| `/guias`           | `Guías — Creovision`         | `Ensayos y artículos editoriales sobre tarot, luna y símbolos, con una mirada clara y contemporánea.` | (GuidesPage)           | KEEP metadata / contenido DEFER |
| `/guias/$slug`     | `article.seo.title ?? title` | `article.seo.description ?? excerpt`                                                                  | (ArticlePage.título)   | P1 (marca) / contenido DEFER    |
| `/temas/$category` | `${category.label}           | Creovision`                                                                                           | `category.description` | (CategoryPage.label)            | KEEP metadata / contenido DEFER |

Inventario editorial real: la migración `20260727225111_...sql` solo siembra **un artículo de demostración** (`slug = "articulo-de-demostracion"`, `is_demo = true`, `home_featured = true`) y 6 categorías vacías de contenido. El hub `/guias` y las categorías listan básicamente ese único artículo demo.

Hallazgos:

1. **Marca inconsistente (P1)**: la metadata del artículo demo usa `"Artículo de demostración — Proyecto Astral"` y descripción `"...Proyecto Astral."` (nombre antiguo) en lugar de "Creovision". Es un mismatch de marca en datos editoriales (seed), no en código de plantilla.
2. **Thin content (DEFER)**: no hay contenido editorial real publicado. Crear contenido editorial excede el alcance de SEO-08A y no puede inventarse. El hub quedará thin hasta que exista producción editorial.
3. `/temas` (hub) no tiene archivo de ruta aunque `routes.topics = "/temas"` existe en config: documentado como observación editorial (posible 404/roto), fuera del alcance de metadata.

No se recomienda nada de Antigravity aquí: el problema no es de presentación, es de inexistencia de contenido.

---

## 11. Dynamic templates / Plantillas dinámicas

| Familia                         | Nº aprox. URLs          | Plantilla               | Diferenciación                                                                         | Riesgo |
| ------------------------------- | ----------------------- | ----------------------- | -------------------------------------------------------------------------------------- | ------ |
| `/horoscopo/$sign`              | 12                      | `SignHoroscopePage`     | Metadata incluye nombre; contenido único desde `getLatestHoroscope` (DB)               | LOW    |
| `/luna/fases/$slug`             | 8                       | `MoonPhasePage`         | Contenido único por fase (DB `moon_phase_content`); metadata genérica no usa seo de DB | MEDIUM |
| `/tarot/cartas/$card`           | 78 (8 alcanzables)      | `TarotCardDetailPage`   | Contenido único por carta (DB `tarot_cards`); `parseParams` restringe a 8              | HIGH   |
| `/compatibilidad/$signA/$signB` | 3 indexables + fallback | `CompatibilityPairPage` | Contenido específico por par en DB para los 3 indexables; resto noindex                | LOW    |

Regla: no editar URL por URL. Los problemas se resuelven en plantilla/config.

---

## 12. Titles

Política aplicada (evaluate: intención visible, tema específico, sin stuffing, marca cuando corresponde, sin promesas falsas).

- KEEP generalizado. No se detecta stuffing, "mejor" infundado, ni "gratis" engañoso en las rutas auditadas.
- Cambio único autorizado: `/luna/fases/$slug` (usar `seo_title` de DB, más específico).

---

## 13. Descriptions

Política aplicada (representa experiencia real, utilidad, naturalidad, especificidad).

- KEEP generalizado. No se re-detecta el patrón SEO-05 (metadata prometiendo estructura que el producto no ejecuta) en ninguna ruta indexable auditada, salvo la **config residual** de `threeCardReadings.general` (P2, no renderizada).
- Cambios: `/luna/fases/$slug` (P1). REVIEW_LATER: `$card` (bajo), `cancer/capricornio` y `aries/libra` (P2).

---

## 14. H1

Política aplicada (identifica la experiencia o respuesta principal; un único H1; alineado al producto).

- KEEP generalizado. Todos los H1 auditados identifican la experiencia de forma clara. Relación title-H1 coherente en Hoy/Semana/Mes, tarot, compatibilidad y fases lunares.
- No hay segundo H1 ni H1 desalineado del producto.

---

## 15. Answer layers

| Familia                  | ANSWER layer                                                                                    | Estado          |
| ------------------------ | ----------------------------------------------------------------------------------------------- | --------------- |
| Horóscopo $sign          | `entry.summary` + foco/ánimo/energía inmediatos                                                 | OK              |
| Horóscopo Hoy/Semana/Mes | 12 tarjetas con resumen del periodo                                                             | OK              |
| Luna hoy                 | `MoonTodayCard` (fase/iluminación/edad) inmediato                                               | OK              |
| Luna fases               | "Qué es esta fase" + summary                                                                    | OK              |
| Tarot tiradas            | Valor diferido a interacción; contexto mínimo                                                   | OK (tool-first) |
| Tarot carta              | `card.summary` en PageHeader                                                                    | OK              |
| Compatibilidad par       | Quick read (Energía/Potencial/Cuida) + dynámica; Géminis/Sagitario añade answer-first explícito | OK              |

---

## 16. Depth layers

| Familia            | DEPTH layer                                                   | Estado |
| ------------------ | ------------------------------------------------------------- | ------ |
| Horóscopo $sign    | Amor/Trabajo/Bienestar + número/color                         | OK     |
| Luna fases         | meaning + preguntas + sugerencias + misconceptions            | OK     |
| Tarot carta        | Significado + keywords + sí/no + pregunta                     | OK     |
| Compatibilidad par | dimensiones + puntas + contextos + preguntas + misconceptions | OK     |
| Editorial          | no hay contenido real                                         | DEFER  |

---

## 17. Action layers

| Familia            | ACTION layer                                          | Estado |
| ------------------ | ----------------------------------------------------- | ------ |
| Horóscopo $sign    | Compatibilidad destacada + NBA + prev/next + selector | OK     |
| Luna hoy           | Próximas fases + nav                                  | OK     |
| Tarot tiradas      | Sel/barajar + NBA post-tirada                         | OK     |
| Compatibilidad par | "Prueba otra combinación" + NBA + enlaces a signos    | OK     |

---

## 18. Thin content

- Tarot cards: contenido único por carta en DB, pero 70 de 78 inaccesibles (P0 cobertura). El contenido existente no es thin; el alcance de indexación sí está roto.
- Moon phase pages: NO thin. Cada fase tiene contenido único y curado.
- Compatibility pairs: NO thin (los 3 indexables tienen perfil real y profundo).
- Editorial hubs: thin por inexistencia de contenido real (DEFER).
- Dynamic horoscope sign pages: contenido desde DB; no thin si hay entrada publicada (fallback "demo" cubierto con badge y hoy no es issue de indexación).

---

## 19. Duplicate intent

| Par                              | Veredicto                                               |
| -------------------------------- | ------------------------------------------------------- |
| `/horoscopo` vs `/horoscopo/hoy` | CLEAR (hub vs vista diaria)                             |
| `/luna` vs `/luna/hoy`           | OVERLAP_ACCEPTABLE (hub con snapshot + detalle factual) |
| `/tarot` vs `/tarot/tres-cartas` | CLEAR (hub vs herramienta)                              |
| `/compatibilidad` vs pair pages  | CLEAR (selector vs ficha de par)                        |

No hay riesgo de canibalización severa.

---

## 20. Páginas protegidas

Decisión: **KEEP_FROZEN**.

- `/`, `/horoscopo`, `/tarot/carta-del-dia`, `/tarot/tres-cartas/trabajo`: sin evidencia de gap que justifique reabrir. Se mantienen como controles positivos.
- Optimizadas `/luna`, `/tarot/tres-cartas`, `/compatibilidad/geminis/sagitario`: sin problema concreto demostrado. No se recomienda cambio.

No se genera ningún `PROTECTED_REVIEW_REQUIRED`.

---

## 21. P0 / P1 / P2

| Id            | Prioridad | Hallazgo                                                                            | Tipo               | Responsable   |
| ------------- | --------- | ----------------------------------------------------------------------------------- | ------------------ | ------------- |
| CHANGE-08B-01 | P0        | `/tarot/cartas/$card`: `parseParams` limita a 8 de 78 cartas (cobertura/indexación) | plantilla          | CODEX         |
| CHANGE-08B-02 | P1        | `/luna/fases/$slug` ignora `seo_title`/`seo_description` de DB                      | metadata plantilla | CODEX         |
| CHANGE-08B-03 | P2        | `threeCardReadings.general.seo.description` obsoleto ("pasado/presente/futuro")     | config residual    | CODEX         |
| CHANGE-08B-04 | P1        | Marca "Proyecto Astral" en seed editorial demo                                      | datos/seed         | CODEX         |
| —             | P2        | Desc específica por par para cancer/capricornio y aries/libra                       | REVIEW_LATER       | CLAUDE_REVIEW |

`/temas` hub sin archivo de ruta: observación editorial (posible 404), no parte de SEO-08B.

---

## 22. CHANGE-08B (especificación cerrada para Codex)

### CHANGE-08B-01 — Cobertura de `/tarot/cartas/$card`

PRIORIDAD: P0 (cobertura técnico/plantilla, no metadata).
RUTA/FAMILIA: `/tarot/cartas/$card` (78 cartas).
OBJETIVO: hacer alcanzables las cartas publicadas en DB sin editar 78 URLs.
ARCHIVO: `src/routes/tarot.cartas.$card.tsx` (y/o `src/data/tarot-cards.ts`).
SIMBOLO: `parseTarotCardParams`, `getTarotBySlug`.
ESTADO_ACTUAL: `parseParams` valida contra `getTarotBySlug` (8 Arcanos Mayores estáticos); el resto de cartas publicadas en `tarot_cards` recibe `notFound()`.
CAMBIO_EXACTO: derivar el conjunto de slugs válidos de la fuente completa (DB publicados) en el `loader`, y en metadata/`parseParams` no descartar slugs que no estén en la lista estática; o sustituir la lista estática por la fuente autoritativa. Mantener `notFound` solo para slugs verdaderamente inexistentes.
NO_CAMBIAR: metadata title/description de la ficha, canonical, sitemap, robots, contenido renderizado.
TEST: una carta publicada no estática (p. ej. un Arcano Menor) resuelve 200; slug inexistente sigue `notFound`.
RIESGO: medio-alto (contrato de parseParams + carga de DB).
ROLLBACK: restaurar validación estática.

### CHANGE-08B-02 — Metadata de ficha de fase desde DB

PRIORIDAD: P1.
RUTA/FAMILIA: `/luna/fases/$slug` (8 fases).
OBJETIVO: usar el copy editorial ya curado (`seo_title`/`seo_description`) en metadata.
ARCHIVO: `src/routes/luna.fases.$slug.tsx`.
SIMBOLO: `head`.
ESTADO_ACTUAL: title `${meta.label} — Creovision`; desc `${meta.label}: astronomía y lectura simbólica en Creovision.` (parametrizada; ignora DB).
TITLE BEFORE: `Luna creciente — Creovision`
TITLE AFTER: `Luna creciente | Significado y ciclo` (desde `content.seo_title`)
DESCRIPTION BEFORE: `Luna creciente: astronomía y lectura simbólica en Creovision.`
DESCRIPTION AFTER: `Astronomía y lectura simbólica de la Luna creciente en el ciclo sinódico.` (desde `content.seo_description`)
H1: KEEP (`${meta.label}`).
CAMBIO_EXACTO: en `head`, consumir `loaderData` del contenido por fase y usar `seo_title`/`seo_description` del registro cuando existan; fallback a los strings actuales si son null.
NO_CAMBIAR: canonical, robots, H1, contenido, loader astronómico.
TEST: metadata expected de una fase muestre `seo_title`/`seo_description`; canonical preservado; fallback cuando DB no devuelve seo.
RIESGO: bajo (requiere exponer loaderData a head).
ROLLBACK: revertir a strings parametrizados.

### CHANGE-08B-03 — Limpiar config residual de tirada general

PRIORIDAD: P2.
RUTA/FAMILIA: `/tarot/tres-cartas` (config general).
OBJETIVO: eliminar la description obsoleta que promete "pasado/presente/futuro".
ARCHIVO: `src/config/three-card-readings.ts`.
SIMBOLO: `threeCardReadings.general.seo.description`.
ESTADO_ACTUAL: `Baraja y elige tres cartas para una lectura general de tarot: pasado, presente y tendencia futura.` (ya no se renderiza, pero es fuente de verdad desincronizada).
CAMBIO_EXACTO: alinear con `tarotThreeCardsGeneralMeta.description` (`Elige tres cartas para una lectura general de tarot sobre una situación abierta: influencia, qué mirar y próximo paso.`).
NO_CAMBIAR: la ruta `tarot.tres-cartas.index.tsx`, title, canonical, posiciones.
TEST: `three-card-readings.test.ts` existente sigue PASS.
RIESGO: nulo (config no renderizada).
ROLLBACK: restaurar string previo.

### CHANGE-08B-04 — Marca "Proyecto Astral" en seed editorial

PRIORIDAD: P1 (marca/metadata de datos).
RUTA/FAMILIA: `/guias/articulo-de-demostracion`.
OBJETIVO: corregir mismatch de marca en metadatos editoriales demo.
ARCHIVO: `supabase/migrations/20260727225111_...sql` (seed) o datos en DB.
SIMBOLO: `editorial_articles.seo` (jsonb) del artículo demo.
ESTADO_ACTUAL: title `Artículo de demostración — Proyecto Astral`; description `...Proyecto Astral.`
CAMBIO_EXACTO: sustituir "Proyecto Astral" por "Creovision" (o reemplazar el contenido demo si existe contenido real).
NO_CAMBIAR: plantilla `ArticlePage`, esquema, tipado.
TEST: n/a (datos).
RIESGO: bajo.
ROLLBACK: restaurar seed.

---

## 23. SEO-08C (Antigravity)

Decisión: **NO** (`seo08c_needed = NO`).

No se detectó trabajo visual/editorial de alto valor que justifique una fase de presentación. El único gap editorial (contenido de `/guias` y `/temas`) es de inexistencia de contenido, no de presentación. Los cambios son metadata/plantilla (Codex). Géminis/Sagitario conserva los bloques visuales ya implementados en SEO-06B. No se crea SEO-08C artificialmente.

---

## 24. Tests

Baseline ejecutado:

```
npx --yes vitest run src/config/seo-indexability.test.ts
```

Resultado: PASS, 29 tests.

Diseño para SEO-08B:

- metadata expected de `/luna/fases/$slug` (seo_title/description desde DB + fallback).
- canonical preservado en `/luna/fases/$slug`.
- one H1 en fases/fichas/cartas.
- protected pages unchanged (`/`, `/horoscopo`, `/tarot/carta-del-dia`, `/tarot/tres-cartas/trabajo`).
- seo-indexability PASS.
- Dynamic templates: samplear rutas representativas (una fase, una carta no estática); no testear 8/78 URLs cuando la lógica es de plantilla.

---

## 25. Riesgos

- CHANGE-08B-01 (cobertura tarot) toca `parseParams`/loader; requiere validar que no rompa biblioteca ni soft-404. Medio-alto.
- CHANGE-08B-02 (metadata por loaderData) depende de que TanStack Router exponga `loaderData` a `head()`; validar disponibilidad antes de implementar. Bajo-medio.
- No inventar contenido editorial: el gap de `/guias`/`/temas` queda como DEFER hasta que exista fuente editorial fiable.
- Bajo volumen Search Console: ninguna decisión asume causalidad de ranking.

---

## 26. Rollback

Revertir solo SEO-08B (cuando Codex implemente):

1. Revertir `src/routes/tarot.cartas.$card.tsx` (validación estática).
2. Revertir `src/routes/luna.fases.$slug.tsx` (strings parametrizados).
3. Revertir `threeCardReadings.general.seo.description`.
4. Restaurar seed editorial previo.
5. Reejecutar `npx --yes vitest run src/config/seo-indexability.test.ts`.

No revertir fases previas (SEO-04…SEO-07).

---

## Documentación

- Creado: `docs/seo-search-console-2026/08_METADATA_Y_CAPAS_DE_CONTENIDO.md` (este documento).
- Actualizado: `docs/seo-search-console-2026/README.md` (tabla de fases, hallazgo SEO08A-01, historial de actualizaciones).
- No se modificó ningún archivo funcional ni ninguna otra documentación previa de fases SEO.

---

## 27. Estado

PASS_CON_OBSERVACIONES.

Decisiones finales:

```yaml
horoscope: SUFFICIENT
moon: TARGETED_CHANGES
tarot: TARGETED_CHANGES
compatibility: SUFFICIENT
editorial: DEFER
protected_pages: KEEP_FROZEN
seo08c_needed: NO
immediate_changes: 4 (CHANGE-08B-01 P0, -02 P1, -03 P2, -04 P1)
```

No se modificó código funcional. SEO-08B (Codex) y SEO-08C (no aplica) no fueron iniciados. SEO-09 no fue iniciado.

---

## Implementación SEO-08B — 2026-08-18

Modo: IMPLEMENTACION_FOCAL_CERRADA.  
Estado: PASS_CON_OBSERVACIONES.

### CHANGE-08B-01 — Cobertura de `/tarot/cartas/$card`

Estado: IMPLEMENTADO.

Causa real de cobertura 8/78: `src/routes/tarot.cartas.$card.tsx` validaba
`parseParams` contra `getTarotBySlug(...)`, cuya fuente local (`src/data/tarot-cards.ts`) contiene
solo 8 cartas estáticas. La fuente runtime real de producto para cartas publicadas es
`tarotService.getCardBySlug(...)` -> `supabaseTarotRepository.getCardBySlug(...)` ->
`tarot_cards`.

Cambio aplicado:

- `parseTarotCardParams(...)` ya no descarta cartas por no estar en la lista local de 8.
- el `loader` consulta la fuente runtime real con `tarotService.getCardBySlug(params.card)`.
- si la carta no existe o no está publicada, el loader emite `notFound()`.
- `head()` usa `loaderData.card.name` para preservar el patrón de metadata existente:
  `${name} · Tarot · Creovision` y
  `Significado simbólico y palabras clave de la carta ${name}.`
- canonical se mantiene con `tarotCardRoute(params.card)`.

Cartas adicionales verificadas por test focal:

- `as-de-copas`
- `dos-de-espadas`

Carta inexistente verificada:

- `carta-inexistente` sigue resolviendo como `notFound()` mediante loader; no se creó fallback
  genérico ni soft-404 200.

No se modificaron title/description/H1/contenido de las fichas de Tarot ni el sitemap.

### CHANGE-08B-02 — Metadata de ficha lunar desde DB

Estado: IMPLEMENTADO.

La ruta `src/routes/luna.fases.$slug.tsx` ahora retorna `loaderData.content` desde el loader,
reutilizando la query existente `moonQueries.contentByPhase(params.phaseKey)`. `head()` consume
ese `loaderData` y usa `content.seo_title` / `content.seo_description` cuando existen.

Antes para `luna-creciente`:

- title: `Luna creciente — Creovision`
- description: `Luna creciente: astronomía y lectura simbólica en Creovision.`

Después para `luna-creciente`:

- title: `Luna creciente | Significado y ciclo`
- description: `Astronomía y lectura simbólica de la Luna creciente en el ciclo sinódico.`

Fallback seguro:

- si `seo_title` o `seo_description` son null, undefined o string vacío, se conservan los strings
  parametrizados anteriores.
- no se emite title/description vacío ni `undefined`.

Loader/head lifecycle:

- no se añadió una segunda query en `head()`;
- los datos SSR de metadata vienen del loader;
- la fase inválida sigue protegida por `parseParams` + `notFound()`;
- H1 (`meta.label`), contenido, navegación entre fases y canonical quedan preservados.

### CHANGE-08B-03 — Config residual de Tarot General

Estado: NO_IMPLEMENTADO.

Se respetó la instrucción del YAML de SEO-08B: `threeCardReadings.general.seo.description` queda
P2/LATER porque actualmente no es la fuente renderizada por la ruta optimizada.

### CHANGE-08B-04 — Marca `Proyecto Astral` en artículo demo

Estado: BLOQUEO_PARCIAL_JUSTIFICADO.

SEO-08A identificó la referencia residual en
`supabase/migrations/20260727225111_4cc4d9e8-78ab-43b9-b0b5-8fde95dab88f.sql`, dentro del seed
histórico de `editorial_articles.seo` para `articulo-de-demostracion`:

- before: `Artículo de demostración — Proyecto Astral`
- after deseado: `Artículo de demostración — Creovision`

Análisis seed/migración/runtime:

- el hallazgo está en una migración histórica ya aplicada;
- editar esa migración no actualizaría una base de producción existente;
- no se encontró una fuente runtime posterior en código/config que sobrescriba ese `seo`;
- el YAML prohíbe editar una migración histórica "como si eso actualizara producción";
- SEO-08A no autorizó una nueva migración de datos.

Resultado: no se aplicó reemplazo global ni se editó la migración histórica. La corrección real
de producción requiere una migración nueva y explícitamente autorizada que actualice solo
`editorial_articles.seo` del slug `articulo-de-demostracion`.

### Archivos modificados

- `src/routes/tarot.cartas.$card.tsx`
- `src/routes/luna.fases.$slug.tsx`
- `src/config/seo-indexability.test.ts`
- `docs/seo-search-console-2026/08_METADATA_Y_CAPAS_DE_CONTENIDO.md`
- `docs/seo-search-console-2026/README.md`

### Validación

`npx --yes vitest run src/config/seo-indexability.test.ts` — PASS, 32 tests.

`npm run build` — PASS en ejecución capturada.

`npx tsc --noEmit --pretty false` — FAIL preexistente permitido. El filtro de salida no muestra
errores en `src/routes/tarot.cartas.$card.tsx` ni `src/routes/luna.fases.$slug.tsx`; se mantiene
el error conocido de tipos de `vitest` en `src/config/seo-indexability.test.ts`.

### Diff y fronteras

Cambios asociados:

- 08B-01: `src/routes/tarot.cartas.$card.tsx` y tests focales.
- 08B-02: `src/routes/luna.fases.$slug.tsx` y tests focales.
- 08B-04: documentación de bloqueo; sin cambio funcional por falta de migración autorizada.

No se modificaron Home, `/horoscopo`, `/tarot/carta-del-dia`, `/tarot/tres-cartas`,
`/tarot/tres-cartas/trabajo`, `/luna`, `/compatibilidad/geminis/sagitario`, navegación global,
footer, internal linking SEO-07, robots, sitemap, canonical policy global, JSON-LD, Supabase
schema ni contenido editorial.

### Riesgos pendientes

- Las 78 cartas son resolubles si existen como filas publicadas en `tarot_cards`; el entorno local
  puede tener solo el seed demo de 8 cartas si no se cargó el mazo completo.
- El sitemap de Tarot sigue basado en la lista local de 8 cartas; SEO-08B no autorizó ampliarlo.
- La marca `Proyecto Astral` en producción requiere migración nueva autorizada para corregirse.

### Rollback

- 08B-01: restaurar validación anterior de `parseParams` contra la fuente local.
- 08B-02: restaurar metadata parametrizada anterior en `head()`.
- 08B-04: no hay cambio funcional que revertir; si se autoriza una migración futura, su rollback
  debe restaurar solo el JSON SEO del artículo demo.

---

## SEO-08D — Cierre técnico — 2026-08-18

Modo: HARDENING_FOCAL.  
Estado: PASS.

### CHANGE-08D-01 — Sitemap Tarot completo

Estado: IMPLEMENTADO.

Sitemap Tarot antes:

- `src/routes/sitemap[.]xml.ts` importaba `majorArcana` desde `src/data/tarot-cards.ts`;
- esa fuente contiene el subconjunto histórico de 8 cartas;
- el sitemap listaba `/tarot/cartas` y solo 8 URLs dinámicas de cartas.

Sitemap Tarot después:

- `getSitemapEntries(...)` acepta un catálogo de cartas como parámetro;
- `getSitemapEntriesWithPublishedTarot(...)` hace una única llamada a `tarotService.getLibrary()`;
- el handler `GET /sitemap.xml` construye el XML con esa fuente runtime;
- la fuente real de slugs es `tarot_cards` publicada, a través de
  `tarotService.getLibrary()` -> `supabaseTarotRepository.getLibrary(...)`.

Cantidad real obtenida:

- en producción depende del número de filas publicadas devueltas por `tarot_cards`;
- el test focal inyecta 3 cartas publicadas y valida que el número de URLs dinámicas de Tarot
  coincida exactamente con esa fuente.

Ejemplos validados:

- `el-loco`
- `as-de-copas`
- `dos-de-espadas`
- `carta-inexistente` no aparece.

Coste/query sitemap:

- una query de catálogo para las cartas publicadas;
- no hay una query por carta;
- el resto del sitemap conserva su generación previa.

Compatibilidad preservada:

- `indexableCompatibilityPairs()` sigue siendo la fuente de pares de compatibilidad en sitemap;
- los fallback demo, por ejemplo `/compatibilidad/aries/aries`, siguen excluidos.

### CHANGE-08D-02 — Migración nueva para marca residual

Estado: IMPLEMENTADO.

Migración histórica identificada:

- archivo: `supabase/migrations/20260727225111_4cc4d9e8-78ab-43b9-b0b5-8fde95dab88f.sql`;
- tabla: `public.editorial_articles`;
- fila estable: `slug = 'articulo-de-demostracion'`;
- columna: `seo` JSONB;
- valores históricos:
  - `seo.title = 'Artículo de demostración — Proyecto Astral'`
  - `seo.description = 'Contenido de ejemplo utilizado para validar la infraestructura editorial de Proyecto Astral.'`

Nueva migración creada:

- `supabase/migrations/20260818233000_fix_demo_article_project_astral_brand.sql`

La migración:

- no modifica la migración histórica;
- usa `UPDATE public.editorial_articles`;
- restringe por `slug = 'articulo-de-demostracion'`;
- añade condiciones sobre los valores SEO esperados para evitar cambios amplios;
- actualiza solo `seo.title` y `seo.description`;
- no modifica otros artículos ni contenido editorial.

Marca antes/después:

- before: `Proyecto Astral`
- after: `Creovision`

Rollback:

- la migración incluye SQL inverso comentado para restaurar puntualmente los dos campos SEO del
  artículo demo si hiciera falta.

### Validación

`npx --yes vitest run src/config/seo-indexability.test.ts` — PASS, 34 tests.

`npm run build` — PASS en ejecución capturada.

`npx tsc --noEmit --pretty false` — FAIL preexistente permitido. El filtro de salida no muestra
errores en `src/routes/sitemap[.]xml.ts`; se mantiene el error conocido de tipos de `vitest` en
`src/config/seo-indexability.test.ts`.

### Diff y fronteras

Archivos SEO-08D:

- `src/routes/sitemap[.]xml.ts`
- `src/config/seo-indexability.test.ts`
- `supabase/migrations/20260818233000_fix_demo_article_project_astral_brand.sql`
- `docs/seo-search-console-2026/08_METADATA_Y_CAPAS_DE_CONTENIDO.md`
- `docs/seo-search-console-2026/README.md`

No se modificaron `src/routes/tarot.cartas.$card.tsx`, `src/routes/luna.fases.$slug.tsx`,
Tarot Three Cards, Carta del Día, Home, Horóscopo, Compatibilidad, navegación, footer, robots,
canonical policy ni JSON-LD.

### Riesgos pendientes

- La cobertura final del sitemap depende de que el entorno tenga el mazo completo publicado en
  `tarot_cards`.
- Si `tarotService.getLibrary()` falla por indisponibilidad de Supabase, el sitemap dinámico
  también fallará; no se añadió fallback silencioso para no ocultar errores de cobertura.

### Rollback

- Sitemap: restaurar el uso directo de `majorArcana` en `src/routes/sitemap[.]xml.ts`.
- Migración: aplicar el SQL inverso comentado en
  `20260818233000_fix_demo_article_project_astral_brand.sql`.
