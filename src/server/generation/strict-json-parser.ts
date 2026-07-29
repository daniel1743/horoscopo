import type { SignContext } from "../rules/domain";
import {
  GENERATION_SCHEMA_VERSION,
  HoroscopeGenerationError,
  type GeneratedHoroscopeDraft,
  type GenerationConstraints,
  type GenerationErrorCode,
  type GenerationValidationIssue,
  type StructuralGenerationValidation,
} from "./domain";

const ROOT_FIELDS = [
  "schemaVersion",
  "signContextId",
  "sign",
  "period",
  "title",
  "summary",
  "sections",
  "closingMessage",
  "usedFactIds",
  "sourceEventIds",
] as const;
const SECTION_FIELDS = ["love", "work", "wellbeing", "reflection"] as const;

function issue(code: GenerationErrorCode, message: string): GenerationValidationIssue {
  return { code, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertNoUnexpectedFields(
  object: Record<string, unknown>,
  fields: readonly string[],
  path: string,
): void {
  for (const key of Object.keys(object)) {
    if (!fields.includes(key)) {
      throw new HoroscopeGenerationError(`${path}.${key} no esta permitido`, "UNEXPECTED_FIELD");
    }
  }
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new HoroscopeGenerationError(`${field} debe ser string`, "INVALID_FIELD_TYPE");
  }
  if (value.trim().length === 0) {
    throw new HoroscopeGenerationError(`${field} no puede ser vacio`, "INVALID_FIELD_VALUE");
  }
  return value;
}

function assertStringArray(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new HoroscopeGenerationError(`${field} debe ser array`, "INVALID_FIELD_TYPE");
  }
  return value.map((item, index) => assertString(item, `${field}[${index}]`));
}

export function parseGeneratedHoroscopeJson(rawText: string): GeneratedHoroscopeDraft {
  if (typeof rawText !== "string" || rawText.trim().length === 0) {
    throw new HoroscopeGenerationError("respuesta vacia", "NON_JSON_RESPONSE");
  }
  if (rawText.includes("```")) {
    throw new HoroscopeGenerationError("markdown no permitido", "NON_JSON_RESPONSE");
  }
  if (rawText !== rawText.trim() || !rawText.startsWith("{") || !rawText.endsWith("}")) {
    throw new HoroscopeGenerationError("texto extra antes o despues del JSON", "EXTRANEOUS_TEXT");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    throw new HoroscopeGenerationError(
      error instanceof Error ? error.message : "JSON invalido",
      "STRICT_JSON_PARSE_FAILED",
    );
  }
  if (!isRecord(parsed)) {
    throw new HoroscopeGenerationError("raiz JSON debe ser objeto", "INVALID_JSON_ROOT");
  }
  assertNoUnexpectedFields(parsed, ROOT_FIELDS, "root");
  for (const field of ROOT_FIELDS) {
    if (!(field in parsed)) {
      throw new HoroscopeGenerationError(`falta ${field}`, "MISSING_REQUIRED_FIELD");
    }
  }
  if (!isRecord(parsed.sections)) {
    throw new HoroscopeGenerationError("sections debe ser objeto", "INVALID_FIELD_TYPE");
  }
  assertNoUnexpectedFields(parsed.sections, SECTION_FIELDS, "sections");
  for (const field of SECTION_FIELDS) {
    if (!(field in parsed.sections)) {
      throw new HoroscopeGenerationError(`falta sections.${field}`, "MISSING_REQUIRED_FIELD");
    }
  }
  return {
    schemaVersion: assertString(parsed.schemaVersion, "schemaVersion"),
    signContextId: assertString(parsed.signContextId, "signContextId"),
    sign: assertString(parsed.sign, "sign") as GeneratedHoroscopeDraft["sign"],
    period: assertString(parsed.period, "period") as GeneratedHoroscopeDraft["period"],
    title: assertString(parsed.title, "title"),
    summary: assertString(parsed.summary, "summary"),
    sections: {
      love: assertString(parsed.sections.love, "sections.love"),
      work: assertString(parsed.sections.work, "sections.work"),
      wellbeing: assertString(parsed.sections.wellbeing, "sections.wellbeing"),
      reflection: assertString(parsed.sections.reflection, "sections.reflection"),
    },
    closingMessage: assertString(parsed.closingMessage, "closingMessage"),
    usedFactIds: assertStringArray(parsed.usedFactIds, "usedFactIds"),
    sourceEventIds: assertStringArray(parsed.sourceEventIds, "sourceEventIds"),
  };
}

function hasDuplicates(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

function containsForbiddenContent(text: string, constraints: GenerationConstraints): boolean {
  const normalized = text.toLocaleLowerCase("es");
  return constraints.forbiddenPatterns.some((pattern) =>
    normalized.includes(pattern.toLocaleLowerCase("es")),
  );
}

function checkLength(
  value: string,
  constraint: { min: number; max: number },
  field: string,
  errors: GenerationValidationIssue[],
): void {
  if (value.length < constraint.min || value.length > constraint.max) {
    errors.push(issue("INVALID_FIELD_VALUE", `${field} fuera de longitud`));
  }
}

export function validateGeneratedDraft(
  draft: GeneratedHoroscopeDraft,
  context: SignContext,
  constraints: GenerationConstraints,
): StructuralGenerationValidation {
  const errors: GenerationValidationIssue[] = [];
  if (draft.schemaVersion !== GENERATION_SCHEMA_VERSION)
    errors.push(issue("SCHEMA_VALIDATION_FAILED", "schemaVersion invalida"));
  if (draft.signContextId !== context.id)
    errors.push(issue("TRACEABILITY_VIOLATION", "signContextId no coincide"));
  if (draft.sign !== context.sign) errors.push(issue("TRACEABILITY_VIOLATION", "sign no coincide"));
  if (draft.period !== context.period)
    errors.push(issue("TRACEABILITY_VIOLATION", "period no coincide"));
  checkLength(draft.title, constraints.title, "title", errors);
  checkLength(draft.summary, constraints.summary, "summary", errors);
  checkLength(draft.sections.love, constraints.section, "sections.love", errors);
  checkLength(draft.sections.work, constraints.section, "sections.work", errors);
  checkLength(draft.sections.wellbeing, constraints.section, "sections.wellbeing", errors);
  checkLength(draft.sections.reflection, constraints.section, "sections.reflection", errors);
  checkLength(draft.closingMessage, constraints.closingMessage, "closingMessage", errors);
  const allowedFactIds = new Set(context.selectedFacts.map((fact) => fact.id));
  const allowedEventIds = new Set(
    context.selectedFacts.flatMap((fact) => [...fact.sourceEventIds]),
  );
  if (hasDuplicates(draft.usedFactIds) || hasDuplicates(draft.sourceEventIds)) {
    errors.push(issue("TRACEABILITY_VIOLATION", "IDs duplicados"));
  }
  if (!draft.usedFactIds.every((id) => allowedFactIds.has(id))) {
    errors.push(issue("TRACEABILITY_VIOLATION", "usedFactIds inventados"));
  }
  if (!draft.sourceEventIds.every((id) => allowedEventIds.has(id))) {
    errors.push(issue("TRACEABILITY_VIOLATION", "sourceEventIds inventados"));
  }
  const allText = [
    draft.title,
    draft.summary,
    draft.sections.love,
    draft.sections.work,
    draft.sections.wellbeing,
    draft.sections.reflection,
    draft.closingMessage,
  ].join("\n");
  if (containsForbiddenContent(allText, constraints)) {
    errors.push(issue("FORBIDDEN_CONTENT", "contenido prohibido"));
  }
  if (allText.includes("<") || allText.includes(">") || allText.includes("```")) {
    errors.push(issue("INVALID_FIELD_VALUE", "HTML o Markdown no permitido"));
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}
