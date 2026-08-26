/**
 * Configuración del footer. El componente visual (src/components/layout/Footer.tsx)
 * lee columnas, newsletter y copyright desde aquí.
 */
import type { RouteKey } from "./routes";
import { siteConfig } from "./site";

export interface FooterLink {
  label: string;
  routeKey: RouteKey;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export const footerConfig = {
  brand: {
    name: siteConfig.name,
    description:
      "Astrología, tarot y ciclos lunares explicados con claridad para acompañarte en tu proceso de autoconocimiento.",
  },
  columns: [
    {
      id: "explore",
      title: "Explorar",
      links: [
        { label: "Horóscopo", routeKey: "horoscope" },
        { label: "Tarot", routeKey: "tarot" },
        { label: "Astrología", routeKey: "astrology" },
        { label: "Compatibilidad", routeKey: "compatibility" },
        { label: "Luna", routeKey: "moon" },
        { label: "Comunidad", routeKey: "community" },
      ],
    },
    {
      id: "learn",
      title: "Aprender",
      links: [
        { label: "Guías", routeKey: "guides" },
        { label: "Método editorial", routeKey: "method" },
        { label: "Sobre nosotros", routeKey: "about" },
        { label: "Ayuda", routeKey: "help" },
      ],
    },
    {
      id: "account",
      title: "Tu espacio",
      links: [
        { label: "Mi espacio", routeKey: "account" },
        { label: "Favoritos", routeKey: "favorites" },
        { label: "Historial", routeKey: "history" },
        { label: "Configuración", routeKey: "settings" },
      ],
    },
    {
      id: "legal",
      title: "Información legal",
      links: [
        { label: "Privacidad", routeKey: "privacy" },
        { label: "Términos", routeKey: "terms" },
        { label: "Cookies", routeKey: "cookies" },
        { label: "Aviso de responsabilidad", routeKey: "disclaimer" },
      ],
    },
  ] satisfies FooterColumn[],
  newsletter: {
    enabled: true,
    title: "Recibe tu guía semanal",
    description: "Contenido seleccionado según tu signo y los ciclos de la luna.",
    submitLabel: "Suscribirme",
  },
  copyright: {
    pattern: "© {year} {siteName}. Todos los derechos reservados.",
    render: () =>
      `© ${new Date().getFullYear()} ${siteConfig.name}. Todos los derechos reservados.`,
  },
} as const;

export type FooterConfig = typeof footerConfig;
