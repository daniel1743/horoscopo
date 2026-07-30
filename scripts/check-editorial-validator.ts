import { generateHoroscopeDraft } from "../src/server/generation/horoscope-generator";
import { DEFAULT_GENERATION_CONSTRAINTS } from "../src/server/generation/generation-policy";
import { DeterministicTestGenerationProvider } from "../src/server/generation/provider";
import { generationFact, signContext, validDraft } from "../src/server/generation/test-fixtures";
import { validateEditorialDraft } from "../src/server/validation/editorial-validator";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const context = signContext([generationFact()]);
  const draft = validDraft(context);
  const valid = validateEditorialDraft({
    draft,
    context,
    constraints: DEFAULT_GENERATION_CONSTRAINTS,
  });
  assert(valid.valid, "caso valido debe aprobar");
  assert(
    JSON.stringify(valid) ===
      JSON.stringify(
        validateEditorialDraft({ draft, context, constraints: DEFAULT_GENERATION_CONSTRAINTS }),
      ),
    "validacion debe ser determinista",
  );
  assert(
    JSON.parse(JSON.stringify(valid)).metrics.totalWords === valid.metrics.totalWords,
    "serializacion estable",
  );

  const hallucinated = validateEditorialDraft({
    draft: { ...draft, summary: `${draft.summary} Marte en Tauro aparece con 23 grados.` },
    context,
    constraints: DEFAULT_GENERATION_CONSTRAINTS,
  });
  assert(!hallucinated.valid, "alucinacion debe rechazarse");

  const risky = validateEditorialDraft({
    draft: {
      ...draft,
      summary: `${draft.summary} Sin duda ocurrira seguro y deja tu tratamiento.`,
    },
    context,
    constraints: DEFAULT_GENERATION_CONSTRAINTS,
  });
  assert(!risky.valid, "lenguaje riesgoso debe rechazarse");

  const provider = new DeterministicTestGenerationProvider(() =>
    JSON.stringify({
      ...draft,
      summary: `${draft.summary} Marte en Tauro sin duda ocurrira seguro. No tienes opción.`,
    }),
  );
  const result = await generateHoroscopeDraft(context, provider);
  assert(result.status === "fallback", "fallback debe activarse");
  assert(provider.callCount === 1, "proveedor no debe reintentarse");
  assert(!result.draft.summary.includes("Marte"), "texto rechazado no debe publicarse");
  const editorial = result.validation.editorial;
  if (!editorial || editorial.valid) {
    throw new Error("diagnostico editorial debe preservarse");
  }
  assert(
    editorial.issues.some(
      (issue) => issue.code === "EMOTIONAL_MANIPULATION" && issue.evidence === "no tienes opcion",
    ),
    "politica normalizada debe detectar tildes",
  );
  assert(editorial.issues.length > 3, "multiples issues editoriales no deben colapsarse");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
