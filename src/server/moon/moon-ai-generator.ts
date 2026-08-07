import { buildFallbackReading } from "./moon-editorial-library";
import type { ZodiacSignKey } from "@/data/zodiac-signs";
import type { AspectType } from "../aspects/moon-aspects";

export interface MoonReadingRequest {
  currentSign: ZodiacSignKey;
  natalSign: ZodiacSignKey;
  aspect: AspectType;
  phaseKey: string;
}

export interface MoonReadingResponse {
  reading: string;
  isFallback: boolean;
}

/**
 * Validador anti-fatalismo para asegurar que la lectura sea constructiva.
 */
function validateReading(text: string): boolean {
  const forbiddenWords = ["desastre", "imposible", "arruinar", "fatal", "terrible", "peor"];
  const lowerText = text.toLowerCase();
  
  for (const word of forbiddenWords) {
    if (lowerText.includes(word)) {
      return false; // Falla la validación
    }
  }
  return true;
}

/**
 * Genera la lectura de la luna usando un LLM (DeepSeek) o un fallback si falla.
 */
export async function generateMoonReading(req: MoonReadingRequest): Promise<MoonReadingResponse> {
  const fallbackText = buildFallbackReading(req.currentSign, req.natalSign, req.aspect, req.phaseKey);
  
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    // Si no hay API key configurada, usar fallback determinista (Fase 6)
    return { reading: fallbackText, isFallback: true };
  }

  const prompt = `
Eres un astrólogo experto con enfoque psicológico y evolutivo.
Escribe una breve lectura de "Tu Luna de Hoy" (máximo 4 oraciones).
Usa un tono empático, claro y sin fatalismos.

DATOS ASTRONÓMICOS DE HOY:
- Luna Transitando en: ${req.currentSign}
- Fase Lunar: ${req.phaseKey}

DATOS NATALES DEL USUARIO:
- Luna Natal en: ${req.natalSign}
- Aspecto exacto formado hoy: ${req.aspect}

INSTRUCCIONES:
1. Conecta la energía de la luna actual con su luna natal.
2. Explica brevemente cómo el aspecto (${req.aspect}) influye hoy.
3. No uses jerga astrológica excesiva, háblale directo al usuario.
  `;

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Devuelve únicamente el texto de la lectura, sin saludos ni introducciones extra." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      console.error("Error llamando a DeepSeek:", await res.text());
      return { reading: fallbackText, isFallback: true };
    }

    const data = await res.json();
    const reading = data.choices[0]?.message?.content?.trim();

    if (!reading || !validateReading(reading)) {
      return { reading: fallbackText, isFallback: true };
    }

    return { reading, isFallback: false };
  } catch (err) {
    console.error("Excepción generando lectura de luna:", err);
    return { reading: fallbackText, isFallback: true };
  }
}
