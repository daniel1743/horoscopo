/** Configuración global del sitio. Fuente única para textos y metadatos. */
export const siteConfig = {
  name: "Proyecto Astral",
  shortName: "Astral",
  tagline: "Astrología editorial contemporánea",
  description:
    "Plataforma editorial de astrología, horóscopo, tarot, compatibilidad y ciclos lunares. Contenido claro, íntimo y visualmente cuidado.",
  locale: "es-ES",
  timezone: "Europe/Madrid",
  url: "",
  email: "hola@proyecto-astral.example",
  social: {
    instagram: "",
    twitter: "",
  },
  legal: {
    disclaimer:
      "El contenido de Proyecto Astral tiene fines de reflexión y entretenimiento. No sustituye la orientación profesional en salud, finanzas o cuestiones legales.",
    copyright: `© ${new Date().getFullYear()} Proyecto Astral. Todos los derechos reservados.`,
  },
} as const;

export type SiteConfig = typeof siteConfig;
