import type { IconName } from "./icons";
import { routes, type RouteKey } from "./routes";
import { featureFlags } from "./features";

export interface AccountNavItem {
  label: string;
  routeKey: RouteKey;
  icon: IconName;
  description?: string;
  disabled?: boolean;
}

/** Menú lateral / dashboard de Mi espacio. Se lee desde AccountSidebar. */
export const accountNav: AccountNavItem[] = [
  {
    label: "Resumen",
    routeKey: "account",
    icon: "user",
    description: "Vista general de tu espacio personal.",
  },
  {
    label: "Perfil",
    routeKey: "profile",
    icon: "account",
    description: "Nombre, avatar, signo preferido y biografía.",
  },
  {
    label: "Favoritos",
    routeKey: "favorites",
    icon: "favorite",
    description: "Artículos, cartas y guías que guardaste.",
  },
  {
    label: "Lecturas guardadas",
    routeKey: "savedReadings",
    icon: "tarot",
    description: "Solo las lecturas que decidiste conservar.",
  },
  {
    label: "Mis publicaciones",
    routeKey: "myPosts",
    icon: "article",
    description: "Revisa, oculta o elimina lo que compartiste.",
  },
  {
    label: "Historial",
    routeKey: "history",
    icon: "history",
    description: "Actividad reciente. Puedes desactivarlo o borrarlo.",
  },
  {
    label: "Memoria del asistente",
    routeKey: "accountMemory",
    icon: "premium",
    description: "Lo que la Guía Astral recuerda de ti.",
    disabled: !featureFlags.aiMemory,
  },
  {
    label: "Privacidad",
    routeKey: "privacySettings",
    icon: "moon",
    description: "Historial, personalización IA y comunicaciones.",
  },
  {
    label: "Configuración",
    routeKey: "settings",
    icon: "menu",
    description: "Contraseña, exportar y eliminar cuenta.",
  },
];
