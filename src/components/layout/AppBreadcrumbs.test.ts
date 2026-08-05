import { describe, expect, it } from "vitest";
import { routes } from "@/config/routes";
import { buildBreadcrumbTrail } from "./breadcrumb-utils";

describe("buildBreadcrumbTrail", () => {
  it("adds Inicio once for a simple breadcrumb", () => {
    expect(buildBreadcrumbTrail([{ label: "Tarot", href: routes.tarot }])).toEqual([
      { label: "Inicio", href: routes.home },
      { label: "Tarot", href: routes.tarot },
    ]);
  });

  it("does not duplicate Inicio if the caller includes it", () => {
    expect(
      buildBreadcrumbTrail([
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
      ]),
    ).toEqual([
      { label: "Inicio", href: routes.home },
      { label: "Tarot", href: routes.tarot },
    ]);
  });

  it("keeps nested breadcrumbs after Inicio", () => {
    expect(
      buildBreadcrumbTrail([
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Amor" },
      ]),
    ).toEqual([
      { label: "Inicio", href: routes.home },
      { label: "Tarot", href: routes.tarot },
      { label: "Amor" },
    ]);
  });

  it("handles an empty breadcrumb list", () => {
    expect(buildBreadcrumbTrail([])).toEqual([{ label: "Inicio", href: routes.home }]);
  });
});
