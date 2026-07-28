/**
 * Detección MUY simple de temas sensibles (solo cliente).
 * Nunca se envía la pregunta a analytics, logs o Supabase.
 */

export type SensitiveTopic = "health" | "self_harm" | "violence" | "financial" | "legal";

const patterns: Record<SensitiveTopic, RegExp> = {
  self_harm: /\b(suicid|autolesi|hacerme da[nñ]o|matarme)\b/i,
  violence: /\b(violenc|agresi[oó]n|maltrato|abus[oa])\b/i,
  health: /\b(c[aá]ncer|diagn[oó]stico|enferm(edad|o|a)|s[ií]ntoma|medic|embaraz)\b/i,
  financial: /\b(inversi[oó]n|apuesta|criptomoneda|bolsa|pr[eé]stamo|deuda|hipoteca)\b/i,
  legal: /\b(demand|abogad|juicio|denunci|herenci|divorci)\b/i,
};

export const sensitiveMessages: Record<SensitiveTopic, string> = {
  self_harm:
    "Esta herramienta no es adecuada para una situación de peligro inmediato o daño personal. Si necesitas ayuda ahora mismo, busca apoyo profesional o llama a un servicio de emergencia.",
  violence:
    "Si existe riesgo o violencia, prioriza ayuda y seguridad real antes que una lectura simbólica.",
  health:
    "El tarot no puede determinar diagnósticos ni tratamientos. Consulta a un profesional de la salud.",
  financial: "No utilices esta lectura como recomendación de inversión, apuestas o endeudamiento.",
  legal: "Esta lectura no sustituye asesoría legal profesional.",
};

/** Devuelve el primer tema sensible detectado, o null. Es orientativo, no bloquea. */
export function detectSensitiveTopic(question: string): SensitiveTopic | null {
  const q = question.trim();
  if (q.length === 0) return null;
  // Prioridad: seguridad primero.
  const order: SensitiveTopic[] = ["self_harm", "violence", "health", "legal", "financial"];
  for (const topic of order) {
    if (patterns[topic].test(q)) return topic;
  }
  return null;
}
