/**
 * Configuración central del sistema de compatibilidad.
 * Registro único de dimensiones, contextos y textos base.
 */
import type { CompatibilityContextKey, CompatibilityDimensionKey } from "@/types/compatibility";

export const COMPATIBILITY_DIMENSIONS: readonly {
  key: CompatibilityDimensionKey;
  label: string;
  description: string;
}[] = [
  {
    key: "communication",
    label: "Comunicación",
    description: "Cómo pueden expresar y procesar sus ideas.",
  },
  {
    key: "emotional_rhythm",
    label: "Ritmo emocional",
    description: "Cómo pueden relacionarse con sus necesidades emocionales.",
  },
  {
    key: "daily_life",
    label: "Vida cotidiana",
    description: "Cómo pueden coordinar hábitos, espacios y responsabilidades.",
  },
  {
    key: "attraction",
    label: "Atracción",
    description: "Cómo puede manifestarse el interés y la conexión.",
  },
  {
    key: "conflict_management",
    label: "Manejo de diferencias",
    description: "Cómo pueden reaccionar ante desacuerdos.",
  },
  {
    key: "growth",
    label: "Crecimiento",
    description: "Qué pueden aprender al relacionarse.",
  },
];

export const COMPATIBILITY_CONTEXTS: readonly {
  key: CompatibilityContextKey;
  label: string;
}[] = [
  { key: "romantic", label: "En una relación" },
  { key: "friendship", label: "En la amistad" },
  { key: "collaboration", label: "En la colaboración" },
];

export const COMPATIBILITY_COPY = {
  hubEyebrow: "Dos formas de mirar el mundo",
  hubTitle: "Explora la dinámica entre dos signos",
  hubDescription:
    "Esta lectura no decide si una relación funcionará. Te ayuda a observar diferencias, coincidencias y formas posibles de comunicación.",
  selector: {
    firstLabel: "Primer signo",
    secondLabel: "Segundo signo",
    submitLabel: "Ver compatibilidad",
    firstPlaceholder: "Selecciona un signo",
    secondPlaceholder: "Selecciona otro signo",
  },
  disclaimer:
    "Esta lectura es simbólica y general. No evalúa una relación real ni sustituye comunicación, criterio personal o ayuda profesional.",
  ratingScale:
    "Los indicadores son una síntesis editorial simbólica. No son una medición científica ni predicen el resultado de una relación.",
  interpretationGuide: {
    title: "Cómo leer una compatibilidad",
    points: [
      "Los signos representan tendencias simbólicas generales.",
      "Una puntuación no reemplaza la comunicación real.",
      "Los retos no significan incompatibilidad.",
      "La conducta y las decisiones importan más que una etiqueta.",
    ],
  },
  empty: {
    title: "Esta combinación está en preparación",
    description:
      "Todavía no hemos publicado una interpretación editorial completa para estos dos signos.",
    primaryLabel: "Probar otra combinación",
    secondaryLabel: "Explorar guías",
  },
} as const;
