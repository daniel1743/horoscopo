import { dreamSymbols, dreamThemeLabels } from "@/config/dreams";
import type {
  DreamEmotion,
  DreamJournalEntry,
  DreamReflection,
  DreamSymbol,
  DreamTheme,
} from "@/types/dreams";

const DREAM_JOURNAL_STORAGE_KEY = "creovision-dream-journal-v1";
const MAX_JOURNAL_ENTRIES = 50;
const MAX_SYMBOLS_PER_REFLECTION = 5;

export const dreamEmotionLabels: Record<DreamEmotion, string> = {
  calm: "Calma",
  fear: "Miedo",
  joy: "Alegría",
  sadness: "Tristeza",
  anger: "Enojo",
  wonder: "Asombro",
  unclear: "No estoy seguro/a",
};

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

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function buildDreamReflection(
  symbols: readonly DreamSymbol[],
  emotion: DreamEmotion | null = null,
  context = "",
): DreamReflection | null {
  const selected = symbols.slice(0, MAX_SYMBOLS_PER_REFLECTION);
  if (selected.length === 0) return null;

  const themes = uniqueStrings(selected.map((symbol) => dreamThemeLabels[symbol.theme]));
  const relatedWords = selected.flatMap((symbol) =>
    symbol.relatedWords.map((word) => word.toLocaleLowerCase()),
  );
  const sharedWords = uniqueStrings(
    selected
      .flatMap((symbol) => symbol.relatedWords)
      .filter(
        (word) =>
          relatedWords.filter((candidate) => candidate === word.toLocaleLowerCase()).length > 1,
      ),
  );
  const emotionText = emotion
    ? ` La emoción que elegiste fue «${dreamEmotionLabels[emotion].toLocaleLowerCase()}».`
    : "";
  const contextText = context.trim().slice(0, 1000);

  return {
    title:
      selected.length === 1 ? `Reflexión sobre ${selected[0].name}` : "Cómo dialogan tus símbolos",
    overview: `Elegiste ${selected.map((symbol) => symbol.name).join(", ")}.${emotionText} Esta lectura no descifra el sueño ni diagnostica: organiza asociaciones para que compares imágenes, contexto y experiencia propia.`,
    sharedThemes: [
      ...themes,
      ...(sharedWords.length > 0
        ? [`Palabras relacionadas que se repiten: ${sharedWords.slice(0, 3).join(", ")}`]
        : []),
    ],
    symbolPrompts: selected.map((symbol) => ({
      symbolName: symbol.name,
      prompt: `${symbol.symbolicLens} ${symbol.emotionalLens} Pregunta: ${symbol.reflectionQuestion}`,
    })),
    contextPrompt: contextText
      ? `Al relacionarlo con lo que escribiste («${contextText}»), revisa qué asociación nace de tu experiencia y cuál proviene solo del catálogo.`
      : "¿Qué estaba ocurriendo en tu vida cuando apareció esta imagen y qué detalle del sueño cambia su sentido para ti?",
    reflectionQuestion:
      selected.length === 1
        ? selected[0].reflectionQuestion
        : "¿Qué relación encuentras entre los símbolos, la emoción y el contexto, y qué interpretación prefieres dejar abierta por ahora?",
  };
}

function isDreamEmotion(value: unknown): value is DreamEmotion {
  return typeof value === "string" && value in dreamEmotionLabels;
}

function isDreamJournalEntry(value: unknown): value is DreamJournalEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<DreamJournalEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.createdAtIso === "string" &&
    typeof entry.updatedAtIso === "string" &&
    typeof entry.title === "string" &&
    typeof entry.context === "string" &&
    (entry.reflection === undefined || typeof entry.reflection === "string") &&
    (entry.emotion === null || entry.emotion === undefined || isDreamEmotion(entry.emotion)) &&
    Array.isArray(entry.symbolSlugs) &&
    entry.symbolSlugs.length > 0 &&
    entry.symbolSlugs.length <= MAX_SYMBOLS_PER_REFLECTION &&
    entry.symbolSlugs.every(
      (slug) => typeof slug === "string" && getDreamSymbolBySlug(slug) !== null,
    )
  );
}

export function loadDreamJournal(): DreamJournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DREAM_JOURNAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isDreamJournalEntry)
      .map((entry) => ({ ...entry, reflection: entry.reflection ?? entry.context }))
      .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso))
      .slice(0, MAX_JOURNAL_ENTRIES);
  } catch {
    return [];
  }
}

function writeDreamJournal(entries: readonly DreamJournalEntry[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      DREAM_JOURNAL_STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_JOURNAL_ENTRIES)),
    );
    return true;
  } catch {
    return false;
  }
}

function localEntryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return `dream-${crypto.randomUUID()}`;
  return `dream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDreamJournalEntry(input: {
  title: string;
  context: string;
  reflection: string;
  emotion: DreamEmotion | null;
  symbolSlugs: readonly string[];
}): DreamJournalEntry | null {
  const symbolSlugs = uniqueStrings(input.symbolSlugs).filter((slug) => getDreamSymbolBySlug(slug));
  const title = input.title.trim().slice(0, 100);
  const context = input.context.trim().slice(0, 2000);
  const reflection = input.reflection.trim().slice(0, 6000);
  if (!title || !reflection || symbolSlugs.length === 0) return null;
  const now = new Date().toISOString();
  return {
    id: localEntryId(),
    createdAtIso: now,
    updatedAtIso: now,
    title,
    context,
    reflection,
    emotion: input.emotion,
    symbolSlugs: symbolSlugs.slice(0, MAX_SYMBOLS_PER_REFLECTION),
  };
}

export function saveDreamJournalEntry(entry: DreamJournalEntry): boolean {
  if (!isDreamJournalEntry(entry)) return false;
  const entries = loadDreamJournal().filter((current) => current.id !== entry.id);
  return writeDreamJournal([{ ...entry, updatedAtIso: new Date().toISOString() }, ...entries]);
}

export function deleteDreamJournalEntry(id: string): boolean {
  return writeDreamJournal(loadDreamJournal().filter((entry) => entry.id !== id));
}

export function clearDreamJournal(): boolean {
  return writeDreamJournal([]);
}

export function buildDreamJournalExport(entries: readonly DreamJournalEntry[]): string {
  return entries
    .map((entry) => {
      const symbols = entry.symbolSlugs
        .map((slug) => getDreamSymbolBySlug(slug)?.name)
        .filter((name): name is string => Boolean(name))
        .join(", ");
      const emotion = entry.emotion ? dreamEmotionLabels[entry.emotion] : "No indicada";
      const date = new Date(entry.createdAtIso).toLocaleString();
      return [
        `# ${entry.title}`,
        `Fecha: ${date}`,
        `Símbolos: ${symbols}`,
        `Emoción: ${emotion}`,
        "",
        "## Contexto",
        entry.context || "Sin contexto escrito.",
        "",
        "## Reflexión",
        entry.reflection,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}
