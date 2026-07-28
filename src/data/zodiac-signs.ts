/** Datos zodiacales — fuente única. */

export type ZodiacElement = "fuego" | "tierra" | "aire" | "agua";
export type ZodiacModality = "cardinal" | "fijo" | "mutable";

export interface ZodiacSign {
  id: string;
  name: string;
  slug: string;
  symbol: string;
  dateRange: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  rulingPlanet: string;
  keyword: string;
}

export const zodiacSigns: readonly ZodiacSign[] = [
  {
    id: "aries",
    name: "Aries",
    slug: "aries",
    symbol: "♈",
    dateRange: "21 mar – 19 abr",
    element: "fuego",
    modality: "cardinal",
    rulingPlanet: "Marte",
    keyword: "Impulso",
  },
  {
    id: "tauro",
    name: "Tauro",
    slug: "tauro",
    symbol: "♉",
    dateRange: "20 abr – 20 may",
    element: "tierra",
    modality: "fijo",
    rulingPlanet: "Venus",
    keyword: "Arraigo",
  },
  {
    id: "geminis",
    name: "Géminis",
    slug: "geminis",
    symbol: "♊",
    dateRange: "21 may – 20 jun",
    element: "aire",
    modality: "mutable",
    rulingPlanet: "Mercurio",
    keyword: "Curiosidad",
  },
  {
    id: "cancer",
    name: "Cáncer",
    slug: "cancer",
    symbol: "♋",
    dateRange: "21 jun – 22 jul",
    element: "agua",
    modality: "cardinal",
    rulingPlanet: "Luna",
    keyword: "Cuidado",
  },
  {
    id: "leo",
    name: "Leo",
    slug: "leo",
    symbol: "♌",
    dateRange: "23 jul – 22 ago",
    element: "fuego",
    modality: "fijo",
    rulingPlanet: "Sol",
    keyword: "Expresión",
  },
  {
    id: "virgo",
    name: "Virgo",
    slug: "virgo",
    symbol: "♍",
    dateRange: "23 ago – 22 sep",
    element: "tierra",
    modality: "mutable",
    rulingPlanet: "Mercurio",
    keyword: "Precisión",
  },
  {
    id: "libra",
    name: "Libra",
    slug: "libra",
    symbol: "♎",
    dateRange: "23 sep – 22 oct",
    element: "aire",
    modality: "cardinal",
    rulingPlanet: "Venus",
    keyword: "Equilibrio",
  },
  {
    id: "escorpio",
    name: "Escorpio",
    slug: "escorpio",
    symbol: "♏",
    dateRange: "23 oct – 21 nov",
    element: "agua",
    modality: "fijo",
    rulingPlanet: "Plutón",
    keyword: "Profundidad",
  },
  {
    id: "sagitario",
    name: "Sagitario",
    slug: "sagitario",
    symbol: "♐",
    dateRange: "22 nov – 21 dic",
    element: "fuego",
    modality: "mutable",
    rulingPlanet: "Júpiter",
    keyword: "Horizonte",
  },
  {
    id: "capricornio",
    name: "Capricornio",
    slug: "capricornio",
    symbol: "♑",
    dateRange: "22 dic – 19 ene",
    element: "tierra",
    modality: "cardinal",
    rulingPlanet: "Saturno",
    keyword: "Estructura",
  },
  {
    id: "acuario",
    name: "Acuario",
    slug: "acuario",
    symbol: "♒",
    dateRange: "20 ene – 18 feb",
    element: "aire",
    modality: "fijo",
    rulingPlanet: "Urano",
    keyword: "Visión",
  },
  {
    id: "piscis",
    name: "Piscis",
    slug: "piscis",
    symbol: "♓",
    dateRange: "19 feb – 20 mar",
    element: "agua",
    modality: "mutable",
    rulingPlanet: "Neptuno",
    keyword: "Intuición",
  },
] as const;

export const getZodiacBySlug = (slug: string) => zodiacSigns.find((s) => s.slug === slug);
