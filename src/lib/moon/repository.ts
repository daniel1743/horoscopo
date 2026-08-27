/**
 * Repositorio de contenido lunar. ÚNICA capa que consulta Supabase para
 * el contenido editorial de fases. Los componentes nunca importan supabase.
 */
import { supabase } from "@/integrations/supabase/client";
import type { MoonEditorialContent, MoonPhaseKey } from "@/types/moon";

interface Row {
  phase_key: string;
  title: string;
  summary: string;
  meaning: string;
  reflection_questions: unknown;
  practical_suggestions: unknown;
  misconceptions: unknown;
  disclaimer_key: string;
  image_key: string;
  seo_title: string | null;
  seo_description: string | null;
  status: "draft" | "published" | "archived";
  is_demo: boolean;
  published_at: string | null;
}

const COLUMNS =
  "phase_key,title,summary,meaning,reflection_questions,practical_suggestions,misconceptions,disclaimer_key,image_key,seo_title,seo_description,status,is_demo,published_at";

const cli = () => supabase as unknown as import("@supabase/supabase-js").SupabaseClient;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function map(row: Row): MoonEditorialContent {
  return {
    phase_key: row.phase_key as MoonPhaseKey,
    title: row.title,
    summary: row.summary,
    meaning: row.meaning,
    reflection_questions: asStringArray(row.reflection_questions),
    practical_suggestions: asStringArray(row.practical_suggestions),
    misconceptions: asStringArray(row.misconceptions),
    disclaimer_key: row.disclaimer_key,
    image_key: row.image_key,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    status: row.status,
    is_demo: row.is_demo,
    published_at: row.published_at,
  };
}

export async function fetchAllPublishedMoonContent(): Promise<MoonEditorialContent[]> {
  const { data, error } = await cli()
    .from("moon_phase_content")
    .select(COLUMNS)
    .eq("status", "published")
    .not("published_at", "is", null);
  if (error) throw error;
  return ((data as Row[]) ?? []).map(map);
}

export async function fetchMoonContentByPhase(
  phaseKey: MoonPhaseKey,
): Promise<MoonEditorialContent | null> {
  const { data, error } = await cli()
    .from("moon_phase_content")
    .select(COLUMNS)
    .eq("phase_key", phaseKey)
    .eq("status", "published")
    .not("published_at", "is", null)
    .maybeSingle();
  if (error) throw error;
  return data ? map(data as Row) : null;
}
