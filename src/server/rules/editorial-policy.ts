import { PLANETARY_BODIES } from "../planetary/planetary-engine";
import type { EditorialPeriod, EditorialPolicy, EditorialTopic } from "./domain";

export const EDITORIAL_PERIODS: readonly EditorialPeriod[] = ["daily", "weekly", "monthly"];

export const ALLOWED_EDITORIAL_TOPICS: readonly EditorialTopic[] = [
  "love",
  "relationships",
  "work",
  "creativity",
  "organization",
  "wellbeing",
  "reflection",
  "communication",
  "personal_energy",
] as const;

export const DEFAULT_EDITORIAL_POLICY: Readonly<EditorialPolicy> = Object.freeze({
  version: "editorial-policy@2d:whole-sign-solar",
  timezone: "America/Santiago",
  maxFactsByPeriod: {
    daily: 3,
    weekly: 5,
    monthly: 6,
  },
  maxFactsPerTopic: 2,
  allowedTopics: ALLOWED_EDITORIAL_TOPICS,
  forbiddenClaimCategories: [
    "medical_diagnosis",
    "clinical_treatment",
    "financial_promise",
    "absolute_prediction",
    "fatalism",
    "death",
    "announced_accident",
    "guaranteed_pregnancy",
    "guaranteed_breakup",
    "guaranteed_financial_success",
    "exact_predictive_science_claim",
  ],
  weights: {
    eventType: {
      lunar_phase: 1.2,
      sign_ingress: 1.1,
      retrograde_station: 1.35,
      direct_station: 1.25,
      exact_aspect: 1.5,
    },
    body: Object.fromEntries(
      PLANETARY_BODIES.map((body) => [body, body === "moon" ? 1.1 : 1]),
    ) as EditorialPolicy["weights"]["body"],
    exactness: 0.2,
    recency: 0.1,
  },
});
