/**
 * FASE L: Seguridad y Privacidad
 *
 * Detecta y bloquea preguntas sobre temas sensibles. El endpoint debe cortar
 * el flujo antes de construir prompts o llamar a IA.
 */

export interface SafetyCheckResult {
  isSafe: boolean;
  category?:
    | "mental_health"
    | "self_harm"
    | "violence"
    | "abuse"
    | "emergency"
    | "medical"
    | "legal"
    | "financial"
    | "high_risk";
  message?: string;
  referralUrl?: string;
}

const SAFETY_KEYWORDS = {
  mental_health: [
    "suicidio",
    "suicida",
    "suicidas",
    "suicidarme",
    "pensamientos suicidas",
    "matarme",
    "depresión profunda",
    "ansiedad extrema",
    "crisis",
    "ataque de pánico",
    "automutilación",
    "cortarme",
    "quiero desaparecer",
    "no quiero vivir",
  ],
  self_harm: ["autolesión", "cortarme", "hacerme daño", "quiero lastimar", "causar daño"],
  violence: [
    "matar",
    "asesinar",
    "atacar",
    "violencia",
    "pelear",
    "golpear",
    "arma",
    "cuchillo",
    "pistola",
  ],
  abuse: [
    "abuso",
    "maltrato",
    "violación",
    "acoso",
    "explotación",
    "manipulación",
    "he sido abusado",
    "me maltrata",
  ],
  emergency: [
    "emergencia",
    "urgencia",
    "ahora",
    "está muriéndose",
    "sangra",
    "inconsciente",
    "accidente",
    "intoxicación",
  ],
  medical: [
    "diagnóstico",
    "enfermedad",
    "síntomas",
    "tratamiento",
    "medicamento",
    "medicina",
    "cáncer",
    "diabetes",
    "infarto",
    "dolencia",
    "cirugía",
    "operación",
    "¿me voy a morir?",
    "¿tengo cáncer?",
  ],
  legal: [
    "abogado",
    "demanda",
    "juicio",
    "culpable",
    "inocente",
    "cárcel",
    "sentencia",
    "divorcio",
    "herencia",
    "contrato",
    "deuda",
    "embargo",
  ],
  financial: [
    "inversión",
    "bolsa",
    "acciones",
    "criptomonedas",
    "bitcoin",
    "dinero",
    "préstamo",
    "deuda",
    "bancarrota",
    "¿me enriquezco?",
    "¿pierdo dinero?",
  ],
  high_risk: [
    "abandonar tratamiento",
    "dejar medicinas",
    "confiar más en tarot que en médico",
    "tarot en lugar de",
  ],
} as const;

const PROFESSIONAL_RESPONSES: Record<
  Exclude<SafetyCheckResult["category"], undefined>,
  { message: string; referralUrl?: string }
> = {
  mental_health: {
    message:
      "No puedo ofrecer una interpretación de Tarot ante una crisis emocional o pensamientos de autolesión. Si hay riesgo inmediato, contacta ahora con los servicios de emergencia locales o con una línea de crisis de tu país. Si puedes, busca también a una persona de confianza que pueda acompañarte.",
  },
  self_harm: {
    message:
      "No puedo interpretar Tarot ante señales de autolesión. Busca ayuda inmediata con servicios de emergencia locales, una línea de crisis de tu país o una persona de confianza que pueda acompañarte ahora.",
  },
  violence: {
    message:
      "No puedo ayudar con una situación de violencia mediante Tarot. Prioriza la seguridad física y contacta con servicios de emergencia locales o autoridades competentes de tu zona.",
  },
  abuse: {
    message:
      "No puedo reemplazar apoyo profesional ante abuso o maltrato. Busca ayuda con servicios locales especializados, autoridades competentes o una persona segura de confianza.",
  },
  emergency: {
    message:
      "No puedo interpretar Tarot ante una emergencia. Contacta de inmediato con los servicios de emergencia locales o acude al centro de urgencia más cercano.",
  },
  medical: {
    message:
      "No puedo responder preguntas médicas mediante Tarot. Consulta con un profesional de salud o un servicio de urgencia si hay riesgo inmediato.",
  },
  legal: {
    message:
      "No puedo dar orientación legal mediante Tarot. Consulta con un abogado o servicio legal autorizado en tu jurisdicción.",
  },
  financial: {
    message:
      "No puedo dar recomendaciones financieras mediante Tarot. Consulta con un asesor financiero autorizado antes de tomar decisiones de inversión o deuda.",
  },
  high_risk: {
    message:
      "No puedo sustituir atención profesional con Tarot. Antes de abandonar tratamientos, procesos legales o decisiones financieras críticas, consulta con el profesional correspondiente.",
  },
};

function normalizeForSafety(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function checkSafety(userQuestion: string): SafetyCheckResult {
  if (!userQuestion || userQuestion.trim().length === 0) {
    return { isSafe: true };
  }

  const normalizedQuestion = normalizeForSafety(userQuestion);

  for (const [category, keywords] of Object.entries(SAFETY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedQuestion.includes(normalizeForSafety(keyword))) {
        const categoryKey = category as Exclude<SafetyCheckResult["category"], undefined>;
        const response = PROFESSIONAL_RESPONSES[categoryKey];

        return {
          isSafe: false,
          category: categoryKey,
          message: response.message,
          referralUrl: response.referralUrl,
        };
      }
    }
  }

  return { isSafe: true };
}

export function buildSafetyResponse(check: SafetyCheckResult): {
  error: boolean;
  message: string;
  referralUrl?: string;
} | null {
  if (check.isSafe) {
    return null;
  }

  return {
    error: true,
    message:
      check.message ||
      "No podemos responder esta pregunta. Por favor, consulta con un profesional.",
    referralUrl: check.referralUrl,
  };
}

export function shouldLogQuestion(check: SafetyCheckResult): boolean {
  return check.isSafe;
}

export const SafetyModule = {
  checkSafety,
  buildSafetyResponse,
  shouldLogQuestion,
} as const;
