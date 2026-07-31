import type { ExecutionRepository, PersistExecutionInput, PersistExecutionResult } from "./domain";
import { PersistenceError } from "./domain";
import { buildPersistedExecutionRecord } from "./trace-record-builder";

export async function persistGenerationExecution(
  input: PersistExecutionInput,
  repository: ExecutionRepository,
): Promise<PersistExecutionResult> {
  try {
    const record = buildPersistedExecutionRecord(input);
    const existing = await repository.findByIdempotencyKey(record.identity.idempotencyKey);
    if (existing && existing.identity.executionId !== record.identity.executionId) {
      return { status: "conflict", errorCode: "IDEMPOTENCY_CONFLICT", existingRecord: existing };
    }
    return repository.save(record);
  } catch (error) {
    if (error instanceof PersistenceError) {
      return { status: "failed", errorCode: error.code, message: error.message };
    }
    return {
      status: "failed",
      errorCode: "REPOSITORY_FAILURE",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
