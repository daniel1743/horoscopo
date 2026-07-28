/**
 * Variantes reutilizables (cva) para primitivas globales.
 * Extiende — no reemplaza — las variantes de shadcn.
 */
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body font-semibold",
    "transition-colors duration-200 outline-none cursor-pointer",
    "focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:opacity-[0.48] disabled:cursor-not-allowed",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-brand text-ink-inverse hover:bg-brand-hover",
        secondary: "bg-transparent text-brand border border-brand hover:bg-brand-soft",
        dark: "bg-night text-ink-inverse border border-line-dark hover:bg-night-elevated",
        premium: "bg-night text-ink-inverse border border-gold/40 hover:bg-night-elevated",
        ghost: "bg-transparent text-ink hover:bg-brand-soft hover:text-brand",
        link: "text-brand underline-offset-4 hover:underline p-0 h-auto",
        // Aliases de compatibilidad con shadcn (no usar en código nuevo)
        default: "bg-brand text-ink-inverse hover:bg-brand-hover",
        outline:
          "bg-transparent text-ink border border-line hover:bg-brand-soft hover:text-brand hover:border-brand",
        destructive: "bg-danger text-ink-inverse hover:opacity-90",
      },
      size: {
        sm: "h-10 px-4 text-sm rounded-[var(--radius-control)] [&_svg]:size-4",
        md: "h-12 px-[22px] text-[15px] rounded-[var(--radius-control)] [&_svg]:size-5",
        lg: "h-[54px] px-7 text-base rounded-[var(--radius-control)] [&_svg]:size-5",
        icon: "h-11 w-11 rounded-[var(--radius-control)] [&_svg]:size-5",
        // Alias shadcn
        default: "h-12 px-[22px] text-[15px] rounded-[var(--radius-control)] [&_svg]:size-5",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;

export const cardVariants = cva("block transition-shadow duration-200", {
  variants: {
    variant: {
      default:
        "bg-warm-white border border-line-subtle rounded-[var(--radius-card)] shadow-[var(--shadow-card)]",
      editorial: "bg-warm-white border border-line rounded-[var(--radius-card-lg)]",
      dark: "bg-night-elevated border border-line-dark text-ink-inverse rounded-[var(--radius-card-lg)]",
      interactive:
        "bg-warm-white border border-line-subtle rounded-[var(--radius-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-[3px] transition-all",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: { variant: "default", padding: "md" },
});
export type CardVariants = VariantProps<typeof cardVariants>;

export const badgeVariants = cva(
  "inline-flex items-center min-h-7 px-[11px] rounded-full font-body text-[12px] font-medium tracking-[0.01em] uppercase whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-ivory text-ink-soft",
        violet: "bg-brand-soft text-brand",
        premium: "bg-night text-gold",
        rose: "bg-[rgba(185,111,145,0.12)] text-rose",
        blue: "bg-[rgba(113,137,200,0.13)] text-celestial",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;

export const inputBaseClass = [
  "w-full h-[52px] px-4 rounded-[var(--radius-control)]",
  "bg-warm-white border border-line text-ink",
  "placeholder:text-ink-muted font-body text-[15px]",
  "outline-none transition-shadow",
  "focus:border-brand focus:ring-4 focus:ring-[rgba(108,75,217,0.18)]",
  "disabled:opacity-[0.48] disabled:cursor-not-allowed",
  "aria-invalid:border-danger aria-invalid:ring-[rgba(184,92,100,0.18)]",
].join(" ");
