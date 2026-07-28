/**
 * Helpers de ruta canónica para compatibilidad.
 * Vive fuera de `src/config/routes.ts` para evitar dependencias circulares.
 */
import { normalizeSignPair } from "./normalize-sign-pair";

export function compatibilityRoute(a: string, b: string): string {
  return normalizeSignPair(a, b).canonical_path;
}
