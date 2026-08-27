import type { TarotDrawnCard, TarotReading, TarotSynthesis } from "@/types/tarot";

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sharedKeywords(drawn: readonly TarotDrawnCard[]): string[] {
  if (drawn.length < 2) return [];
  const [first, ...rest] = drawn;
  const restKeywords = rest.map((item) => new Set(item.card.keywords.map(normalize)));
  return first.card.keywords.filter((keyword) =>
    restKeywords.every((keywords) => keywords.has(normalize(keyword))),
  );
}

function positionText(drawn: TarotDrawnCard): string {
  const meaning = drawn.reversed
    ? (drawn.card.reversedMeaning ?? drawn.card.uprightMeaning)
    : drawn.card.uprightMeaning;
  const keywords = drawn.card.keywords.slice(0, 3).join(", ");
  return `${drawn.position.description} ${meaning}${keywords ? ` Palabras para observar: ${keywords}.` : ""}`;
}

function relationshipText(reading: TarotReading): { label: string; text: string } {
  const cards = reading.drawn;
  if (cards.length === 1) {
    return {
      label: "Una carta para observar",
      text: "Aquí no hay una secuencia que resolver: la utilidad está en relacionar esta carta con tu pregunta y con lo que ocurrió realmente durante el día.",
    };
  }

  const shared = sharedKeywords(cards);
  const hasUpright = cards.some((item) => !item.reversed);
  const hasReversed = cards.some((item) => item.reversed);
  const hasFavorable = cards.some((item) => item.card.yesNoTendency === "favorable");
  const hasCaution = cards.some((item) => item.card.yesNoTendency === "caution");
  const observations: string[] = [];

  if (shared.length > 0) {
    observations.push(
      `Las cartas comparten el hilo «${shared.slice(0, 2).join("» y «")}», que puede servir como puente entre posiciones.`,
    );
  } else {
    observations.push(
      "No comparten palabras clave exactas; el contraste entre sus imágenes puede ser más útil que buscar una respuesta única.",
    );
  }
  if (hasUpright && hasReversed) {
    observations.push(
      "La mezcla de cartas al derecho e invertidas introduce un contraste entre expresión visible y revisión interna.",
    );
  }
  if (hasFavorable && hasCaution) {
    observations.push(
      "También aparece una combinación de apertura y cautela: conviene mirar qué información sostiene cada tono antes de decidir.",
    );
  }

  if (reading.spread === "decision") {
    return {
      label: "Relación entre valorar y avanzar",
      text: `La primera posición (${cards[0].position.label}) funciona como contexto para la segunda (${cards[1].position.label}). La segunda no borra la primera: propone un paso posible después de haberla considerado. ${observations.join(" ")}`,
    };
  }
  if (reading.spread === "past_present_future") {
    return {
      label: "Del antecedente a la posibilidad",
      text: `La secuencia conecta «${cards[0].card.name}» con «${cards[1].card.name}» y abre «${cards[2].card.name}» como posibilidad, no como hecho inevitable. ${observations.join(" ")}`,
    };
  }
  return {
    label: "Progresión de la tirada",
    text: `La lectura avanza desde «${cards[0].position.label}» hacia «${cards[cards.length - 1].position.label}». Busca qué cambia entre el contexto, lo que observas y el siguiente paso, en lugar de leer cada carta como una sentencia aislada. ${observations.join(" ")}`,
  };
}

function synthesisText(reading: TarotReading): string {
  const cards = reading.drawn;
  if (cards.length === 1) {
    return `La carta de ${cards[0].card.name} ofrece un punto de atención para tu pregunta. Comprueba qué parte de su significado se conecta con hechos concretos y qué parte no describe tu situación.`;
  }
  if (reading.spread === "decision") {
    return `La combinación sugiere hacer una pausa entre lo que necesitas valorar y el siguiente paso posible. Una lectura útil no decide por ti: te ayuda a identificar la información, el límite o la conversación que falta.`;
  }
  if (reading.spread === "past_present_future") {
    return "El pasado aporta contexto, el presente muestra una dinámica y el futuro queda abierto a distintas respuestas. Usa la secuencia para reconocer aprendizajes y elegir una acción consciente, no para anticipar un resultado fijo.";
  }
  return "La tirada se vuelve más clara cuando conectas la influencia inicial con lo que hoy conviene observar y con un próximo paso pequeño. La síntesis es una invitación a revisar el conjunto, no una sentencia.";
}

function reflectionQuestion(reading: TarotReading): string {
  const questions = reading.drawn
    .map(({ card }) => card.reflectionQuestion)
    .filter((question): question is string => Boolean(question));
  if (reading.spread === "past_present_future") {
    return "¿Qué aprendizaje del pasado puedo reconocer, qué está ocurriendo realmente ahora y qué posibilidad quiero construir con mis decisiones?";
  }
  if (reading.spread === "decision") {
    return "¿Qué dato, límite o conversación necesito antes de convertir esta reflexión en un siguiente paso?";
  }
  return (
    questions[questions.length - 1] ??
    "¿Qué hecho concreto de mi situación ayuda a poner esta lectura en contexto?"
  );
}

export function buildTarotSynthesis(reading: TarotReading): TarotSynthesis {
  const relation = relationshipText(reading);
  return {
    title:
      reading.spread === "daily" ? "Cómo llevar esta carta a tu día" : "Cómo dialogan las cartas",
    overview: reading.question
      ? `Tomamos tu pregunta como marco de reflexión: «${reading.question}»`
      : "La síntesis usa las posiciones y los significados de esta lectura como un mapa de reflexión.",
    relationshipLabel: relation.label,
    relationshipText: relation.text,
    positions: reading.drawn.map((drawn) => ({
      positionKey: drawn.position.key,
      positionLabel: drawn.position.label,
      cardName: drawn.card.name,
      orientationLabel: drawn.reversed ? "Invertida" : "Al derecho",
      text: positionText(drawn),
    })),
    synthesis: synthesisText(reading),
    reflectionQuestion: reflectionQuestion(reading),
  };
}
