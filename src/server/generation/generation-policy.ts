import type { GenerationConstraints } from "./domain";

export const GENERATION_POLICY_VERSION = "generation-policy@2e:v1";

export const FORBIDDEN_GENERATION_PATTERNS: readonly string[] = [
  "vas a ganar dinero seguro",
  "ganarás dinero seguro",
  "tendrás un accidente",
  "estas enfermo",
  "estás enfermo",
  "deja tu tratamiento",
  "quedarás embarazada",
  "tu pareja te será infiel",
  "esto ocurrirá sin duda",
  "sin duda ocurrirá",
  "muerte",
  "diagnóstico",
  "tratamiento médico",
  "éxito económico garantizado",
] as const;

export const DEFAULT_GENERATION_CONSTRAINTS: Readonly<GenerationConstraints> = Object.freeze({
  title: { min: 35, max: 90 },
  summary: { min: 120, max: 320 },
  section: { min: 120, max: 450 },
  closingMessage: { min: 60, max: 220 },
  allowedSections: ["love", "work", "wellbeing", "reflection"],
  tone: ["claro", "reflexivo", "cercano", "prudente", "no fatalista"],
  forbiddenClaimCategories: [
    "medical_diagnosis",
    "clinical_treatment",
    "financial_promise",
    "absolute_prediction",
    "fatalism",
    "natal_chart_claim",
  ],
  forbiddenPatterns: FORBIDDEN_GENERATION_PATTERNS,
  noInventedFacts: true,
  noNatalChartData: true,
  noAbsoluteCertainty: true,
});
