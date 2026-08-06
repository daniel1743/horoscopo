/**
 * Sistema de estrategias de variantes para horóscopos.
 * Cada variante tiene un enfoque único para personalización de contenido.
 */

import { VARIANT_CONFIGS } from "@/types/horoscope-automation";
import type { VariantId, VariantStrategy, VariantConfig } from "@/types/horoscope-automation";

// Re-export para acceso directo
export { VARIANT_CONFIGS } from "@/types/horoscope-automation";
export type { VariantId, VariantStrategy, VariantConfig } from "@/types/horoscope-automation";

/**
 * Modificadores de prompt según estrategia de variante.
 * Estos textos se inyectan en el prompt para guiar el tono de la IA.
 */
export const VARIANT_PROMPT_MODIFIERS: Record<VariantId, string> = {
  1: `ENFOQUE PRÁCTICO: Centra tu lectura en acciones concretas y decisiones tangibles.
Prioriza trabajo, productividad, metas y pasos específicos que el signo puede tomar HOY.
Usa verbos de acción: actuar, lograr, construir, decidir, planificar.
Ejemplo: "Es momento de actuar sobre ese proyecto que has pospuesto. Los tránsitos favorecen iniciativas concretas."`,

  2: `ENFOQUE EMOCIONAL/RELACIONAL: Centra tu lectura en relaciones, sentimientos y conexiones humanas.
Prioriza amor, vínculos afectivos, comunicación emocional y dinámicas relacionales.
Usa verbos emocionales: sentir, conectar, abrirse, compartir, escuchar, expresar.
Ejemplo: "Tus relaciones piden mayor vulnerabilidad. Los aspectos lunares invitan a compartir lo que sientes."`,

  3: `ENFOQUE REFLEXIVO/CRECIMIENTO: Centra tu lectura en autoconocimiento, aprendizaje y evolución personal.
Prioriza introspección, patrones internos, lecciones de vida y transformación consciente.
Usa verbos reflexivos: reflexionar, comprender, observar, integrar, crecer, transformar.
Ejemplo: "Observa qué patrones se repiten en tu vida. Esta configuración planetaria te ayuda a comprenderlos."`,

  4: `ENFOQUE INTUITIVO/ESPIRITUAL: Centra tu lectura en sincronicidad, símbolos y guía interior.
Prioriza intuición, señales del universo, espiritualidad práctica y flujo natural.
Usa verbos intuitivos: percibir, fluir, confiar, sintonizar, permitir, recibir.
Ejemplo: "Presta atención a las sincronicidades que aparezcan. Tu intuición está particularmente aguda."`,
};

/**
 * Seeds adicionales para cada variante (aumenta diversidad en output de IA).
 * Aunque usamos temperature 0.7, estos seeds ayudan a guiar el enfoque.
 */
export const VARIANT_SEEDS: Record<VariantId, number> = {
  1: 1001, // Práctico
  2: 2002, // Emocional
  3: 3003, // Reflexivo
  4: 4004, // Intuitivo
};

/**
 * Palabras clave prioritarias por variante.
 * Se inyectan en el prompt para reforzar el enfoque temático.
 */
export const VARIANT_KEYWORDS: Record<VariantId, string[]> = {
  1: ["acción", "resultados", "metas", "decisiones", "productividad", "plan", "estrategia"],
  2: ["relaciones", "emociones", "conexión", "amor", "vínculos", "comunicación", "intimidad"],
  3: ["crecimiento", "aprendizaje", "consciencia", "patrones", "transformación", "introspección"],
  4: ["intuición", "sincronicidad", "guía interior", "espiritualidad", "símbolos", "flujo"],
};

/**
 * Obtiene el modificador de prompt para una variante específica.
 */
export function getVariantPromptModifier(variantId: VariantId): string {
  return VARIANT_PROMPT_MODIFIERS[variantId];
}

/**
 * Obtiene el seed para una variante específica.
 */
export function getVariantSeed(variantId: VariantId): number {
  return VARIANT_SEEDS[variantId];
}

/**
 * Obtiene palabras clave prioritarias para una variante.
 */
export function getVariantKeywords(variantId: VariantId): string[] {
  return VARIANT_KEYWORDS[variantId];
}

/**
 * Construye el texto completo de instrucción de variante para el prompt.
 */
export function buildVariantInstruction(variantId: VariantId): string {
  const config = VARIANT_CONFIGS[variantId];
  const modifier = VARIANT_PROMPT_MODIFIERS[variantId];
  const keywords = VARIANT_KEYWORDS[variantId].join(", ");

  return `
═══════════════════════════════════════════════════════════════
VARIANTE #${variantId}: ${config.label.toUpperCase()}
${config.description}
═══════════════════════════════════════════════════════════════

${modifier}

PALABRAS CLAVE A PRIORIZAR: ${keywords}

ÁREAS DE ENFOQUE: ${config.focusAreas.join(", ")}

IMPORTANTE: Mantén este enfoque de forma consistente pero natural en todo el horóscopo.
No menciones explícitamente que es una "variante ${variantId}" - simplemente aplica el enfoque.
═══════════════════════════════════════════════════════════════
`;
}

/**
 * Valida que un texto generado cumple con la estrategia de variante esperada.
 * Retorna score 0-100 indicando qué tan bien se alinea con la variante.
 */
export function validateVariantAlignment(text: string, variantId: VariantId): {
  score: number;
  aligned: boolean;
  details: string;
} {
  const keywords = VARIANT_KEYWORDS[variantId];
  const lowerText = text.toLowerCase();

  // Contar cuántas keywords aparecen
  let keywordMatches = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      keywordMatches++;
      matchedKeywords.push(keyword);
    }
  }

  // Calcular score (mínimo 2 keywords de 7 = ~30%)
  const keywordScore = (keywordMatches / keywords.length) * 100;

  // Validar tono según variante
  let toneScore = 50; // Base

  const config = VARIANT_CONFIGS[variantId];
  let toneMatches = 0;
  for (const toneKeyword of config.toneKeywords) {
    if (lowerText.includes(toneKeyword.toLowerCase())) {
      toneMatches++;
    }
  }
  toneScore = (toneMatches / config.toneKeywords.length) * 100;

  // Score final: promedio ponderado
  const finalScore = Math.round(keywordScore * 0.6 + toneScore * 0.4);

  const aligned = finalScore >= 40; // Threshold: al menos 40% alineación

  const details = aligned
    ? `Alineación correcta con variante ${variantId} (${config.label}). Keywords encontradas: ${matchedKeywords.join(", ")}.`
    : `Baja alineación con variante ${variantId}. Solo ${keywordMatches}/${keywords.length} keywords encontradas.`;

  return {
    score: finalScore,
    aligned,
    details,
  };
}

/**
 * Asigna variante de forma determinística basada en hash.
 * Usado para visitantes en localStorage.
 */
export function assignVariantByHash(userId: string, signSlug: string, dateFor: string): VariantId {
  const input = `${userId}-${signSlug}-${dateFor}`;

  // Simple hash function (no cryptográfico, solo para distribución)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Modulo 4 para obtener 0-3, luego +1 para 1-4
  const variantId = (Math.abs(hash) % 4) + 1;

  return variantId as VariantId;
}

/**
 * Genera una distribución aleatoria pero balanceada de variantes.
 * Útil para testing o cuando se quiere asegurar distribución uniforme.
 */
export function generateBalancedVariantDistribution(count: number): VariantId[] {
  const variants: VariantId[] = [1, 2, 3, 4];
  const result: VariantId[] = [];

  // Llenar con ciclos completos
  const fullCycles = Math.floor(count / 4);
  for (let i = 0; i < fullCycles; i++) {
    result.push(...variants);
  }

  // Agregar resto aleatorio
  const remainder = count % 4;
  const shuffled = [...variants].sort(() => Math.random() - 0.5);
  result.push(...shuffled.slice(0, remainder));

  // Shuffle final
  return result.sort(() => Math.random() - 0.5);
}

/**
 * Helpers para UI (opcional, para mostrar badges de variante)
 */
export const VARIANT_UI_COLORS: Record<VariantId, string> = {
  1: "bg-amber-100 text-amber-800 border-amber-200", // Práctico
  2: "bg-rose-100 text-rose-800 border-rose-200", // Emocional
  3: "bg-purple-100 text-purple-800 border-purple-200", // Reflexivo
  4: "bg-sky-100 text-sky-800 border-sky-200", // Intuitivo
};

export const VARIANT_UI_ICONS: Record<VariantId, string> = {
  1: "⚡", // Práctico
  2: "❤️", // Emocional
  3: "🌱", // Reflexivo
  4: "✨", // Intuitivo
};

/**
 * Obtiene un label corto para mostrar en UI.
 */
export function getVariantUILabel(variantId: VariantId): string {
  const icon = VARIANT_UI_ICONS[variantId];
  const label = VARIANT_CONFIGS[variantId].label;
  return `${icon} ${label}`;
}
