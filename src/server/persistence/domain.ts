import type { GeneratedHoroscopeDraft, GenerationResult } from "../generation/domain";
import type { SignContext } from "../rules/domain";
import type { EditorialValidationResult } from "../validation/domain";

export const PERSISTENCE_SCHEMA_VERSION = "persistence-trace@2g:v1";
export type PersistenceSchemaVersion = typeof PERSISTENCE_SCHEMA_VERSION;
export type PersistedExecutionStatus = "started" | "generated" | "fallback" | "rejected" | "failed";
export type PersistedPeriod = "daily" | "weekly" | "monthly";
export type PersistExecutionResultStatus = "persisted" | "already_exists" | "conflict" | "failed";
export type PersistenceErrorCode =
  | "EXECUTION_CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "INVALID_PERSISTENCE_RECORD"
  | "REPOSITORY_FAILURE";

export interface PersistedExecutionIdentity {
  executionId: string;
  idempotencyKey: string;
  sign: string;
  period: PersistedPeriod;
  periodStart: string;
  periodEnd: string;
  calculatedAt: string;
  schemaVersion: PersistenceSchemaVersion;
  engineVersion?: string;
  rulesVersion?: string;
  generationVersion?: string;
  validationVersion?: string;
}

export interface PersistedSourceSnapshot {
  positionIds: readonly string[];
  aspectIds: readonly string[];
  temporalEventIds: readonly string[];
  factIds: readonly string[];
  sourceEventIds: readonly string[];
  ruleIds: readonly string[];
  selectedFacts: SignContext["selectedFacts"];
  signContext: SignContext;
  constraints: GenerationResult["draft"] extends never ? never : unknown;
}

export interface PersistedGenerationSnapshot {
  generationResultId?: string;
  providerMetadata?: GenerationResult["providerMetadata"];
  generatedDraft?: GeneratedHoroscopeDraft;
  fallbackDraft?: GeneratedHoroscopeDraft;
  rejectedDraft?: GeneratedHoroscopeDraft;
}

export interface PersistedValidationSnapshot {
  structural: GenerationResult["validation"];
  editorial?: EditorialValidationResult;
}

export interface PersistedExecutionRecord {
  identity: PersistedExecutionIdentity;
  status: PersistedExecutionStatus;
  providerAttempted: boolean;
  providerCallCount: number;
  fallbackUsed: boolean;
  publicationEligible: boolean;
  failureStage?:
    | "provider"
    | "parser"
    | "structural_validation"
    | "editorial_validation"
    | "fallback"
    | "repository";
  errorCodes: readonly string[];
  source: PersistedSourceSnapshot;
  generation: PersistedGenerationSnapshot;
  validation: PersistedValidationSnapshot;
  createdAt: string;
}

export interface PersistExecutionInput {
  calculatedAt: string;
  status?: PersistedExecutionStatus;
  signContext: SignContext;
  generationResult?: GenerationResult;
  generatedDraft?: GeneratedHoroscopeDraft;
  fallbackDraft?: GeneratedHoroscopeDraft;
  rejectedDraft?: GeneratedHoroscopeDraft;
  source?: {
    positionIds?: readonly string[];
    aspectIds?: readonly string[];
    temporalEventIds?: readonly string[];
  };
  versions?: {
    engineVersion?: string;
    rulesVersion?: string;
    generationVersion?: string;
    validationVersion?: string;
  };
  providerAttempted?: boolean;
  providerCallCount?: number;
  failureStage?: PersistedExecutionRecord["failureStage"];
  errorCodes?: readonly string[];
}

export interface PersistExecutionResult {
  status: PersistExecutionResultStatus;
  record?: PersistedExecutionRecord;
  existingRecord?: PersistedExecutionRecord;
  errorCode?: PersistenceErrorCode;
  message?: string;
}

export class PersistenceError extends Error {
  constructor(
    message: string,
    readonly code: PersistenceErrorCode,
  ) {
    super(message);
    this.name = "PersistenceError";
  }
}

export interface ExecutionRepository {
  save(record: PersistedExecutionRecord): Promise<PersistExecutionResult>;
  findByExecutionId(executionId: string): Promise<PersistedExecutionRecord | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<PersistedExecutionRecord | null>;
}
