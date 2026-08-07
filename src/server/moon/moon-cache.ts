import { supabase } from "@/integrations/supabase/client";
import type { MoonReadingResponse } from "./moon-ai-generator";

const cli = () => supabase as unknown as import("@supabase/supabase-js").SupabaseClient;

export async function getCachedReading(fingerprint: string): Promise<MoonReadingResponse | null> {
  const { data, error } = await cli()
    .from("lunar_reading_cache")
    .select("reading, is_fallback")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (error) {
    console.error("Error reading lunar cache:", error);
    return null;
  }
  
  if (!data) return null;

  return {
    reading: data.reading,
    isFallback: data.is_fallback,
  };
}

export async function saveReadingToCache(
  fingerprint: string,
  reading: string,
  isFallback: boolean
): Promise<void> {
  const { error } = await cli()
    .from("lunar_reading_cache")
    .upsert({
      fingerprint,
      reading,
      is_fallback: isFallback,
    }, { onConflict: "fingerprint" });

  if (error) {
    console.error("Error saving lunar cache:", error);
  }
}
