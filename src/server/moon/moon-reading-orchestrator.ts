import { z } from "zod";
import { calculateNatalMoon, getCurrentMoonPosition, type NatalMoonResult } from "../natal/natal-moon-calculator";
import { compareNatalAndCurrentMoon, type AspectResult } from "../aspects/moon-aspects";
import { generateMoonReading, type MoonReadingResponse } from "./moon-ai-generator";
import { getCachedReading, saveReadingToCache } from "./moon-cache";
import { astronomyMoonEngine } from "./astronomy-moon-engine";
import { MOON_SITE_TIMEZONE } from "@/config/moon";

export interface LunarReadingResult {
  natal: NatalMoonResult;
  aspect: AspectResult;
  reading: MoonReadingResponse;
  currentPhase: string;
  currentSign: string;
}

export async function orchestrateLunarReading(
  input: { birthDate: string; birthTime?: string; timezoneOffset: number; }
): Promise<LunarReadingResult> {
  console.log(">> orchestrateLunarReading called with:", input);
  try {
    // 1. Calcular Luna Natal
    const natalResult = calculateNatalMoon(input.birthDate, input.birthTime, input.timezoneOffset);
    console.log(">> natalResult:", natalResult);
  
  // 2. Calcular Luna Actual
  const now = new Date();
  const currentPos = getCurrentMoonPosition(now);
  
  // Extra: Obtener fase lunar actual para la lectura
  const currentSnapshot = astronomyMoonEngine.getSnapshot(now, MOON_SITE_TIMEZONE);
  const phaseKey = currentSnapshot.phase_key;

  // 3. Comparar para encontrar aspectos
  const aspect = compareNatalAndCurrentMoon(natalResult.moon.longitude, currentPos.longitude);

  // 4. Buscar en caché o generar
  // Fingerprint único para evitar regenerar si no ha cambiado el escenario astrológico
  const fingerprint = `reading|c:${currentPos.sign}|n:${natalResult.moon.sign}|a:${aspect.type}|p:${phaseKey}`;

  let reading = await getCachedReading(fingerprint);

  if (!reading) {
    // Generar con AI (o fallback si falla)
    reading = await generateMoonReading({
      currentSign: currentPos.sign,
      natalSign: natalResult.moon.sign,
      aspect: aspect.type,
      phaseKey,
    });

    // Guardar en caché
    console.log(">> saving to cache...");
    await saveReadingToCache(fingerprint, reading.reading, reading.isFallback);
    console.log(">> cache saved.");
  } else {
    console.log(">> returned from cache.");
  }

  return {
    natal: natalResult,
    aspect,
    reading,
    currentPhase: phaseKey,
    currentSign: currentPos.sign,
  };
  } catch (err) {
    console.error(">> ERROR in orchestrateLunarReading:", err);
    throw err;
  }
}
