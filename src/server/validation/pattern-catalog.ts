import type { EditorialValidationIssueCode, EditorialValidationSeverity } from "./domain";

export interface EditorialPattern {
  code: EditorialValidationIssueCode;
  severity: EditorialValidationSeverity;
  pattern: RegExp;
  message: string;
}

export const CERTAINTY_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  {
    code: "ABSOLUTE_CERTAINTY",
    severity: "error",
    pattern: /\b(sin duda|seguro que|con certeza|inevitablemente|definitivamente)\b/iu,
    message: "certeza absoluta no permitida",
  },
  {
    code: "GUARANTEED_PREDICTION",
    severity: "error",
    pattern: /\b(ocurrira|sucedera|pasara)\s+(seguro|sin falta|inevitablemente)\b/iu,
    message: "prediccion garantizada no permitida",
  },
]);

export const FATALISM_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  {
    code: "FATALISM",
    severity: "error",
    pattern: /\b(no podras evitar|tu destino es|estas condenado|sera imposible escapar)\b/iu,
    message: "fatalismo no permitido",
  },
  {
    code: "FORBIDDEN_PROMISE",
    severity: "error",
    pattern: /\b(muerte|accidente|enfermedad grave|embarazo seguro|riqueza garantizada)\b/iu,
    message: "promesa o amenaza sensible no permitida",
  },
]);

export const MEDICAL_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  {
    code: "MEDICAL_ADVICE",
    severity: "error",
    pattern: /\b(toma|deja|suspende|cambia)\s+(tu\s+)?(medicacion|medicamento|tratamiento)\b/iu,
    message: "recomendacion medica no permitida",
  },
  {
    code: "DIAGNOSTIC_CLAIM",
    severity: "error",
    pattern: /\b(tienes|padeces|sufres)\s+(de\s+)?(depresion|ansiedad|cancer|diabetes)\b/iu,
    message: "afirmacion diagnostica no permitida",
  },
  {
    code: "DISCONTINUE_TREATMENT",
    severity: "error",
    pattern: /\b(abandona|deja|suspende)\s+(el\s+)?tratamiento\b/iu,
    message: "instruccion para abandonar tratamiento no permitida",
  },
]);

export const LEGAL_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  {
    code: "LEGAL_ADVICE",
    severity: "error",
    pattern: /\b(firma|demanda|divorciate|renuncia)\s+(el\s+)?(contrato|acuerdo|juicio)\b/iu,
    message: "consejo legal no permitido",
  },
]);

export const FINANCIAL_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  {
    code: "FINANCIAL_ADVICE",
    severity: "error",
    pattern: /\b(compra|vende|invierte|apuesta)\s+(acciones|criptomonedas|todo tu dinero)\b/iu,
    message: "consejo financiero no permitido",
  },
  {
    code: "FORBIDDEN_PROMISE",
    severity: "error",
    pattern: /\b(ganaras dinero seguro|exito economico garantizado|te haras rico)\b/iu,
    message: "promesa financiera no permitida",
  },
]);

export const DANGEROUS_ADVICE_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  {
    code: "DANGEROUS_ADVICE",
    severity: "error",
    pattern: /\b(ponte en riesgo|ignora las alertas|maneja sin cuidado|enfrenta violencia)\b/iu,
    message: "consejo peligroso no permitido",
  },
  {
    code: "EMOTIONAL_MANIPULATION",
    severity: "error",
    pattern: /\b(si\s+no\s+haces\s+esto|debes\s+obedecer|no\s+tienes\s+opcion)\b/iu,
    message: "manipulacion emocional no permitida",
  },
]);

export const NATAL_ONLY_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  {
    code: "NATAL_CHART_REFERENCE",
    severity: "error",
    pattern: /\b(carta natal|mapa natal|datos natales|hora de nacimiento)\b/iu,
    message: "referencia natal no permitida en generacion general",
  },
  {
    code: "ASCENDANT_REFERENCE",
    severity: "error",
    pattern: /\b(ascendente)\b/iu,
    message: "ascendente no proporcionado",
  },
  {
    code: "MIDHEAVEN_REFERENCE",
    severity: "error",
    pattern: /\b(medio cielo|mediocielo|mc natal)\b/iu,
    message: "medio cielo no proporcionado",
  },
]);

export const DISCRIMINATORY_OR_EXPLICIT_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  {
    code: "DISCRIMINATORY_CONTENT",
    severity: "error",
    pattern: /\b(inferior por tu raza|inferior por tu genero|odio a)\b/iu,
    message: "contenido discriminatorio no permitido",
  },
  {
    code: "EXPLICIT_SEXUAL_CONTENT",
    severity: "error",
    pattern: /\b(sexo explicito|acto sexual explicito)\b/iu,
    message: "lenguaje sexual explicito no permitido",
  },
  {
    code: "GRAPHIC_VIOLENCE",
    severity: "error",
    pattern: /\b(violencia grafica|sangre y mutilacion)\b/iu,
    message: "violencia grafica no permitida",
  },
  {
    code: "SEVERE_OFFENSIVE_LANGUAGE",
    severity: "error",
    pattern: /\b(insulto grave deshumanizante)\b/iu,
    message: "lenguaje ofensivo grave no permitido",
  },
]);

export const ALL_EDITORIAL_PATTERNS: readonly EditorialPattern[] = Object.freeze([
  ...CERTAINTY_PATTERNS,
  ...FATALISM_PATTERNS,
  ...MEDICAL_PATTERNS,
  ...LEGAL_PATTERNS,
  ...FINANCIAL_PATTERNS,
  ...DANGEROUS_ADVICE_PATTERNS,
  ...NATAL_ONLY_PATTERNS,
  ...DISCRIMINATORY_OR_EXPLICIT_PATTERNS,
]);
