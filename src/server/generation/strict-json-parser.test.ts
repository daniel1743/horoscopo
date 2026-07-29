import { describe, expect, it } from "vitest";
import { DEFAULT_GENERATION_CONSTRAINTS } from "./generation-policy";
import { parseGeneratedHoroscopeJson, validateGeneratedDraft } from "./strict-json-parser";
import { signContext, validDraft } from "./test-fixtures";

describe("strict-json-parser", () => {
  it("acepta JSON valido", () => {
    const draft = validDraft();
    expect(parseGeneratedHoroscopeJson(JSON.stringify(draft))).toEqual(draft);
  });

  it.each([
    ["Markdown", "```json\n{}\n```"],
    ["texto antes", `hola ${JSON.stringify(validDraft())}`],
    ["texto despues", `${JSON.stringify(validDraft())} fin`],
    ["array raiz", "[]"],
    ["truncado", '{"schemaVersion":'],
  ])("rechaza %s", (_name, raw) => {
    expect(() => parseGeneratedHoroscopeJson(raw)).toThrow();
  });

  it("rechaza campos adicionales, faltantes, tipos incorrectos y strings vacios", () => {
    const draft = validDraft();
    expect(() => parseGeneratedHoroscopeJson(JSON.stringify({ ...draft, extra: true }))).toThrow();
    const { title: _title, ...missing } = draft;
    expect(() => parseGeneratedHoroscopeJson(JSON.stringify(missing))).toThrow();
    expect(() => parseGeneratedHoroscopeJson(JSON.stringify({ ...draft, title: [] }))).toThrow();
    expect(() => parseGeneratedHoroscopeJson(JSON.stringify({ ...draft, title: "" }))).toThrow();
  });

  it.each([
    "schemaVersion",
    "signContextId",
    "sign",
    "period",
    "summary",
    "sections",
    "closingMessage",
    "usedFactIds",
    "sourceEventIds",
  ] as const)("rechaza campo requerido faltante: %s", (field) => {
    const draft = { ...validDraft() };
    delete (draft as Record<string, unknown>)[field];
    expect(() => parseGeneratedHoroscopeJson(JSON.stringify(draft))).toThrow();
  });

  it.each(["love", "work", "wellbeing", "reflection"] as const)(
    "rechaza seccion faltante: %s",
    (field) => {
      const draft = validDraft();
      const sections = { ...draft.sections };
      delete (sections as Record<string, unknown>)[field];
      expect(() => parseGeneratedHoroscopeJson(JSON.stringify({ ...draft, sections }))).toThrow();
    },
  );

  it("rechaza signo, periodo y signContextId distintos", () => {
    const context = signContext();
    expect(
      validateGeneratedDraft(
        { ...validDraft(context), sign: "tauro" },
        context,
        DEFAULT_GENERATION_CONSTRAINTS,
      ).valid,
    ).toBe(false);
    expect(
      validateGeneratedDraft(
        { ...validDraft(context), period: "weekly" },
        context,
        DEFAULT_GENERATION_CONSTRAINTS,
      ).valid,
    ).toBe(false);
    expect(
      validateGeneratedDraft(
        { ...validDraft(context), signContextId: "otro" },
        context,
        DEFAULT_GENERATION_CONSTRAINTS,
      ).valid,
    ).toBe(false);
  });

  it("rechaza IDs inventados y duplicados", () => {
    const context = signContext();
    expect(
      validateGeneratedDraft(
        { ...validDraft(context), usedFactIds: ["inventado"] },
        context,
        DEFAULT_GENERATION_CONSTRAINTS,
      ).valid,
    ).toBe(false);
    expect(
      validateGeneratedDraft(
        { ...validDraft(context), sourceEventIds: ["inventado"] },
        context,
        DEFAULT_GENERATION_CONSTRAINTS,
      ).valid,
    ).toBe(false);
    expect(
      validateGeneratedDraft(
        { ...validDraft(context), usedFactIds: ["fact:one", "fact:one"] },
        context,
        DEFAULT_GENERATION_CONSTRAINTS,
      ).valid,
    ).toBe(false);
  });

  it.each([
    "vas a ganar dinero seguro",
    "tendrás un accidente",
    "estás enfermo",
    "deja tu tratamiento",
    "quedarás embarazada",
    "tu pareja te será infiel",
    "esto ocurrirá sin duda",
  ])("rechaza contenido prohibido: %s", (text) => {
    const context = signContext();
    const draft = { ...validDraft(context), summary: `${validDraft(context).summary} ${text}` };
    expect(validateGeneratedDraft(draft, context, DEFAULT_GENERATION_CONSTRAINTS).valid).toBe(
      false,
    );
  });
});
