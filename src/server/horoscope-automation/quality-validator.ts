/**
 * Sistema de validación de calidad para horóscopos generados.
 * Previene contenido genérico y valida diversidad entre variantes.
 */

import type {
  QualityValidationResult,
  QualityIssue,
  VariantDiversityResult,
  VariantId,
} from "@/types/horoscope-automation";

// =====================================================================
// Detección de Clichés
// =====================================================================

/**
 * Lista negra de frases cliché que se deben evitar.
 */
const CLICHE_PHRASES = [
  "las estrellas se alinean",
  "un buen día para",
  "las energías están a tu favor",
  "mantén una actitud positiva",
  "confía en el universo",
  "todo sucede por algo",
  "el destino te sonríe",
  "las oportunidades llaman a tu puerta",
  "es tu momento de brillar",
  "sigue tu corazón",
  "el amor está en el aire",
  "hoy es un día especial",
  "la suerte está de tu lado",
  "confía en ti mismo",
  "todo es posible",
  "cree en ti",
  "mantente positivo",
  "sé tú mismo",
];

/**
 * Frases genéricas de baja especificidad.
 */
const GENERIC_PHRASES = [
  "hoy será",
  "en este momento",
  "actualmente",
  "en estos días",
  "pronto",
  "muy pronto",
  "en el futuro cercano",
  "las cosas mejorarán",
  "todo mejorará",
  "será mejor",
];

/**
 * Detecta frases cliché en el texto.
 */
function detectCliches(text: string): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lowerText = text.toLowerCase();

  for (const phrase of CLICHE_PHRASES) {
    if (lowerText.includes(phrase)) {
      issues.push({
        type: "cliche_detected",
        severity: "error",
        message: `Frase cliché detectada: "${phrase}"`,
        location: phrase,
      });
    }
  }

  return issues;
}

/**
 * Detecta frases genéricas de baja calidad.
 */
function detectGenericPhrases(text: string): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lowerText = text.toLowerCase();

  let genericCount = 0;
  for (const phrase of GENERIC_PHRASES) {
    if (lowerText.includes(phrase)) {
      genericCount++;
    }
  }

  // Si tiene más de 2 frases genéricas, es problemático
  if (genericCount > 2) {
    issues.push({
      type: "too_generic",
      severity: "error",
      message: `Contenido demasiado genérico (${genericCount} frases vagas detectadas)`,
    });
  } else if (genericCount > 0) {
    issues.push({
      type: "too_generic",
      severity: "warning",
      message: `Contenido algo genérico (${genericCount} frases vagas)`,
    });
  }

  return issues;
}

// =====================================================================
// Validación de Contenido Astronómico
// =====================================================================

/**
 * Planetas que se deben mencionar.
 */
const PLANETARY_KEYWORDS = [
  "sol",
  "luna",
  "mercurio",
  "venus",
  "marte",
  "júpiter",
  "saturno",
  "urano",
  "neptuno",
  "plutón",
  "tránsito",
  "aspecto",
  "retrógrado",
  "conjunción",
  "oposición",
  "trígono",
  "cuadratura",
];

/**
 * Signos zodiacales.
 */
const ZODIAC_KEYWORDS = [
  "aries",
  "tauro",
  "géminis",
  "cáncer",
  "leo",
  "virgo",
  "libra",
  "escorpio",
  "sagitario",
  "capricornio",
  "acuario",
  "piscis",
];

/**
 * Valida que el texto mencione contexto astronómico.
 */
function validateAstronomicalContent(text: string): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lowerText = text.toLowerCase();

  // Contar menciones planetarias
  let planetCount = 0;
  for (const planet of PLANETARY_KEYWORDS) {
    if (lowerText.includes(planet)) {
      planetCount++;
    }
  }

  // DEBE mencionar al menos 1 planeta o tránsito
  if (planetCount === 0) {
    issues.push({
      type: "no_planetary_mention",
      severity: "error",
      message:
        "No menciona ningún planeta, tránsito o aspecto específico. Contenido no fundamentado astrológicamente.",
    });
  }

  // Ideal: mencionar 2+ referencias astronómicas
  if (planetCount === 1) {
    issues.push({
      type: "low_specificity",
      severity: "warning",
      message:
        "Solo menciona 1 referencia astronómica. Recomendado: 2 o más para mayor profundidad.",
    });
  }

  return issues;
}

// =====================================================================
// Validación de Especificidad
// =====================================================================

/**
 * Calcula score de especificidad del texto (0-100).
 */
function calculateSpecificity(text: string): number {
  const lowerText = text.toLowerCase();

  // Factor 1: Longitud adecuada (150-250 palabras es ideal)
  const wordCount = text.split(/\s+/).length;
  let lengthScore = 0;
  if (wordCount >= 150 && wordCount <= 250) {
    lengthScore = 30;
  } else if (wordCount >= 100 && wordCount <= 300) {
    lengthScore = 20;
  } else {
    lengthScore = 10;
  }

  // Factor 2: Menciones astronómicas específicas
  let astroScore = 0;
  for (const keyword of PLANETARY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      astroScore += 5;
    }
  }
  astroScore = Math.min(astroScore, 30); // Max 30 puntos

  // Factor 3: Ausencia de clichés
  let clicheScore = 20;
  for (const cliche of CLICHE_PHRASES) {
    if (lowerText.includes(cliche)) {
      clicheScore -= 10;
    }
  }
  clicheScore = Math.max(clicheScore, 0);

  // Factor 4: Uso de números/grados específicos (ej: "a 15°")
  const hasSpecificDegrees = /\d+°/.test(text);
  const degreeScore = hasSpecificDegrees ? 10 : 0;

  // Factor 5: Menciones de signos zodiacales
  let zodiacScore = 0;
  for (const sign of ZODIAC_KEYWORDS) {
    if (lowerText.includes(sign)) {
      zodiacScore += 2;
    }
  }
  zodiacScore = Math.min(zodiacScore, 10); // Max 10 puntos

  const totalScore = lengthScore + astroScore + clicheScore + degreeScore + zodiacScore;
  return Math.min(totalScore, 100);
}

// =====================================================================
// Validación Principal
// =====================================================================

/**
 * Valida la calidad de un horóscopo generado.
 * Retorna score 0-100 y lista de issues.
 */
export function validateQuality(text: string): QualityValidationResult {
  const issues: QualityIssue[] = [];
  const warnings: string[] = [];

  // 1. Detectar clichés
  const clicheIssues = detectCliches(text);
  issues.push(...clicheIssues);

  // 2. Detectar contenido genérico
  const genericIssues = detectGenericPhrases(text);
  issues.push(...genericIssues);

  // 3. Validar contenido astronómico
  const astroIssues = validateAstronomicalContent(text);
  issues.push(...astroIssues);

  // 4. Calcular score de especificidad
  const specificityScore = calculateSpecificity(text);

  // Generar warnings adicionales
  if (specificityScore < 50) {
    warnings.push("Score de especificidad bajo. Considera agregar más detalles astrológicos.");
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount < 100) {
    warnings.push(`Texto muy corto (${wordCount} palabras). Mínimo recomendado: 150 palabras.`);
  } else if (wordCount > 300) {
    warnings.push(`Texto muy largo (${wordCount} palabras). Máximo recomendado: 250 palabras.`);
  }

  // Determinar validez: no debe tener errores críticos
  const hasErrors = issues.some((issue) => issue.severity === "error");
  const valid = !hasErrors && specificityScore >= 40;

  return {
    valid,
    score: specificityScore,
    issues,
    warnings,
  };
}

// =====================================================================
// Validación de Diversidad entre Variantes
// =====================================================================

/**
 * Calcula similitud entre dos textos usando Jaccard similarity de n-gramas.
 * Retorna valor 0-1 (0 = totalmente diferente, 1 = idéntico).
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Normalizar textos
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\sáéíóúñ]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3); // Ignorar palabras muy cortas

  const words1 = normalize(text1);
  const words2 = normalize(text2);

  // Crear sets de n-gramas (bigrams)
  const createBigrams = (words: string[]): Set<string> => {
    const bigrams = new Set<string>();
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.add(`${words[i]} ${words[i + 1]}`);
    }
    return bigrams;
  };

  const bigrams1 = createBigrams(words1);
  const bigrams2 = createBigrams(words2);

  // Calcular Jaccard similarity
  const intersection = new Set([...bigrams1].filter((x) => bigrams2.has(x)));
  const union = new Set([...bigrams1, ...bigrams2]);

  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

/**
 * Valida que las variantes sean suficientemente diversas entre sí.
 * Threshold: similitud <40% entre cualquier par de variantes.
 */
export function validateVariantDiversity(
  variants: Array<{ variantId: VariantId; text: string }>,
): VariantDiversityResult {
  const pairwiseSimilarities: VariantDiversityResult["pairwiseSimilarities"] = [];

  // Comparar cada par de variantes
  for (let i = 0; i < variants.length; i++) {
    for (let j = i + 1; j < variants.length; j++) {
      const similarity = calculateTextSimilarity(variants[i].text, variants[j].text);

      pairwiseSimilarities.push({
        variant1: variants[i].variantId,
        variant2: variants[j].variantId,
        similarity: Math.round(similarity * 100) / 100,
      });
    }
  }

  // Calcular similitud promedio
  const averageSimilarity =
    pairwiseSimilarities.reduce((sum, pair) => sum + pair.similarity, 0) /
    pairwiseSimilarities.length;

  // Validar: similitud promedio debe ser <0.4 (40%)
  const THRESHOLD = 0.4;
  const valid = averageSimilarity < THRESHOLD;

  // Detectar pares problemáticos
  const problematicPairs = pairwiseSimilarities.filter((pair) => pair.similarity >= THRESHOLD);

  let message = "";
  if (valid) {
    message = `✓ Variantes suficientemente diversas (similitud promedio: ${Math.round(averageSimilarity * 100)}%)`;
  } else {
    message = `✗ Variantes demasiado similares (similitud promedio: ${Math.round(averageSimilarity * 100)}%). Pares problemáticos: ${problematicPairs.map((p) => `${p.variant1}-${p.variant2}`).join(", ")}`;
  }

  return {
    valid,
    pairwiseSimilarities,
    averageSimilarity: Math.round(averageSimilarity * 100) / 100,
    message,
  };
}

/**
 * Valida un conjunto completo de variantes para un signo.
 */
export function validateVariantSet(
  variants: Array<{ variantId: VariantId; summary: string; focus: string; mood: string }>,
): {
  valid: boolean;
  qualityResults: Array<{ variantId: VariantId; result: QualityValidationResult }>;
  diversityResult: VariantDiversityResult;
  overallScore: number;
} {
  // 1. Validar calidad individual
  const qualityResults = variants.map((v) => ({
    variantId: v.variantId,
    result: validateQuality(`${v.summary} ${v.focus} ${v.mood}`),
  }));

  // 2. Validar diversidad
  const diversityResult = validateVariantDiversity(
    variants.map((v) => ({
      variantId: v.variantId,
      text: `${v.summary} ${v.focus}`,
    })),
  );

  // 3. Determinar validez general
  const allQualityValid = qualityResults.every((r) => r.result.valid);
  const valid = allQualityValid && diversityResult.valid;

  // 4. Calcular score general
  const averageQualityScore =
    qualityResults.reduce((sum, r) => sum + r.result.score, 0) / qualityResults.length;
  const diversityScore = (1 - diversityResult.averageSimilarity) * 100;
  const overallScore = Math.round(averageQualityScore * 0.7 + diversityScore * 0.3);

  return {
    valid,
    qualityResults,
    diversityResult,
    overallScore,
  };
}
