export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition" | "none";

export interface AspectResult {
  type: AspectType;
  exactness: number; // 0 is exact, up to orb is less exact
  angle: number;
}

const ASPECTS = [
  { type: "conjunction" as AspectType, angle: 0 },
  { type: "sextile" as AspectType, angle: 60 },
  { type: "square" as AspectType, angle: 90 },
  { type: "trine" as AspectType, angle: 120 },
  { type: "opposition" as AspectType, angle: 180 },
];

const DEFAULT_ORB = 8; // Grados de tolerancia para la Luna

/**
 * Compara dos longitudes eclípticas (ej: Luna Natal y Luna Actual)
 * y determina si forman un aspecto mayor.
 * 
 * @param natalLongitude Longitud de la posición natal (0-360)
 * @param currentLongitude Longitud de la posición actual (0-360)
 * @param orb Tolerancia en grados (por defecto 8 para la luna)
 */
export function compareNatalAndCurrentMoon(
  natalLongitude: number,
  currentLongitude: number,
  orb: number = DEFAULT_ORB
): AspectResult {
  // Encontrar la distancia angular más corta entre dos puntos en un círculo
  let diff = Math.abs(currentLongitude - natalLongitude) % 360;
  if (diff > 180) {
    diff = 360 - diff;
  }

  for (const aspect of ASPECTS) {
    const exactness = Math.abs(diff - aspect.angle);
    if (exactness <= orb) {
      return {
        type: aspect.type,
        exactness,
        angle: diff,
      };
    }
  }

  return {
    type: "none",
    exactness: diff, // para 'none' guardamos la distancia menor
    angle: diff,
  };
}
