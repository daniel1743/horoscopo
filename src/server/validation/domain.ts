import type { GeneratedHoroscopeDraft, GenerationConstraints } from "../generation/domain";
import type { SignContext } from "../rules/domain";

export type EditorialValidationSeverity = "error" | "warning";

export type EditorialValidationIssueCode =
  | "REQUIRED_SECTION_MISSING"
  | "EMPTY_SECTION"
  | "INVALID_FIELD_TYPE"
  | "LENGTH_OUT_OF_RANGE"
  | "WHITESPACE_ONLY_TEXT"
  | "UNEXPECTED_STRUCTURE"
  | "UNAUTHORIZED_PLANET"
  | "UNAUTHORIZED_SIGN"
  | "UNAUTHORIZED_ASPECT"
  | "UNKNOWN_ASPECT_TYPE"
  | "INVENTED_TEMPORAL_EVENT"
  | "UNSUPPORTED_NUMERIC_CLAIM"
  | "UNKNOWN_FACT_ID"
  | "UNKNOWN_SOURCE_EVENT_ID"
  | "NATAL_CHART_REFERENCE"
  | "ASTROLOGICAL_HOUSE_REFERENCE"
  | "ASCENDANT_REFERENCE"
  | "MIDHEAVEN_REFERENCE"
  | "DIRECT_RETROGRADE_CONTRADICTION"
  | "SECTION_CONTRADICTION"
  | "ASPECT_AFFIRM_NEGATE_CONTRADICTION"
  | "PERIOD_MISMATCH"
  | "ABSOLUTE_CERTAINTY"
  | "GUARANTEED_PREDICTION"
  | "FATALISM"
  | "EMOTIONAL_MANIPULATION"
  | "MEDICAL_ADVICE"
  | "LEGAL_ADVICE"
  | "FINANCIAL_ADVICE"
  | "DANGEROUS_ADVICE"
  | "DIAGNOSTIC_CLAIM"
  | "DISCONTINUE_TREATMENT"
  | "DISCRIMINATORY_CONTENT"
  | "EXPLICIT_SEXUAL_CONTENT"
  | "GRAPHIC_VIOLENCE"
  | "SEVERE_OFFENSIVE_LANGUAGE"
  | "FORBIDDEN_PROMISE"
  | "EXCESSIVE_REPETITION"
  | "DUPLICATED_SECTION_TEXT"
  | "GENERIC_PHRASE_DENSITY_HIGH"
  | "TEXT_WITHOUT_FACT_TRACE"
  | "FILLER_PHRASE_EXCESS";

export interface EditorialValidationIssue {
  code: EditorialValidationIssueCode;
  severity: EditorialValidationSeverity;
  path: string;
  message: string;
  evidence?: string;
  relatedFactIds?: readonly string[];
}

export interface ValidationMetrics {
  totalCharacters: number;
  totalWords: number;
  sectionsChecked: number;
  recognizedFactReferences: number;
  unknownEntityMentions: number;
  duplicatedSentenceCount: number;
  blockingIssueCount: number;
  warningCount: number;
}

export interface EditorialValidationResult {
  valid: boolean;
  issues: readonly EditorialValidationIssue[];
  metrics: ValidationMetrics;
}

export interface EditorialValidationInput {
  draft: GeneratedHoroscopeDraft;
  context: SignContext;
  constraints: GenerationConstraints;
}
