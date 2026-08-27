/**
 * Datos de DEMOSTRACIÓN para la Home (YAML 04).
 * NO son datos astronómicos reales. Deben ser reemplazables por API/CMS.
 * Tipados estrictamente y estables entre renders (nunca Math.random).
 */
import { editorialTopicRoute } from "@/config/editorial";
import type { IconName } from "@/config/icons";

/* ---------------- Horóscopo diario (mock) ---------------- */

export interface DailyHoroscopeEntry {
  signSlug: string;
  focus: string;
  mood: string;
  energy: 1 | 2 | 3 | 4 | 5;
  summary: string;
}

export const dailyHoroscopes: readonly DailyHoroscopeEntry[] = [
  {
    signSlug: "aries",
    focus: "Claridad",
    mood: "Movimiento",
    energy: 4,
    summary:
      "Este puede ser un buen momento para ordenar tus prioridades antes de actuar. La energía del día favorece las conversaciones directas, siempre que dejes espacio para escuchar.",
  },
  {
    signSlug: "tauro",
    focus: "Constancia",
    mood: "Serenidad",
    energy: 3,
    summary:
      "Un día para volver a lo que sostiene tu ritmo. Cuidar los detalles cotidianos puede tener más impacto del que imaginas.",
  },
  {
    signSlug: "geminis",
    focus: "Diálogo",
    mood: "Curiosidad",
    energy: 4,
    summary:
      "Las ideas circulan con soltura. Un intercambio breve puede abrirte una perspectiva que llevabas tiempo buscando.",
  },
  {
    signSlug: "cancer",
    focus: "Presencia",
    mood: "Ternura",
    energy: 3,
    summary:
      "Escucha lo que tus emociones intentan decirte sin apurarlas. La calma será una forma de cuidarte y de cuidar a quienes te rodean.",
  },
  {
    signSlug: "leo",
    focus: "Expresión",
    mood: "Cálido",
    energy: 4,
    summary:
      "Puedes ocupar tu lugar sin esfuerzo. La generosidad con la que compartes hoy volverá en formas que no esperas.",
  },
  {
    signSlug: "virgo",
    focus: "Precisión",
    mood: "Concentración",
    energy: 3,
    summary:
      "Un pequeño ajuste puede resolver algo que llevaba tiempo pendiente. Confía en tu manera de ordenar las cosas.",
  },
  {
    signSlug: "libra",
    focus: "Equilibrio",
    mood: "Diplomático",
    energy: 3,
    summary:
      "Buscar acuerdos no significa ceder. Encontrarás la palabra justa para sostener tu posición sin romper vínculos.",
  },
  {
    signSlug: "escorpio",
    focus: "Profundidad",
    mood: "Intenso",
    energy: 4,
    summary:
      "Algo que había quedado en pausa vuelve a moverse. Observa qué te dice esa emoción antes de tomar una decisión.",
  },
  {
    signSlug: "sagitario",
    focus: "Horizonte",
    mood: "Expansivo",
    energy: 5,
    summary:
      "Se abre espacio para pensar en grande. Anota lo que hoy te entusiasme: será material valioso para los próximos días.",
  },
  {
    signSlug: "capricornio",
    focus: "Estructura",
    mood: "Constante",
    energy: 3,
    summary:
      "Avanza un paso a la vez. Lo que hoy parece lento está construyendo una base más firme de lo que crees.",
  },
  {
    signSlug: "acuario",
    focus: "Visión",
    mood: "Creativo",
    energy: 4,
    summary:
      "Una idea distinta puede resolver un problema viejo. No la descartes por poco convencional.",
  },
  {
    signSlug: "piscis",
    focus: "Intuición",
    mood: "Reflexivo",
    energy: 3,
    summary:
      "Escucha lo que aparece en silencio. Hoy la sensibilidad puede ser una herramienta útil, no una carga.",
  },
] as const;

export const getDailyHoroscope = (slug: string): DailyHoroscopeEntry =>
  dailyHoroscopes.find((h) => h.signSlug === slug) ?? dailyHoroscopes[0];

/* ---------------- Tarot del día (mock estable) ---------------- */

export interface DailyTarotEntry {
  cardSlug: string;
  cardName: string;
  shortMessage: string;
  reflection: string;
}

export const dailyTarot: DailyTarotEntry = {
  cardSlug: "la-estrella",
  cardName: "La Estrella",
  shortMessage:
    "Después de un tiempo denso, aparece una guía silenciosa. Es una invitación a confiar sin apurar los procesos.",
  reflection: "¿Qué necesito soltar para dejar entrar algo más claro?",
};

/* ---------------- Luna de hoy (mock) ---------------- */

export interface MoonToday {
  phaseKey: string;
  phaseName: string;
  illumination: number;
  zodiacSign: string;
  message: string;
}

export const moonToday: MoonToday = {
  phaseKey: "waxing_crescent",
  phaseName: "Luna creciente",
  illumination: 34,
  zodiacSign: "Libra",
  message:
    "Un ciclo favorable para avanzar con paciencia y observar qué decisiones necesitan equilibrio.",
};

/* ---------------- Guías destacadas (mock) ---------------- */

export type GuideCategoryKey = "astrology" | "moon" | "tarot" | "compatibility" | "editorial";

export interface FeaturedGuide {
  slug: string;
  title: string;
  excerpt: string;
  categoryKey: GuideCategoryKey;
  categoryLabel: string;
  readingTime: number;
  gradient: string;
}

export const featuredGuides: readonly FeaturedGuide[] = [
  {
    slug: "como-conocer-tu-ascendente",
    title: "Cómo conocer tu ascendente y qué representa",
    excerpt:
      "Una introducción clara para comprender la forma en que te presentas y respondes al mundo.",
    categoryKey: "astrology",
    categoryLabel: "Astrología",
    readingTime: 7,
    gradient: "linear-gradient(135deg, var(--brand-violet) 0%, var(--bg-deep-night-elevated) 100%)",
  },
  {
    slug: "significado-luna-carta-natal",
    title: "Qué representa la Luna en tu carta natal",
    excerpt:
      "Aprende cómo este símbolo se relaciona con tus necesidades emocionales y tus formas de protección.",
    categoryKey: "moon",
    categoryLabel: "Luna",
    readingTime: 6,
    gradient: "linear-gradient(135deg, var(--accent-celestial-blue) 0%, var(--bg-deep-night) 100%)",
  },
  {
    slug: "tarot-para-principiantes",
    title: "Tarot para principiantes: cómo empezar sin complicarte",
    excerpt: "Conoce las bases de una lectura simbólica y cómo formular preguntas más útiles.",
    categoryKey: "tarot",
    categoryLabel: "Tarot",
    readingTime: 8,
    gradient:
      "linear-gradient(135deg, var(--accent-astral-rose) 0%, var(--bg-deep-night-elevated) 100%)",
  },
  {
    slug: "compatibilidad-entre-signos",
    title: "Qué puede decir realmente la compatibilidad entre signos",
    excerpt: "Una mirada equilibrada a los elementos que intervienen en nuestras relaciones.",
    categoryKey: "compatibility",
    categoryLabel: "Compatibilidad",
    readingTime: 9,
    gradient: "linear-gradient(135deg, var(--accent-lunar-gold) 0%, var(--brand-violet) 100%)",
  },
] as const;

/* ---------------- Exploración por temas ---------------- */

export interface HomeTopic {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  href: string;
}

export const homeTopics: readonly HomeTopic[] = [
  {
    id: "love",
    title: "Amor y relaciones",
    description: "Compatibilidad, vínculos y comunicación emocional.",
    icon: "compatibility",
    href: editorialTopicRoute("amor-y-relaciones"),
  },
  {
    id: "work",
    title: "Trabajo y propósito",
    description: "Decisiones, talentos y dirección profesional.",
    icon: "premium",
    href: editorialTopicRoute("trabajo-y-proposito"),
  },
  {
    id: "money",
    title: "Dinero y decisiones",
    description: "Reflexiones sobre organización, prioridades y recursos.",
    icon: "article",
    href: editorialTopicRoute("dinero-y-decisiones"),
  },
  {
    id: "emotional_wellbeing",
    title: "Bienestar emocional",
    description: "Ciclos internos, descanso y comprensión personal.",
    icon: "moon",
    href: editorialTopicRoute("bienestar-emocional"),
  },
  {
    id: "personal_growth",
    title: "Crecimiento personal",
    description: "Herramientas simbólicas para conocerte mejor.",
    icon: "article",
    href: editorialTopicRoute("crecimiento-personal"),
  },
  {
    id: "changes",
    title: "Ciclos y cambios",
    description: "Luna, tránsitos y momentos de transición.",
    icon: "moon",
    href: editorialTopicRoute("ciclos-y-cambios"),
  },
] as const;

/* ---------------- Beneficios de "Mi espacio" ---------------- */

export interface PersonalBenefit {
  icon: IconName;
  title: string;
  description: string;
}

export const personalBenefits: readonly PersonalBenefit[] = [
  {
    icon: "favorite",
    title: "Guarda tus favoritos",
    description: "Conserva artículos y lecturas para volver a ellos.",
  },
  {
    icon: "history",
    title: "Consulta tu historial",
    description: "Encuentra tus últimas experiencias en un solo lugar.",
  },
  {
    icon: "account",
    title: "Configura tu experiencia",
    description: "Define tu signo y tus datos para volver a encontrar lo que te interesa.",
  },
] as const;
