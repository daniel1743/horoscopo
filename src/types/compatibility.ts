/**
 * Tipos de dominio del sistema de compatibilidad.
 * No conocen Supabase. Los componentes consumen estos tipos.
 */
import type { ZodiacSign } from "@/data/zodiac-signs";

export type ZodiacSignKey =
  | "aries"
  | "tauro"
  | "geminis"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "escorpio"
  | "sagitario"
  | "capricornio"
  | "acuario"
  | "piscis";

export type CompatibilityPairKey = `${ZodiacSignKey}__${ZodiacSignKey}`;

export interface NormalizedSignPair {
  sign_a: ZodiacSignKey;
  sign_b: ZodiacSignKey;
  pair_key: CompatibilityPairKey;
  canonical_path: `/compatibilidad/${ZodiacSignKey}/${ZodiacSignKey}`;
}

export type CompatibilityDimensionKey =
  | "communication"
  | "emotional_rhythm"
  | "daily_life"
  | "attraction"
  | "conflict_management"
  | "growth";

export interface CompatibilityDimension {
  rating: 1 | 2 | 3 | 4 | 5;
  interpretation: string;
}

export type CompatibilityDimensions = Partial<
  Record<CompatibilityDimensionKey, CompatibilityDimension>
>;

export type CompatibilityContextKey = "romantic" | "friendship" | "collaboration";
export type CompatibilityContexts = Partial<Record<CompatibilityContextKey, string>>;

export type CompatibilityStatus = "draft" | "published" | "archived";

export interface CompatibilityProfile {
  id: string;
  pairKey: CompatibilityPairKey;
  signA: ZodiacSignKey;
  signB: ZodiacSignKey;
  title: string;
  summary: string;
  dynamicLabel: string | null;
  relationshipDynamic: string;
  dimensions: CompatibilityDimensions;
  strengths: string[];
  challenges: string[];
  communicationTips: string[];
  contexts: CompatibilityContexts;
  reflectionQuestions: string[];
  misconceptions: string[];
  disclaimerKey: string;
  status: CompatibilityStatus;
  isDemo: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
}

export interface CompatibilitySearchSelection {
  signOne: ZodiacSignKey | null;
  signTwo: ZodiacSignKey | null;
}

export interface CompatibilityPageData {
  normalized: NormalizedSignPair;
  signA: ZodiacSign;
  signB: ZodiacSign;
  profile: CompatibilityProfile | null;
  alternativePairs: CompatibilityProfile[];
}
