/**
 * Recuperación de contexto autorizado (RAG básico). SERVER-ONLY.
 * Consulta únicamente contenido publicado por el módulo correspondiente.
 */
import type {
  AiArticleContextInput,
  AiHoroscopeContextInput,
  AiModuleMode,
  AiSource,
  AiTarotContextInput,
} from "@/types/ai";
import { retrievalConfig } from "@/config/ai/retrieval";
import { articleRoute, tarotCardRoute, zodiacRoute } from "@/config/routes";

interface RetrievedContext {
  text: string;
  sources: AiSource[];
  notFound?: boolean;
}

const EMPTY: RetrievedContext = { text: "", sources: [] };

export async function retrieveContext(
  mode: AiModuleMode,
  input: unknown,
): Promise<RetrievedContext> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (mode === "tarot") {
      const ctx = input as AiTarotContextInput | undefined;
      if (!ctx || !Array.isArray(ctx.cardKeys) || ctx.cardKeys.length === 0) return EMPTY;
      const { data } = await supabaseAdmin
        .from("tarot_cards")
        .select("card_key, slug, name, upright_meaning, reversed_meaning, summary, yes_no_tendency")
        .in("card_key", ctx.cardKeys)
        .eq("status", "published");
      if (!data || data.length === 0) return { ...EMPTY, notFound: true };
      // Preserve requested order.
      const byKey = new Map(data.map((r) => [r.card_key, r]));
      const ordered = ctx.cardKeys.map((k) => byKey.get(k)).filter(Boolean) as typeof data;
      const text = ordered
        .map((c, i) => {
          const pos = ctx.positionKeys?.[i] ?? `posición ${i + 1}`;
          return `[Posición: ${pos}] Carta: ${c.name} (tendencia sí/no: ${c.yes_no_tendency}).\nResumen: ${c.summary}\nSignificado (al derecho): ${c.upright_meaning}`;
        })
        .join("\n\n");
      const sources: AiSource[] = ordered.map((c) => ({
        title: c.name,
        sourceType: "tarot_card",
        url: tarotCardRoute(c.slug),
      }));
      return { text: text.slice(0, retrievalConfig.maxCharacters), sources };
    }

    if (mode === "horoscope") {
      const ctx = input as AiHoroscopeContextInput | undefined;
      if (!ctx?.signSlug || !ctx?.period) return EMPTY;
      const query = supabaseAdmin
        .from("horoscopes")
        .select("sign_slug, period, date_for, summary, focus, mood, love, work, wellbeing")
        .eq("sign_slug", ctx.signSlug)
        .eq("period", ctx.period)
        .not("published_at", "is", null)
        .order("date_for", { ascending: false })
        .limit(1);
      const { data } = await query;
      if (!data || data.length === 0) return { ...EMPTY, notFound: true };
      const h = data[0];
      const text = `Signo: ${h.sign_slug} — periodo: ${h.period} — fecha: ${h.date_for}.
Resumen: ${h.summary}
Enfoque: ${h.focus}
Ánimo: ${h.mood}
${h.love ? `Amor: ${h.love}\n` : ""}${h.work ? `Trabajo: ${h.work}\n` : ""}${h.wellbeing ? `Bienestar: ${h.wellbeing}` : ""}`;
      return {
        text: text.slice(0, retrievalConfig.maxCharacters),
        sources: [
          {
            title: `Horóscopo ${h.sign_slug} — ${h.period}`,
            sourceType: "horoscope",
            url: zodiacRoute(h.sign_slug),
          },
        ],
      };
    }

    if (mode === "article") {
      const ctx = input as AiArticleContextInput | undefined;
      if (!ctx?.articleSlug) return EMPTY;
      const { data } = await supabaseAdmin
        .from("editorial_articles")
        .select("slug, title, excerpt, content")
        .eq("slug", ctx.articleSlug)
        .eq("status", "published")
        .maybeSingle();
      if (!data) return { ...EMPTY, notFound: true };
      const contentText = flattenArticleContent(data.content);
      const text = `Título: ${data.title}\nResumen: ${data.excerpt}\n\n${contentText}`.slice(
        0,
        retrievalConfig.maxCharacters,
      );
      return {
        text,
        sources: [{ title: data.title, sourceType: "article", url: articleRoute(data.slug) }],
      };
    }

    return EMPTY;
  } catch (err) {
    console.error("[ai/retrieval] error", err);
    return EMPTY;
  }
}

function flattenArticleContent(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .map((rawBlock) => {
      const block = asRecord(rawBlock);
      if (typeof block?.text === "string") return block.text;
      if (typeof block?.content === "string") return block.content;
      if (Array.isArray(block?.children)) {
        return block.children
          .map((rawChild) => {
            const child = asRecord(rawChild);
            return typeof child?.text === "string" ? child.text : "";
          })
          .join(" ");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}
