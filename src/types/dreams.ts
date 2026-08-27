export type DreamTheme = "emotions" | "movement" | "nature" | "relationships" | "objects";

export interface DreamSymbol {
  slug: string;
  name: string;
  theme: DreamTheme;
  shortDescription: string;
  symbolicLens: string;
  emotionalLens: string;
  reflectionQuestion: string;
  relatedWords: string[];
}
