import { getZodiacBySlug, zodiacSigns } from "@/data/zodiac-signs";
import { createPairKey, normalizeSignPair } from "@/lib/compatibility/normalize-sign-pair";
import type { CompatibilityProfile, ZodiacSignKey } from "@/types/compatibility";

const ELEMENT_RELATION: Record<string, string> = {
  "fuego-aire": "El fuego aporta impulso y el aire abre nuevas perspectivas.",
  "aire-fuego": "El aire abre nuevas perspectivas y el fuego aporta impulso.",
  "tierra-agua": "La tierra ofrece estabilidad y el agua aporta sensibilidad.",
  "agua-tierra": "El agua aporta sensibilidad y la tierra ofrece estabilidad.",
  "fuego-fuego": "La energía compartida puede encender proyectos y conversaciones intensas.",
  "aire-aire": "La curiosidad compartida puede alimentar ideas y movimiento.",
  "tierra-tierra": "El sentido práctico compartido puede sostener acuerdos duraderos.",
  "agua-agua": "La sensibilidad compartida puede crear profundidad y cuidado.",
};

const FALLBACK_PAIRS: readonly [ZodiacSignKey, ZodiacSignKey][] = [
  ["aries", "leo"],
  ["aries", "libra"],
  ["tauro", "cancer"],
  ["geminis", "libra"],
  ["escorpio", "piscis"],
  ["sagitario", "acuario"],
];

export function getFallbackFeaturedPairs(): readonly [ZodiacSignKey, ZodiacSignKey][] {
  return FALLBACK_PAIRS;
}

export function getFallbackPairsForSign(
  signKey: ZodiacSignKey,
  limit = 4,
): readonly [ZodiacSignKey, ZodiacSignKey][] {
  const signIndex = zodiacSigns.findIndex((sign) => sign.slug === signKey);
  if (signIndex < 0) return [];

  const pairs: [ZodiacSignKey, ZodiacSignKey][] = [];
  const seen = new Set<string>();
  for (let offset = 1; offset < zodiacSigns.length && pairs.length < limit; offset += 1) {
    const other = zodiacSigns[(signIndex + offset) % zodiacSigns.length].slug as ZodiacSignKey;
    const normalized = normalizeSignPair(signKey, other);
    if (seen.has(normalized.pair_key)) continue;
    seen.add(normalized.pair_key);
    pairs.push([normalized.sign_a, normalized.sign_b]);
  }
  return pairs;
}

export function createCompatibilityFallback(
  signOne: ZodiacSignKey,
  signTwo: ZodiacSignKey,
): CompatibilityProfile {
  const a = getZodiacBySlug(signOne);
  const b = getZodiacBySlug(signTwo);
  if (!a || !b) throw new Error("Zodiac metadata missing");

  const pairKey = createPairKey(signOne, signTwo);
  const sameElement = a.element === b.element;
  const sameModality = a.modality === b.modality;
  const relationship =
    ELEMENT_RELATION[`${a.element}-${b.element}`] ??
    "La diferencia de elementos puede abrir una conversación rica sobre ritmos y necesidades.";

  const rating = (base: number): 1 | 2 | 3 | 4 | 5 =>
    Math.max(1, Math.min(5, base + (sameElement ? 1 : 0))) as 1 | 2 | 3 | 4 | 5;

  return {
    id: `fallback-${pairKey}`,
    pairKey,
    signA: signOne,
    signB: signTwo,
    title: `${a.name} y ${b.name}: una dinámica para observar`,
    summary: `Una lectura simbólica para explorar cómo ${a.name} y ${b.name} pueden encontrarse, negociar sus ritmos y cuidar su forma de comunicarse.`,
    dynamicLabel: `${a.symbol} ${a.name} · ${b.symbol} ${b.name}`,
    relationshipDynamic: `${relationship} ${a.name} se mueve desde la ${a.keyword.toLowerCase()}, mientras ${b.name} expresa su energía desde la ${b.keyword.toLowerCase()}. La clave no es predecir el resultado, sino observar qué acuerdos les permiten relacionarse con más claridad.`,
    dimensions: {
      communication: {
        rating: rating(sameModality ? 4 : 3),
        interpretation: sameModality
          ? "Comparten un ritmo de iniciativa que puede facilitar los acuerdos; conviene dejar espacio para que ambas voces aparezcan."
          : "Sus ritmos pueden ser distintos; nombrar expectativas antes de actuar ayuda a reducir malentendidos.",
      },
      emotional_rhythm: {
        rating: rating(a.element === b.element ? 4 : 3),
        interpretation:
          "La forma de procesar lo que sienten puede diferir. Escuchar antes de resolver permite que la conexión no se convierta en presión.",
      },
      daily_life: {
        rating: rating(sameElement ? 4 : 3),
        interpretation:
          "La convivencia mejora cuando convierten sus preferencias en acuerdos concretos sobre tiempo, tareas y espacio personal.",
      },
      attraction: {
        rating: rating(3),
        interpretation:
          "La curiosidad puede crecer cuando cada persona conserva su individualidad y evita convertir la diferencia en un examen.",
      },
      conflict_management: {
        rating: rating(sameModality ? 3 : 4),
        interpretation:
          "Los desacuerdos pueden volverse productivos si se habla de necesidades observables en lugar de etiquetar la personalidad del otro.",
      },
      growth: {
        rating: rating(4),
        interpretation:
          "La relación puede abrir una oportunidad de aprendizaje sobre flexibilidad, límites y formas distintas de tomar decisiones.",
      },
    },
    strengths: [
      `Pueden aprender de la manera en que ${a.name} y ${b.name} miran una situación desde ángulos distintos.`,
      "La curiosidad y la conversación pueden convertirse en un punto de encuentro.",
      "Cuando hay acuerdos claros, la diferencia puede complementar en lugar de separar.",
    ],
    challenges: [
      "Evitar asumir que la otra persona necesita lo mismo para sentirse cuidada.",
      "No convertir una diferencia de ritmo en una crítica personal.",
      "Revisar los acuerdos cuando cambian las circunstancias.",
    ],
    communicationTips: [
      "Pregunten qué necesita cada persona antes de proponer una solución.",
      "Acuerden una pausa cuando la conversación se vuelva reactiva.",
      "Reconozcan los avances concretos, no solo los resultados finales.",
    ],
    contexts: {
      romantic:
        "En una relación, la claridad sobre tiempos, expectativas y límites puede cuidar la conexión.",
      friendship:
        "En la amistad, compartir intereses sin exigir disponibilidad constante ayuda a sostener el vínculo.",
      collaboration:
        "En la colaboración, repartir responsabilidades y definir cómo decidir evita fricciones innecesarias.",
    },
    reflectionQuestions: [
      "¿Qué diferencia entre ustedes podría convertirse en una fortaleza si la escuchan con curiosidad?",
      "¿Qué acuerdo concreto haría más fácil la comunicación esta semana?",
      "¿Dónde necesitan más libertad y dónde necesitan más claridad?",
    ],
    misconceptions: [
      "La combinación no determina si una relación funcionará.",
      "Un reto simbólico no equivale a incompatibilidad.",
      "La lectura no sustituye la comunicación, el consentimiento ni el criterio personal.",
    ],
    disclaimerKey: "general-symbolic",
    status: "published",
    isDemo: true,
    isFallback: true,
    seoTitle: `${a.name} y ${b.name}: compatibilidad simbólica | Creovision`,
    seoDescription: `Explora la dinámica simbólica entre ${a.name} y ${b.name}, con comunicación, ritmo emocional y áreas de crecimiento.`,
    publishedAt: null,
  };
}
