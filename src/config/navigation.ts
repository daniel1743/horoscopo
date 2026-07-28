/** Navegación centralizada. Toda la app debe leer los menús desde aquí. */
import type { IconName } from "./icons";
import type { RouteKey } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon?: IconName;
  description?: string;
}

/** Estructura por route_key para consumir con Link + routes registry. */
export interface NavLink {
  label: string;
  routeKey: RouteKey;
  icon?: IconName;
  description?: string;
}

export interface NavGroup {
  label: string;
  routeKey: RouteKey;
  icon?: IconName;
  children?: NavLink[];
}

/** Navegación primaria de escritorio con dropdowns opcionales. */
export const desktopPrimary: NavGroup[] = [
  {
    label: "Horóscopo",
    routeKey: "horoscope",
    icon: "sun",
    children: [
      { label: "Hoy", routeKey: "horoscopeToday", description: "Tendencias del día actual" },
      { label: "Semana", routeKey: "horoscopeWeek", description: "Panorama semanal" },
      { label: "Mes", routeKey: "horoscopeMonth", description: "Ciclo mensual completo" },
    ],
  },
  {
    label: "Tarot",
    routeKey: "tarot",
    icon: "tarot",
    children: [
      { label: "Carta del día", routeKey: "tarotDaily" },
      { label: "Sí o no", routeKey: "tarotYesNo" },
      { label: "Tres cartas", routeKey: "tarotThreeCards" },
    ],
  },
  {
    label: "Astrología",
    routeKey: "astrology",
    icon: "premium",
    children: [
      { label: "Carta natal", routeKey: "birthChart" },
      { label: "Ascendente", routeKey: "ascendant" },
      { label: "Signo lunar", routeKey: "moonSign" },
    ],
  },
  { label: "Compatibilidad", routeKey: "compatibility", icon: "compatibility" },
  {
    label: "Luna",
    routeKey: "moon",
    icon: "moon",
    children: [
      { label: "Luna de hoy", routeKey: "moonToday" },
      { label: "Calendario lunar", routeKey: "moonCalendar" },
    ],
  },
  { label: "Guías", routeKey: "guides", icon: "article" },
];

/** Cinco destinos de la barra inferior móvil. */
export const mobileBottomPrimary: NavLink[] = [
  { label: "Inicio", routeKey: "home", icon: "menu" },
  { label: "Horóscopo", routeKey: "horoscope", icon: "sun" },
  { label: "Tarot", routeKey: "tarot", icon: "tarot" },
  { label: "Luna", routeKey: "moon", icon: "moon" },
  { label: "Yo", routeKey: "account", icon: "user" },
];

/** Grupos del drawer móvil secundario. */
export const drawerGroups: { id: string; title: string; items: NavLink[] }[] = [
  {
    id: "explore",
    title: "Explorar",
    items: [
      { label: "Horóscopo", routeKey: "horoscope", icon: "sun" },
      { label: "Tarot", routeKey: "tarot", icon: "tarot" },
      { label: "Astrología", routeKey: "astrology", icon: "premium" },
      { label: "Compatibilidad", routeKey: "compatibility", icon: "compatibility" },
      { label: "Luna", routeKey: "moon", icon: "moon" },
      { label: "Guías", routeKey: "guides", icon: "article" },
    ],
  },
  {
    id: "account",
    title: "Tu espacio",
    items: [
      { label: "Mi espacio", routeKey: "account", icon: "user" },
      { label: "Asistente", routeKey: "assistant", icon: "premium" },
      { label: "Memoria", routeKey: "accountMemory", icon: "history" },
      { label: "Favoritos", routeKey: "favorites", icon: "favorite" },
      { label: "Historial", routeKey: "history", icon: "history" },
      { label: "Configuración", routeKey: "settings", icon: "settings" },
    ],
  },
  {
    id: "learn",
    title: "Aprender",
    items: [
      { label: "Sobre nosotros", routeKey: "about" },
      { label: "Método editorial", routeKey: "method" },
      { label: "Ayuda", routeKey: "help" },
      { label: "Contacto", routeKey: "contact" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    items: [
      { label: "Privacidad", routeKey: "privacy" },
      { label: "Términos", routeKey: "terms" },
      { label: "Cookies", routeKey: "cookies" },
      { label: "Aviso", routeKey: "disclaimer" },
    ],
  },
];

/** Legacy — mantener para no romper consumidores previos. */
export const primaryNav: NavItem[] = [
  { label: "Horóscopo", href: "/horoscopo", icon: "sun" },
  { label: "Tarot", href: "/tarot", icon: "tarot" },
  { label: "Compatibilidad", href: "/compatibilidad", icon: "compatibility" },
  { label: "Luna", href: "/luna", icon: "moon" },
  { label: "Guías", href: "/guias", icon: "article" },
];

export const mobileBottomNav: NavItem[] = [
  { label: "Inicio", href: "/", icon: "menu" },
  { label: "Horóscopo", href: "/horoscopo", icon: "sun" },
  { label: "Tarot", href: "/tarot", icon: "tarot" },
  { label: "Luna", href: "/luna", icon: "moon" },
  { label: "Yo", href: "/mi-espacio", icon: "user" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  { title: "Explorar", items: primaryNav },
];
