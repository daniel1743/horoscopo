import { routes } from "@/config/routes";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

function isHomeBreadcrumb(item: BreadcrumbItem): boolean {
  return item.href === routes.home || item.label.trim().toLowerCase() === "inicio";
}

export function buildBreadcrumbTrail(items?: BreadcrumbItem[]): BreadcrumbItem[] {
  const cleanItems = (items ?? []).filter((item, index) => index > 0 || !isHomeBreadcrumb(item));
  return [{ label: "Inicio", href: routes.home }, ...cleanItems];
}
