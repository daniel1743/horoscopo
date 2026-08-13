import { routes, zodiacRoute } from "./routes";
import { getZodiacBySlug } from "@/data/zodiac-signs";
import type {
  PersonalizationContext,
  PersonalizationIntent,
} from "@/lib/account/personalization-context";
import type { IconName } from "@/config/icons";

export type NBASource =
  | "horoscope"
  | "moon"
  | "tarot_daily"
  | "tarot_three_cards"
  | "tarot_yes_no"
  | "compatibility"
  | "moon_phase"
  | "guide";

export interface NBAContext {
  source: NBASource;
  sign?: string; // Sign slug (e.g. "aries")
  userSign?: string;
  otherSign?: string;
  authenticated?: boolean;
  hasBirthData?: boolean;
  readingSaved?: boolean;
  tarotTopic?: string;
  horoscopePeriod?: string;
  dynamicCardSlug?: string;
  personalization?: PersonalizationContext | null;
}

export type NBAActionId =
  "save_reading" | "ask_guide" | "another_reading" | "another_question" | "another_combination";

export interface NBAAction {
  label: string;
  href?: string;
  actionId?: NBAActionId;
  icon?: IconName;
}

export interface NBAResult {
  title?: string;
  description?: string;
  primary?: NBAAction;
  secondary?: NBAAction;
  tertiary?: NBAAction; // text-only discrete action
}

type RankedCandidate = NBAAction & {
  id: "moon" | "horoscope" | "daily_card" | "three_cards";
  score: number;
  title?: string;
  description?: string;
  relatedIntent?: PersonalizationIntent;
};

function isPersonalized(
  context: NBAContext,
): context is NBAContext & { personalization: PersonalizationContext } {
  return Boolean(context.personalization?.enabled && context.personalization.personalized);
}

function currentTarotIntent(context: NBAContext): PersonalizationIntent | null {
  if (context.source === "tarot_daily") return "daily";
  if (context.source === "tarot_yes_no") return "decision";
  if (context.source !== "tarot_three_cards") return null;
  if (context.tarotTopic === "amor") return "love";
  if (context.tarotTopic === "trabajo") return "work";
  if (context.tarotTopic === "decision") return "decision";
  return "general";
}

function rankTarotCandidate(candidate: RankedCandidate, context: NBAContext): RankedCandidate {
  if (!isPersonalized(context)) return candidate;
  const personalization = context.personalization;
  const currentIntent = currentTarotIntent(context);
  let score = candidate.score;

  if (candidate.id === "moon" && personalization.today.moonUsed) score -= 12;
  if (candidate.id === "horoscope" && personalization.today.horoscopeUsed) score -= 10;
  if (candidate.id === "daily_card" && personalization.today.dailyCardUsed) score -= 24;
  if (candidate.id === "moon" && personalization.identity.hasBirthData) score += 8;
  if (candidate.id === "moon" && !personalization.identity.hasBirthData) score -= 20;

  if (currentIntent === "love" && candidate.id === "moon") score += 10;
  if (currentIntent === "work" && candidate.id === "horoscope") score += 10;
  if (currentIntent === "decision" && candidate.id === "daily_card") score += 10;
  if (currentIntent === "daily" && candidate.id === "horoscope") score += 8;

  if (
    currentIntent === "general" &&
    personalization.recent.dominantIntent === candidate.relatedIntent
  ) {
    score += 4;
  }

  return { ...candidate, score };
}

function chooseTarotRecommendation(context: NBAContext, candidates: RankedCandidate[]): NBAResult {
  const ranked = candidates
    .map((candidate) => rankTarotCandidate(candidate, context))
    .sort((a, b) => b.score - a.score);
  const [primary, secondary] = ranked;

  return {
    title: primary?.title ?? "Continúa tu lectura",
    description: primary?.description,
    primary: primary
      ? {
          label: primary.label,
          href: primary.href,
          icon: primary.icon,
        }
      : undefined,
    secondary: secondary
      ? {
          label: secondary.label,
          href: secondary.href,
          icon: secondary.icon,
        }
      : undefined,
  };
}

export function getNextBestAction(context: NBAContext): NBAResult {
  switch (context.source) {
    case "horoscope": {
      const isDaily = context.horoscopePeriod === "hoy" || !context.horoscopePeriod;
      const hasBirthData =
        context.personalization?.identity.hasBirthData ?? context.hasBirthData ?? false;

      if (hasBirthData) {
        return {
          title: "Profundiza tu lectura",
          description: "Conecta tu lectura del Sol con tu mundo emocional de hoy.",
          primary: {
            label: "Tu Luna de Hoy",
            href: routes.moonPersonalToday,
            icon: "moon",
          },
          secondary: {
            label: "Carta del Día",
            href: routes.tarotDaily,
            icon: "premium",
          },
        };
      } else {
        return {
          title: "Enfoca tu día",
          description: "Saca una carta simbólica o explora tus emociones.",
          primary: {
            label: "Carta del Día",
            href: routes.tarotDaily,
            icon: "premium",
          },
          secondary: {
            label: "Descubrir mi Luna",
            href: routes.moonPersonalToday,
            icon: "moon",
          },
        };
      }
    }

    case "moon": {
      return {
        title: "Integra tu lectura",
        description: "Lleva tu mundo emocional a la práctica diaria.",
        primary: {
          label: "Horóscopo de hoy",
          href: routes.horoscopeToday,
          icon: "sun",
        },
        secondary: {
          label: "Guardar lectura",
          actionId: "save_reading",
          icon: "favorite",
        },
      };
    }

    case "tarot_daily": {
      if (isPersonalized(context)) {
        return chooseTarotRecommendation(context, [
          {
            id: "horoscope",
            score: 80,
            label: context.userSign ? "Ver mi horóscopo" : "Horóscopo de hoy",
            href: context.userSign ? zodiacRoute(context.userSign) : routes.horoscopeToday,
            icon: "sun",
            title: "Completa tu día",
            description: "Descubre qué energía acompaña hoy a tu signo.",
          },
          {
            id: "moon",
            score: 72,
            label: "Tu Luna de Hoy",
            href: routes.moonPersonalToday,
            icon: "moon",
            title: "Mira otra capa del día",
            description: "Observa cómo se mueve tu mundo emocional hoy.",
            relatedIntent: "love",
          },
        ]);
      }
      if (context.userSign) {
        const signData = getZodiacBySlug(context.userSign);
        return {
          primary: {
            label: `Horóscopo de ${signData?.name || context.userSign}`,
            href: zodiacRoute(context.userSign),
            icon: "sun",
          },
          secondary: {
            label: "Explorar esta carta",
            href: context.dynamicCardSlug
              ? `/tarot/cartas/${context.dynamicCardSlug}`
              : routes.tarotLibrary,
            icon: "search",
          },
        };
      } else {
        return {
          primary: {
            label: "Ver mi horóscopo",
            href: routes.horoscopeToday,
            icon: "sun",
          },
          secondary: {
            label: "Explorar esta carta",
            href: context.dynamicCardSlug
              ? `/tarot/cartas/${context.dynamicCardSlug}`
              : routes.tarotLibrary,
            icon: "search",
          },
        };
      }
    }

    case "tarot_three_cards": {
      if (isPersonalized(context)) {
        const topic = context.tarotTopic;
        if (topic === "trabajo") {
          return chooseTarotRecommendation(context, [
            {
              id: "horoscope",
              score: 86,
              label: "Horóscopo de hoy",
              href: routes.horoscopeToday,
              icon: "sun",
              title: "Lleva la lectura al día",
              description: "Descubre qué energía acompaña hoy a tu signo.",
            },
            {
              id: "daily_card",
              score: 74,
              label: "Carta del Día",
              href: routes.tarotDaily,
              icon: "premium",
              title: "Una señal breve",
              description: "Contrasta esta lectura con una carta simple para hoy.",
            },
          ]);
        }
        if (topic === "decision") {
          return chooseTarotRecommendation(context, [
            {
              id: "daily_card",
              score: 86,
              label: "Carta del Día",
              href: routes.tarotDaily,
              icon: "premium",
              title: "Una señal breve",
              description: "Contrasta esta decisión con una carta simple para hoy.",
            },
            {
              id: "horoscope",
              score: 76,
              label: "Horóscopo de hoy",
              href: routes.horoscopeToday,
              icon: "sun",
              title: "Mira el clima del día",
              description: "Observa qué energía general acompaña tu momento.",
            },
          ]);
        }
        return chooseTarotRecommendation(context, [
          {
            id: "moon",
            score: topic === "amor" ? 86 : 78,
            label: "Tu Luna de Hoy",
            href: routes.moonPersonalToday,
            icon: "moon",
            title: topic === "amor" ? "Mira tu mundo emocional" : "Mira otra capa del día",
            description:
              topic === "amor"
                ? "Observa esta lectura desde una perspectiva emocional."
                : "Conecta esta lectura con la energía lunar actual.",
            relatedIntent: "love",
          },
          {
            id: "horoscope",
            score: 78,
            label: "Horóscopo de hoy",
            href: routes.horoscopeToday,
            icon: "sun",
            title: "Completa tu día",
            description: "Descubre qué energía acompaña hoy a tu signo.",
          },
          {
            id: "daily_card",
            score: 72,
            label: "Carta del Día",
            href: routes.tarotDaily,
            icon: "premium",
            title: "Una señal breve",
            description: "Contrasta esta lectura con una carta simple para hoy.",
          },
        ]);
      }
      return {
        title: "Lleva la lectura al día",
        description: "Contrasta esta lectura profunda con la energía de hoy.",
        primary: {
          label: "Horóscopo de hoy",
          href: routes.horoscopeToday,
          icon: "sun",
        },
        secondary: {
          label: "Carta del Día",
          href: routes.tarotDaily,
          icon: "premium",
        },
      };
    }

    case "tarot_yes_no": {
      if (isPersonalized(context)) {
        return chooseTarotRecommendation(context, [
          {
            id: "three_cards",
            score: 90,
            label: "Tres Cartas",
            href: routes.tarotThreeCardsDecision,
            icon: "premium",
            title: "¿Necesitas más claridad?",
            description: "Profundiza esta orientación con tres cartas.",
          },
          {
            id: "daily_card",
            score: 66,
            label: "Carta del Día",
            href: routes.tarotDaily,
            icon: "premium",
            title: "Una señal breve",
            description: "Observa otra señal simple para este momento.",
          },
        ]);
      }
      return {
        title: "¿Necesitas más claridad?",
        description: "Profundiza esta orientación con tres cartas.",
        primary: {
          label: "Tres Cartas",
          href: routes.tarotThreeCardsDecision,
          icon: "premium",
        },
        secondary: {
          label: "Carta del Día",
          href: routes.tarotDaily,
          icon: "premium",
        },
      };
    }

    case "compatibility": {
      const userSign = context.personalization?.enabled
        ? context.personalization.identity.sunSign
        : null;

      if (userSign) {
        return {
          title: "Vuelve a tu energía de hoy",
          description: "Toda relación empieza por uno mismo.",
          primary: {
            label: "Ver mi horóscopo de hoy",
            href: zodiacRoute(userSign),
            icon: "sun",
          },
          secondary: {
            label: "Probar otra combinación",
            actionId: "another_combination",
            icon: "reset",
          },
        };
      } else {
        return {
          title: "Continúa explorando",
          description: "Vuelve al foco individual.",
          primary: {
            label: "Mira qué energía acompaña hoy a tu signo",
            href: routes.horoscope,
            icon: "sun",
          },
          secondary: {
            label: "Probar otra combinación",
            actionId: "another_combination",
            icon: "reset",
          },
        };
      }
    }

    case "moon_phase": {
      return {
        title: "Tu conexión lunar",
        description: "Descubre cómo esta fase afecta tu energía natal.",
        primary: {
          label: "Descubrir mi Luna de Hoy",
          href: routes.moonPersonalToday,
          icon: "moon",
        },
      };
    }

    case "guide":
    default:
      return {};
  }
}
