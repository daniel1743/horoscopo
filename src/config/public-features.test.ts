import { describe, expect, it } from "vitest";
import {
  isRoutePubliclyEnabled,
  publicFeatureVisibility,
  statusForRoute,
} from "@/config/public-features";
import { desktopPrimary, drawerGroups, mobileBottomPrimary, primaryNav } from "@/config/navigation";
import { footerConfig } from "@/config/footer";

describe("public feature visibility", () => {
  it("keeps the reduced public product enabled", () => {
    expect(publicFeatureVisibility.tarot).toBe("enabled");
    expect(publicFeatureVisibility.tarotDaily).toBe("enabled");
    expect(publicFeatureVisibility.tarotThreeCardsAmor).toBe("enabled");
    expect(publicFeatureVisibility.moon).toBe("enabled");
    expect(publicFeatureVisibility.guides).toBe("enabled");
  });

  it("hides incomplete public functions", () => {
    expect(statusForRoute("horoscope")).toBe("hidden");
    expect(statusForRoute("astrology")).toBe("hidden");
    expect(statusForRoute("compatibility")).toBe("hidden");
    expect(statusForRoute("account")).toBe("hidden");
    expect(statusForRoute("assistant")).toBe("hidden");
    expect(statusForRoute("about")).toBe("hidden");
    expect(statusForRoute("help")).toBe("hidden");
    expect(statusForRoute("contact")).toBe("hidden");
  });

  it("does not expose hidden routes in configured navigation", () => {
    const routeKeys = [
      ...desktopPrimary.map((item) => item.routeKey),
      ...desktopPrimary.flatMap((item) => item.children?.map((child) => child.routeKey) ?? []),
      ...mobileBottomPrimary.map((item) => item.routeKey),
      ...drawerGroups.flatMap((group) => group.items.map((item) => item.routeKey)),
      ...footerConfig.columns.flatMap((column) => column.links.map((link) => link.routeKey)),
    ];

    expect(routeKeys.every(isRoutePubliclyEnabled)).toBe(true);
    expect(primaryNav.map((item) => item.href)).not.toContain("/horoscopo");
    expect(primaryNav.map((item) => item.href)).not.toContain("/compatibilidad");
  });
});
