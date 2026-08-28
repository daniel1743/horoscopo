// @ts-nocheck
import { describe, expect, it } from "vitest";

import { routes } from "./routes";
import { absoluteUrl, buildJsonLd, buildMeta, serializeJsonLdForScript } from "./seo";

describe("buildJsonLd", () => {
  it("builds one deterministic WebSite node and one local WebPage node", () => {
    const payload = buildJsonLd({
      canonical: "/tarot/carta-del-dia",
      name: "Carta del día · Tarot · Creovision",
      description: "Una carta simbólica diaria.",
      pageType: "WebPage",
    });

    expect(payload["@context"]).toBe("https://schema.org");
    expect(payload["@graph"]).toHaveLength(2);
    expect(payload["@graph"].filter((node) => node["@type"] === "WebSite")).toHaveLength(1);
    expect(payload["@graph"].filter((node) => node["@type"] === "WebPage")).toHaveLength(1);
    expect(payload["@graph"][0]).toMatchObject({
      "@type": "WebSite",
      "@id": "https://www.creovision.io/#website",
      url: "https://www.creovision.io/",
      name: "Creovision",
    });
    expect(payload["@graph"][1]).toMatchObject({
      "@type": "WebPage",
      "@id": "https://www.creovision.io/tarot/carta-del-dia#webpage",
      url: "https://www.creovision.io/tarot/carta-del-dia",
      name: "Carta del día · Tarot · Creovision",
      description: "Una carta simbólica diaria.",
      isPartOf: { "@id": "https://www.creovision.io/#website" },
    });
  });

  it("builds CollectionPage without adding forbidden schema nodes", () => {
    const payload = buildJsonLd({
      canonical: "/tarot",
      name: "Tarot · Creovision",
      description: "Lecturas simbólicas de tarot.",
      pageType: "CollectionPage",
    });
    const serialized = JSON.stringify(payload);

    expect(payload["@graph"].filter((node) => node["@type"] === "CollectionPage")).toHaveLength(1);
    expect(serialized).not.toContain("SearchAction");
    expect(serialized).not.toContain("Organization");
    expect(serialized).not.toContain("BreadcrumbList");
    expect(serialized).not.toContain("FAQPage");
    expect(serialized).not.toContain("Article");
    expect(serialized).not.toContain("Product");
    expect(serialized).not.toContain("Review");
    expect(serialized).not.toContain("AggregateRating");
  });

  it("is JSON parseable and does not emit undefined or unintentional null values", () => {
    const payload = buildJsonLd({
      canonical: absoluteUrl(routes.home),
      name: "Inicio",
      description: "Página principal.",
      pageType: "WebPage",
    });
    const serialized = JSON.stringify(payload);

    expect(JSON.parse(serialized)).toEqual(payload);
    expect(serialized).not.toContain("undefined");
    expect(serialized).not.toContain(":null");
  });

  it("emits a safe application/ld+json head script for unsafe text", () => {
    const m = buildMeta({
      title: "Texto </script><script> & acentos",
      description: "Descripción con </script>, <script>, &, ñ y ü.",
      canonical: "/tarot/si-o-no",
      structuredData: "WebPage",
    });
    const script = m.scripts?.[0];

    expect(script?.type).toBe("application/ld+json");
    expect(script?.children).not.toContain("</script>");
    expect(script?.children).not.toContain("<script>");
    expect(script?.children).toContain("\\u003c/script\\u003e");
    expect(script?.children).toContain("\\u0026");
  });

  it("serializes safely while staying parseable as JSON", () => {
    const payload = buildJsonLd({
      canonical: "/luna/fases/luna-llena",
      name: "Luna llena </script>",
      description: "Texto con <script> y &.",
      pageType: "WebPage",
    });
    const serialized = serializeJsonLdForScript(payload);

    expect(JSON.parse(serialized)).toEqual(payload);
  });
});
