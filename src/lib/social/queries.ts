import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/account/repository";

export type PublicProfile = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url" | "cover_url" | "bio" | "sun_sign" | "moon_sign" | "created_at"
>;

export async function fetchPublicProfileByUsername(username: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, cover_url, bio, sun_sign, moon_sign, created_at")
    .ilike("username", username)
    .maybeSingle();

  if (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }

  return data as PublicProfile | null;
}
