/**
 * Registro único de rutas.
 * Consumir siempre `routes.KEY` o los helpers, nunca strings sueltos.
 */

export const routes = {
  // Público
  home: "/",

  horoscope: "/horoscopo",
  horoscopeToday: "/horoscopo/hoy",
  horoscopeWeek: "/horoscopo/semana",
  horoscopeMonth: "/horoscopo/mes",

  tarot: "/tarot",
  tarotDaily: "/tarot/carta-del-dia",
  tarotYesNo: "/tarot/si-o-no",
  tarotThreeCards: "/tarot/tres-cartas",
  tarotDecision: "/tarot/decision",
  tarotPastPresentFuture: "/tarot/pasado-presente-futuro",
  tarotLibrary: "/tarot/cartas",

  astrology: "/astrologia",
  birthChart: "/astrologia/carta-natal",
  ascendant: "/astrologia/ascendente",
  moonSign: "/astrologia/signo-lunar",
  transits: "/astrologia/transitos",
  synastry: "/astrologia/sinastria",

  compatibility: "/compatibilidad",

  moon: "/luna",
  moonToday: "/luna/hoy",
  moonCalendar: "/luna/calendario",
  moonPhases: "/luna/fases",

  numerologyLifePath: "/numerologia/camino-de-vida",
  dreams: "/suenos",

  guides: "/guias",
  topics: "/temas",
  authors: "/autores",
  community: "/comunidad",
  search: "/buscar",
  newsletterUnsubscribe: "/newsletter/unsubscribe",

  about: "/nosotros",
  method: "/metodo",
  help: "/ayuda",
  contact: "/contacto",

  privacy: "/privacidad",
  terms: "/terminos",
  cookies: "/cookies",
  disclaimer: "/aviso-de-responsabilidad",

  // Autenticación (público)
  signIn: "/auth",
  resetPassword: "/reset-password",
  authCallback: "/auth/callback",

  // Privado
  account: "/mi-espacio",
  profile: "/mi-espacio/perfil",
  favorites: "/mi-espacio/favoritos",
  savedReadings: "/mi-espacio/lecturas",
  myPosts: "/mi-espacio/publicaciones",
  history: "/mi-espacio/historial",
  settings: "/mi-espacio/configuracion",
  privacySettings: "/mi-espacio/privacidad",
  accountMemory: "/mi-espacio/memoria",

  // Asistente IA
  assistant: "/asistente",

  // Interno
  designSystem: "/design-system",
} as const;

export type RouteKey = keyof typeof routes;

export const emptyCommunitySearch = {
  shareType: undefined,
  shareTitle: undefined,
  shareBody: undefined,
  shareSourceRef: undefined,
  shareSourceTitle: undefined,
  shareSourceUrl: undefined,
} as const;

/** Helpers para rutas dinámicas. */
export const zodiacRoute = (sign: string) => `/horoscopo/${sign}` as const;
export const profileRoute = (username: string) => `/perfil/${username}` as const;
export const articleRoute = (slug: string) => `/guias/${slug}` as const;
export const tarotCardRoute = (slug: string) => `/tarot/cartas/${slug}` as const;
export { compatibilityRoute } from "@/lib/compatibility/route-helpers";
export const categoryRoute = (slug: string) => `/temas/${slug}` as const;
export const authorRoute = (slug: string) => `/autores/${slug}` as const;
export const moonPhaseRoute = (slug: string) => `/luna/fases/${slug}` as const;
export const moonCalendarMonthRoute = (year: number, month: number) =>
  `/luna/calendario/${year}-${String(month).padStart(2, "0")}` as const;

/** Obtiene una URL a partir de una `route_key` con fallback seguro. */
export const routeByKey = (key: RouteKey): string => routes[key];
