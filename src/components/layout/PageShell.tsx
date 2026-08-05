import type { ReactNode } from "react";
import { Container } from "./Container";
import { AppBreadcrumbs } from "./AppBreadcrumbs";
import type { BreadcrumbItem } from "./breadcrumb-utils";
import { cn } from "@/lib/utils";

type Width = "default" | "narrow" | "reading" | "full";
type Spacing = "default" | "compact" | "none";
type Background = "page" | "ivory" | "warm";

interface Props {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  hideBreadcrumbs?: boolean;
  width?: Width;
  spacing?: Spacing;
  background?: Background;
  className?: string;
}

const widthClass: Record<Width, string> = {
  default: "max-w-[1120px]",
  narrow: "max-w-[880px]",
  reading: "max-w-[720px]",
  full: "max-w-none",
};

const spacingClass: Record<Spacing, string> = {
  default: "py-10 md:py-14 lg:py-16",
  compact: "py-6 md:py-8",
  none: "py-0",
};

const backgroundClass: Record<Background, string> = {
  page: "bg-background",
  ivory: "bg-ivory",
  warm: "bg-warm-white",
};

/** Contenedor estándar para páginas internas. */
export function PageShell({
  children,
  breadcrumbs,
  hideBreadcrumbs,
  width = "default",
  spacing = "default",
  background = "page",
  className,
}: Props) {
  return (
    <div
      className={cn(
        backgroundClass[background],
        spacingClass[spacing],
        "overflow-x-clip",
        className,
      )}
    >
      <Container className={cn("mx-auto min-w-0", widthClass[width])}>
        {!hideBreadcrumbs && <AppBreadcrumbs items={breadcrumbs} />}
        {children}
      </Container>
    </div>
  );
}
