# Sistema de diseño — Proyecto Astral

Fuente única de verdad para tokens y primitivas visuales.
Ver YAML 01 para la especificación completa.

## Dónde vive qué

| Tema           | Archivo |
| -------------- | ------- |
| Colores, radios, sombras, fuentes (CSS vars) | `src/styles.css` |
| Tokens tipados (TypeScript) | `src/design-system/tokens.ts` |
| Escala tipográfica | `src/design-system/typography.ts` |
| Variantes de componentes (cva) | `src/design-system/component-variants.ts` |
| Registro de iconos | `src/config/icons.ts` |
| Navegación | `src/config/navigation.ts` |
| Estilos de imagen | `src/config/image-styles.ts` |
| Sitio y textos globales | `src/config/site.ts` |
| Zodíaco | `src/data/zodiac-signs.ts` |
| Tarot (arcanos mayores) | `src/data/tarot-cards.ts` |
| Categorías de contenido | `src/data/content-categories.ts` |

## Utilidades Tailwind generadas

Los tokens de `@theme inline` en `src/styles.css` producen utilidades:

- Colores: `bg-brand`, `bg-brand-soft`, `bg-ivory`, `bg-warm-white`,
  `bg-night`, `bg-night-elevated`, `bg-gold`, `bg-rose`, `bg-celestial`,
  y sus variantes `text-*` / `border-*`.
- Texto: `text-ink`, `text-ink-soft`, `text-ink-muted`,
  `text-ink-inverse`, `text-ink-inverse-soft`.
- Bordes: `border-line`, `border-line-subtle`, `border-line-strong`,
  `border-line-dark`.
- Semántico: `text-success`, `text-warning`, `text-danger`, `text-info`.
- Radios: `rounded-md/lg/xl/2xl/pill` (mapeados a tokens).
- Sombras: usar `shadow-[var(--shadow-card)]` (u otros tokens).
- Fuentes: `font-display` y `font-body` (utilidades personalizadas).

## Reglas duras

- Nunca escribir hexadecimales en componentes. Añadir el token primero.
- Nunca crear variantes de botón, badge o tarjeta en una página.
  Extender `component-variants.ts` y consumirlas.
- Iconos siempre vía `<Icon name="..." />` (registro central).
- Navegación siempre desde `src/config/navigation.ts`.
- Signos y cartas siempre desde `src/data/*`.

## Cómo añadir una variante nueva

1. Editar `src/design-system/component-variants.ts`.
2. Documentar el uso en este archivo si es un patrón nuevo.
3. No usar `!important`. Si necesitas anular estilos, revisa el token.

## Página de referencia

Ruta interna: `/design-system` — muestra colores, tipografía, botones,
badges, inputs, tarjetas, iconos y espaciado.
