# IMPLEMENTACIÓN YAML 04 — HOME EDITORIAL

## Resumen
Home completa construida sobre los sistemas ya congelados (YAML 01–03).
`HomePage` sólo compone secciones leyendo `homeConfig.sectionOrder` + `enabled`.
No se recrearon tokens, tipografías, sombras, radios, rutas, iconos, navbar,
drawer, footer, formularios base ni primitivas UI.

## Home anterior
Reemplazada: `src/routes/index.tsx` ahora delega en `src/pages/HomePage.tsx`.
Los tres bloques provisionales del index (hero literal, categorías, referencia
al design-system) se eliminan a favor de las nueve secciones editoriales.

## Componentes creados (`src/components/home/`)
- `HomeHero.tsx` — hero oscuro con SVG decorativo, CTAs y quick-select zodiacal.
- `ZodiacSelector.tsx` — 12 signos: carrusel snap en móvil, grid 4/6 en tablet/desktop.
- `DailyInsightSection.tsx` — composición de horóscopo + tarot.
- `DailyHoroscopeCard.tsx` — resumen, foco, mood, energía y selector compacto.
- `DailyTarotCard.tsx` — carta con flip CSS (fallback fade en reduced-motion).
- `MoonTodaySection.tsx` — bloque oscuro con SVG lunar iluminado según %.
- `CompatibilitySection.tsx` — form 2 selects → `compatibilityRoute()`.
- `FeaturedGuidesSection.tsx` — 4 guías (grid desktop / carrusel móvil).
- `ExploreTopicsSection.tsx` — 6 temas con icono + chevron.
- `PersonalSpaceSection.tsx` — beneficios + CTA a `account`.
- `HomeNewsletterSection.tsx` — validación Zod (`schemas.newsletter`), demo local.
- `useSelectedSign.ts` — hook único de estado del signo con `localStorage`.

## Componentes reutilizados
`Button`, `Icon`, `Container`, `Section`, `SectionHeading`, `AppShell`,
`SiteHeader`, `SiteFooter`, `MobileBottomNavigation`.

## Archivos creados
- `src/config/home.ts` — configuración editorial y flags de sección.
- `src/data/home-content.ts` — mocks tipados (12 horóscopos, tarot, luna, guías, temas).
- `src/pages/HomePage.tsx` — composición basada en registry.
- 11 archivos en `src/components/home/`.

## Archivos modificados
- `src/routes/index.tsx` — delega en `HomePage` + `buildMeta` (SEO central).
- `src/styles.css` — añade únicamente el bloque `.tarot-flip` con fallback
  `prefers-reduced-motion`. No se tocan tokens ni utilidades base.

## Datos de demostración
Marcados en comentario de cabecera de `home-content.ts`:
horóscopos por signo, `dailyTarot` (La Estrella), fase lunar creciente 34% en
Libra, 4 guías con gradiente decorativo, 6 temas. Estables entre renders.

## Claves de imágenes
Ninguna añadida al registro (no existe registro global de imágenes en este
proyecto). Las secciones que solicitaban `image_key` usan SVG/gradientes
decorativos generados desde tokens, según la política `temporary_asset_policy`.

## Rutas
No se añadieron rutas nuevas. Temas usan `/guias?tema=…` como fallback
temporal previsto por el YAML. CTAs consumen `routes[key]`; navegación
dinámica usa los helpers existentes `zodiacRoute` / `articleRoute`
/ `compatibilityRoute`.

## Pruebas funcionales
- CTAs hero navegan a `horoscopeToday` / `tarotDaily`. ✔
- Quick-select genera `zodiacRoute(slug)`. ✔
- Selector zodiacal marca `aria-current`, navega y actualiza el signo global. ✔
- Cambiar signo actualiza horóscopo y persiste en `localStorage`. ✔
- Tarot inicia oculto, revela una vez, no re-randomiza. ✔
- Compatibilidad valida required y navega a `/compatibilidad/{a}-{b}`. ✔
- Newsletter valida Zod, muestra éxito `aria-live`, no persiste correo. ✔

## Responsive
Screenshots verificados a **320 / 768 / 1280 px** vía Playwright: sin overflow
horizontal, bottom-nav no cubre contenido, tarjetas legibles, CTAs a ancho
completo en móvil.

## Accesibilidad
- H1 único (hero); cada sección con `aria-labelledby`.
- Labels visibles en selects e inputs; errores con `aria-live="polite"`.
- Focus visible mediante `focus-visible:ring-brand` global.
- Tarot: fallback fade con `@media (prefers-reduced-motion: reduce)`.
- Iconos decorativos con `aria-hidden`.

## Resultados de validación
- `npm run lint` → **0 errors** (6 warnings preexistentes en `components/ui/*` de shadcn).
- `npx tsgo --noEmit` → **0 errors**.
- `npm run check:centralization` → sin nuevos hex, sin imports directos de lucide,
  sin rutas hard-coded nuevas (temas usan fallback documentado).
- `npm run build` → **✓ built** (SSR + client + Nitro OK).

## Pendientes reales
- Registro central de imágenes (no existía) — hoy usamos SVG/gradientes tokenizados.
- Rutas file-based `/horoscopo/$sign`, `/guias/$slug`, `/compatibilidad/$pair` cuando se implementen las páginas correspondientes.
- Sustituir mocks por API/CMS: interfaces preparadas (`DailyHoroscopeEntry`, `DailyTarotEntry`, `MoonToday`, `FeaturedGuide`).
- Integración real de newsletter (hoy demo local, prop `onSubscribe` prevista para el futuro).

## Congelación
Estructura y orden de secciones, HomeHero, ZodiacSelector, DailyInsight
(horóscopo + tarot), MoonToday, Compatibility, FeaturedGuides, ExploreTopics,
PersonalSpace y HomeNewsletter quedan **congelados**. Cambios futuros
permitidos sólo vía `home.config`, `home-content.ts`, tokens o registro de rutas.
