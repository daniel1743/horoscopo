/**
 * Implementación Supabase del repositorio de tarot.
 * Portable: usa el cliente estándar generado. No usa service_role.
 */
import { supabase } from "@/integrations/supabase/client";
import type { TarotArcana, TarotCard, TarotSuit } from "@/types/tarot";
import type { TarotRepository } from "./tarot.repository";
import { TAROT_CARD_COLUMNS, mapTarotCardRow, type TarotCardRow } from "@/lib/tarot/mappers";

const cli = () => supabase as unknown as import("@supabase/supabase-js").SupabaseClient;

interface TarotPublicationQuery {
  eq(column: string, value: unknown): TarotPublicationQuery;
  not(column: string, operator: string, value: unknown): TarotPublicationQuery;
  lte(column: string, value: unknown): TarotPublicationQuery;
}

export interface TarotPublicationState {
  status: string | null;
  published_at: string | null;
}

export function applyPublishedTarotFilters<TQuery>(
  query: TQuery,
  nowIso = new Date().toISOString(),
): TQuery {
  const filtered = query as unknown as TarotPublicationQuery;
  return filtered
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", nowIso) as unknown as TQuery;
}

export function isPublicTarotPublication(row: TarotPublicationState, nowIso: string): boolean {
  return (
    row.status === "published" &&
    typeof row.published_at === "string" &&
    row.published_at.length > 0 &&
    row.published_at <= nowIso
  );
}

export function isTarotDraftPreviewEnabled(
  env: Pick<ImportMetaEnv, "DEV"> &
    Partial<Pick<ImportMetaEnv, "VITE_TAROT_PREVIEW_DRAFTS">> = import.meta.env,
): boolean {
  return env.DEV === true && env.VITE_TAROT_PREVIEW_DRAFTS === "true";
}

async function selectPublished(filter?: {
  arcana?: TarotArcana;
  suit?: TarotSuit;
}): Promise<TarotCard[]> {
  let q = applyPublishedTarotFilters(
    cli()
      .from("tarot_cards")
      .select(TAROT_CARD_COLUMNS)
      .order("display_order", { ascending: true }),
  );
  if (filter?.arcana) q = q.eq("arcana", filter.arcana);
  if (filter?.suit) q = q.eq("suit", filter.suit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as TarotCardRow[] | null)?.map(mapTarotCardRow) ?? [];
}

async function selectPreview(filter?: {
  arcana?: TarotArcana;
  suit?: TarotSuit;
}): Promise<TarotCard[]> {
  if (!isTarotDraftPreviewEnabled()) {
    return [];
  }

  let q = cli()
    .from("tarot_cards")
    .select(TAROT_CARD_COLUMNS)
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
    const { data, error } = await applyPublishedTarotFilters(
      cli().from("tarot_cards").select(TAROT_CARD_COLUMNS).eq("slug", slug),
    ).maybeSingle();
    if (error) throw error;
    return data ? mapTarotCardRow(data as TarotCardRow) : null;
  },

  async getCardByKey(cardKey) {
    const { data, error } = await applyPublishedTarotFilters(
      cli().from("tarot_cards").select(TAROT_CARD_COLUMNS).eq("card_key", cardKey),
    ).maybeSingle();
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

  async getPreviewCards(opts) {
    return selectPreview(opts);
  },

  async getPreviewCardBySlug(slug) {
    if (!isTarotDraftPreviewEnabled()) {
      return null;
    }

    const { data, error } = await cli()
      .from("tarot_cards")
      .select(TAROT_CARD_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapTarotCardRow(data as TarotCardRow) : null;
  },
};
