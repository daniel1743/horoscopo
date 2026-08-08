import { zodiacSigns, getZodiacBySlug } from "@/data/zodiac-signs";
import { createPairKey, normalizeSignPair } from "@/lib/compatibility/normalize-sign-pair";
import type {
  CompatibilityDimensionKey,
  CompatibilityPairKey,
  CompatibilityProfile,
  ZodiacSignKey,
} from "@/types/compatibility";

const elementTone = {
  fuego: "acción, deseo y movimiento",
  tierra: "presencia, constancia y realidad cotidiana",
  aire: "ideas, conversación y perspectiva",
  agua: "sensibilidad, cuidado e intuición",
} as const;

const dimensionKeys: CompatibilityDimensionKey[] = [
  "communication",
  "emotional_rhythm",
  "daily_life",
  "attraction",
  "conflict_management",
  "growth",
];

export function buildFallbackCompatibilityProfile(
  signOne: unknown,
  signTwo: unknown,
): CompatibilityProfile {
  const normalized = normalizeSignPair(signOne, signTwo);
  const signA = getZodiacBySlug(normalized.sign_a);
  const signB = getZodiacBySlug(normalized.sign_b);

  if (!signA || !signB) {
    throw new Error("Zodiac metadata missing");
  }

  const sameSign = signA.slug === signB.slug;
  const sameElement = signA.element === signB.element;
  const sameModality = signA.modality === signB.modality;
  const baseRating = sameSign || sameElement ? 4 : sameModality ? 3 : 3;

  return {
    id: `fallback-${normalized.pair_key}`,
    pairKey: normalized.pair_key,
    signA: normalized.sign_a,
    signB: normalized.sign_b,
    title: sameSign
      ? `${signA.name} y ${signB.name}: espejo de ${signA.keyword.toLowerCase()}`
      : `${signA.name} y ${signB.name}: ${signA.keyword.toLowerCase()} y ${signB.keyword.toLowerCase()}`,
    summary: sameSign
      ? `Dos energías de ${signA.name} pueden reconocerse rápido: comparten ritmo, deseo y una forma similar de reaccionar.`
      : `${signA.name} aporta ${elementTone[signA.element]}; ${signB.name} responde desde ${elementTone[signB.element]}. La clave está en traducir sus ritmos sin imponerlos.`,
    dynamicLabel: sameElement
      ? "Afinidad elemental"
      : sameModality
        ? "Ritmos parecidos"
        : "Complemento por contraste",
    relationshipDynamic: sameSign
      ? `Esta combinación funciona como un espejo. Hay comprensión inmediata, pero también tendencia a repetir las mismas respuestas. Si ambos cuidan la escucha, la relación gana claridad sin perder intensidad.`
      : `La dinámica entre ${signA.name} y ${signB.name} mezcla ${signA.keyword.toLowerCase()} con ${signB.keyword.toLowerCase()}. Puede sentirse natural cuando cada uno reconoce el lenguaje del otro y evita convertir la diferencia en una prueba de poder.`,
    dimensions: Object.fromEntries(
      dimensionKeys.map((key, index) => [
        key,
        {
          rating: Math.max(2, Math.min(5, baseRating + ((index % 3) - 1))) as 1 | 2 | 3 | 4 | 5,
          interpretation:
            key === "communication"
              ? `La conversación mejora cuando ${signA.name} y ${signB.name} nombran lo que necesitan sin asumir que el otro lo adivina.`
              : `Este punto pide equilibrio entre la energía de ${signA.name} y la forma de responder de ${signB.name}.`,
        },
      ]),
    ),
    strengths: [
      sameElement
        ? `Comparten una base elemental de ${signA.element}, lo que facilita entender prioridades.`
        : `La diferencia elemental puede ampliar la mirada de ambos.`,
      `${signA.name} aporta ${signA.keyword.toLowerCase()} y ${signB.name} aporta ${signB.keyword.toLowerCase()}.`,
      "La relación puede crecer cuando hay acuerdos explícitos y espacio para matices.",
    ],
    challenges: [
      sameModality
        ? "Pueden chocar si ambos intentan marcar el ritmo al mismo tiempo."
        : "Pueden interpretar la diferencia como distancia si no conversan a tiempo.",
      "Conviene evitar etiquetas rápidas y observar la conducta real.",
      "La compatibilidad simbólica no reemplaza acuerdos, límites ni cuidado cotidiano.",
    ],
    communicationTips: [
      "Hablen de expectativas concretas antes de sacar conclusiones.",
      "Usen preguntas directas cuando algo se sienta confuso.",
      "Revisen acuerdos después de un conflicto, no solo durante la tensión.",
    ],
    contexts: {
      romantic: `En el amor, ${signA.name} y ${signB.name} necesitan combinar deseo con presencia real.`,
      friendship:
        "En amistad, la relación fluye mejor cuando hay honestidad y libertad para cambiar de ritmo.",
      collaboration:
        "Trabajando juntos, conviene definir roles, tiempos y decisiones desde el comienzo.",
    },
    reflectionQuestions: [
      "¿Qué necesita cada persona para sentirse escuchada?",
      "¿Qué diferencia puede volverse una fortaleza si se conversa mejor?",
      "¿Qué acuerdo pequeño haría más liviana la relación esta semana?",
    ],
    misconceptions: [
      "Una diferencia de signos no significa incompatibilidad.",
      "Una alta afinidad simbólica no garantiza una relación sana.",
    ],
    disclaimerKey: "compatibility_general",
    status: "published",
    isDemo: true,
    seoTitle: `Compatibilidad ${signA.name} y ${signB.name} | Creovision`,
    seoDescription: `Explora la compatibilidad simbólica entre ${signA.name} y ${signB.name}: comunicación, atracción, desafíos y consejos.`,
    publishedAt: null,
  };
}

export function buildFeaturedFallbackCompatibilityProfiles(limit = 6): CompatibilityProfile[] {
  const preferredPairs: [ZodiacSignKey, ZodiacSignKey][] = [
    ["aries", "libra"],
    ["tauro", "escorpio"],
    ["geminis", "sagitario"],
    ["cancer", "capricornio"],
    ["leo", "acuario"],
    ["virgo", "piscis"],
  ];

  return preferredPairs.slice(0, limit).map(([a, b]) => buildFallbackCompatibilityProfile(a, b));
}

export function buildAllFallbackPairKeys(): CompatibilityPairKey[] {
  const keys: CompatibilityPairKey[] = [];
  for (let i = 0; i < zodiacSigns.length; i += 1) {
    for (let j = i; j < zodiacSigns.length; j += 1) {
      keys.push(createPairKey(zodiacSigns[i].slug, zodiacSigns[j].slug) as CompatibilityPairKey);
    }
  }
  return keys;
}
