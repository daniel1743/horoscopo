/** Arcanos mayores — fuente única mínima para el MVP. */

export interface TarotCard {
  id: number;
  name: string;
  slug: string;
  keywords: string[];
  upright: string;
  reversed: string;
}

export const majorArcana: readonly TarotCard[] = [
  {
    id: 0,
    name: "El Loco",
    slug: "el-loco",
    keywords: ["comienzo", "libertad", "confianza"],
    upright: "Un nuevo ciclo se abre con la ligereza de lo posible.",
    reversed: "Cuidado con la impulsividad no meditada.",
  },
  {
    id: 1,
    name: "El Mago",
    slug: "el-mago",
    keywords: ["voluntad", "recursos", "iniciativa"],
    upright: "Tienes las herramientas; el gesto depende de ti.",
    reversed: "Revisa qué usas y qué se usa a través tuyo.",
  },
  {
    id: 2,
    name: "La Sacerdotisa",
    slug: "la-sacerdotisa",
    keywords: ["intuición", "misterio", "silencio"],
    upright: "Escucha lo que aún no tiene palabras.",
    reversed: "Algo se ha guardado de más.",
  },
  {
    id: 3,
    name: "La Emperatriz",
    slug: "la-emperatriz",
    keywords: ["abundancia", "cuidado", "creatividad"],
    upright: "Momento fértil para crear y sostener.",
    reversed: "Puede haber saturación o exceso de entrega.",
  },
  {
    id: 4,
    name: "El Emperador",
    slug: "el-emperador",
    keywords: ["estructura", "límite", "autoridad"],
    upright: "Poner orden trae claridad.",
    reversed: "Cuidado con la rigidez o el control.",
  },
  {
    id: 5,
    name: "El Sumo Sacerdote",
    slug: "el-sumo-sacerdote",
    keywords: ["tradición", "guía", "aprendizaje"],
    upright: "Un marco compartido sostiene el camino.",
    reversed: "Cuestiona los dogmas que ya no te sirven.",
  },
  {
    id: 6,
    name: "Los Enamorados",
    slug: "los-enamorados",
    keywords: ["elección", "vínculo", "valor"],
    upright: "Una decisión te alinea con lo que amas.",
    reversed: "Duda entre lo cómodo y lo verdadero.",
  },
  {
    id: 7,
    name: "El Carro",
    slug: "el-carro",
    keywords: ["dirección", "voluntad", "avance"],
    upright: "Reúne las fuerzas y avanza con foco.",
    reversed: "Dispersión: falta un rumbo claro.",
  },
] as const;

export const getTarotBySlug = (slug: string) => majorArcana.find((c) => c.slug === slug);
