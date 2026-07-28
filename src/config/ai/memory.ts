import type { AiMemoryCategory } from "@/types/ai";

export const memoryConfig = {
  maxActiveMemories: 8,
  maxCharacters: 2500,
  automaticSave: false,
} as const;

export const memoryCategoryLabels: Record<AiMemoryCategory, string> = {
  preference: "Preferencia",
  interest: "Interés",
  goal: "Objetivo",
  personal_context: "Contexto personal",
  content_preference: "Contenido preferido",
};

export const memoryNeverStore: readonly string[] = [
  "contraseñas",
  "datos bancarios",
  "documentos de identidad",
  "dirección exacta",
  "diagnósticos médicos",
  "medicación",
  "detalles de autolesión",
  "expedientes legales",
  "información financiera privada",
  "datos sexuales íntimos",
];
