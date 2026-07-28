import { Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { routes } from "@/config/routes";
import { Icon } from "@/components/ui/icon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items?: BreadcrumbItem[];
}

/** Breadcrumbs reutilizables. Ocultos en la home. */
export function AppBreadcrumbs({ items }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === routes.home) return null;

  const auto: BreadcrumbItem[] =
    items ??
    pathname
      .split("/")
      .filter(Boolean)
      .map((seg, i, arr) => ({
        label: decodeURIComponent(seg).replace(/-/g, " "),
        href: "/" + arr.slice(0, i + 1).join("/"),
      }));

  const trail: BreadcrumbItem[] = [{ label: "Inicio", href: routes.home }, ...auto];

  return (
    <nav aria-label="Migas de pan" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 font-body text-[13px] text-ink-soft">
        {trail.map((item, idx) => {
          const isLast = idx === trail.length - 1;
          return (
            <Fragment key={idx}>
              <li className="inline-flex items-center">
                {item.href && !isLast ? (
                  <Link to={item.href} className="capitalize hover:text-ink">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="capitalize text-ink">
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="text-ink-muted">
                  <Icon name="forward" size={14} decorative />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
