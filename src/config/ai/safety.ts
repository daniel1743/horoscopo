/** Reglas de seguridad orientativas. Las decisiones finales las toma el servidor. */
export const safetyRules = {
  forbiddenAbsolutes: [
    /\besto\s+sucederá\b/i,
    /\bel\s+tarot\s+confirma\b/i,
    /\btu\s+signo\s+demuestra\b/i,
  ],
  professionalReferralTopics: [
    "salud",
    "salud mental",
    "asuntos legales",
    "asuntos financieros",
    "peligro personal",
  ],
} as const;

export const safetyNotices = {
  professionalReferral:
    "Este tema puede requerir apoyo profesional. Considera acompañamiento humano cualificado antes de tomar decisiones importantes.",
  danger:
    "Si existe riesgo inmediato para ti o alguien más, busca ayuda profesional o llama a un servicio de emergencia.",
  aiGeneric: "Recuerda que soy una guía de inteligencia artificial: puedo equivocarme.",
} as const;
