import type { HoroscopePeriod } from "@/types/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";

interface SignEditorialLens {
  centralIdea: string;
  context: string;
  whyItMatters: string;
  observe: string;
  question: string;
}

export interface HoroscopeEditorialGuide {
  periodLabel: string;
  timeframe: string;
  opening: string;
  contextTitle: string;
  context: string;
  whyTitle: string;
  whyItMatters: string;
  observeTitle: string;
  observe: string;
  reflectionQuestion: string;
}

const SIGN_LENSES: Record<string, SignEditorialLens> = {
  aries: {
    centralIdea: "convertir el impulso en una decisión con dirección",
    context:
      "Tu energía de inicio puede ayudarte a abrir camino, siempre que distingas una respuesta rápida de una acción verdaderamente necesaria.",
    whyItMatters:
      "Cuando actúas sin perder de vista el propósito, tu iniciativa deja de sentirse como prisa y se convierte en una forma de claridad.",
    observe:
      "Observa qué deseo de avanzar nace de una convicción y cuál aparece solo para evitar una pausa incómoda.",
    question: "¿Qué merece una iniciativa hoy y qué necesita primero un momento de preparación?",
  },
  tauro: {
    centralIdea: "dar valor a lo que puede sostenerse en el tiempo",
    context:
      "Tu mirada práctica puede ayudarte a elegir lo esencial, especialmente cuando el entorno te invita a cambiar de rumbo demasiado deprisa.",
    whyItMatters:
      "La estabilidad no consiste en mantenerlo todo igual, sino en reconocer qué base te permite cambiar sin perderte.",
    observe:
      "Observa si estás cuidando una necesidad real o defendiendo una costumbre que ya no te sirve.",
    question: "¿Qué quieres conservar porque te nutre y qué mantienes solo por familiaridad?",
  },
  geminis: {
    centralIdea: "ordenar la curiosidad para encontrar una idea útil",
    context:
      "Tu capacidad para conectar temas y conversaciones es una ventaja cuando la diriges hacia una pregunta concreta en lugar de repartir tu atención sin medida.",
    whyItMatters:
      "Nombrar lo que de verdad quieres comprender reduce el ruido y permite que tu flexibilidad se convierta en aprendizaje.",
    observe:
      "Observa qué conversación amplía tu perspectiva y cuál solo te mantiene saltando entre posibilidades.",
    question: "¿Qué pregunta merece hoy toda tu atención, aunque todavía no tengas la respuesta?",
  },
  cancer: {
    centralIdea: "cuidar sin desaparecer dentro de las necesidades ajenas",
    context:
      "Tu sensibilidad registra matices que otras personas pueden pasar por alto; el reto consiste en escuchar esos matices sin convertirlos automáticamente en una responsabilidad.",
    whyItMatters:
      "Poner límites también es una forma de cuidado: protege la energía con la que acompañas a quienes sí necesitan tu presencia.",
    observe:
      "Observa dónde estás ofreciendo apoyo por elección y dónde lo haces por miedo a decepcionar.",
    question: "¿Qué necesitas pedir o delimitar para poder cuidar de ti con la misma atención?",
  },
  leo: {
    centralIdea: "expresarte desde la autenticidad y no desde la aprobación",
    context:
      "Tu deseo de crear y dejar una huella puede abrir conversaciones valiosas cuando no depende de que todo el mundo confirme tu valor.",
    whyItMatters:
      "La expresión se vuelve más libre cuando tu voz no necesita competir: basta con que sea honesta y esté bien dirigida.",
    observe:
      "Observa qué proyecto o gesto nace de la alegría de compartir y cuál busca una validación inmediata.",
    question: "¿Qué expresarías hoy si no tuvieras que demostrar nada a nadie?",
  },
  virgo: {
    centralIdea: "usar la precisión para avanzar, no para exigirte perfección",
    context:
      "Tu atención al detalle puede convertir una intención grande en un paso concreto, siempre que no convierta cada avance en una nueva prueba que superar.",
    whyItMatters:
      "Diferenciar mejora de perfeccionismo te permite cuidar la calidad sin posponer indefinidamente aquello que ya está listo para empezar.",
    observe: "Observa qué ajuste aporta claridad y cuál es solo una forma de aplazar la decisión.",
    question: "¿Cuál es el siguiente paso suficientemente bueno que puedes realizar hoy?",
  },
  libra: {
    centralIdea: "buscar equilibrio sin ceder tu propio criterio",
    context:
      "Tu capacidad para considerar varios puntos de vista es valiosa, pero necesita un centro interno desde el que puedas elegir.",
    whyItMatters:
      "La armonía que depende de callarte termina pesando; la armonía que incluye tu posición puede sostener relaciones más honestas.",
    observe:
      "Observa si estás negociando desde el respeto mutuo o evitando una incomodidad necesaria.",
    question: "¿Qué parte de tu opinión necesita ser escuchada para que el equilibrio sea real?",
  },
  escorpio: {
    centralIdea: "mirar la profundidad sin convertirla en sospecha",
    context:
      "Tu intuición para detectar lo que no se dice puede ayudarte a comprender una situación, siempre que separe señales concretas de interpretaciones que aún no puedes comprobar.",
    whyItMatters:
      "La profundidad es una herramienta cuando abre comprensión; se vuelve una carga cuando te obliga a investigar cada silencio.",
    observe:
      "Observa qué información tienes realmente y qué historia estás completando por protección.",
    question:
      "¿Qué verdad puedes mirar de frente sin necesitar controlar todo lo que ocurra después?",
  },
  sagitario: {
    centralIdea: "ampliar tu horizonte sin saltarte el presente",
    context:
      "Tu impulso por aprender y explorar puede devolverte la perspectiva, pero una visión amplia también necesita un paso concreto que la aterrice.",
    whyItMatters:
      "Una dirección no se construye solo con entusiasmo: se fortalece cuando tus ideas encuentran una práctica repetible.",
    observe:
      "Observa qué posibilidad te inspira a crecer y cuál funciona únicamente como escape de una tarea pendiente.",
    question: "¿Qué pequeño movimiento puede acercarte hoy al horizonte que estás imaginando?",
  },
  capricornio: {
    centralIdea: "construir con ambición sin dejar fuera tu bienestar",
    context:
      "Tu sentido de responsabilidad puede darte estructura en momentos complejos, pero no todo debe resolverse a través del esfuerzo individual.",
    whyItMatters:
      "Una meta sostenible incluye pausas, ayuda y límites; de lo contrario, el logro termina costando más de lo que aporta.",
    observe:
      "Observa qué compromiso es realmente prioritario y qué carga estás aceptando por inercia.",
    question: "¿Qué estructura te ayudaría a avanzar sin tratar tu descanso como un premio lejano?",
  },
  acuario: {
    centralIdea: "proteger tu visión sin aislarla del vínculo",
    context:
      "Tu forma original de observar el mundo puede encontrar soluciones nuevas cuando compartes tus ideas con personas capaces de enriquecerlas, no solo de aprobarlas.",
    whyItMatters:
      "La independencia se vuelve más fértil cuando permite colaboración sin renunciar a la propia mirada.",
    observe:
      "Observa qué diferencia quieres defender y qué conversación podría ayudarte a desarrollarla.",
    question: "¿Qué idea merece ser compartida para que pueda crecer más allá de ti?",
  },
  piscis: {
    centralIdea: "dar forma concreta a tu intuición",
    context:
      "Tu sensibilidad puede recoger el tono de un momento con gran precisión, pero necesita límites y lenguaje para no confundirse con todo lo que te rodea.",
    whyItMatters:
      "Cuando conviertes una percepción en una decisión pequeña, tu intuición deja de ser solo sensación y se vuelve orientación práctica.",
    observe:
      "Observa qué emoción te pertenece y cuál estás absorbiendo del entorno sin darte cuenta.",
    question: "¿Qué intuición puedes traducir hoy en un gesto claro y amable contigo?",
  },
};

const PERIOD_COPY: Record<HoroscopePeriod, { label: string; timeframe: string }> = {
  daily: { label: "hoy", timeframe: "En las próximas horas" },
  weekly: { label: "esta semana", timeframe: "Durante los próximos días" },
  monthly: { label: "este mes", timeframe: "A lo largo de este mes" },
};

export function getHoroscopeEditorial(
  signSlug: string,
  period: HoroscopePeriod,
): HoroscopeEditorialGuide {
  const sign = zodiacSigns.find((item) => item.slug === signSlug);
  const lens = SIGN_LENSES[signSlug] ?? SIGN_LENSES.aries;
  const copy = PERIOD_COPY[period];
  const signName = sign?.name ?? "tu signo";

  return {
    periodLabel: copy.label,
    timeframe: copy.timeframe,
    opening: `Para ${signName}, ${copy.label} el foco está en ${lens.centralIdea}.`,
    contextTitle: `Qué puede estar pasando`,
    context: `${copy.timeframe}, esta lectura puede ayudarte a situar esa clave en tu experiencia. ${lens.context}`,
    whyTitle: "Por qué puede importarte",
    whyItMatters: lens.whyItMatters,
    observeTitle: "Qué observar en la práctica",
    observe: lens.observe,
    reflectionQuestion: lens.question,
  };
}
