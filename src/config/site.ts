/** Configuración global del sitio. Fuente única para textos y metadatos. */
export const siteConfig = {
  name: "Creovision",
  shortName: "Astral",
  tagline: "Tarot editorial contemporáneo",
  description:
    "Plataforma editorial de tarot, ciclos lunares y guías simbólicas. Contenido claro, íntimo y visualmente cuidado.",
  locale: "es-ES",
  timezone: "Europe/Madrid",
  url: "https://www.creovision.io",
  email: "hola@creovision.io",
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
