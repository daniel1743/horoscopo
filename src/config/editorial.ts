/**
 * Configuración editorial: avisos, calibración y utilidades sin datos de dominio.
 */
import type { IconName } from "@/config/icons";

export const editorialConfig = {
  wordsPerMinute: 200,
  maxRelated: 3,
  categoryIconFallback: "article" as IconName,
} as const;

/**
 * Temas de intención de la portada. Cada tema aterriza en una categoría que
 * existe en el catálogo editorial; no crea taxonomías ni páginas huérfanas.
 */
export const editorialTopicFilters = {
  "amor-y-relaciones": {
    label: "Amor y relaciones",
    categorySlug: "compatibilidad",
  },
  "trabajo-y-proposito": {
    label: "Trabajo y propósito",
    categorySlug: "astrologia",
  },
  "dinero-y-decisiones": {
    label: "Dinero y decisiones",
    categorySlug: "horoscopo",
  },
  "bienestar-emocional": {
    label: "Bienestar emocional",
    categorySlug: "luna",
  },
  "crecimiento-personal": {
    label: "Crecimiento personal",
    categorySlug: "editorial",
  },
  "ciclos-y-cambios": {
    label: "Ciclos y cambios",
    categorySlug: "luna",
  },
} as const;

export type EditorialTopicSlug = keyof typeof editorialTopicFilters;

export const editorialTopicRoute = (topic: EditorialTopicSlug) => `/guias?tema=${topic}`;

/** Avisos legales/editoriales reutilizables referenciados desde bloques disclaimer. */
export const disclaimers: Record<string, { title: string; body: string }> = {
  general: {
    title: "Aviso editorial",
    body: "El contenido de Creovision es simbólico y de reflexión. No sustituye consejo profesional médico, legal ni financiero.",
  },
  demo: {
    title: "Contenido de demostración",
    body: "Este artículo se publica únicamente para validar la infraestructura editorial. No representa contenido definitivo.",
  },
};

export const calloutStyles: Record<string, { border: string; label: string }> = {
  reflection: { border: "border-l-brand", label: "Reflexión" },
  important: { border: "border-l-accent-astral-rose", label: "Importante" },
  context: { border: "border-l-accent-celestial-blue", label: "Contexto" },
  caution: { border: "border-l-accent-lunar-gold", label: "Atención" },
};
