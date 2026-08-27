import type { NatalAspect, NatalChart } from "@/types/astrology";

export interface NatalPlacementNarrative {
  body: string;
  title: string;
  placement: string;
  houseText: string;
  text: string;
}

export interface NatalAspectNarrative {
  key: string;
  title: string;
  closeness: string;
  theme: string;
  text: string;
}

export interface NatalNarrative {
  overview: string;
  patternText: string;
  placements: NatalPlacementNarrative[];
  aspects: NatalAspectNarrative[];
  reflectionQuestion: string;
}

const BODY_LENSES: Record<string, string> = {
  Sun: "identidad, vitalidad y dirección consciente",
  Moon: "necesidades emocionales, memoria y sensación de seguridad",
  Mercury: "aprendizaje, lenguaje y manera de procesar información",
  Venus: "vínculos, valores y formas de apreciar o acercarte",
  Mars: "iniciativa, deseo y manera de actuar ante la fricción",
  Jupiter: "expansión, confianza y búsqueda de sentido",
  Saturn: "límites, responsabilidad y aprendizajes sostenidos",
  Uranus: "independencia, cambio y ruptura de patrones",
  Neptune: "imaginación, sensibilidad y relación con lo sutil",
  Pluto: "procesos profundos, poder personal y transformación",
};

const ASPECT_THEMES: Record<string, string> = {
  Sun: "identidad y propósito",
  Moon: "necesidades emocionales",
  Mercury: "comunicación y pensamiento",
  Venus: "vínculos y valores",
  Mars: "acción y deseo",
  Jupiter: "crecimiento y confianza",
  Saturn: "responsabilidad y límites",
  Uranus: "cambio e independencia",
  Neptune: "sensibilidad e imaginación",
  Pluto: "transformación y profundidad",
};

function aspectCloseness(orb: number): string {
  if (orb <= 1) return "Muy cercano";
  if (orb <= 3) return "Cercano";
  return "Amplio dentro del orbe";
}

function aspectTheme(aspect: NatalAspect): string {
  const firstTheme = ASPECT_THEMES[aspect.firstBody] ?? "experiencia personal";
  const secondTheme = ASPECT_THEMES[aspect.secondBody] ?? "experiencia personal";
  return `${firstTheme} y ${secondTheme}`;
}

function aspectNarrative(aspect: NatalAspect): string {
  const tone =
    aspect.key === "square" || aspect.key === "opposition"
      ? "una fricción que pide conciencia"
      : "un vínculo que puede facilitar integración";
  return `${aspect.firstLabel} y ${aspect.secondLabel} forman ${aspect.label.toLocaleLowerCase()} con un orbe de ${aspect.orb.toFixed(1)}°. En este modelo puede leerse como ${tone}; observa qué ocurre en hechos concretos antes de convertirlo en una etiqueta sobre ti.`;
}

function placementNarrative(placement: NatalChart["placements"][number]): NatalPlacementNarrative {
  const lens = BODY_LENSES[placement.body] ?? "una dimensión de experiencia personal";
  const houseText = placement.house ? `Casa ${placement.house}` : "Casa no asignada";
  const signText = `${placement.sign.symbol} ${placement.sign.label}`;
  return {
    body: placement.body,
    title: placement.label,
    placement: `${signText} · ${placement.degreeInSign.toFixed(1)}°`,
    houseText,
    text: `${placement.label} se observa en ${signText}, dentro de ${houseText.toLocaleLowerCase()}. Para esta lectura simbólica representa ${lens}. Relaciona esta posición con las otras áreas de tu carta y con situaciones observables; no la tomes como una descripción fija de personalidad.`,
  };
}

export function buildNatalNarrative(chart: NatalChart): NatalNarrative {
  const personal = chart.placements.filter((placement) =>
    ["Sun", "Moon", "Mercury", "Venus", "Mars"].includes(placement.body),
  );
  const personalSigns = personal.map((placement) => placement.sign.label);
  const aspects = [...chart.aspects].sort((a, b) => a.orb - b.orb);
  const patternText = `El resumen cuenta ${chart.summary.dominantElement.count} puntos en ${chart.summary.dominantElement.label}, ${chart.summary.dominantModality.count} en modalidad ${chart.summary.dominantModality.label} y ${chart.summary.dominantSign.count} presencia${chart.summary.dominantSign.count === 1 ? "" : "s"} de ${chart.summary.dominantSign.label}. En los placements personales aparecen ${personalSigns.join(", ")}; esta combinación puede orientar preguntas sobre cómo expresas, sientes, piensas, vinculas y actúas, sin convertir el conteo en una sentencia.`;

  return {
    overview: `Tu Big Three reúne Sol en ${chart.summary.bigThree.sun.sign.label}, Luna en ${chart.summary.bigThree.moon.sign.label} y Ascendente en ${chart.summary.bigThree.ascendant.sign.label}. Aquí se leen como tres puntos de observación distintos: dirección, mundo emocional y presencia.`,
    patternText,
    placements: chart.placements.map((placement) => placementNarrative(placement)),
    aspects: aspects.map((aspect) => ({
      key: `${aspect.firstBody}-${aspect.secondBody}-${aspect.key}`,
      title: `${aspect.firstLabel} · ${aspect.secondLabel}`,
      closeness: aspectCloseness(aspect.orb),
      theme: aspectTheme(aspect),
      text: aspectNarrative(aspect),
    })),
    reflectionQuestion:
      "¿Qué patrón de tu carta reconoces en una situación concreta y qué parte de esa historia todavía puedes elegir de otra manera?",
  };
}
