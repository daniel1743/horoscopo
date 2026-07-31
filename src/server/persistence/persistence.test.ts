import { describe, expect, it } from "vitest";
import { DeterministicTestGenerationProvider } from "../generation/provider";
import { generateHoroscopeDraft } from "../generation/horoscope-generator";
import { generationFact, signContext, validDraft } from "../generation/test-fixtures";
import type { PersistExecutionInput, PersistedExecutionRecord } from "./domain";
import { InMemoryExecutionRepository } from "./in-memory-execution-repository";
import { persistGenerationExecution } from "./persist-generation-execution";
import {
  buildPersistedExecutionRecord,
  stableExecutionId,
  stableIdempotencyKey,
} from "./trace-record-builder";

const calculatedAt = "2024-06-01T12:00:00.000Z";

async function generatedInput(): Promise<PersistExecutionInput> {
  const context = signContext();
  const result = await generateHoroscopeDraft(
    context,
    new DeterministicTestGenerationProvider(() => JSON.stringify(validDraft(context))),
  );
  return {
    calculatedAt,
    signContext: context,
    generationResult: result,
    source: {
      positionIds: ["position:b", "position:a", "position:a"],
      aspectIds: ["aspect:b", "aspect:a", "aspect:a"],
      temporalEventIds: ["event:z", "event:a", "event:a"],
    },
    versions: { engineVersion: "engine@1" },
    providerCallCount: 1,
  };
}

async function fallbackInput(): Promise<PersistExecutionInput> {
  const context = signContext();
  const rejected = {
    ...validDraft(context),
    summary: `${validDraft(context).summary} Marte en Tauro sin duda ocurrira seguro.`,
  };
  const result = await generateHoroscopeDraft(
    context,
    new DeterministicTestGenerationProvider(() => JSON.stringify(rejected)),
  );
  return {
    calculatedAt,
    signContext: context,
    generationResult: result,
    rejectedDraft: rejected,
    source: { positionIds: ["position:a"], aspectIds: ["aspect:a"], temporalEventIds: ["event:a"] },
    versions: { engineVersion: "engine@1" },
    providerCallCount: 1,
    failureStage: "editorial_validation",
  };
}

function mutateRecord(record: PersistedExecutionRecord): void {
  (record.source.factIds as string[]).push("mutated");
}

function noUndefined(value: unknown): boolean {
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.every(noUndefined);
  if (value && typeof value === "object") return Object.values(value).every(noUndefined);
  return true;
}

describe("persistence trace", () => {
  it("registro valido serializa y round-trip", async () => {
    const record = buildPersistedExecutionRecord(await generatedInput());
    expect(JSON.parse(JSON.stringify(record))).toEqual(record);
    expect(noUndefined(record)).toBe(true);
  });

  it("preserva IDs literales y normaliza arrays", async () => {
    const record = buildPersistedExecutionRecord(await generatedInput());
    expect(record.source.positionIds).toEqual(["position:a", "position:b"]);
    expect(record.source.aspectIds).toEqual(["aspect:a", "aspect:b"]);
    expect(record.source.temporalEventIds).toEqual(["event:a", "event:z"]);
    expect(record.source.factIds).toEqual(["fact:one"]);
    expect(record.source.sourceEventIds).toEqual(["event:one"]);
  });

  it("preserva validation.editorial y warnings", async () => {
    const input = await generatedInput();
    const warningResult = {
      ...input.generationResult!,
      validation: {
        ...input.generationResult!.validation,
        editorial: {
          valid: true,
          issues: [
            {
              code: "TEXT_WITHOUT_FACT_TRACE" as const,
              severity: "warning" as const,
              path: "usedFactIds",
              message: "warning visible",
              evidence: "fact",
            },
          ],
          metrics: {
            totalCharacters: 1,
            totalWords: 1,
            sectionsChecked: 4,
            recognizedFactReferences: 1,
            unknownEntityMentions: 0,
            duplicatedSentenceCount: 0,
            blockingIssueCount: 0,
            warningCount: 1,
          },
        },
      },
    };
    const record = buildPersistedExecutionRecord({ ...input, generationResult: warningResult });
    expect(record.validation.editorial?.issues[0]).toMatchObject({
      severity: "warning",
      evidence: "fact",
    });
  });

  it("preserva diagnostico de fallback y no aprueba draft rechazado", async () => {
    const record = buildPersistedExecutionRecord(await fallbackInput());
    expect(record.status).toBe("fallback");
    expect(record.generation.fallbackDraft).toBeDefined();
    expect(record.generation.rejectedDraft?.summary).toContain("Marte");
    expect(record.generation.generatedDraft).toBeUndefined();
    expect(record.validation.editorial?.valid).toBe(false);
    expect(record.publicationEligible).toBe(true);
  });

  it("identidad determinista y sensible a signo periodo ventana", async () => {
    const input = await generatedInput();
    expect(stableExecutionId(input)).toBe(stableExecutionId(input));
    expect(stableIdempotencyKey(input)).toBe(stableIdempotencyKey(input));
    const otherSign = { ...input, signContext: { ...input.signContext, sign: "taurus" as const } };
    const otherPeriod = {
      ...input,
      signContext: { ...input.signContext, period: "weekly" as const },
    };
    const otherWindow = {
      ...input,
      signContext: { ...input.signContext, windowStart: "2024-06-03T00:00:00.000Z" },
    };
    expect(stableExecutionId(otherSign)).not.toBe(stableExecutionId(input));
    expect(stableExecutionId(otherPeriod)).not.toBe(stableExecutionId(input));
    expect(stableExecutionId(otherWindow)).not.toBe(stableExecutionId(input));
  });

  it("idempotencyKey cambia con version critica", async () => {
    const input = await generatedInput();
    expect(
      stableIdempotencyKey({ ...input, versions: { ...input.versions, generationVersion: "g@2" } }),
    ).not.toBe(stableIdempotencyKey(input));
  });

  it("selectedFacts conservan orden canonico por id y errorCodes se ordenan", async () => {
    const facts = [generationFact("fact:b", ["event:b"]), generationFact("fact:a", ["event:a"])];
    const context = signContext(facts);
    const record = buildPersistedExecutionRecord({
      calculatedAt,
      signContext: context,
      status: "started",
      errorCodes: ["Z", "A", "A"],
    });
    expect(record.source.selectedFacts.map((fact) => fact.id)).toEqual(["fact:a", "fact:b"]);
    expect(record.errorCodes).toEqual(["A", "Z"]);
  });

  it.each(["generated", "fallback", "rejected", "failed"] as const)(
    "estado %s coherente",
    async (status) => {
      const input = status === "fallback" ? await fallbackInput() : await generatedInput();
      const record = buildPersistedExecutionRecord({
        ...input,
        status,
        ...(status === "rejected" || status === "failed" ? { generatedDraft: undefined } : {}),
        ...(status === "generated" ? { generatedDraft: input.generationResult?.draft } : {}),
        ...(status === "failed" ? { failureStage: "provider" as const } : {}),
      });
      expect(record.status).toBe(status);
      if (status === "rejected" || status === "failed")
        expect(record.publicationEligible).toBe(false);
    },
  );

  it("invariantes invalidas fallan", async () => {
    const input = await generatedInput();
    expect(() =>
      buildPersistedExecutionRecord({ ...input, status: "generated", generationResult: undefined }),
    ).toThrow();
    expect(() =>
      buildPersistedExecutionRecord({ ...input, status: "fallback", generationResult: undefined }),
    ).toThrow();
    expect(() => buildPersistedExecutionRecord({ ...input, calculatedAt: "" })).toThrow();
  });

  it("repositorio save/find/idempotencia", async () => {
    const repository = new InMemoryExecutionRepository();
    const record = buildPersistedExecutionRecord(await generatedInput());
    expect((await repository.save(record)).status).toBe("persisted");
    expect((await repository.save(record)).status).toBe("already_exists");
    expect(await repository.findByExecutionId(record.identity.executionId)).toEqual(record);
    expect(await repository.findByIdempotencyKey(record.identity.idempotencyKey)).toEqual(record);
    expect(await repository.findByExecutionId("missing")).toBeNull();
  });

  it("conflictos por executionId e idempotencyKey", async () => {
    const repository = new InMemoryExecutionRepository();
    const record = buildPersistedExecutionRecord(await generatedInput());
    await repository.save(record);
    const byId = { ...record, providerCallCount: 2 };
    expect((await repository.save(byId)).errorCode).toBe("EXECUTION_CONFLICT");
    const byKey = {
      ...record,
      identity: { ...record.identity, executionId: `${record.identity.executionId}:other` },
    };
    expect((await repository.save(byKey)).errorCode).toBe("IDEMPOTENCY_CONFLICT");
  });

  it("repositorios no comparten estado y aislan mutaciones", async () => {
    const first = new InMemoryExecutionRepository();
    const second = new InMemoryExecutionRepository();
    const record = buildPersistedExecutionRecord(await generatedInput());
    await first.save(record);
    expect(await second.findByExecutionId(record.identity.executionId)).toBeNull();
    mutateRecord(record);
    const stored = await first.findByExecutionId(record.identity.executionId);
    expect(stored?.source.factIds).toEqual(["fact:one"]);
    if (stored) mutateRecord(stored);
    expect((await first.findByExecutionId(record.identity.executionId))?.source.factIds).toEqual([
      "fact:one",
    ]);
  });

  it("concurrencia idempotente y conflictiva", async () => {
    const repository = new InMemoryExecutionRepository();
    const record = buildPersistedExecutionRecord(await generatedInput());
    const results = await Promise.all([
      repository.save(record),
      repository.save(record),
      repository.save(record),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([
      "already_exists",
      "already_exists",
      "persisted",
    ]);
    const conflict = { ...record, providerCallCount: 99 };
    const conflictResults = await Promise.all([repository.save(conflict), repository.save(record)]);
    expect(conflictResults.some((result) => result.status === "conflict")).toBe(true);
  });

  it("caso de uso persiste, detecta existente y conflicto", async () => {
    const repository = new InMemoryExecutionRepository();
    const input = await generatedInput();
    expect((await persistGenerationExecution(input, repository)).status).toBe("persisted");
    expect((await persistGenerationExecution(input, repository)).status).toBe("already_exists");
    const conflict = { ...input, providerCallCount: 3 };
    expect((await persistGenerationExecution(conflict, repository)).status).toBe("conflict");
  });

  it("integracion no llama proveedor durante persistencia", async () => {
    const context = signContext();
    const provider = new DeterministicTestGenerationProvider(() =>
      JSON.stringify(validDraft(context)),
    );
    const result = await generateHoroscopeDraft(context, provider);
    const beforeCalls = provider.callCount;
    const repository = new InMemoryExecutionRepository();
    const persisted = await persistGenerationExecution(
      { calculatedAt, signContext: context, generationResult: result },
      repository,
    );
    expect(persisted.status).toBe("persisted");
    expect(provider.callCount).toBe(beforeCalls);
  });
});
