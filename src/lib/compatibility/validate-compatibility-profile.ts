/**
 * Validador editorial de perfiles de compatibilidad.
 * Se usa para decidir si un perfil publicado puede considerarse "completo"
 * (indexable) o "pendiente" (renderiza estado editorial pendiente).
 */
import type {
  CompatibilityDimensionKey,
  CompatibilityProfile,
} from "@/types/compatibility";

const REQUIRED_DIMENSIONS: readonly CompatibilityDimensionKey[] = [
  "communication",
  "emotional_rhythm",
  "daily_life",
  "attraction",
  "conflict_management",
  "growth",
];

export interface CompatibilityValidationResult {
  complete: boolean;
  reasons: string[];
}

export function validateCompatibilityProfile(
  profile: CompatibilityProfile,
): CompatibilityValidationResult {
  const reasons: string[] = [];
  if (!profile.title.trim()) reasons.push("missing_title");
  if (!profile.summary.trim()) reasons.push("missing_summary");
  if (!profile.relationshipDynamic.trim()) reasons.push("missing_relationship_dynamic");

  for (const key of REQUIRED_DIMENSIONS) {
    const d = profile.dimensions[key];
    if (!d || !d.interpretation.trim()) reasons.push(`missing_dimension:${key}`);
  }

  if (profile.strengths.length < 3) reasons.push("strengths_below_minimum");
  if (profile.challenges.length < 3) reasons.push("challenges_below_minimum");
  if (profile.communicationTips.length < 3) reasons.push("tips_below_minimum");
  if (profile.reflectionQuestions.length < 2) reasons.push("reflection_below_minimum");

  return { complete: reasons.length === 0, reasons };
}

export function isProfileIndexable(profile: CompatibilityProfile | null): boolean {
  if (!profile) return false;
  if (profile.status !== "published") return false;
  if (profile.isDemo) return false;
  return validateCompatibilityProfile(profile).complete;
}
