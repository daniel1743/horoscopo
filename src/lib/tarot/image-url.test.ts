import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getTarotImagePublicUrl, getTarotImageStoragePath } from "./image-url";

interface CatalogCard {
  name: string;
  arcana: string;
  suit: string | null;
  image_key: string;
}

const catalog = JSON.parse(
  readFileSync(new URL("../../../catalogo_tarot.json", import.meta.url), "utf8"),
) as CatalogCard[];

function toInput(card: CatalogCard) {
  return {
    arcana: card.arcana,
    suit: card.suit,
    imageKey: card.image_key,
  };
}

describe("tarot image url mapper", () => {
  it("genera 78 rutas unicas con la distribucion esperada", () => {
    const results = catalog.map((card) => getTarotImageStoragePath(toInput(card)));
    const paths = results.map((result) => {
      expect(result.ok).toBe(true);
      return result.ok ? result.storagePath : "";
    });

    expect(paths).toHaveLength(78);
    expect(new Set(paths).size).toBe(78);
    expect(paths.filter((path) => path.startsWith("major/"))).toHaveLength(22);
    expect(paths.filter((path) => path.startsWith("wands/"))).toHaveLength(14);
    expect(paths.filter((path) => path.startsWith("cups/"))).toHaveLength(14);
    expect(paths.filter((path) => path.startsWith("swords/"))).toHaveLength(14);
    expect(paths.filter((path) => path.startsWith("pentacles/"))).toHaveLength(14);
    expect(paths.some((path) => path.includes("unknown"))).toBe(false);
    expect(paths.some((path) => path.includes(".webp.webp"))).toBe(false);
  });

  it("rechaza entradas invalidas sin construir rutas silenciosas", () => {
    const validMinor = { arcana: "minor", suit: "wands", imageKey: "tarot_wands_ace" };
    const cases = [
      { ...validMinor, imageKey: "" },
      { ...validMinor, suit: null },
      { ...validMinor, suit: "fire" },
      { ...validMinor, arcana: "court" },
      { ...validMinor, imageKey: "tarot/wands_ace" },
      { ...validMinor, imageKey: "tarot\\wands_ace" },
      { ...validMinor, imageKey: "../tarot_wands_ace" },
      { ...validMinor, imageKey: "tarot_wands_ace.webp" },
      { ...validMinor, imageKey: "tarot_wands_ace?download=1" },
      { ...validMinor, imageKey: "tarot_wands_ace#fragment" },
    ];

    for (const input of cases) {
      const result = getTarotImageStoragePath(input);
      expect(result.ok).toBe(false);
    }
  });

  it("construye URL publica con el cliente centralizado y sin dominio hardcodeado", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";

    const result = getTarotImagePublicUrl({
      arcana: "major",
      suit: null,
      imageKey: "tarot_major_00_the_fool",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.storagePath).toBe("major/tarot_major_00_the_fool.webp");
      expect(result.publicUrl).toContain("/storage/v1/object/public/tarot/");
    }
  });

  it("no contiene dominios fijos ni referencias a la funcion antigua", () => {
    const mapperSource = readFileSync(new URL("./image-url.ts", import.meta.url), "utf8");
    const visualSource = readFileSync(
      new URL("../../components/tarot/TarotCardVisual.tsx", import.meta.url),
      "utf8",
    );

    expect(mapperSource).not.toContain("supabase.co/storage");
    expect(visualSource).not.toContain("mmfendqrucasrcsfsvpw");
    expect(visualSource).not.toContain("function getTarotImageUrl");
  });
});
