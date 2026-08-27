/**
 * Implementación Supabase del repositorio de tarot.
 * Portable: usa el cliente estándar generado. No usa service_role.
 */
import { supabase } from "@/integrations/supabase/client";
import type { TarotArcana, TarotCard, TarotSuit } from "@/types/tarot";
import type { TarotRepository } from "./tarot.repository";
import { TAROT_CARD_COLUMNS, mapTarotCardRow, type TarotCardRow } from "@/lib/tarot/mappers";

const cli = () => supabase as unknown as import("@supabase/supabase-js").SupabaseClient;

async function selectPublished(filter?: {
  arcana?: TarotArcana;
  suit?: TarotSuit;
}): Promise<TarotCard[]> {
  let q = cli()
    .from("tarot_cards")
    .select(TAROT_CARD_COLUMNS)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("display_order", { ascending: true });
  if (filter?.arcana) q = q.eq("arcana", filter.arcana);
  if (filter?.suit) q = q.eq("suit", filter.suit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as TarotCardRow[] | null)?.map(mapTarotCardRow) ?? [];
}

export const supabaseTarotRepository: TarotRepository = {
  async getPublishedCards(opts) {
    return selectPublished({ arcana: opts?.arcana });
  },

  async getCardBySlug(slug) {
    const { data, error } = await cli()
      .from("tarot_cards")
      .select(TAROT_CARD_COLUMNS)
      .eq("slug", slug)
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data ? mapTarotCardRow(data as TarotCardRow) : null;
  },

  async getCardByKey(cardKey) {
    const { data, error } = await cli()
      .from("tarot_cards")
      .select(TAROT_CARD_COLUMNS)
      .eq("card_key", cardKey)
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data ? mapTarotCardRow(data as TarotCardRow) : null;
  },

  async getPublishedCardCount() {
    const { count, error } = await cli()
      .from("tarot_cards")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString());
    if (error) throw error;
    return count ?? 0;
  },

  async getLibrary(opts) {
    return selectPublished(opts);
  },
};
