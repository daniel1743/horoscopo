/**
 * Proyecto Astral — Tokens de diseño (TypeScript)
 * ------------------------------------------------------------
 * Espejo tipado de los tokens definidos en `src/styles.css`.
 * NO redefinir valores en componentes: importar desde aquí o
 * usar las utilidades Tailwind generadas (bg-brand, text-ink, ...).
 */

export const colors = {
  brand: {
    violet: "var(--brand-violet)",
    violetHover: "var(--brand-violet-hover)",
    violetSoft: "var(--brand-violet-soft)",
  },
  background: {
    ivory: "var(--bg-lunar-ivory)",
    warmWhite: "var(--bg-warm-white)",
    night: "var(--bg-deep-night)",
    nightElevated: "var(--bg-deep-night-elevated)",
  },
  accent: {
    gold: "var(--accent-lunar-gold)",
    rose: "var(--accent-astral-rose)",
    celestial: "var(--accent-celestial-blue)",
  },
  text: {
    primary: "var(--text-primary)",
    secondary: "var(--text-secondary)",
    muted: "var(--text-muted)",
    inverse: "var(--text-inverse)",
    inverseSoft: "var(--text-inverse-soft)",
    link: "var(--text-link)",
  },
  border: {
    default: "var(--border-default)",
    subtle: "var(--border-subtle)",
    strong: "var(--border-strong)",
    dark: "var(--border-dark)",
  },
  semantic: {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    info: "var(--info)",
  },
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
  "4xl": "64px",
  "5xl": "96px",
} as const;

export const sectionPadding = {
  mobile: "56px",
  tablet: "72px",
  desktop: "96px",
} as const;

export const radius = {
  control: "var(--radius-control)",
  card: "var(--radius-card)",
  cardLarge: "var(--radius-card-lg)",
  modal: "var(--radius-modal)",
  image: "var(--radius-image)",
  pill: "var(--radius-pill)",
} as const;

export const shadows = {
  card: "var(--shadow-card)",
  cardHover: "var(--shadow-card-hover)",
  floating: "var(--shadow-floating)",
  darkGlow: "var(--shadow-dark-glow)",
} as const;

export const motion = {
  durations: { fast: "140ms", default: "220ms", slow: "360ms" },
  easing: {
    standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

export const breakpoints = {
  mobile: "0px",
  tablet: "640px",
  desktop: "1024px",
  wide: "1440px",
} as const;

export type Tokens = {
  colors: typeof colors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  motion: typeof motion;
};
