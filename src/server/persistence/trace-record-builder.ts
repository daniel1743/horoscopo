import { ZODIAC_SIGNS } from "../rules/domain";
import {
  DEFAULT_GENERATION_CONSTRAINTS,
  GENERATION_POLICY_VERSION,
} from "../generation/generation-policy";
import { GENERATION_PROMPT_VERSION } from "../generation/domain";
import {
  PERSISTENCE_SCHEMA_VERSION,
  PersistenceError,
  type PersistedExecutionRecord,
  type PersistedExecutionStatus,
  type PersistExecutionInput,
} from "./domain";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function uniqueSorted(values: readonly string[] = []): readonly string[] {
  return [...new Set(values)].sort();
}

function assertIso(value: string, label: string): void {
  const parsed = Date.parse(value);
  if (!value || Number.isNaN(parsed) || new Date(parsed).toISOString() !== value) {
    throw new PersistenceError(`${label} invalido`, "INVALID_PERSISTENCE_RECORD");
  }
}

function compareIso(left: string, right: string): number {
  return Date.parse(left) - Date.parse(right);
}

function stableStatus(input: PersistExecutionInput): PersistedExecutionStatus {
  if (input.status) return input.status;
  if (input.generationResult?.status === "generated") return "generated";
  if (input.generationResult?.status === "fallback") return "fallback";
  if (input.generationResult?.status === "rejected") return "rejected";
  return "started";
}

function errorCodes(input: PersistExecutionInput): readonly string[] {
  const structural = input.generationResult?.validation.errors.map((error) => error.code) ?? [];
  const editorial =
    input.generationResult?.validation.editorial?.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.code) ?? [];
  return uniqueSorted([...(input.errorCodes ?? []), ...structural, ...editorial]);
}

// executionId identifies one logical run instant; idempotencyKey adds critical versions.
export function stableExecutionId(input: PersistExecutionInput): string {
  return `execution:${input.signContext.period}:${input.signContext.windowStart}:${input.signContext.sign}:${input.calculatedAt}`;
}

export function stableIdempotencyKey(input: PersistExecutionInput): string {
  const versions = input.versions ?? {};
  return [
    "idempotency",
    input.signContext.period,
    input.signContext.windowStart,
    input.signContext.windowEnd,
    input.signContext.sign,
    input.signContext.ruleCatalogVersion,
    input.signContext.policyVersion,
    versions.engineVersion ?? "",
    versions.rulesVersion ?? "",
    versions.generationVersion ?? GENERATION_PROMPT_VERSION,
    versions.validationVersion ?? GENERATION_POLICY_VERSION,
  ].join(":");
}

function hasUndefined(value: unknown): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.some(hasUndefined);
  if (value && typeof value === "object") return Object.values(value).some(hasUndefined);
  return false;
}

function validateRecord(record: PersistedExecutionRecord): void {
  if (!record.identity.executionId || !record.identity.idempotencyKey) {
    throw new PersistenceError("identidad vacia", "INVALID_PERSISTENCE_RECORD");
  }
  if (!ZODIAC_SIGNS.includes(record.identity.sign as never)) {
    throw new PersistenceError("signo invalido", "INVALID_PERSISTENCE_RECORD");
  }
  assertIso(record.identity.periodStart, "periodStart");
  assertIso(record.identity.periodEnd, "periodEnd");
  assertIso(record.identity.calculatedAt, "calculatedAt");
  assertIso(record.createdAt, "createdAt");
  if (compareIso(record.identity.periodStart, record.identity.periodEnd) > 0) {
    throw new PersistenceError("ventana temporal invalida", "INVALID_PERSISTENCE_RECORD");
  }
  if (record.status === "generated" && !record.generation.generatedDraft) {
    throw new PersistenceError("generated sin draft", "INVALID_PERSISTENCE_RECORD");
  }
  if (record.status === "fallback" && !record.generation.fallbackDraft) {
    throw new PersistenceError("fallback sin fallbackDraft", "INVALID_PERSISTENCE_RECORD");
  }
  if (record.fallbackUsed !== Boolean(record.generation.fallbackDraft)) {
    throw new PersistenceError("fallbackUsed incoherente", "INVALID_PERSISTENCE_RECORD");
  }
  if ((record.status === "rejected" || record.status === "failed") && record.publicationEligible) {
    throw new PersistenceError(
      "estado no publicable marcado elegible",
      "INVALID_PERSISTENCE_RECORD",
    );
  }
  const traceArrays = [
    record.source.positionIds,
    record.source.aspectIds,
    record.source.temporalEventIds,
    record.source.factIds,
    record.source.sourceEventIds,
    record.source.ruleIds,
    record.errorCodes,
  ];
  if (traceArrays.some((values) => values.length !== new Set(values).size)) {
    throw new PersistenceError("IDs duplicados", "INVALID_PERSISTENCE_RECORD");
  }
  if (hasUndefined(record)) {
    throw new PersistenceError("snapshot contiene undefined", "INVALID_PERSISTENCE_RECORD");
  }
}

function publicationEligible(
  record: Omit<PersistedExecutionRecord, "publicationEligible">,
): boolean {
  if (record.status === "rejected" || record.status === "failed" || record.status === "started")
    return false;
  const hasTrace = record.source.factIds.length > 0 && record.source.sourceEventIds.length > 0;
  if (record.status === "fallback") {
    return Boolean(record.generation.fallbackDraft) && hasTrace;
  }
  const structuralOk = record.validation.structural.errors.length === 0;
  const editorialOk = record.validation.editorial ? record.validation.editorial.valid : true;
  const hasDraft =
    record.status === "generated"
      ? Boolean(record.generation.generatedDraft)
      : Boolean(record.generation.fallbackDraft);
  return structuralOk && editorialOk && hasDraft && hasTrace;
}

export function buildPersistedExecutionRecord(
  input: PersistExecutionInput,
): PersistedExecutionRecord {
  const before = JSON.stringify(input);
  assertIso(input.calculatedAt, "calculatedAt");
  const status = stableStatus(input);
  const facts = [...input.signContext.selectedFacts].sort((a, b) => a.id.localeCompare(b.id));
  const generationResult = input.generationResult;
  const fallbackDraft =
    input.fallbackDraft ??
    (generationResult?.status === "fallback" ? generationResult.draft : undefined);
  const generatedDraft =
    input.generatedDraft ??
    (generationResult?.status === "generated" ? generationResult.draft : undefined);
  const base = {
    identity: {
      executionId: stableExecutionId(input),
      idempotencyKey: stableIdempotencyKey(input),
      sign: input.signContext.sign,
      period: input.signContext.period,
      periodStart: input.signContext.windowStart,
      periodEnd: input.signContext.windowEnd,
      calculatedAt: input.calculatedAt,
      schemaVersion: PERSISTENCE_SCHEMA_VERSION,
      ...(input.versions?.engineVersion ? { engineVersion: input.versions.engineVersion } : {}),
      rulesVersion: input.versions?.rulesVersion ?? input.signContext.ruleCatalogVersion,
      generationVersion: input.versions?.generationVersion ?? GENERATION_PROMPT_VERSION,
      validationVersion: input.versions?.validationVersion ?? GENERATION_POLICY_VERSION,
    },
    status,
    providerAttempted: input.providerAttempted ?? Boolean(generationResult),
    providerCallCount: input.providerCallCount ?? (generationResult ? 1 : 0),
    fallbackUsed: Boolean(fallbackDraft),
    failureStage: input.failureStage,
    errorCodes: errorCodes(input),
    source: {
      positionIds: uniqueSorted(input.source?.positionIds),
      aspectIds: uniqueSorted(input.source?.aspectIds),
      temporalEventIds: uniqueSorted(input.source?.temporalEventIds),
      factIds: uniqueSorted(facts.map((fact) => fact.id)),
      sourceEventIds: uniqueSorted(facts.flatMap((fact) => [...fact.sourceEventIds])),
      ruleIds: uniqueSorted(facts.map((fact) => fact.ruleId)),
      selectedFacts: facts,
      signContext: input.signContext,
      constraints: DEFAULT_GENERATION_CONSTRAINTS,
    },
    generation: {
      ...(generationResult
        ? {
            generationResultId: generationResult.id,
            providerMetadata: generationResult.providerMetadata,
          }
        : {}),
      ...(generatedDraft ? { generatedDraft } : {}),
      ...(fallbackDraft ? { fallbackDraft } : {}),
      ...(input.rejectedDraft ? { rejectedDraft: input.rejectedDraft } : {}),
    },
    validation: {
      structural: generationResult?.validation ?? { valid: true, errors: [], warnings: [] },
      ...(generationResult?.validation.editorial
        ? { editorial: generationResult.validation.editorial }
        : {}),
    },
    createdAt: input.calculatedAt,
  } satisfies Omit<PersistedExecutionRecord, "publicationEligible">;
  const record = clone({ ...base, publicationEligible: publicationEligible(base) });
  validateRecord(record);
  if (before !== JSON.stringify(input)) {
    throw new PersistenceError("input mutado", "INVALID_PERSISTENCE_RECORD");
  }
  return record;
}
