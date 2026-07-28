/** Dirección artística y ratios estándar para imágenes editoriales. */

export const imageRatios = {
  heroDesktop: "16 / 9",
  heroMobile: "4 / 5",
  articleCard: "16 / 10",
  articleHeader: "16 / 8",
  zodiacCard: "1 / 1",
  tarotCard: "2 / 3",
  lunarFeature: "4 / 3",
} as const;

export const categoryImagePrompts = {
  horoscope:
    "constelaciones y símbolos zodiacales sobre atmósfera cósmica sobria, iluminación violeta y dorada",
  tarot: "cartas simbólicas y objetos rituales mínimos, composición centrada, sombras profundas",
  astrology: "órbitas y diagramas astrales, geometría circular, papel editorial",
  moon: "fases lunares y paisajes nocturnos, reflejos suaves, azul celestial",
  compatibility: "dos cuerpos celestes conectados, órbitas compartidas, equilibrio visual",
  editorial: "ilustración conceptual editorial, metáforas visuales, composición de revista",
} as const;

export type ImageRatio = keyof typeof imageRatios;
export type CategoryStyle = keyof typeof categoryImagePrompts;
