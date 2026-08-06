/**
 * Configuración editorial de la Home (YAML 04).
 * Solo contiene textos y flags exclusivos de la Home.
 * Los textos repetibles viven en copy.ts, las rutas en routes.ts,
 * los iconos en icons.ts y los signos en data/zodiac-signs.ts.
 */
import type { IconName } from "@/config/icons";
import type { RouteKey } from "@/config/routes";
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
    "zodiac_selector",
    "daily_insight",
    "featured_tarot",
    "moon_today",
    "compatibility",
    "featured_guides",
    "topics",
    "personal_space",
    "newsletter",
  ] as const satisfies readonly HomeSectionId[],

  enabled: {
    hero: true,
    zodiac_selector: true,
    daily_insight: false,
    featured_tarot: true,
    moon_today: isPublicFeatureEnabled("moonToday"),
    compatibility: isPublicFeatureEnabled("compatibility"),
    featured_guides: true,
    topics: true,
    personal_space: isPublicFeatureEnabled("account"),
    newsletter: true,
  } as const satisfies Record<HomeSectionId, boolean>,

  hero: {
    eyebrow: "Tarot y ciclos lunares",
    title: "Tarot, luna y guías para comprender tu momento",
    description:
      "Cartas de tarot, ciclos lunares y guías editoriales para observar tu momento con claridad.",
    primaryAction: {
      label: "Sacar una carta",
      routeKey: "tarotDaily",
      icon: "tarot",
      variant: "primary",
    } satisfies HomeAction,
    secondaryAction: {
      label: "Explorar tiradas",
      routeKey: "tarot",
      icon: "premium",
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
    eyebrow: "Tu lectura de hoy",
    title: "Una mirada para comenzar el día",
    description: "Explora una orientación breve para tu signo y una carta simbólica de tarot.",
    defaultSignSlug: "aries",
    storageKey: "preferred-zodiac-sign",
  },

  moonToday: {
    eyebrow: "Ciclo lunar",
    title: "La luna de hoy",
    action: {
      label: "Descubrir la luna de hoy",
      routeKey: "moonToday",
      variant: "secondary_on_dark",
    } satisfies HomeAction,
  },

  compatibility: {
    eyebrow: "Relaciones",
    title: "Explora vuestra compatibilidad",
    description:
      "Selecciona dos signos para conocer una primera aproximación a su dinámica emocional y comunicativa.",
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
    title:
      "Elige un tema, conecta con tu situación y descubre una orientación simbólica a través de tres cartas.",
    action: {
      label: "Ver tarot",
      href: "/tarot",
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
        href: "/tarot/tres-cartas/amor",
        image: "/amor.webp",
      },
      {
        slug: "trabajo",
        title: "Trabajo",
        description:
          "Observa tu situación laboral, los desafíos presentes y el próximo paso práctico.",
        status: "enabled",
        ctaLabel: "Comenzar tirada",
        href: "/tarot/tres-cartas/trabajo",
        image: "/trabajo.webp",
      },
      {
        slug: "decision",
        title: "Decisiones",
        description:
          "Comprende qué impulsa tu elección, qué debes considerar y desde dónde decidir.",
        status: "enabled",
        ctaLabel: "Comenzar tirada",
        href: "/tarot/tres-cartas/decision",
        image: "/decision.webp",
      },
    ],
  },
} as const;

export type HomeConfig = typeof homeConfig;
