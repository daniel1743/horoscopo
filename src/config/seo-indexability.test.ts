import { describe, expect, it } from "vitest";
import { absoluteUrl, buildMeta } from "@/config/seo";
import { routes, compatibilityRoute, tarotCardRoute } from "@/config/routes";
import { majorArcana } from "@/data/tarot-cards";
import { getSitemapEntries, buildSitemapXml } from "@/routes/sitemap[.]xml";

function metaContent(
  meta: Array<Record<string, string>>,
  key: "name" | "property",
  value: string,
): string | undefined {
  return meta.find((item) => item[key] === value)?.content;
}

describe("SEO indexability and canonical consistency", () => {
  it("includes public tarot core routes and Tu Luna in the sitemap", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);

    expect(paths).toContain(routes.tarot);
    expect(paths).toContain(routes.tarotDaily);
    expect(paths).toContain(routes.tarotYesNo);
    expect(paths).toContain(routes.tarotThreeCards);
    expect(paths).toContain(routes.tarotThreeCardsAmor);
    expect(paths).toContain(routes.tarotThreeCardsTrabajo);
    expect(paths).toContain(routes.tarotThreeCardsDecision);
    expect(paths).toContain(routes.tarotLibrary);
    expect(paths).toContain(routes.moonPersonalToday);
  });

  it("does not generate duplicate sitemap URLs", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("only enumerates locally known public tarot card URLs", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);
    const tarotCardPaths = paths.filter((path) => path.startsWith(`${routes.tarotLibrary}/`));

    expect(tarotCardPaths).toHaveLength(majorArcana.length);
    expect(tarotCardPaths).toContain(tarotCardRoute("el-loco"));
  });

  it("builds sitemap XML with the canonical host", () => {
    const xml = buildSitemapXml([
      { path: routes.tarotYesNo, priority: "0.8", changefreq: "weekly" },
    ]);
    expect(xml).toContain(`<loc>${absoluteUrl(routes.tarotYesNo)}</loc>`);
  });

  it("uses self canonical and matching og:url when canonical is provided", () => {
    const result = buildMeta({
      title: "Tarot sí o no · Creovision",
      canonical: routes.tarotYesNo,
    });

    expect(result.links).toContainEqual({ rel: "canonical", href: absoluteUrl(routes.tarotYesNo) });
    expect(metaContent(result.meta, "property", "og:url")).toBe(absoluteUrl(routes.tarotYesNo));
  });

  it("does not silently point og:url to home when canonical is missing", () => {
    const result = buildMeta({ title: "Página interna sin canonical" });
    expect(metaContent(result.meta, "property", "og:url")).toBeUndefined();
  });

  it("keeps themed tarot canonicals distinct", () => {
    const amor = buildMeta({ title: "Amor", canonical: routes.tarotThreeCardsAmor });
    const trabajo = buildMeta({ title: "Trabajo", canonical: routes.tarotThreeCardsTrabajo });
    const decision = buildMeta({ title: "Decisión", canonical: routes.tarotThreeCardsDecision });

    expect(metaContent(amor.meta, "property", "og:url")).toBe(
      absoluteUrl(routes.tarotThreeCardsAmor),
    );
    expect(metaContent(trabajo.meta, "property", "og:url")).toBe(
      absoluteUrl(routes.tarotThreeCardsTrabajo),
    );
    expect(metaContent(decision.meta, "property", "og:url")).toBe(
      absoluteUrl(routes.tarotThreeCardsDecision),
    );
  });

  it("keeps compatibility canonical URLs normalized by the route helper", () => {
    const canonical = compatibilityRoute("geminis", "sagitario");
    const result = buildMeta({ title: "Compatibilidad", canonical });

    expect(result.links).toContainEqual({ rel: "canonical", href: absoluteUrl(canonical) });
    expect(canonical).toBe("/compatibilidad/geminis/sagitario");
  });
});
