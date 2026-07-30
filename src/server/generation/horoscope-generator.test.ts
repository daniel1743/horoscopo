import { describe, expect, it } from "vitest";
import { generateHoroscopeDraft } from "./horoscope-generator";
import { DeterministicTestGenerationProvider, FailingTestGenerationProvider } from "./provider";
import { signContext, validDraft } from "./test-fixtures";

describe("horoscope-generator", () => {
  it("genera resultado valido y conserva metadata del proveedor", async () => {
    const context = signContext();
    const provider = new DeterministicTestGenerationProvider(() =>
      JSON.stringify(validDraft(context)),
    );
    const result = await generateHoroscopeDraft(context, provider);
    expect(result.status).toBe("generated");
    expect(result.validation.valid).toBe(true);
    expect(result.providerMetadata.providerId).toBe(provider.providerId);
    expect(provider.callCount).toBe(1);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it.each([
    ["JSON invalido", "{", "fallback"],
    ["schema invalido", JSON.stringify({ ...validDraft(), sign: "tauro" }), "fallback"],
    [
      "contenido prohibido",
      JSON.stringify({
        ...validDraft(),
        summary: `${validDraft().summary} vas a ganar dinero seguro`,
      }),
      "fallback",
    ],
    ["bloque markdown", `\`\`\`json\n${JSON.stringify(validDraft())}\n\`\`\``, "fallback"],
  ])("usa fallback ante %s", async (_name, raw, expected) => {
    const provider = new DeterministicTestGenerationProvider(() => raw);
    const result = await generateHoroscopeDraft(signContext(), provider);
    expect(result.status).toBe(expected);
    expect(result.draft.sign).toBe("aries");
    expect(provider.callCount).toBe(1);
  });

  it("error del proveedor activa fallback", async () => {
    const provider = new FailingTestGenerationProvider();
    const result = await generateHoroscopeDraft(signContext(), provider);
    expect(result.status).toBe("fallback");
    expect(provider.callCount).toBe(1);
  });

  it("no muta SignContext e IDs son estables", async () => {
    const context = signContext();
    const before = JSON.stringify(context);
    const provider = new DeterministicTestGenerationProvider(() =>
      JSON.stringify(validDraft(context)),
    );
    const first = await generateHoroscopeDraft(context, provider);
    const second = await generateHoroscopeDraft(
      context,
      new DeterministicTestGenerationProvider(() => JSON.stringify(validDraft(context))),
    );
    expect(JSON.stringify(context)).toBe(before);
    expect(first.id).toBe(second.id);
  });

  it("genera concurrentemente sin estado compartido", async () => {
    const context = signContext();
    const response = JSON.stringify(validDraft(context));
    const results = await Promise.all([
      generateHoroscopeDraft(context, new DeterministicTestGenerationProvider(() => response)),
      generateHoroscopeDraft(context, new DeterministicTestGenerationProvider(() => response)),
      generateHoroscopeDraft(context, new DeterministicTestGenerationProvider(() => response)),
    ]);
    expect(new Set(results.map((result) => JSON.stringify(result))).size).toBe(1);
  });

  it("fallback por validacion editorial conserva diagnostico estructurado completo", async () => {
    const context = signContext();
    const rejected = {
      ...validDraft(context),
      summary: `${validDraft(context).summary} Marte en Tauro sin duda ocurrira seguro. No tienes opción.`,
    };
    const provider = new DeterministicTestGenerationProvider(() => JSON.stringify(rejected));
    const first = await generateHoroscopeDraft(context, provider);
    const second = await generateHoroscopeDraft(
      context,
      new DeterministicTestGenerationProvider(() => JSON.stringify(rejected)),
    );

    expect(first.status).toBe("fallback");
    expect(provider.callCount).toBe(1);
    expect(first.draft.summary).not.toContain("Marte");
    expect(first.validation.errors[0]).toMatchObject({
      code: "FORBIDDEN_CONTENT",
      message: "validacion editorial bloqueo el contenido",
    });
    expect(first.validation.editorial?.valid).toBe(false);
    expect(first.validation.editorial?.issues.length).toBeGreaterThan(3);
    expect(first.validation.editorial?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "UNAUTHORIZED_PLANET",
          severity: "error",
          path: "summary",
        }),
        expect.objectContaining({ code: "UNAUTHORIZED_SIGN", severity: "error", path: "summary" }),
        expect.objectContaining({
          code: "ABSOLUTE_CERTAINTY",
          severity: "error",
          path: "summary",
        }),
        expect.objectContaining({
          code: "EMOTIONAL_MANIPULATION",
          severity: "error",
          path: "summary",
          evidence: "no tienes opcion",
        }),
      ]),
    );
    expect(first.validation.editorial?.metrics.blockingIssueCount).toBeGreaterThan(3);
    expect(first.validation.editorial?.metrics.totalWords).toBeGreaterThan(0);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});
