import { describe, expect, it } from "vitest";
import { DEFAULT_GENERATION_CONSTRAINTS } from "./generation-policy";
import { buildFallbackDraft } from "./fallback-generator";
import { validateGeneratedDraft } from "./strict-json-parser";
import { generationFact, signContext } from "./test-fixtures";

describe("fallback-generator", () => {
  it("produce fallback determinista y valido", () => {
    const context = signContext([generationFact("fact:b"), generationFact("fact:a", ["event:a"])]);
    const first = buildFallbackDraft(context);
    const second = buildFallbackDraft({
      ...context,
      selectedFacts: [...context.selectedFacts].reverse(),
    });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(validateGeneratedDraft(first, context, DEFAULT_GENERATION_CONSTRAINTS).valid).toBe(true);
  });

  it("sin facts produce contexto neutral sin inventar trazabilidad", () => {
    const context = signContext([]);
    const draft = buildFallbackDraft(context);
    expect(draft.usedFactIds).toEqual([]);
    expect(draft.sourceEventIds).toEqual([]);
    expect(draft.sections.wellbeing).toContain("orientacion general");
    expect(JSON.stringify(draft)).not.toContain("health");
  });

  it("conserva trazabilidad y round-trip JSON", () => {
    const context = signContext();
    const draft = buildFallbackDraft(context);
    expect(draft.usedFactIds).toEqual(["fact:one"]);
    expect(draft.sourceEventIds).toEqual(["event:one"]);
    expect(JSON.parse(JSON.stringify(draft))).toEqual(draft);
  });

  it.each(["love", "work", "wellbeing", "reflection"] as const)(
    "seccion fallback %s respeta longitud y no Markdown",
    (section) => {
      const value = buildFallbackDraft(signContext()).sections[section];
      expect(value.length).toBeGreaterThanOrEqual(120);
      expect(value.length).toBeLessThanOrEqual(450);
      expect(value).not.toContain("```");
    },
  );
});
