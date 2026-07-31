/**
 * Interfaz del repositorio de tarot.
 * Los componentes/páginas dependen de esta interfaz, nunca de Supabase.
 */
import type { TarotArcana, TarotCard, TarotSuit } from "@/types/tarot";

export interface TarotRepository {
  getPublishedCards(opts?: { arcana?: TarotArcana }): Promise<TarotCard[]>;
  getCardBySlug(slug: string): Promise<TarotCard | null>;
  getCardByKey(cardKey: string): Promise<TarotCard | null>;
  getPublishedCardCount(): Promise<number>;
  getLibrary(opts?: { arcana?: TarotArcana; suit?: TarotSuit }): Promise<TarotCard[]>;
  getPreviewCards?(opts?: { arcana?: TarotArcana; suit?: TarotSuit }): Promise<TarotCard[]>;
  getPreviewCardBySlug?(slug: string): Promise<TarotCard | null>;
}
