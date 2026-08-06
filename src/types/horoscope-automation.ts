/**
 * Tipos del sistema de automatización de horóscopos.
 * Soporta generación batch, variantes múltiples, y asignación personalizada.
 */

import type { HoroscopeEntry, HoroscopePeriod } from "./horoscope";

// =====================================================================
// Tipos de Variantes
// =====================================================================

/** ID de variante (1-4) para personalización de horóscopos */
export type VariantId = 1 | 2 | 3 | 4;

/** Estrategia de variación aplicada a cada variante */
export type VariantStrategy = "practical" | "emotional" | "reflective" | "intuitive";

/** Configuración de una variante específica */
export interface VariantConfig {
  id: VariantId;
  strategy: VariantStrategy;
  label: string;
  description: string;
  focusAreas: string[];
  toneKeywords: string[];
}

/** Mapa de estrategias a configuraciones de variante */
export const VARIANT_CONFIGS: Record<VariantId, VariantConfig> = {
  1: {
    id: 1,
    strategy: "practical",
    label: "Práctico",
    description: "Enfoque en acciones concretas y resultados tangibles",
    focusAreas: ["trabajo", "productividad", "metas", "decisiones"],
    toneKeywords: ["actuar", "lograr", "construir", "planificar"],
  },
  2: {
    id: 2,
    strategy: "emotional",
    label: "Emocional",
    description: "Enfoque en relaciones, sentimientos y conexiones",
    focusAreas: ["amor", "relaciones", "emociones", "vínculos"],
    toneKeywords: ["sentir", "conectar", "abrirse", "compartir"],
  },
  3: {
    id: 3,
    strategy: "reflective",
    label: "Reflexivo",
    description: "Enfoque en crecimiento personal y autoconocimiento",
    focusAreas: ["introspección", "aprendizaje", "evolución", "consciencia"],
    toneKeywords: ["reflexionar", "comprender", "crecer", "transformar"],
  },
  4: {
    id: 4,
    strategy: "intuitive",
    label: "Intuitivo",
    description: "Enfoque en espiritualidad, sincronicidad y guía interior",
    focusAreas: ["intuición", "sincronicidad", "espiritualidad", "símbolos"],
    toneKeywords: ["percibir", "fluir", "confiar", "sintonizar"],
  },
};

// =====================================================================
// Tipos de Asignación de Variantes
// =====================================================================

/** Asignación de variante para un usuario autenticado */
export interface UserHoroscopeAssignment {
  id: string;
  userId: string;
  signSlug: string;
  period: HoroscopePeriod;
  dateFor: string;
  variantId: VariantId;
  assignedAt: string;
}

/** Asignación de variante para visitante (localStorage) */
export interface VisitorHoroscopeAssignment {
  sessionId: string;
  signSlug: string;
  period: HoroscopePeriod;
  dateFor: string;
  variantId: VariantId;
  assignedAt: string;
}

/** Storage de asignaciones para visitantes */
export interface VisitorAssignmentStorage {
  sessionId: string;
  createdAt: string;
  assignments: Record<string, VariantId>; // key: "sign-period-date" => variantId
}

// =====================================================================
// Tipos de Generación Batch
// =====================================================================

/** Configuración de generación batch */
export interface GenerationBatchConfig {
  period: HoroscopePeriod;
  dateFor: string;
  signs: string[]; // Array de signSlugs, default todos los 12
  variants: VariantId[]; // Array de variantes a generar, default [1,2,3,4]
  forceRegenerate?: boolean; // Si true, regenera aunque ya existan
  maxRetries?: number; // Max intentos por horóscopo, default 2
  batchId?: string; // ID único del batch, auto-generado si no se provee
}

/** Resultado de generación de un horóscopo individual */
export interface SingleGenerationResult {
  signSlug: string;
  variantId: VariantId;
  success: boolean;
  horoscopeId?: string;
  error?: string;
  retries: number;
  durationMs: number;
  tokensUsed?: {
    input: number;
    output: number;
  };
  qualityScore?: number;
}

/** Resultado de generación batch completa */
export interface BatchGenerationResult {
  batchId: string;
  period: HoroscopePeriod;
  dateFor: string;
  startedAt: string;
  completedAt: string;
  totalRequested: number;
  totalGenerated: number;
  totalFailed: number;
  results: SingleGenerationResult[];
  stats: {
    durationMs: number;
    averageQualityScore?: number;
    totalTokensUsed?: {
      input: number;
      output: number;
    };
    successRate: number;
  };
  errors?: string[];
}

/** Status de generación batch (almacenado en DB) */
export type GenerationStatus = "running" | "completed" | "partial" | "failed" | "cancelled";

/** Log de generación batch (tabla horoscope_generation_logs) */
export interface HoroscopeGenerationLog {
  id: string;
  batchId: string;
  period: HoroscopePeriod;
  dateFor: string;
  signsRequested: number;
  variantsPerSign: number;
  totalRequested: number;
  totalGenerated: number;
  totalFailed: number;
  startedAt: string;
  completedAt: string | null;
  status: GenerationStatus;
  errorDetails?: Record<string, unknown>;
  generationStats?: {
    durationSeconds: number;
    successRate: number;
    tokensUsed?: {
      input: number;
      output: number;
    };
    averageQualityScore?: number;
  };
  createdAt: string;
}

// =====================================================================
// Tipos de Contexto Astronómico
// =====================================================================

/** Posición de un planeta en un momento dado */
export interface PlanetaryPosition {
  planet: string;
  sign: string;
  degrees: number;
  retrograde: boolean;
}

/** Aspecto entre dos planetas */
export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspectType: "conjunction" | "opposition" | "trine" | "square" | "sextile";
  angleDegrees: number;
  orb: number;
  strength: number; // 1-5
  nature: "harmonious" | "challenging" | "neutral";
}

/** Contexto astronómico completo para una fecha */
export interface AstronomicalContext {
  date: string;
  positions: PlanetaryPosition[];
  majorAspects: PlanetaryAspect[];
  moonPhase: {
    name: string;
    illumination: number;
    dayOfCycle: number;
  };
  summary: string; // Resumen para incluir en prompt
}

// =====================================================================
// Tipos de Validación de Calidad
// =====================================================================

/** Resultado de validación anti-genérico */
export interface QualityValidationResult {
  valid: boolean;
  score: number; // 0-100
  issues: QualityIssue[];
  warnings: string[];
}

/** Issue detectado en validación de calidad */
export interface QualityIssue {
  type: "cliche_detected" | "no_planetary_mention" | "too_generic" | "low_specificity";
  severity: "error" | "warning";
  message: string;
  location?: string; // Qué parte del horóscopo
}

/** Resultado de validación de diversidad entre variantes */
export interface VariantDiversityResult {
  valid: boolean;
  pairwiseSimilarities: Array<{
    variant1: VariantId;
    variant2: VariantId;
    similarity: number; // 0-1
  }>;
  averageSimilarity: number;
  message: string;
}

// =====================================================================
// Tipos de Proveedor IA (DeepSeek específico)
// =====================================================================

/** Configuración de generación para DeepSeek */
export interface DeepSeekGenerationConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/** Metadata de generación para almacenar en generation_metadata */
export interface GenerationMetadata {
  providerId: "deepseek" | "lovable" | "claude";
  modelId: string;
  variantStrategy: VariantStrategy;
  promptVersion: string;
  temperature: number;
  tokensUsed?: {
    input: number;
    output: number;
  };
  qualityScore?: number;
  retries: number;
  generatedAt: string;
  astronomicalContext?: {
    mainTransits: string[];
    moonPhase: string;
  };
}

// =====================================================================
// Tipos Extendidos de HoroscopeEntry
// =====================================================================

/** HoroscopeEntry con información de variante */
export interface HoroscopeEntryWithVariant extends HoroscopeEntry {
  variantId: VariantId;
  generationMetadata?: GenerationMetadata;
}

// =====================================================================
// Helpers de Tipos
// =====================================================================

/** Genera key única para asignación de variante */
export const makeAssignmentKey = (
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string,
): string => `${signSlug}-${period}-${dateFor}`;

/** Valida si un número es un VariantId válido */
export const isValidVariantId = (id: unknown): id is VariantId => {
  return typeof id === "number" && id >= 1 && id <= 4;
};

/** Obtiene configuración de variante por ID */
export const getVariantConfig = (id: VariantId): VariantConfig => {
  return VARIANT_CONFIGS[id];
};

/** Obtiene todas las variantes disponibles */
export const getAllVariantIds = (): VariantId[] => {
  return [1, 2, 3, 4];
};
