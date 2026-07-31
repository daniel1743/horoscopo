import type {
  ExecutionRepository,
  PersistedExecutionRecord,
  PersistExecutionResult,
} from "./domain";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function canonical(value: unknown): string {
  return JSON.stringify(value);
}

// Conflict policy: identical record is idempotent; incompatible identity/key never overwrites.
export class InMemoryExecutionRepository implements ExecutionRepository {
  readonly #byExecutionId = new Map<string, PersistedExecutionRecord>();
  readonly #byIdempotencyKey = new Map<string, string>();

  async save(record: PersistedExecutionRecord): Promise<PersistExecutionResult> {
    const storedById = this.#byExecutionId.get(record.identity.executionId);
    if (storedById) {
      if (canonical(storedById) === canonical(record)) {
        return { status: "already_exists", existingRecord: clone(storedById) };
      }
      return {
        status: "conflict",
        errorCode: "EXECUTION_CONFLICT",
        existingRecord: clone(storedById),
      };
    }
    const executionForKey = this.#byIdempotencyKey.get(record.identity.idempotencyKey);
    if (executionForKey && executionForKey !== record.identity.executionId) {
      const existing = this.#byExecutionId.get(executionForKey);
      return {
        status: "conflict",
        errorCode: "IDEMPOTENCY_CONFLICT",
        ...(existing ? { existingRecord: clone(existing) } : {}),
      };
    }
    const copy = clone(record);
    this.#byExecutionId.set(copy.identity.executionId, copy);
    this.#byIdempotencyKey.set(copy.identity.idempotencyKey, copy.identity.executionId);
    return { status: "persisted", record: clone(copy) };
  }

  async findByExecutionId(executionId: string): Promise<PersistedExecutionRecord | null> {
    const record = this.#byExecutionId.get(executionId);
    return record ? clone(record) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<PersistedExecutionRecord | null> {
    const executionId = this.#byIdempotencyKey.get(idempotencyKey);
    if (!executionId) return null;
    return this.findByExecutionId(executionId);
  }
}
