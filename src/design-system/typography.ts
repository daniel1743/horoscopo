/**
 * Escala tipográfica — Fraunces (display) + Manrope (body).
 * Usar los tokens `styles.<clave>` como className semántico.
 */

export const fonts = {
  display: "font-display",
  body: "font-body",
} as const;

export const typography = {
  displayXl:
    "font-display text-[42px] leading-[1.04] tracking-[-0.035em] font-semibold md:text-[64px]",
  displayLg:
    "font-display text-[36px] leading-[1.1] tracking-[-0.025em] font-semibold md:text-[48px]",
  h1: "font-display text-[34px] leading-[1.12] font-semibold md:text-[42px]",
  h2: "font-display text-[30px] leading-[1.18] font-semibold md:text-[36px]",
  h3: "font-display text-[23px] leading-[1.25] font-semibold md:text-[26px]",
  h4: "font-display text-[19px] leading-[1.3] font-semibold md:text-[21px]",
  bodyLg: "font-body text-[18px] leading-[1.72]",
  bodyMd: "font-body text-[16px] leading-[1.65]",
  bodySm: "font-body text-[14px] leading-[1.55]",
  label: "font-body text-[14px] leading-[1.3] font-semibold",
  caption: "font-body text-[12px] leading-[1.45] font-medium tracking-[0.01em] uppercase",
} as const;

export type TypographyToken = keyof typeof typography;
