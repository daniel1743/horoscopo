/**
 * Configuración central del tarot.
 * Fuente única para tiradas, posiciones, umbrales y claves de almacenamiento.
 * Los componentes NO definen tiradas ni tocan sessionStorage con claves libres.
 */
import type { IconName } from "@/config/icons";
import type { TarotSpreadDefinition, TarotSpreadKey, TarotYesNoTendency } from "@/types/tarot";

export const tarotDeckConfig = {
  initialMode: "major_arcana" as const,
  reversalsEnabled: false,
  minimumCards: {
    development: 6,
    production: 22,
  },
  incompleteMessage: "Estamos completando la baraja antes de habilitar las lecturas.",
} as const;

export const tarotQuestionLimits = {
  optional: true,
  minCharacters: 0,
  maxCharacters: 240,
  trim: true,
  storeInDatabase: false,
  sendToAnalytics: false,
} as const;

export const tarotStorageKeys = {
  daily: {
    card: "tarot-daily-card",
    date: "tarot-daily-date",
    anonymousSeed: "tarot-anonymous-seed",
  },
  session: {
    yesNo: "tarot-reading-yes-no",
    threeCards: "tarot-reading-three-cards",
  },
} as const;

export const tarotSpreads: Record<TarotSpreadKey, TarotSpreadDefinition> = {
  daily: {
    key: "daily",
    routeKey: "tarotDaily",
    label: "Carta del día",
    description: "Una carta para abrir una reflexión breve sobre el presente.",
    numberOfCards: 1,
    icon: "sun",
    positions: [
      {
        key: "daily_message",
        label: "Mensaje para hoy",
        description: "Una lectura breve para mirar el día con más atención.",
      },
    ],
  },
  yes_no: {
    key: "yes_no",
    routeKey: "tarotYesNo",
    label: "Tarot sí o no",
    description:
      "Una orientación simbólica que puede sugerir avance, cautela o necesidad de observar más.",
    numberOfCards: 1,
    icon: "premium",
    positions: [
      {
        key: "orientation",
        label: "Orientación",
        description:
          "Una lectura simbólica que puede sugerir avance, cautela o necesidad de observar más.",
      },
    ],
  },
  three_cards: {
    key: "three_cards",
    routeKey: "tarotThreeCards",
    label: "Tirada de tres cartas",
    description:
      "Tres perspectivas: lo que influye, lo que conviene observar y un posible próximo paso.",
    numberOfCards: 3,
    icon: "tarot",
    positions: [
      {
        key: "influence",
        label: "Lo que influye",
        description: "El contexto o energía que está presente.",
      },
      {
        key: "observation",
        label: "Lo que conviene observar",
        description: "Un aspecto que puede requerir atención.",
      },
      {
        key: "next_step",
        label: "Próximo paso",
        description: "Una posibilidad de acción o reflexión.",
      },
    ],
  },
};

export const enabledSpreadKeys: readonly TarotSpreadKey[] = [
  "daily",
  "yes_no",
  "three_cards",
] as const;

export const tarotDisclaimer =
  "El tarot no sustituye decisiones profesionales, médicas, legales o financieras. Úsalo como una herramienta de reflexión personal.";

export const tarotThreeCardsSynthesis =
  "Observa cómo se relacionan las tres cartas. La lectura puede ser más útil cuando conectas sus símbolos con hechos concretos de tu situación actual.";

export const tarotHowToUsePoints: readonly string[] = [
  "Formula una pregunta clara y abierta.",
  "Observa qué ideas te despierta la carta.",
  "Relaciona el símbolo con tu contexto real.",
  "No delegues decisiones importantes únicamente en una tirada.",
];

export const yesNoLabels: Record<TarotYesNoTendency, { display: string; description: string }> = {
  favorable: {
    display: "Más cerca de sí",
    description:
      "La carta sugiere apertura o avance, aunque la decisión continúa dependiendo de tu situación y criterio.",
  },
  caution: {
    display: "Más cerca de la cautela",
    description:
      "La carta invita a detenerte, revisar información o evitar una decisión impulsiva.",
  },
  open: {
    display: "Todavía está abierto",
    description:
      "Puede que falte información o que la respuesta dependa de cómo evolucione la situación.",
  },
};

/** Umbral mínimo de cartas publicadas según entorno. */
export function minimumCardsForCurrentEnv(): number {
  return import.meta.env.PROD
    ? tarotDeckConfig.minimumCards.production
    : tarotDeckConfig.minimumCards.development;
}

export type TarotIconName = Extract<IconName, "sun" | "premium" | "tarot">;
