# IMPLEMENTACION_YAML_02_INCREMENTAL.md

## Elementos que ya existían y no fueron tocados

- Tokens (colores, radios, sombras, fuentes) — `src/styles.css`, `src/design-system/*`
- Primitivas visuales (`Button`, `Badge`, `Icon`, `Card`, `Input`, `Container`, `Section`)
- Registro de iconos — `src/config/icons.ts`
- Navegación primaria/mobile/footer-nav — `src/config/navigation.ts` (se mantiene; el footer nuevo consume `routes` en su lugar sin duplicar)
- Datos zodiacales, tarot y categorías — `src/data/*`
- Configuración de sitio — `src/config/site.ts`
- Estilos de imágenes — `src/config/image-styles.ts`

## Elementos faltantes agregados

Registro único de rutas · configuración del footer · componente `Footer` · copy reutilizable · definiciones y validaciones de formularios · registro de modales · plantillas SEO compartidas · feature flags · scripts de validación de centralización.

## Archivos creados

- `src/config/routes.ts`
- `src/config/footer.ts`
- `src/config/copy.ts`
- `src/config/forms.ts`
- `src/config/modals.ts`
- `src/config/seo.ts`
- `src/config/features.ts`
- `src/components/layout/Footer.tsx`
- `scripts/check-hardcoded-styles.ts`
- `scripts/check-direct-icon-imports.ts`
- `scripts/check-direct-routes.ts`
- `scripts/check-duplicate-layout.ts`

## Archivos modificados

- `src/routes/__root.tsx` — montaje del `<Footer />` global.
- `package.json` — script `check:centralization`.

## Rutas centralizadas

Todas las rutas públicas y privadas del YAML viven en `src/config/routes.ts` como objeto `routes` inmutable + helpers dinámicos (`zodiacRoute`, `articleRoute`, `tarotCardRoute`, `compatibilityRoute`, `routeByKey`).

## Footer centralizado

`src/config/footer.ts` expone marca, columnas (por `routeKey`), newsletter y copyright. El componente `Footer` consume esa configuración y las utilidades del sistema de diseño; no redefine colores, sombras ni radios.

## Textos centralizados

`src/config/copy.ts` reúne CTAs, feedback y estados vacíos. Solo textos verdaderamente reutilizables — el contenido editorial no se movió.

## Validaciones agregadas

- `check-hardcoded-styles` — hex/shadow/radius arbitrarios fuera de tokens.
- `check-direct-icon-imports` — imports de lucide-react fuera del registro.
- `check-direct-routes` — rutas internas hard-coded fuera de `routes.ts`.
- `check-duplicate-layout` — segundo Footer/layout global.

Se ejecutan con `bun run check:centralization` en modo **report_only** (no fallan el build), tal como pide el YAML.

Hallazgos actuales del reporte (documentados, no bloqueantes):

- `src/lib/error-page.ts` — pertenece a la plantilla Lovable (página de error), fuera del alcance del sistema de diseño.
- `src/routes/design-system.tsx` — página de referencia que muestra intencionadamente los valores hex de los swatches.
- `src/data/content-categories.ts` — usa las URLs de categoría como parte de sus datos; queda pendiente migrar a `routes.KEY` en una iteración posterior cuando existan las páginas destino, sin cambiar URLs.

## Resultado

- Typecheck (`tsgo --noEmit`): ✅ sin errores.
- Validadores `check:centralization`: ✅ ejecución correcta, reporte informativo.
- Preview activo, sin regresiones.

---

**Confirmación:** no se regeneraron colores, fuentes, sombras, radios, iconografía, navbar, componentes visuales, datos zodiacales, categorías ni configuraciones ya cubiertas por YAML 01. Solo se añadieron piezas faltantes de centralización.
