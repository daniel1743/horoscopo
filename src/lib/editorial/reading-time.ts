import type { ArticleContentBlock } from "@/types/editorial";
import { editorialConfig } from "@/config/editorial";

/** Calcula tiempo de lectura estimado (minutos) a partir de bloques de contenido. */
export function calculateReadingTime(blocks: ArticleContentBlock[]): number {
  const words = blocks.reduce((acc, b) => {
    switch (b.type) {
      case "paragraph":
      case "heading":
        return acc + countWords(b.text);
      case "list":
      case "key_points":
        return acc + b.items.reduce((s, i) => s + countWords(i), 0);
      case "quote":
        return acc + countWords(b.text);
      case "callout":
        return acc + countWords(b.content);
      default:
        return acc;
    }
  }, 0);
  return Math.max(1, Math.round(words / editorialConfig.wordsPerMinute));
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
