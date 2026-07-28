/**
 * YAML 12 — Detección de consultas sensibles.
 * Se usa únicamente para NO persistir en localStorage ni en analítica.
 * No censura resultados.
 */
import { normalizeForStaticMatch } from "./normalize-search-query";

const SENSITIVE_TOKENS: readonly string[] = [
  // salud / autolesión
  "suicidio",
  "autolesion",
  "cortarme",
  "matarme",
  "morirme",
  "deprimido",
  "ansiedad severa",
  // violencia
  "asesinato",
  "violacion",
  "abuso",
  "maltrato",
  // financiero / documentos
  "tarjeta credito",
  "numero tarjeta",
  "cvv",
  "iban",
  "dni",
  "pasaporte",
  "contrasena",
  "password",
  "clave banco",
];

export function isSensitiveQuery(query: string): boolean {
  if (!query) return false;
  const n = normalizeForStaticMatch(query);
  return SENSITIVE_TOKENS.some((token) => n.includes(token));
}
