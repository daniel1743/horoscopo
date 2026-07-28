import * as React from "react";
import { cn } from "@/lib/utils";

type Width = "site" | "editorial";

export function Container({
  as: Tag = "div",
  width = "site",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType; width?: Width }) {
  return (
    <Tag
      className={cn(width === "editorial" ? "container-editorial" : "container-site", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Section({
  className,
  children,
  tone = "light",
  ...props
}: React.HTMLAttributes<HTMLElement> & { tone?: "light" | "ivory" | "dark" }) {
  const toneClass =
    tone === "dark"
      ? "bg-night text-ink-inverse"
      : tone === "ivory"
        ? "bg-ivory text-ink"
        : "bg-warm-white text-ink";
  return (
    <section className={cn("py-14 md:py-18 lg:py-24", toneClass, className)} {...props}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header className={cn("mb-8 md:mb-12", align === "center" && "text-center", className)}>
      {eyebrow && (
        <p className="font-body text-[12px] font-medium tracking-[0.14em] uppercase text-brand mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-[30px] md:text-[36px] leading-[1.18] font-semibold">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-[62ch] font-body text-[16px] md:text-[18px] leading-[1.65] text-ink-soft">
          {description}
        </p>
      )}
    </header>
  );
}
