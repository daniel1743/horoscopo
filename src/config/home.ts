/**
 * Configuración editorial de la Home (YAML 04).
 * Solo contiene textos y flags exclusivos de la Home.
 * Los textos repetibles viven en copy.ts, las rutas en routes.ts,
 * los iconos en icons.ts y los signos en data/zodiac-signs.ts.
 */
import type { IconName } from "@/config/icons";
import { routes, type RouteKey } from "@/config/routes";
import { isPublicFeatureEnabled } from "@/config/public-features";

export type HomeSectionId =
  | "hero"
  | "zodiac_selector"
  | "daily_insight"
  | "featured_tarot"
  | "moon_today"
  | "compatibility"
  | "featured_guides"
  | "topics"
  | "personal_space"
  | "newsletter";

export interface HomeAction {
  label: string;
  routeKey?: RouteKey;
  href?: string;
  icon?: IconName;
  variant: "primary" | "secondary" | "secondary_on_dark" | "ghost_on_dark" | "premium";
}

export const homeConfig = {
  sectionOrder: [
    "hero",
    "daily_insight",
    "compatibility",
    "featured_tarot",
    "zodiac_selector",
    "featured_guides",
    "topics",
    "personal_space",
    "newsletter",
  ] as const satisfies readonly HomeSectionId[],

  enabled: {
    hero: true,
    zodiac_selector: true,
    daily_insight: true,
    featured_tarot: true,
    moon_today: false,
    compatibility: isPublicFeatureEnabled("compatibility"),
    featured_guides: false,
    topics: true,
    personal_space: isPublicFeatureEnabled("account"),
    newsletter: false,
  } as const satisfies Record<HomeSectionId, boolean>,

  hero: {
    eyebrow: "Tarot y ciclos lunares",
    title: "Tarot y luna para entender tu momento",
    description: "Consulta una carta, mira la luna de hoy y vuelve cuando el cielo cambie.",
    primaryAction: {
      label: "Sacar mi carta de hoy",
      routeKey: "tarotDaily",
      icon: "tarot",
      variant: "primary",
    } satisfies HomeAction,
    secondaryAction: {
      label: "Ver mi horóscopo de hoy",
      routeKey: "horoscopeToday",
      icon: "sun",
      variant: "secondary_on_dark",
    } satisfies HomeAction,
    showZodiacQuickSelect: false,
    quickSelectLabel: "Selecciona tu signo",
    imageAlt: "Ilustración editorial celestial con luna, constelaciones y geometría astral.",
  },

  zodiacSelector: {
    title: "Elige tu signo",
    description: "Conoce tu horóscopo y descubre lo que los astros deparan para ti.",
    showDates: true,
  },

  dailyInsight: {
    eyebrow: "Hoy",
    title: "Tu momento de hoy",
    description:
      "Un resumen vivo para entrar rápido: tu signo guardado, la luna actual y una carta diaria.",
    defaultSignSlug: "aries",
    storageKey: "preferred-zodiac-sign",
  },

  moonToday: {
    eyebrow: "Consulta lunar personalizada",
    title: "Tu luna hoy",
    description:
      "Ingresa tu fecha de nacimiento y recibe una lectura del tránsito lunar actual. Si inicias sesión, puedes guardarla en tus lecturas lunares.",
    action: {
      label: "Consultar mi luna",
      routeKey: "moonPersonalToday",
      variant: "secondary_on_dark",
    } satisfies HomeAction,
  },

  compatibility: {
    eyebrow: "Compatibilidad entre signos",
    title: "Compara cualquier pareja zodiacal",
    description:
      "Selecciona dos signos y descubre su dinámica emocional, comunicación, atracción y desafíos. Las 78 combinaciones canónicas están disponibles.",
    firstLabel: "Tu signo",
    secondLabel: "El otro signo",
    action: {
      label: "Ver compatibilidad",
      variant: "primary",
    } satisfies HomeAction,
  },

  featuredGuides: {
    eyebrow: "Aprender",
    title: "Guías para comprenderte mejor",
    description: "Conceptos de astrología y tarot explicados de forma clara, práctica y accesible.",
    maxItems: 4,
    action: {
      label: "Ver todo",
      routeKey: "guides",
      variant: "secondary",
    } satisfies HomeAction,
  },

  topics: {
    eyebrow: "Explora según tu momento",
    title: "¿Qué deseas comprender?",
    description:
      "Encuentra contenido organizado según las preguntas que pueden estar acompañándote ahora.",
    maxItems: 6,
  },

  personalSpace: {
    eyebrow: "Tu experiencia",
    title: "Tu universo personal, reunido en un solo lugar",
    description:
      "Guarda tus lecturas, organiza tus favoritos y prepara una experiencia más personalizada.",
    action: {
      label: "Abrir mi espacio",
      routeKey: "account",
      variant: "premium",
    } satisfies HomeAction,
    imageAlt: "Vista conceptual del espacio personal de la plataforma.",
  },

  newsletter: {
    title: "Recibe una lectura editorial cada semana",
    description:
      "Ensayos breves sobre astrología, tarot y ciclos lunares. Sin ruido, sin promesas absolutas.",
    submitLabel: "Suscribirme",
    privacyHelper:
      "Al suscribirte aceptas recibir contenido editorial. Puedes darte de baja en cualquier momento.",
    privacyRouteKey: "privacy" as RouteKey,
  },

  featuredTarot: {
    eyebrow: "Tiradas destacadas",
    title: "Elige una tirada y deja que las cartas hablen primero.",
    action: {
      label: "Ver tarot",
      href: routes.tarot,
      variant: "secondary",
    } satisfies HomeAction,
    items: [
      {
        slug: "amor",
        title: "Amor",
        description:
          "Explora tu mundo emocional, la dinámica afectiva y una orientación para avanzar.",
        status: "enabled",
        ctaLabel: "Comenzar tirada",
        href: routes.tarotThreeCardsAmor,
        image: "/amor.webp",
      },
      {
        slug: "trabajo",
        title: "Trabajo",
        description:
          "Observa tu situación laboral, los desafíos presentes y el próximo paso práctico.",
        status: isPublicFeatureEnabled("tarotThreeCardsTrabajo") ? "enabled" : "hidden",
        ctaLabel: "Comenzar tirada",
        href: routes.tarotThreeCardsTrabajo,
        image: "/trabajo.webp",
      },
      {
        slug: "decision",
        title: "Decisiones",
        description:
          "Comprende qué impulsa tu elección, qué debes considerar y desde dónde decidir.",
        status: isPublicFeatureEnabled("tarotThreeCardsDecision") ? "enabled" : "hidden",
        ctaLabel: "Comenzar tirada",
        href: routes.tarotThreeCardsDecision,
        image: "/decision.webp",
      },
    ],
  },
} as const;

export type HomeConfig = typeof homeConfig;
