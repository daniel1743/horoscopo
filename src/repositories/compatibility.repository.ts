/**
 * Interfaz del repositorio de compatibilidad.
 * Los componentes/páginas dependen de esta interfaz, nunca de Supabase.
 */
import type {
  CompatibilityPairKey,
  CompatibilityProfile,
  ZodiacSignKey,
} from "@/types/compatibility";

export interface CompatibilityRepository {
  getByPair(signOne: ZodiacSignKey, signTwo: ZodiacSignKey): Promise<CompatibilityProfile | null>;
  getByPairKey(pairKey: CompatibilityPairKey): Promise<CompatibilityProfile | null>;
  getPublishedForSign(signKey: ZodiacSignKey, limit?: number): Promise<CompatibilityProfile[]>;
  getPublishedPairs(limit?: number): Promise<CompatibilityProfile[]>;
  existsPublishedPair(signOne: ZodiacSignKey, signTwo: ZodiacSignKey): Promise<boolean>;
}
