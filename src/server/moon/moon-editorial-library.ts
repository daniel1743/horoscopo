import type { ZodiacSignKey } from "@/data/zodiac-signs";
import type { AspectType } from "../aspects/moon-aspects";

export const MOON_SIGN_THEMES: Record<ZodiacSignKey, string> = {
  aries: "Necesidad de acción, independencia y afirmación personal. La emoción se procesa rápido.",
  tauro: "Búsqueda de seguridad, confort sensorial y estabilidad. Ritmos pausados.",
  geminis: "Necesidad de comunicar, entender y variar. Las emociones se racionalizan.",
  cancer: "Anhelo de refugio, nutrición emocional y pertenencia. Alta sensibilidad.",
  leo: "Deseo de reconocimiento, expresión creativa y calidez. Las emociones son dramáticas y nobles.",
  virgo: "Necesidad de orden, utilidad y análisis. Seguridad a través del servicio y el detalle.",
  libra: "Búsqueda de armonía, vínculo y equilibrio. La emoción se filtra por la estética y el otro.",
  escorpio: "Intensidad emocional, necesidad de transformación y fusión. Nada es superficial.",
  sagitario: "Necesidad de expansión, fe y libertad. Optimismo emocional y evasión de lo denso.",
  capricornio: "Búsqueda de estructura, logro y autosuficiencia. Las emociones se controlan.",
  acuario: "Necesidad de libertad, objetividad y red. La emoción se intelectualiza o distancia.",
  piscis: "Extrema empatía, sensibilidad porosa y conexión espiritual. Límites difusos.",
};

export const ASPECT_MEANINGS: Record<AspectType, string> = {
  conjunction: "Las energías se fusionan. Lo que sientes hoy es muy similar a lo que necesitas por naturaleza.",
  sextile: "Una oportunidad fluye con facilidad. Tu estado actual colabora amablemente con tus instintos.",
  square: "Tensión y desafío. Hay una fricción entre lo que pide el momento y lo que necesitas para sentirte seguro.",
  trine: "Armonía fluida. Hay un entendimiento natural entre la energía del día y tus necesidades emocionales.",
  opposition: "Polaridad y proyección. Sientes que la situación te exige algo opuesto a tu refugio emocional.",
  none: "No hay un contacto exacto. La energía actual actúa de fondo sin chocar directamente con tu luna natal.",
};

export const PHASE_MEANINGS: Record<string, string> = {
  new: "Inicios invisibles. La energía está baja, pide introspección antes de arrancar.",
  waxing_crescent: "Brote y primer impulso. Aparecen las ganas de dar forma a algo nuevo.",
  first_quarter: "Acción y fricción. Surgen los primeros obstáculos que piden decisión.",
  waxing_gibbous: "Ajuste y perfeccionamiento. Casi listos, analizando los detalles.",
  full: "Culminación y claridad. Máxima luz, las emociones se desbordan, todo se revela.",
  waning_gibbous: "Distribución y agradecimiento. Compartiendo lo logrado, soltando el control.",
  last_quarter: "Revisión y descarte. Momento de reorientar y dejar ir lo que no sirve.",
  waning_crescent: "Cierre y descanso. Vaciando el espacio interior para el próximo ciclo.",
};

export function buildFallbackReading(
  currentSign: ZodiacSignKey,
  natalSign: ZodiacSignKey,
  aspect: AspectType,
  phaseKey: string
): string {
  const cTheme = MOON_SIGN_THEMES[currentSign];
  const nTheme = MOON_SIGN_THEMES[natalSign];
  const aspectMsg = ASPECT_MEANINGS[aspect];
  const phaseMsg = PHASE_MEANINGS[phaseKey] || "El ciclo sigue su curso.";

  return `Hoy la Luna transita por ${currentSign}, trayendo una energía de: ${cTheme.toLowerCase()} ` +
         `Por otro lado, tu Luna natal en ${natalSign} te pide: ${nTheme.toLowerCase()} ` +
         `Fase actual: ${phaseMsg} ` +
         `El aspecto entre ambas es ${aspect}. ${aspectMsg} ` +
         `Tómalo como una oportunidad para observar tus reacciones emocionales hoy.`;
}
