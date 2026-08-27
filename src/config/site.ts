/** Configuración global del sitio. Fuente única para textos y metadatos. */
export const siteConfig = {
  name: "Creovision",
  shortName: "Creovision",
  tagline: "Astrología simbólica para entender tu momento",
  description:
    "Plataforma editorial de astrología, horóscopo, tarot, compatibilidad y ciclos lunares. Contenido claro, íntimo y visualmente cuidado.",
  locale: "es-ES",
  timezone: "Europe/Madrid",
  url: "https://www.creovision.io",
  email: "hola@proyecto-astral.example",
  social: {
    instagram: "",
    twitter: "",
  },
  legal: {
    disclaimer:
      "El contenido de Creovision tiene fines de reflexión y entretenimiento. No sustituye la orientación profesional en salud, finanzas o cuestiones legales.",
    copyright: `© ${new Date().getFullYear()} Creovision. Todos los derechos reservados.`,
  },
} as const;

export type SiteConfig = typeof siteConfig;
