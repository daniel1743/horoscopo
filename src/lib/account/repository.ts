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

export type CommunityPostType =
  "reflection" | "horoscope" | "moon" | "tarot" | "compatibility" | "birth_chart" | "other";
export type CommunityPostStatus = "published" | "hidden" | "deleted" | "pending";
export type CommunityReportReason = "spam" | "harassment" | "sensitive" | "misleading" | "other";

export interface CommunityPost {
  id: string;
  user_id: string;
  post_type: CommunityPostType;
  title: string | null;
  body: string;
  source_ref: string | null;
  source_title: string | null;
  source_url: string | null;
  visibility: "private" | "public";
  status: CommunityPostStatus;
  created_at: string;
  updated_at: string;
}

export interface PublicCommunityPost {
  id: string;
  post_type: CommunityPostType;
  title: string | null;
  body: string;
  source_ref: string | null;
  source_title: string | null;
  source_url: string | null;
  created_at: string;
  author_username: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
  author_aura_style: AuraStyle;
  likes_count: number;
  reposts_count: number;
  liked_by_viewer: boolean;
  reposted_by_viewer: boolean;
}

export interface PublicCommunityRepost extends PublicCommunityPost {
  reposter_username: string;
  reposter_display_name: string | null;
}

export async function listPublicCommunityPosts(limit = 30): Promise<PublicCommunityPost[]> {
  const { data, error } = await supabase.rpc("list_public_community_posts", { p_limit: limit });
  if (error) throw error;
  return (data ?? []) as PublicCommunityPost[];
}

export async function listPublicCommunityReposts(limit = 30): Promise<PublicCommunityRepost[]> {
  const { data, error } = await supabase.rpc("list_public_community_reposts", { p_limit: limit });
  if (error) throw error;
  return (data ?? []) as PublicCommunityRepost[];
}

export async function listPublicProfilePosts(
  username: string,
  limit = 30,
): Promise<PublicCommunityPost[]> {
  const { data, error } = await supabase.rpc("list_public_profile_posts", {
    p_username: username,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as PublicCommunityPost[];
}

export async function listPublicProfileReposts(
  username: string,
  limit = 30,
): Promise<PublicCommunityRepost[]> {
  const { data, error } = await supabase.rpc("list_public_profile_reposts", {
    p_username: username,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as PublicCommunityRepost[];
}

export async function toggleCommunityPostLike(input: {
  postId: string;
  userId: string;
  liked: boolean;
}): Promise<void> {
  if (input.liked) {
    const { error } = await supabase
      .from("community_post_likes")
      .delete()
      .eq("post_id", input.postId)
      .eq("user_id", input.userId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("community_post_likes").insert({
    post_id: input.postId,
    user_id: input.userId,
  });
  if (error) throw error;
}

export async function toggleCommunityPostRepost(input: {
  postId: string;
  userId: string;
  reposted: boolean;
}): Promise<void> {
  if (input.reposted) {
    const { error } = await supabase
      .from("community_post_reposts")
      .delete()
      .eq("post_id", input.postId)
      .eq("user_id", input.userId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("community_post_reposts").insert({
    post_id: input.postId,
    user_id: input.userId,
  });
  if (error) throw error;
}

export async function listOwnCommunityPosts(userId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CommunityPost[];
}

export async function createCommunityPost(input: {
  userId: string;
  postType: CommunityPostType;
  title?: string | null;
  body: string;
  sourceRef?: string | null;
  sourceTitle?: string | null;
  sourceUrl?: string | null;
  visibility?: "private" | "public";
}): Promise<CommunityPost> {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: input.userId,
      post_type: input.postType,
      title: input.title?.trim() || null,
      body: input.body.trim(),
      source_ref: input.sourceRef ?? null,
      source_title: input.sourceTitle ?? null,
      source_url: input.sourceUrl ?? null,
      visibility: input.visibility ?? "public",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as CommunityPost;
}

export async function updateCommunityPostStatus(
  userId: string,
  postId: string,
  status: Extract<CommunityPostStatus, "published" | "hidden">,
): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .update({ status })
    .eq("id", postId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteCommunityPost(userId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function reportCommunityPost(input: {
  postId: string;
  reporterId: string;
  reason: CommunityReportReason;
  details?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("community_post_reports").insert({
    post_id: input.postId,
    reporter_id: input.reporterId,
    reason: input.reason,
    details: input.details?.trim() || null,
  });
  if (error) throw error;
}

export interface CommunityModerationReport {
  report_id: string;
  post_id: string;
  report_reason: CommunityReportReason;
  report_details: string | null;
  report_status: "open" | "reviewed" | "dismissed";
  reported_at: string;
  post_title: string | null;
  post_body: string;
  post_type: CommunityPostType;
  post_status: CommunityPostStatus;
  author_username: string | null;
  reporter_id: string;
}

export async function listOpenCommunityReports(limit = 50): Promise<CommunityModerationReport[]> {
  const { data, error } = await supabase.rpc("list_open_community_reports", { p_limit: limit });
  if (error) throw error;
  return (data ?? []) as CommunityModerationReport[];
}

export async function moderateCommunityReport(input: {
  reportId: string;
  decision: "dismiss" | "hide";
  note?: string | null;
}): Promise<boolean> {
  const { data, error } = await supabase.rpc("moderate_community_report", {
    p_report_id: input.reportId,
    p_decision: input.decision,
    p_note: input.note?.trim() || null,
  });
  if (error) throw error;
  return Boolean(data);
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
