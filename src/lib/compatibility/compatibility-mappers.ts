/**
 * Mapper Supabase → dominio para compatibility_profiles.
 * Único punto donde una fila cruda se traduce a `CompatibilityProfile`.
 */
import type {
  CompatibilityContextKey,
  CompatibilityContexts,
  CompatibilityDimension,
  CompatibilityDimensionKey,
  CompatibilityDimensions,
  CompatibilityPairKey,
  CompatibilityProfile,
  CompatibilityStatus,
  ZodiacSignKey,
} from "@/types/compatibility";
import { isZodiacSign } from "./normalize-sign-pair";

export interface CompatibilityProfileRow {
  id: string;
  pair_key: string;
  sign_a: string;
  sign_b: string;
  title: string;
  summary: string;
  dynamic_label: string | null;
  relationship_dynamic: string;
  dimensions: unknown;
  strengths: unknown;
  challenges: unknown;
  communication_tips: unknown;
  contexts: unknown;
  reflection_questions: unknown;
  misconceptions: unknown;
  disclaimer_key: string;
  status: string;
  is_demo: boolean;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
}

export const COMPATIBILITY_PROFILE_COLUMNS =
  "id,pair_key,sign_a,sign_b,title,summary,dynamic_label,relationship_dynamic,dimensions,strengths,challenges,communication_tips,contexts,reflection_questions,misconceptions,disclaimer_key,status,is_demo,seo_title,seo_description,published_at";

const DIMENSION_KEYS: readonly CompatibilityDimensionKey[] = [
  "communication",
  "emotional_rhythm",
  "daily_life",
  "attraction",
  "conflict_management",
  "growth",
];

const CONTEXT_KEYS: readonly CompatibilityContextKey[] = [
  "romantic",
  "friendship",
  "collaboration",
];

function parseStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : [];
}

function parseDimension(raw: unknown): CompatibilityDimension | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { rating?: unknown; interpretation?: unknown };
  const rating = typeof r.rating === "number" ? Math.round(r.rating) : NaN;
  const interpretation = typeof r.interpretation === "string" ? r.interpretation.trim() : "";
  if (rating < 1 || rating > 5 || !interpretation) return null;
  return { rating: rating as 1 | 2 | 3 | 4 | 5, interpretation };
}

function parseDimensions(raw: unknown): CompatibilityDimensions {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const out: CompatibilityDimensions = {};
  for (const key of DIMENSION_KEYS) {
    const dim = parseDimension(source[key]);
    if (dim) out[key] = dim;
  }
  return out;
}

function parseContexts(raw: unknown): CompatibilityContexts {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const out: CompatibilityContexts = {};
  for (const key of CONTEXT_KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) out[key] = value.trim();
  }
  return out;
}

function parseStatus(raw: string): CompatibilityStatus {
  return raw === "published" || raw === "archived" ? raw : "draft";
}

function parseSign(raw: string): ZodiacSignKey {
  if (!isZodiacSign(raw)) throw new Error(`Signo inválido en fila: ${raw}`);
  return raw;
}

export function mapCompatibilityProfileRow(row: CompatibilityProfileRow): CompatibilityProfile {
  const signA = parseSign(row.sign_a);
  const signB = parseSign(row.sign_b);
  return {
    id: row.id,
    pairKey: row.pair_key as CompatibilityPairKey,
    signA,
    signB,
    title: row.title,
    summary: row.summary,
    dynamicLabel: row.dynamic_label,
    relationshipDynamic: row.relationship_dynamic,
    dimensions: parseDimensions(row.dimensions),
    strengths: parseStringArray(row.strengths),
    challenges: parseStringArray(row.challenges),
    communicationTips: parseStringArray(row.communication_tips),
    contexts: parseContexts(row.contexts),
    reflectionQuestions: parseStringArray(row.reflection_questions),
    misconceptions: parseStringArray(row.misconceptions),
    disclaimerKey: row.disclaimer_key,
    status: parseStatus(row.status),
    isDemo: row.is_demo,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    publishedAt: row.published_at,
  };
}
