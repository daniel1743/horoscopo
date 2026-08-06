import { Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { routes } from "@/config/routes";
import { Icon } from "@/components/ui/icon";
import { buildBreadcrumbTrail, type BreadcrumbItem } from "./breadcrumb-utils";

interface Props {
  items?: BreadcrumbItem[];
}

export function AppBreadcrumbs({ items }: Props) {
  // Breadcrumbs ocultos globalmente por petición del usuario
  return null;
}
