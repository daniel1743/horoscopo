/** Categorías editoriales — fuente única para navegación de contenido. */
import type { IconName } from "@/config/icons";
import type { CategoryStyle } from "@/config/image-styles";

export interface ContentCategory {
  id: string;
  label: string;
  slug: string;
  href: string;
  icon: IconName;
  imageStyle: CategoryStyle;
  description: string;
}

export const contentCategories: readonly ContentCategory[] = [
  {
    id: "horoscopo",
    label: "Horóscopo",
    slug: "horoscopo",
    href: "/horoscopo",
    icon: "sun",
    imageStyle: "horoscope",
    description: "Lecturas diarias, semanales y por signo.",
  },
  {
    id: "tarot",
    label: "Tarot",
    slug: "tarot",
    href: "/tarot",
    icon: "tarot",
    imageStyle: "tarot",
    description: "Tiradas simples para escuchar el momento.",
  },
  {
    id: "compatibilidad",
    label: "Compatibilidad",
    slug: "compatibilidad",
    href: "/compatibilidad",
    icon: "compatibility",
    imageStyle: "compatibility",
    description: "Cómo dialogan dos signos entre sí.",
  },
  {
    id: "luna",
    label: "Luna",
    slug: "luna",
    href: "/luna",
    icon: "moon",
    imageStyle: "moon",
    description: "Fase actual y calendario lunar.",
  },
  {
    id: "astrologia",
    label: "Astrología",
    slug: "astrologia",
    href: "/astrologia",
    icon: "premium",
    imageStyle: "astrology",
    description: "Conceptos y ciclos para leer el cielo.",
  },
  {
    id: "guias",
    label: "Guías",
    slug: "guias",
    href: "/guias",
    icon: "article",
    imageStyle: "editorial",
    description: "Ensayos y artículos editoriales.",
  },
] as const;
