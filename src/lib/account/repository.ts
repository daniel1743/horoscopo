/**
 * Repositorio del área privada. Todas las operaciones pasan por el cliente
 * Supabase autenticado del navegador; RLS asegura que cada usuario solo vea
 * lo suyo. Los inserts nunca aceptan user_id desde parámetros externos.
 */
import { supabase } from "@/integrations/supabase/client";

// ---------- Tipos ----------
export type AuraStyle = "lunar-violet" | "solar-gold" | "forest-emerald" | "cosmic-blue";
export type ProfileVisibility = "private" | "public";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferred_sign: string | null;
  city: string | null;
  birth_date: string | null;
  username: string | null;
  aura_style: AuraStyle;
  profile_visibility: ProfileVisibility;
  show_preferred_sign: boolean;
  show_city: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferred_sign: string | null;
  city: string | null;
  aura_style: AuraStyle;
}

export interface PrivacySettings {
  user_id: string;
  activity_tracking_enabled: boolean;
  save_readings_allowed: boolean;
  ai_personalization_enabled: boolean;
  newsletter_opt_in: boolean;
}

export type FavoriteType = "article" | "tarot_card" | "zodiac_sign" | "guide" | "horoscope";

export interface Favorite {
  id: string;
  user_id: string;
  item_type: FavoriteType;
  item_ref: string;
  item_title: string | null;
  item_metadata: Record<string, unknown>;
  created_at: string;
}

export type SpreadType = "daily" | "yes_no" | "three_cards";

export interface SavedReadingCard {
  slug: string;
  position?: string;
  reversed?: boolean;
}

export interface SavedReading {
  id: string;
  user_id: string;
  spread_type: SpreadType;
  cards: SavedReadingCard[];
  interpretation: string | null;
  note: string | null;
  created_at: string;
}

export type ActivityType =
  | "view_horoscope"
  | "view_tarot_card"
  | "view_article"
  | "view_guide"
  | "tarot_reading"
  | "favorite_added"
  | "favorite_removed"
  | "reading_saved"
  | "profile_updated";

export interface ActivityEntry {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  ref_type: string | null;
  ref_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---------- Profile ----------
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(
  userId: string,
  patch: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...patch }, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase.rpc("get_public_profile", { p_username: username });
  if (error) throw error;
  return (data?.[0] ?? null) as PublicProfile | null;
}

// ---------- Privacy ----------
export async function fetchPrivacySettings(userId: string): Promise<PrivacySettings> {
  const { data, error } = await supabase
    .from("user_privacy_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as PrivacySettings;
  // Fallback si el trigger no corrió aún
  const { data: inserted, error: insertError } = await supabase
    .from("user_privacy_settings")
    .insert({ user_id: userId })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return inserted as PrivacySettings;
}

export async function updatePrivacySettings(
  userId: string,
  patch: Partial<Omit<PrivacySettings, "user_id">>,
): Promise<PrivacySettings> {
  const { data, error } = await supabase
    .from("user_privacy_settings")
    .update(patch)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as PrivacySettings;
}

// ---------- Favorites ----------
export async function listFavorites(): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Favorite[];
}

export async function isFavorite(itemType: FavoriteType, itemRef: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("item_type", itemType)
    .eq("item_ref", itemRef)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function addFavorite(input: {
  userId: string;
  itemType: FavoriteType;
  itemRef: string;
  itemTitle?: string;
  metadata?: Record<string, unknown>;
}): Promise<Favorite> {
  const { data, error } = await supabase
    .from("user_favorites")
    .insert({
      user_id: input.userId,
      item_type: input.itemType,
      item_ref: input.itemRef,
      item_title: input.itemTitle ?? null,
      item_metadata: (input.metadata ?? {}) as never,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Favorite;
}

export async function removeFavorite(itemType: FavoriteType, itemRef: string): Promise<void> {
  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("item_type", itemType)
    .eq("item_ref", itemRef);
  if (error) throw error;
}

// ---------- Saved tarot readings ----------
export async function listSavedReadings(): Promise<SavedReading[]> {
  const { data, error } = await supabase
    .from("saved_tarot_readings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SavedReading[];
}

/**
 * Guarda una lectura manualmente. Nunca se guarda la pregunta original,
 * solo la selección de cartas, la interpretación y una nota opcional.
 */
export async function saveTarotReading(input: {
  userId: string;
  spreadType: SpreadType;
  cards: SavedReadingCard[];
  interpretation?: string | null;
  note?: string | null;
}): Promise<SavedReading> {
  const { data, error } = await supabase
    .from("saved_tarot_readings")
    .insert({
      user_id: input.userId,
      spread_type: input.spreadType,
      cards: input.cards as never,
      interpretation: input.interpretation ?? null,
      note: input.note ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as SavedReading;
}

export async function deleteSavedReading(id: string): Promise<void> {
  const { error } = await supabase.from("saved_tarot_readings").delete().eq("id", id);
  if (error) throw error;
}

export async function updateSavedReadingNote(id: string, note: string | null): Promise<void> {
  const { error } = await supabase.from("saved_tarot_readings").update({ note }).eq("id", id);
  if (error) throw error;
}

// ---------- Activity history ----------
export async function listActivity(limit = 50): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("user_activity_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ActivityEntry[];
}

/**
 * Registra actividad SOLO si el usuario tiene el historial activado.
 * Nunca guardar texto libre ni contenido sensible.
 */
export async function logActivity(input: {
  userId: string;
  type: ActivityType;
  refType?: string;
  refId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const privacy = await fetchPrivacySettings(input.userId);
    if (!privacy.activity_tracking_enabled) return;
    await supabase.from("user_activity_history").insert({
      user_id: input.userId,
      activity_type: input.type,
      ref_type: input.refType ?? null,
      ref_id: input.refId ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch {
    // El historial es opcional: no debe romper la UX si falla.
  }
}

export async function deleteActivityEntry(id: string): Promise<void> {
  const { error } = await supabase.from("user_activity_history").delete().eq("id", id);
  if (error) throw error;
}

export async function clearActivity(userId: string): Promise<void> {
  const { error } = await supabase.from("user_activity_history").delete().eq("user_id", userId);
  if (error) throw error;
}
