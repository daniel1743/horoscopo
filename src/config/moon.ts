/**
 * Configuración central de fases lunares (YAML 10 §5).
 *
 * Fuente única para labels, iconos, rutas de fase, imágenes y disclaimers.
 * Los componentes NO deben clasificar fases ni asignar labels/colores locales.
 */
import type { MoonPhaseKey } from "@/types/moon";
import type { IconName } from "./icons";

export interface MoonPhaseMeta {
  key: MoonPhaseKey;
  label: string;
  shortLabel: string;
  iconKey: IconName;
  slug: string;
  imageKey: string;
}

/** Orden canónico del ciclo. */
export const MOON_PHASE_ORDER: readonly MoonPhaseKey[] = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
] as const;

export const MOON_PHASE_REGISTRY: Record<MoonPhaseKey, MoonPhaseMeta> = {
  new_moon: {
    key: "new_moon",
    label: "Luna nueva",
    shortLabel: "Nueva",
    iconKey: "moon_new",
    slug: "luna-nueva",
    imageKey: "moon_phase_new",
  },
  waxing_crescent: {
    key: "waxing_crescent",
    label: "Luna creciente",
    shortLabel: "Creciente",
    iconKey: "moon_waxing_crescent",
    slug: "luna-creciente",
    imageKey: "moon_phase_waxing_crescent",
  },
  first_quarter: {
    key: "first_quarter",
    label: "Cuarto creciente",
    shortLabel: "Cuarto creciente",
    iconKey: "moon_first_quarter",
    slug: "cuarto-creciente",
    imageKey: "moon_phase_first_quarter",
  },
  waxing_gibbous: {
    key: "waxing_gibbous",
    label: "Gibosa creciente",
    shortLabel: "Gibosa creciente",
    iconKey: "moon_waxing_gibbous",
    slug: "gibosa-creciente",
    imageKey: "moon_phase_waxing_gibbous",
  },
  full_moon: {
    key: "full_moon",
    label: "Luna llena",
    shortLabel: "Llena",
    iconKey: "moon_full",
    slug: "luna-llena",
    imageKey: "moon_phase_full",
  },
  waning_gibbous: {
    key: "waning_gibbous",
    label: "Gibosa menguante",
    shortLabel: "Gibosa menguante",
    iconKey: "moon_waning_gibbous",
    slug: "gibosa-menguante",
    imageKey: "moon_phase_waning_gibbous",
  },
  last_quarter: {
    key: "last_quarter",
    label: "Cuarto menguante",
    shortLabel: "Cuarto menguante",
    iconKey: "moon_last_quarter",
    slug: "cuarto-menguante",
    imageKey: "moon_phase_last_quarter",
  },
  waning_crescent: {
    key: "waning_crescent",
    label: "Luna menguante",
    shortLabel: "Menguante",
    iconKey: "moon_waning_crescent",
    slug: "luna-menguante",
    imageKey: "moon_phase_waning_crescent",
  },
};

/** Timezone y locale del sitio. Fuente única. */
export const MOON_SITE_TIMEZONE = "Europe/Madrid";
export const MOON_SITE_LOCALE = "es-ES";

/** Rango permitido de navegación del calendario (años absolutos alrededor de "hoy"). */
export const MOON_CALENDAR_RANGE_YEARS = { past: 10, future: 10 } as const;

/** Umbrales angulares para clasificar la fase a partir del phase_angle
 * (0..360). Coincide con la convención del motor `astronomy-engine`:
 *   0 = Luna nueva, 90 = cuarto creciente, 180 = llena, 270 = cuarto menguante.
 * Los ±TOL definen ventanas para reportar la fase mayor "en la fecha".
 */
export const MOON_MAJOR_PHASE_TOLERANCE_DEGREES = 2;

/** Feature flags específicos del sistema lunar. Se leen desde
 *  `featureFlags` (config/features.ts). Los que dependen de precisión no
 *  cubierta por el motor actual permanecen desactivados.
 */
export const MOON_FEATURE_KEYS = {
  moonZodiacSign: "moonZodiacSign",
  moonriseMoonset: "moonriseMoonset",
  moonAiExplanation: "aiAssistant",
  moonFavorites: "accountBasic",
  moonHistory: "accountBasic",
} as const;

/** Disclaimer central asociado por defecto al contenido lunar. */
export const MOON_DEFAULT_DISCLAIMER_KEY = "general";

/** Formatos de fecha centralizados. Todas las páginas los reutilizan. */
export const MOON_DATE_FORMATS = {
  longDate: { weekday: "long", day: "numeric", month: "long", year: "numeric" } as const,
  shortDate: { day: "numeric", month: "long" } as const,
  monthYear: { month: "long", year: "numeric" } as const,
  timeShort: { hour: "2-digit", minute: "2-digit", hour12: false } as const,
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export function phaseMeta(key: MoonPhaseKey): MoonPhaseMeta {
  return MOON_PHASE_REGISTRY[key];
}

export function phaseBySlug(slug: string): MoonPhaseMeta | null {
  for (const key of MOON_PHASE_ORDER) {
    if (MOON_PHASE_REGISTRY[key].slug === slug) return MOON_PHASE_REGISTRY[key];
  }
  return null;
}
