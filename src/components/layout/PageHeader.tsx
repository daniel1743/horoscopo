import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "light" | "soft" | "dark";
type Alignment = "left" | "center";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  alignment?: Alignment;
  variant?: Variant;
  className?: string;
}

const variantClass: Record<Variant, string> = {
  light: "bg-transparent text-ink",
  soft: "bg-brand-soft text-ink rounded-[var(--radius-card-lg)] px-8 py-10",
  dark: "bg-night text-ink-inverse rounded-[var(--radius-card-lg)] px-8 py-10",
};

/** Encabezado reutilizable para páginas y categorías. */
export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
  alignment = "left",
  variant = "light",
  className,
}: Props) {
  return (
    <header
      className={cn(
        "mb-8 md:mb-10",
        variantClass[variant],
        alignment === "center" && "text-center",
        className,
      )}
    >
      {badge && (
        <div className={cn("mb-3", alignment === "center" && "flex justify-center")}>{badge}</div>
      )}
      {eyebrow && (
        <p
          className={cn(
            "mb-3 font-body text-[12px] font-medium uppercase tracking-[0.14em]",
            variant === "dark" ? "text-gold" : "text-brand",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className={cn(
          "font-display font-semibold tracking-[-0.02em]",
          "text-[32px] leading-[1.12] md:text-[44px]",
          variant === "dark" ? "text-ink-inverse" : "text-ink",
        )}
      >
        {title}
      </h1>
      {description && (
        <p
          className={cn(
            "mt-4 max-w-[62ch] font-body text-[16px] leading-[1.65] md:text-[18px]",
            variant === "dark" ? "text-ink-inverse-soft" : "text-ink-soft",
            alignment === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
      {actions && (
        <div
          className={cn("mt-6 flex flex-wrap gap-3", alignment === "center" && "justify-center")}
        >
          {actions}
        </div>
      )}
    </header>
  );
}
