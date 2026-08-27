/**
 * Tipos de dominio para la capa de IA.
 * Los componentes NUNCA reciben filas crudas.
 */
export type AiModuleMode =
  "general" | "tarot" | "horoscope" | "article" | "recommendation" | "reflection";

export type AiRole = "user" | "assistant";

export interface AiSource {
  title: string;
  sourceType: "article" | "tarot_card" | "horoscope" | "editorial_method" | "zodiac" | "moon";
  url?: string;
}

export interface AiMessage {
  id: string;
  role: AiRole;
  content: string;
  sources?: AiSource[];
  createdAt: string;
  modelAlias?: string;
  safetyNotice?: string;
}

export interface AiConversation {
  id: string;
  title: string | null;
  module: AiModuleMode;
  summary: string | null;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type AiMemoryCategory =
  "preference" | "interest" | "goal" | "personal_context" | "content_preference";

export interface AiMemory {
  id: string;
  category: AiMemoryCategory;
  memoryKey: string;
  memoryValue: unknown;
  summary: string;
  active: boolean;
  consentStatus: "confirmed" | "revoked";
  createdAt: string;
  updatedAt: string;
}

export interface AiUserPreferences {
  responseLength: "brief" | "balanced" | "detailed";
  tone: "warm" | "direct" | "reflective";
  memoryEnabled: boolean;
  citationsExpanded: boolean;
}

export interface AiTarotContextInput {
  spreadKey: "daily" | "yes_no" | "three_cards" | "decision";
  cardKeys: string[];
  positionKeys: string[];
  question?: string;
}

export interface AiHoroscopeContextInput {
  signSlug: string;
  period: "daily" | "weekly" | "monthly";
  dateFor?: string;
}

export interface AiArticleContextInput {
  articleSlug: string;
}

export type AiRequestContext =
  | { kind: "tarot"; tarot: AiTarotContextInput }
  | { kind: "horoscope"; horoscope: AiHoroscopeContextInput }
  | { kind: "article"; article: AiArticleContextInput }
  | { kind: "none" };

export interface AiRespondRequest {
  message: string;
  mode: AiModuleMode;
  conversationId?: string;
  context?: AiRequestContext;
  allowMemory?: boolean;
  requestId: string;
}

export interface AiRespondEnvelope {
  conversationId: string | null;
  messageId: string | null;
  sources: AiSource[];
  memorySuggestion?: {
    summary: string;
    category: AiMemoryCategory;
    memoryKey: string;
  } | null;
  safetyNotice?: string | null;
  usageRemaining: number | null;
}
