import type { RouteKey } from "@/config/routes";

export type PublicFeatureStatus = "enabled" | "coming_soon" | "hidden";

export type PublicFeatureKey =
  | "home"
  | "tarot"
  | "tarotDaily"
  | "tarotYesNo"
  | "tarotThreeCards"
  | "tarotThreeCardsAmor"
  | "tarotThreeCardsTrabajo"
  | "tarotThreeCardsDecision"
  | "tarotOptionalQuestion"
  | "tarotLibrary"
  | "moon"
  | "moonToday"
  | "moonCalendar"
  | "moonPhases"
  | "guides"
  | "search"
  | "account"
  | "assistant"
  | "horoscope"
  | "astrology"
  | "compatibility"
  | "informational"
  | "legal";

export const publicFeatureVisibility: Record<PublicFeatureKey, PublicFeatureStatus> = {
  home: "enabled",
  tarot: "enabled",
  tarotDaily: "enabled",
  tarotYesNo: "enabled",
  tarotThreeCards: "enabled",
  tarotThreeCardsAmor: "enabled",
  tarotThreeCardsTrabajo: "hidden",
  tarotThreeCardsDecision: "hidden",
  /** TODO: Reactivar cuando la pregunta influya realmente en la interpretación o personalización de la tirada. */
  tarotOptionalQuestion: "hidden",
  tarotLibrary: "enabled",
  moon: "enabled",
  moonToday: "enabled",
  moonCalendar: "enabled",
  moonPhases: "enabled",
  guides: "enabled",
  search: "enabled",
  account: "hidden",
  assistant: "hidden",
  horoscope: "hidden",
  astrology: "hidden",
  compatibility: "hidden",
  informational: "hidden",
  legal: "enabled",
};

export const routeFeatureMap: Partial<Record<RouteKey, PublicFeatureKey>> = {
  home: "home",
  tarot: "tarot",
  tarotDaily: "tarotDaily",
  tarotYesNo: "tarotYesNo",
  tarotThreeCards: "tarotThreeCards",
  tarotThreeCardsAmor: "tarotThreeCardsAmor",
  tarotLibrary: "tarotLibrary",
  moon: "moon",
  moonToday: "moonToday",
  moonCalendar: "moonCalendar",
  moonPhases: "moonPhases",
  guides: "guides",
  search: "search",
  account: "account",
  profile: "account",
  favorites: "account",
  savedReadings: "account",
  history: "account",
  settings: "account",
  privacySettings: "account",
  accountMemory: "account",
  assistant: "assistant",
  horoscope: "horoscope",
  horoscopeToday: "horoscope",
  horoscopeWeek: "horoscope",
  horoscopeMonth: "horoscope",
  astrology: "astrology",
  birthChart: "astrology",
  ascendant: "astrology",
  moonSign: "astrology",
  compatibility: "compatibility",
  about: "informational",
  method: "guides",
  help: "informational",
  contact: "informational",
  privacy: "legal",
  terms: "legal",
  cookies: "legal",
  disclaimer: "legal",
};

export function getPublicFeatureStatus(feature: PublicFeatureKey): PublicFeatureStatus {
  return publicFeatureVisibility[feature];
}

export function isPublicFeatureEnabled(feature: PublicFeatureKey): boolean {
  return getPublicFeatureStatus(feature) === "enabled";
}

export function isRoutePubliclyEnabled(routeKey: RouteKey): boolean {
  const feature = routeFeatureMap[routeKey];
  return feature ? isPublicFeatureEnabled(feature) : true;
}

export function statusForRoute(routeKey: RouteKey): PublicFeatureStatus {
  const feature = routeFeatureMap[routeKey];
  return feature ? getPublicFeatureStatus(feature) : "enabled";
}
