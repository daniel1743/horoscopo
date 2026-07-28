/**
 * Detección orientativa de temas sensibles del lado servidor.
 * Añade un aviso al contexto; nunca bloquea silenciosamente al usuario.
 */
import { safetyNotices } from "@/config/ai/safety";

const DANGER = /\b(suicid|autolesi|matarme|hacerme da[nñ]o|violaci[oó]n)\b/i;
const PROFESSIONAL =
  /\b(c[aá]ncer|diagn[oó]stico|medic|s[ií]ntoma|inversi[oó]n|hipoteca|abogad|juicio|demand)\b/i;

export function classifySafety(message: string): string | null {
  if (DANGER.test(message)) return safetyNotices.danger;
  if (PROFESSIONAL.test(message)) return safetyNotices.professionalReferral;
  return null;
}
