/**
 * Contenido científico central (YAML 10 §19).
 *
 * Definiciones factuales, breves y verificables. Nunca incluir creencias,
 * simbolismo ni afirmaciones causales. Este archivo alimenta las páginas
 * de fase y el hub /luna.
 */

export const MOON_SCIENCE_COPY = {
  definitions: {
    phase: {
      title: "Qué es una fase lunar",
      text: "La fase describe la porción iluminada de la Luna que observamos desde la Tierra según la posición relativa del Sol, la Tierra y la Luna.",
    },
    illumination: {
      title: "Qué mide la iluminación",
      text: "La iluminación representa la fracción visible del disco lunar que recibe luz solar directa. Se expresa como un porcentaje entre 0 y 100.",
    },
    lunarAge: {
      title: "Qué es la edad lunar",
      text: "La edad lunar indica el tiempo transcurrido desde la Luna nueva anterior dentro del ciclo sinódico, cuya duración media es de 29,53 días.",
    },
    synodicCycle: {
      title: "Ciclo sinódico",
      text: "El ciclo sinódico es el tiempo que tarda la Luna en volver a la misma posición relativa respecto al Sol vista desde la Tierra. Determina el orden de las fases.",
    },
  },
  distinction: {
    title: "Diferencia entre dato y lectura simbólica",
    text: "Los datos astronómicos (fase, iluminación, edad, próximas fases) se calculan a partir de un motor validado. Las lecturas simbólicas son interpretaciones editoriales y no describen efectos físicos, emocionales ni causales sobre las personas.",
  },
  observationTip: {
    title: "Qué puedes observar",
    text: "La orientación visible de la Luna varía según el hemisferio y la hora. Las representaciones diagramáticas del sitio son neutrales y no pretenden reproducir la orientación exacta del cielo.",
  },
} as const;

export type MoonScienceCopy = typeof MOON_SCIENCE_COPY;
