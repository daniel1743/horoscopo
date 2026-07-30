import { describe, expect, it } from "vitest";
import { generateHoroscopeDraft } from "../generation/horoscope-generator";
import { DEFAULT_GENERATION_CONSTRAINTS } from "../generation/generation-policy";
import { DeterministicTestGenerationProvider } from "../generation/provider";
import { generationFact, signContext, validDraft } from "../generation/test-fixtures";
import type { GeneratedHoroscopeDraft } from "../generation/domain";
import type { RuleFact } from "../rules/domain";
import { validateEditorialDraft } from "./editorial-validator";
import type { EditorialValidationIssueCode } from "./domain";

function makeDraft(overrides: Partial<GeneratedHoroscopeDraft> = {}): GeneratedHoroscopeDraft {
  const context = signContext();
  return { ...validDraft(context), ...overrides };
}

function validate(draft = makeDraft(), facts: readonly RuleFact[] = [generationFact()]) {
  const context = signContext(facts);
  return validateEditorialDraft({
    draft: { ...draft, signContextId: context.id, sign: context.sign, period: context.period },
    context,
    constraints: DEFAULT_GENERATION_CONSTRAINTS,
  });
}

function expectCode(draft: GeneratedHoroscopeDraft, code: EditorialValidationIssueCode): void {
  const result = validate(draft);
  expect(result.valid).toBe(false);
  expect(result.issues.map((issue) => issue.code)).toContain(code);
}

const validLongText =
  "En vinculos y afectos, la lectura observa el periodo con calma y propone revisar prioridades desde hechos trazables. Mantiene un tono prudente, sin prometer resultados cerrados ni agregar datos personales.";

describe("editorial-validator", () => {
  it("acepta contenido completamente valido", () => {
    const result = validate();
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.metrics.sectionsChecked).toBe(4);
  });

  it("es determinista", () => {
    expect(JSON.stringify(validate())).toBe(JSON.stringify(validate()));
  });

  it("serializa y deserializa JSON sin perdida", () => {
    const result = validate();
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("detecta seccion ausente", () => {
    const draft = makeDraft({ sections: { ...makeDraft().sections } });
    delete (draft.sections as Partial<typeof draft.sections>).love;
    expectCode(draft, "REQUIRED_SECTION_MISSING");
  });

  it("detecta seccion vacia", () => {
    expectCode(makeDraft({ sections: { ...makeDraft().sections, love: "" } }), "EMPTY_SECTION");
  });

  it("detecta seccion demasiado corta", () => {
    expectCode(
      makeDraft({ sections: { ...makeDraft().sections, love: "Muy breve." } }),
      "LENGTH_OUT_OF_RANGE",
    );
  });

  it("detecta seccion demasiado larga", () => {
    expectCode(
      makeDraft({ sections: { ...makeDraft().sections, love: "larga ".repeat(120) } }),
      "LENGTH_OUT_OF_RANGE",
    );
  });

  it("detecta texto compuesto solo por espacios", () => {
    expectCode(
      makeDraft({ sections: { ...makeDraft().sections, love: "   " } }),
      "WHITESPACE_ONLY_TEXT",
    );
  });

  it("detecta estructura adicional no permitida", () => {
    const draft = makeDraft({
      sections: {
        ...makeDraft().sections,
        money: validLongText,
      } as unknown as GeneratedHoroscopeDraft["sections"],
    });
    expectCode(draft, "UNEXPECTED_STRUCTURE");
  });

  it("detecta planeta inventado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Marte ordena el impulso.` }),
      "UNAUTHORIZED_PLANET",
    );
  });

  it("detecta signo inventado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Tauro aparece como foco.` }),
      "UNAUTHORIZED_SIGN",
    );
  });

  it("detecta aspecto inventado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Un sextil abre matices.` }),
      "UNKNOWN_ASPECT_TYPE",
    );
  });

  it("detecta evento temporal inventado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Un ingreso marca el tono.` }),
      "INVENTED_TEMPORAL_EVENT",
    );
  });

  it("detecta factId desconocido", () => {
    expectCode(makeDraft({ usedFactIds: ["fact:inventado"] }), "UNKNOWN_FACT_ID");
  });

  it("detecta sourceEventId desconocido", () => {
    expectCode(makeDraft({ sourceEventIds: ["event:inventado"] }), "UNKNOWN_SOURCE_EVENT_ID");
  });

  it("detecta grado inventado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} El foco aparece en 23 grados.` }),
      "UNSUPPORTED_NUMERIC_CLAIM",
    );
  });

  it("detecta fecha inventada", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} La fecha 2026-12-24 no esta respaldada.` }),
      "UNSUPPORTED_NUMERIC_CLAIM",
    );
  });

  it("detecta orbe inventado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} El orbe 8 grados no esta respaldado.` }),
      "UNSUPPORTED_NUMERIC_CLAIM",
    );
  });

  it("detecta referencia natal prohibida", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} La carta natal confirma esto.` }),
      "NATAL_CHART_REFERENCE",
    );
  });

  it("detecta casa astrologica no autorizada", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} La casa 7 toma protagonismo.` }),
      "ASTROLOGICAL_HOUSE_REFERENCE",
    );
  });

  it("detecta ascendente no autorizado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} El ascendente modifica la lectura.` }),
      "ASCENDANT_REFERENCE",
    );
  });

  it("detecta medio cielo no autorizado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} El medio cielo interviene.` }),
      "MIDHEAVEN_REFERENCE",
    );
  });

  it("detecta promesa absoluta", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Sin duda ocurrira todo.` }),
      "ABSOLUTE_CERTAINTY",
    );
  });

  it("detecta prediccion garantizada", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Ocurrira seguro antes del cierre.` }),
      "GUARANTEED_PREDICTION",
    );
  });

  it("detecta fatalismo", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Tu destino es no poder evitarlo.` }),
      "FATALISM",
    );
  });

  it("detecta consejo medico", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Deja tu tratamiento medico.` }),
      "MEDICAL_ADVICE",
    );
  });

  it("detecta consejo legal", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Firma el contrato sin revisar.` }),
      "LEGAL_ADVICE",
    );
  });

  it("detecta consejo financiero", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Invierte todo tu dinero.` }),
      "FINANCIAL_ADVICE",
    );
  });

  it("detecta consejo peligroso", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} Ignora las alertas.` }),
      "DANGEROUS_ADVICE",
    );
  });

  it("detecta contradiccion directo retrogrado", () => {
    expectCode(
      makeDraft({ summary: `${makeDraft().summary} La Luna esta directa y retrograda.` }),
      "DIRECT_RETROGRADE_CONTRADICTION",
    );
  });

  it("detecta contradiccion entre secciones como warning no bloqueante", () => {
    const result = validate(
      makeDraft({ summary: `${makeDraft().summary} Se abre un inicio y se cierra el proceso.` }),
    );
    expect(result.valid).toBe(true);
    expect(result.metrics.warningCount).toBeGreaterThan(0);
    expect(result.issues[0]).toMatchObject({
      code: "SECTION_CONTRADICTION",
      severity: "warning",
      path: "summary",
    });
  });

  it("detecta aspecto afirmado y negado", () => {
    const result = validate(
      makeDraft({ summary: `${makeDraft().summary} No hay sextil, aunque el sextil aparece.` }),
    );
    expect(result.issues.map((issue) => issue.code)).toContain(
      "ASPECT_AFFIRM_NEGATE_CONTRADICTION",
    );
  });

  it("detecta duplicacion literal", () => {
    const result = validate(
      makeDraft({ sections: { ...makeDraft().sections, work: makeDraft().sections.love } }),
    );
    expect(result.metrics.duplicatedSentenceCount).toBeGreaterThan(0);
  });

  it("detecta repeticion excesiva", () => {
    const repeated = `${validLongText} calma calma calma calma calma calma calma calma.`;
    const result = validate(makeDraft({ sections: { ...makeDraft().sections, love: repeated } }));
    expect(result.valid).toBe(true);
    expect(result.metrics.warningCount).toBeGreaterThan(0);
    expect(result.issues.map((issue) => issue.code)).toContain("EXCESSIVE_REPETITION");
  });

  it("detecta densidad elevada de frases genericas", () => {
    const generic = `${validLongText} Escucha tu intuicion y confia en el universo. Todo fluye.`;
    const result = validate(makeDraft({ sections: { ...makeDraft().sections, love: generic } }));
    expect(result.valid).toBe(true);
    expect(result.metrics.warningCount).toBeGreaterThan(0);
    expect(result.issues.map((issue) => issue.code)).toContain("GENERIC_PHRASE_DENSITY_HIGH");
  });

  it("detecta texto sin factId como warning no bloqueante", () => {
    const result = validate(makeDraft({ usedFactIds: [] }));
    expect(result.valid).toBe(true);
    expect(result.metrics.warningCount).toBeGreaterThan(0);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "TEXT_WITHOUT_FACT_TRACE",
        severity: "warning",
        path: "usedFactIds",
      }),
    );
    expect(JSON.parse(JSON.stringify(result)).issues).toEqual(result.issues);
  });

  it("ordena multiples errores de forma estable", () => {
    const result = validate(
      makeDraft({
        summary:
          "Marte en Tauro sin duda ocurrira seguro. Se abre un inicio y se cierra el proceso.",
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.severity === "error")).toBe(true);
    expect(result.issues.some((issue) => issue.severity === "warning")).toBe(true);
    expect(JSON.stringify(result)).toBe(
      JSON.stringify(
        validate(
          makeDraft({
            summary:
              "Marte en Tauro sin duda ocurrira seguro. Se abre un inicio y se cierra el proceso.",
          }),
        ),
      ),
    );
  });

  it("valida concurrentemente sin contaminacion", async () => {
    const results = await Promise.all([validate(), validate(), validate()]);
    expect(new Set(results.map((result) => JSON.stringify(result))).size).toBe(1);
  });

  it("acepta entradas Unicode y tildes", () => {
    const result = validate(
      makeDraft({ summary: `${makeDraft().summary} La orientación mantiene calma y criterio.` }),
    );
    expect(result.valid).toBe(true);
  });

  it("respeta limites exactos de longitud", () => {
    const text = "a".repeat(DEFAULT_GENERATION_CONSTRAINTS.section.min);
    expect(validate(makeDraft({ sections: { ...makeDraft().sections, love: text } })).valid).toBe(
      true,
    );
  });

  it("maneja ausencia total de hechos", () => {
    const context = signContext([]);
    const draft = validDraft(context);
    const result = validateEditorialDraft({
      draft,
      context,
      constraints: DEFAULT_GENERATION_CONSTRAINTS,
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("acepta conjunto minimo de hechos valido", () => {
    const context = signContext([generationFact("fact:min", ["event:min"])]);
    const result = validateEditorialDraft({
      draft: validDraft(context),
      context,
      constraints: DEFAULT_GENERATION_CONSTRAINTS,
    });
    expect(result.valid).toBe(true);
  });

  it("evita falsos positivos por palabras contenidas dentro de otras palabras", () => {
    const result = validate(
      makeDraft({ summary: `${makeDraft().summary} El martes se revisa la agenda.` }),
    );
    expect(result.valid).toBe(true);
  });

  it.each([
    "no tienes opción",
    "no tienes opcion",
    "NO TIENES OPCIÓN",
    "no tienes opción.",
    "no tienes\nopción",
  ])("detecta politica riesgosa normalizada: %s", (phrase) => {
    const result = validate(makeDraft({ summary: `${makeDraft().summary} ${phrase}` }));
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "EMOTIONAL_MANIPULATION",
        severity: "error",
        path: "summary",
      }),
    );
  });

  it("no bloquea palabras inocuas parecidas a patrones de politica", () => {
    const result = validate(
      makeDraft({ summary: `${makeDraft().summary} Esta opcion editorial es opcional.` }),
    );
    expect(result.valid).toBe(true);
  });

  it("integra generacion valida con HoroscopeGenerator", async () => {
    const context = signContext();
    const provider = new DeterministicTestGenerationProvider(() =>
      JSON.stringify(validDraft(context)),
    );
    const result = await generateHoroscopeDraft(context, provider);
    expect(result.status).toBe("generated");
    expect(result.validation.editorial?.valid).toBe(true);
    expect(provider.callCount).toBe(1);
  });

  it("integra generacion invalida y activa fallback", async () => {
    const context = signContext();
    const invalid = {
      ...validDraft(context),
      summary: `${validDraft(context).summary} Marte sin duda ocurrira seguro.`,
    };
    const provider = new DeterministicTestGenerationProvider(() => JSON.stringify(invalid));
    const result = await generateHoroscopeDraft(context, provider);
    expect(result.status).toBe("fallback");
    expect(provider.callCount).toBe(1);
    expect(result.draft.summary).not.toContain("Marte");
    expect(result.validation.errors[0]?.message).not.toContain("UNAUTHORIZED_PLANET");
    expect(result.validation.editorial?.valid).toBe(false);
    expect(result.validation.editorial?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "UNAUTHORIZED_PLANET",
          severity: "error",
          path: "summary",
          evidence: "mars",
        }),
        expect.objectContaining({
          code: "ABSOLUTE_CERTAINTY",
          severity: "error",
          path: "summary",
        }),
      ]),
    );
    expect(result.validation.editorial?.metrics.blockingIssueCount).toBeGreaterThan(1);
  });
});
