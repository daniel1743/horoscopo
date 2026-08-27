import { dreamSymbols } from "@/config/dreams";
import type { DreamSymbol, DreamTheme } from "@/types/dreams";

export function searchDreamSymbols(query = "", theme: DreamTheme | "all" = "all"): DreamSymbol[] {
  const normalized = query.trim().toLocaleLowerCase();
  return dreamSymbols.filter((symbol) => {
    if (theme !== "all" && symbol.theme !== theme) return false;
    if (!normalized) return true;
    const searchable = [
      symbol.name,
      symbol.shortDescription,
      symbol.symbolicLens,
      symbol.emotionalLens,
      symbol.reflectionQuestion,
      ...symbol.relatedWords,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return searchable.includes(normalized);
  });
}

export function getDreamSymbolBySlug(slug: string): DreamSymbol | null {
  return dreamSymbols.find((symbol) => symbol.slug === slug) ?? null;
}
