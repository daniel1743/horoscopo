import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/account/repository";

export type PublicProfile = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url" | "cover_url" | "bio" | "created_at"
> & {
  sun_sign?: string | null;
  moon_sign?: string | null;
  favorite_signs?: string[] | null;
};

export async function fetchPublicProfileByUsername(username: string): Promise<PublicProfile | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, cover_url, bio, sun_sign, moon_sign, favorite_signs, created_at")
    .ilike("username", username)
    .maybeSingle();

  if (profileError || !profile) {
    if (profileError) console.error("Error fetching public profile:", profileError);
    return null;
  }

  // Fetch privacy settings
  const { data: privacy } = await supabase
    .from("user_privacy_settings")
    .select("show_sun_sign, show_moon_sign, show_favorite_signs")
    .eq("user_id", profile.id)
    .maybeSingle();

  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    cover_url: profile.cover_url,
    bio: profile.bio,
    created_at: profile.created_at,
    sun_sign: privacy?.show_sun_sign !== false ? profile.sun_sign : null,
    moon_sign: privacy?.show_moon_sign === true ? profile.moon_sign : null,
    favorite_signs: privacy?.show_favorite_signs !== false ? profile.favorite_signs : null,
  };
}
