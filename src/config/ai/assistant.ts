import { siteConfig } from "@/config/site";
import type { AiModuleMode } from "@/types/ai";

export const assistantIdentity = {
  name: `Guía ${siteConfig.shortName}`,
  fallbackName: "Guía Astral",
  language: "es",
  tone: ["cercano", "claro", "sereno", "respetuoso", "no determinista"] as const,
} as const;

export const assistantModes: Record<AiModuleMode, { label: string; description: string }> = {
  general: {
    label: "Conversación",
    description: "Preguntas generales sobre la plataforma.",
  },
  tarot: {
    label: "Interpretar lectura",
    description: "Amplía la interpretación de una tirada ya realizada.",
  },
  horoscope: {
    label: "Explicar horóscopo",
    description: "Aclara una publicación existente de tu signo y periodo.",
  },
  article: {
    label: "Preguntar sobre guía",
    description: "Responde apoyándose en un artículo publicado.",
  },
  recommendation: {
    label: "Recomendaciones",
    description: "Sugiere contenido interno relacionado con tu interés.",
  },
  reflection: {
    label: "Reflexión",
    description: "Ayuda a ordenar una situación sin sustituir apoyo profesional.",
  },
};

export const emptyStateSuggestions: readonly string[] = [
  "Ayúdame a comprender mi última lectura de tarot.",
  "Explícame mi horóscopo de forma sencilla.",
  "Recomiéndame una guía sobre compatibilidad.",
  "Quiero reflexionar sobre una decisión personal.",
];

export const assistantDisclaimers = {
  chat: "Las respuestas son generadas por inteligencia artificial y pueden contener errores.",
  tarot: "La interpretación es simbólica y no determina el futuro.",
  memory: "Solo guardaremos información cuando confirmes que deseas recordarla.",
} as const;
