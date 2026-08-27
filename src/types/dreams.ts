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

export type DreamEmotion = "calm" | "fear" | "joy" | "sadness" | "anger" | "wonder" | "unclear";

export interface DreamJournalEntry {
  id: string;
  createdAtIso: string;
  updatedAtIso: string;
  title: string;
  context: string;
  reflection: string;
  emotion: DreamEmotion | null;
  symbolSlugs: string[];
}

export interface DreamReflection {
  title: string;
  overview: string;
  sharedThemes: string[];
  symbolPrompts: Array<{ symbolName: string; prompt: string }>;
  contextPrompt: string;
  reflectionQuestion: string;
}
