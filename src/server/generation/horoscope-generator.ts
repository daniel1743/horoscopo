import type { SignContext } from "../rules/domain";
import { buildFallbackDraft } from "./fallback-generator";
import { buildGenerationRequest, buildPromptBundle } from "./prompt-builder";
import {
  HoroscopeGenerationError,
  type GenerationResult,
  type StructuralGenerationValidation,
  type TextGenerationProvider,
} from "./domain";
import { parseGeneratedHoroscopeJson, validateGeneratedDraft } from "./strict-json-parser";

function invalidValidation(error: unknown): StructuralGenerationValidation {
  const code = error instanceof HoroscopeGenerationError ? error.code : "PROVIDER_FAILURE";
  return {
    valid: false,
    errors: [{ code, message: error instanceof Error ? error.message : String(error) }],
    warnings: [],
  };
}

function assertSignContext(context: SignContext): void {
  if (!context || context.kind !== "sign_context" || !Array.isArray(context.selectedFacts)) {
    throw new HoroscopeGenerationError("SignContext invalido", "INVALID_SIGN_CONTEXT");
  }
}

export async function generateHoroscopeDraft(
  context: SignContext,
  provider: TextGenerationProvider,
): Promise<GenerationResult> {
  assertSignContext(context);
  const before = JSON.stringify(context);
  const request = buildGenerationRequest(context);
  const prompt = buildPromptBundle(request);
  let validation: StructuralGenerationValidation;
  let draft = buildFallbackDraft(context);
  let status: GenerationResult["status"] = "fallback";

  try {
    const response = await provider.generate({
      ...prompt,
      temperature: 0.2,
      metadata: {
        requestId: request.id,
        signContextId: context.id,
        promptVersion: request.promptVersion,
      },
    });
    if (response.finishReason !== "stop") {
      throw new HoroscopeGenerationError(
        "respuesta truncada o fallida",
        "INVALID_PROVIDER_RESPONSE",
      );
    }
    const parsed = parseGeneratedHoroscopeJson(response.rawText);
    const parsedValidation = validateGeneratedDraft(parsed, context, request.constraints);
    if (!parsedValidation.valid) {
      throw new HoroscopeGenerationError(
        parsedValidation.errors.map((error) => error.code).join(","),
        parsedValidation.errors.some((error) => error.code === "FORBIDDEN_CONTENT")
          ? "FORBIDDEN_CONTENT"
          : "STRUCTURAL_VALIDATION_FAILED",
      );
    }
    draft = parsed;
    validation = parsedValidation;
    status = "generated";
  } catch (error) {
    draft = buildFallbackDraft(context);
    validation = invalidValidation(error);
  }

  const fallbackValidation = validateGeneratedDraft(draft, context, request.constraints);
  if (!fallbackValidation.valid) {
    throw new HoroscopeGenerationError("fallback invalido", "FALLBACK_GENERATION_FAILED");
  }
  if (before !== JSON.stringify(context)) {
    throw new HoroscopeGenerationError("SignContext mutado", "INVALID_SIGN_CONTEXT");
  }
  return {
    id: `generation-result:${request.id}:${status}`,
    status,
    draft,
    providerMetadata: {
      providerId: provider.providerId,
      modelId: provider.modelId,
      promptVersion: request.promptVersion,
      schemaVersion: request.outputSchemaVersion,
    },
    validation:
      status === "generated"
        ? validation
        : { ...validation, warnings: fallbackValidation.warnings },
  };
}
