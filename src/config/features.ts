/**
 * Feature flags. Verdadero = disponible; falso = no construir/ocultar.
 * Los menús y rutas deben leer estos flags para decidir visibilidad.
 */

export const featureFlags = {
  // Activadas (MVP)
  horoscope: true,
  tarotDaily: true,
  tarotYesNo: true,
  tarotThreeCards: true,
  compatibilityBasic: true,
  moonToday: true,
  moonCalendar: true,
  articles: true,
  search: true,
  newsletter: true,
  accountBasic: true,

  // Panel administrativo (YAML 13 — Fase A)
  adminPanel: true,
  adminAIEditorial: false,
  scheduledPublication: false,

  // IA (YAML 08)
  aiAssistant: true,
  aiTarotInterpretation: true,
  aiHoroscopeExplanation: true,
  aiArticleQuestions: true,
  aiRecommendations: true,
  aiConversationHistory: true,
  aiMemory: true,
  aiStreaming: true,
  aiFeedback: true,

  // Desactivadas (fases futuras)
  payments: false,
  subscriptions: false,
  aiChat: false,
  advancedBirthChart: false,
  pdfReports: false,
  pushNotifications: false,
  emotionalTracking: false,
  nativeMobileApp: false,
  advancedTransits: false,
  aiWebSearch: false,
  aiVoice: false,
  aiImageGeneration: false,
  aiAutonomousActions: false,
} as const;

export type FeatureKey = keyof typeof featureFlags;

export const isFeatureEnabled = (key: FeatureKey): boolean => featureFlags[key] === true;
