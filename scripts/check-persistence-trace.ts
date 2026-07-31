import { generateHoroscopeDraft } from "../src/server/generation/horoscope-generator";
import { DeterministicTestGenerationProvider } from "../src/server/generation/provider";
import { signContext, validDraft } from "../src/server/generation/test-fixtures";
import { InMemoryExecutionRepository } from "../src/server/persistence/in-memory-execution-repository";
import { persistGenerationExecution } from "../src/server/persistence/persist-generation-execution";
import { buildPersistedExecutionRecord } from "../src/server/persistence/trace-record-builder";

const calculatedAt = "2024-06-01T12:00:00.000Z";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const context = signContext();
  const generated = await generateHoroscopeDraft(
    context,
    new DeterministicTestGenerationProvider(() => JSON.stringify(validDraft(context))),
  );
  const generatedInput = { calculatedAt, signContext: context, generationResult: generated };
  const firstRecord = buildPersistedExecutionRecord(generatedInput);
  const secondRecord = buildPersistedExecutionRecord(generatedInput);
  assert(JSON.stringify(firstRecord) === JSON.stringify(secondRecord), "registro determinista");
  assert(
    JSON.stringify(JSON.parse(JSON.stringify(firstRecord))) === JSON.stringify(firstRecord),
    "round-trip",
  );

  const rejected = {
    ...validDraft(context),
    summary: `${validDraft(context).summary} Marte en Tauro sin duda ocurrira seguro.`,
  };
  const fallback = await generateHoroscopeDraft(
    context,
    new DeterministicTestGenerationProvider(() => JSON.stringify(rejected)),
  );
  const fallbackRecord = buildPersistedExecutionRecord({
    calculatedAt,
    signContext: context,
    generationResult: fallback,
    rejectedDraft: rejected,
    failureStage: "editorial_validation",
  });
  assert(fallbackRecord.status === "fallback", "fallback esperado");
  assert(Boolean(fallbackRecord.generation.fallbackDraft), "fallbackDraft preservado");
  assert(fallbackRecord.generation.generatedDraft === undefined, "draft rechazado no aprobado");
  assert(fallbackRecord.validation.editorial?.valid === false, "diagnostico editorial preservado");

  const repository = new InMemoryExecutionRepository();
  assert(
    (await persistGenerationExecution(generatedInput, repository)).status === "persisted",
    "persisted",
  );
  assert(
    (await persistGenerationExecution(generatedInput, repository)).status === "already_exists",
    "idempotencia",
  );
  assert(
    (await persistGenerationExecution({ ...generatedInput, providerCallCount: 4 }, repository))
      .status === "conflict",
    "conflicto detectado",
  );
  const stored = await repository.findByExecutionId(firstRecord.identity.executionId);
  assert(Boolean(stored), "find debe retornar registro");
  if (stored) (stored.source.factIds as string[]).push("mutated");
  assert(
    (await repository.findByExecutionId(firstRecord.identity.executionId))?.source.factIds
      .length === 1,
    "aislamiento de mutaciones",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
