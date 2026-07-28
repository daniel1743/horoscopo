/**
 * Configuración editorial: avisos, calibración y utilidades sin datos de dominio.
 */
import type { IconName } from "@/config/icons";

export const editorialConfig = {
  wordsPerMinute: 200,
  maxRelated: 3,
  categoryIconFallback: "article" as IconName,
} as const;

/** Avisos legales/editoriales reutilizables referenciados desde bloques disclaimer. */
export const disclaimers: Record<string, { title: string; body: string }> = {
  general: {
    title: "Aviso editorial",
    body: "El contenido de Proyecto Astral es simbólico y de reflexión. No sustituye consejo profesional médico, legal ni financiero.",
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
