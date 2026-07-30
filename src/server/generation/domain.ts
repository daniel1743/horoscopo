import type {
  EditorialPeriod,
  EditorialTopic,
  RuleFactPayload,
  RulePolarity,
  SignContext,
  ZodiacSign,
} from "../rules/domain";
import type { EditorialValidationResult } from "../validation/domain";

export const GENERATION_SCHEMA_VERSION = "generated-horoscope-draft@2e:v1";
export const GENERATION_PROMPT_VERSION = "prompt@2e:v1";

export type GenerationStatus = "generated" | "fallback" | "rejected";
export type GenerationSectionKey = "love" | "work" | "wellbeing" | "reflection";

export interface GenerationFactInput {
  factId: string;
  ruleId: string;
  sourceEventIds: readonly string[];
  topic: EditorialTopic;
  polarity: RulePolarity;
  importance: number;
  confidence: number;
  payload: RuleFactPayload;
}

export interface TextLengthConstraint {
  min: number;
  max: number;
}

export interface GenerationConstraints {
  title: TextLengthConstraint;
  summary: TextLengthConstraint;
  section: TextLengthConstraint;
  closingMessage: TextLengthConstraint;
  allowedSections: readonly GenerationSectionKey[];
  tone: readonly string[];
  forbiddenClaimCategories: readonly string[];
  forbiddenPatterns: readonly string[];
  noInventedFacts: true;
  noNatalChartData: true;
  noAbsoluteCertainty: true;
}

export interface GenerationRequest {
  id: string;
  signContextId: string;
  sign: ZodiacSign;
  period: EditorialPeriod;
  windowStart: string;
  windowEnd: string;
  editorialTimezone: string;
  facts: readonly GenerationFactInput[];
  constraints: GenerationConstraints;
  outputSchemaVersion: string;
  promptVersion: string;
}

export interface GeneratedHoroscopeDraft {
  schemaVersion: string;
  signContextId: string;
  sign: ZodiacSign;
  period: EditorialPeriod;
  title: string;
  summary: string;
  sections: {
    love: string;
    work: string;
    wellbeing: string;
    reflection: string;
  };
  closingMessage: string;
  usedFactIds: readonly string[];
  sourceEventIds: readonly string[];
}

export interface GenerationValidationIssue {
  code: GenerationErrorCode;
  message: string;
}

export interface StructuralGenerationValidation {
  valid: boolean;
  errors: readonly GenerationValidationIssue[];
  warnings: readonly GenerationValidationIssue[];
  editorial?: EditorialValidationResult;
}

export interface GenerationResult {
  id: string;
  status: GenerationStatus;
  draft: GeneratedHoroscopeDraft;
  providerMetadata: {
    providerId: string;
    modelId: string;
    promptVersion: string;
    schemaVersion: string;
  };
  validation: StructuralGenerationValidation;
}

export interface ProviderGenerationRequest {
  systemPrompt: string;
  userPrompt: string;
  responseFormat: {
    type: "json_object";
    schemaVersion: string;
  };
  temperature: number;
  metadata: {
    requestId: string;
    signContextId: string;
    promptVersion: string;
  };
}

export interface ProviderGenerationResponse {
  rawText: string;
  providerId: string;
  modelId: string;
  finishReason: "stop" | "length" | "error";
  requestId?: string;
}

export interface TextGenerationProvider {
  readonly providerId: string;
  readonly modelId: string;
  generate(request: ProviderGenerationRequest): Promise<ProviderGenerationResponse>;
}

export type GenerationErrorCode =
  | "INVALID_SIGN_CONTEXT"
  | "INVALID_GENERATION_POLICY"
  | "INVALID_GENERATION_REQUEST"
  | "PROVIDER_FAILURE"
  | "INVALID_PROVIDER_RESPONSE"
  | "STRICT_JSON_PARSE_FAILED"
  | "STRUCTURAL_VALIDATION_FAILED"
  | "TRACEABILITY_VIOLATION"
  | "FORBIDDEN_CONTENT"
  | "FALLBACK_GENERATION_FAILED"
  | "NON_JSON_RESPONSE"
  | "EXTRANEOUS_TEXT"
  | "INVALID_JSON_ROOT"
  | "SCHEMA_VALIDATION_FAILED"
  | "MISSING_REQUIRED_FIELD"
  | "UNEXPECTED_FIELD"
  | "INVALID_FIELD_TYPE"
  | "INVALID_FIELD_VALUE";

export class HoroscopeGenerationError extends Error {
  constructor(
    message: string,
    readonly code: GenerationErrorCode,
  ) {
    super(message);
    this.name = "HoroscopeGenerationError";
  }
}

export interface PromptBundle {
  systemPrompt: string;
  userPrompt: string;
  responseFormat: ProviderGenerationRequest["responseFormat"];
}

export function stableGenerationRequestId(context: SignContext): string {
  return `generation-request:${context.id}:${context.period}:${context.windowStart}:${context.windowEnd}`;
}
