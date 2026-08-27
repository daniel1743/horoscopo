import type { NatalAspect } from "@/types/astrology";
import type { SynastrySnapshot } from "@/types/synastry";
import type { TransitSnapshot } from "@/types/transits";

export type TransitThemeKey =
  "identity" | "emotional" | "communication" | "relationships" | "action" | "growth";

export interface TransitAspectInsight {
  key: string;
  title: string;
  theme: TransitThemeKey;
  themeLabel: string;
  intensity: "high" | "medium" | "exploratory";
  intensityLabel: string;
  toneLabel: string;
  retrograde: boolean;
  text: string;
}

export interface TransitThemeGroup {
  key: TransitThemeKey;
  label: string;
  count: number;
  summary: string;
  contacts: TransitAspectInsight[];
}

export interface TransitNarrative {
  overview: string;
  groups: TransitThemeGroup[];
  highlights: TransitAspectInsight[];
  reflectionQuestion: string;
}

export type SynastryThemeKey =
  | "communication"
  | "emotional_rhythm"
  | "daily_life"
  | "attraction"
  | "conflict_management"
  | "growth";

export interface SynastryContactInsight {
  key: string;
  title: string;
  theme: SynastryThemeKey;
  aspectLabel: string;
  toneLabel: string;
  closenessLabel: string;
  text: string;
}

export interface SynastryThemeGroup {
  key: SynastryThemeKey;
  label: string;
  count: number;
  toneLabel: string;
  summary: string;
  contacts: SynastryContactInsight[];
}

export interface SynastryNarrative {
  overview: string;
  groups: SynastryThemeGroup[];
  strongestContacts: SynastryContactInsight[];
  reflectionQuestions: string[];
}

const TRANSIT_THEME_LABELS: Record<TransitThemeKey, string> = {
  identity: "Identidad y dirección",
  emotional: "Mundo emocional",
  communication: "Comunicación y pensamiento",
  relationships: "Vínculos y valores",
  action: "Acción y deseo",
  growth: "Crecimiento y estructura",
};

const SYNASTRY_THEME_LABELS: Record<SynastryThemeKey, string> = {
  communication: "Comunicación",
  emotional_rhythm: "Ritmo emocional",
  daily_life: "Vida cotidiana",
  attraction: "Atracción y valores",
  conflict_management: "Fricción y acuerdos",
  growth: "Crecimiento compartido",
};

function transitTheme(body: string): TransitThemeKey {
  switch (body) {
    case "Sun":
      return "identity";
    case "Moon":
      return "emotional";
    case "Mercury":
      return "communication";
    case "Venus":
      return "relationships";
    case "Mars":
      return "action";
    default:
      return "growth";
  }
}

function synastryTheme(firstBody: string, secondBody: string): SynastryThemeKey {
  const bodies = new Set([firstBody, secondBody]);
  if (bodies.has("Mercury")) return "communication";
  if (bodies.has("Moon")) return "emotional_rhythm";
  if (bodies.has("Venus")) return "attraction";
  if (bodies.has("Mars")) return "conflict_management";
  if (bodies.has("Saturn") || bodies.has("Jupiter")) return "growth";
  return "daily_life";
}

function intensityFromOrb(orb: number): TransitAspectInsight["intensity"] {
  if (orb <= 1) return "high";
  if (orb <= 3) return "medium";
  return "exploratory";
}

function intensityLabel(intensity: TransitAspectInsight["intensity"]): string {
  if (intensity === "high") return "Atención alta";
  if (intensity === "medium") return "Atención media";
  return "Para explorar";
}

function toneLabel(aspect: NatalAspect): string {
  if (aspect.key === "square" || aspect.key === "opposition") return "Tensión consciente";
  if (aspect.key === "trine" || aspect.key === "sextile") return "Vía de integración";
  return "Punto de enfoque";
}

function transitInsight(snapshot: TransitSnapshot, aspect: NatalAspect): TransitAspectInsight {
  const theme = transitTheme(aspect.secondBody);
  const transit = snapshot.transits.find((item) => item.body === aspect.firstBody);
  const intensity = intensityFromOrb(aspect.orb);
  const retrogradeText = transit?.isRetrograde
    ? " El cuerpo en tránsito aparece retrógrado en este instante; úsalo como invitación a revisar, no como diagnóstico."
    : "";
  return {
    key: `transit-${aspect.firstBody}-${aspect.secondBody}-${aspect.key}`,
    title: `${aspect.firstLabel} · ${aspect.secondLabel}`,
    theme,
    themeLabel: TRANSIT_THEME_LABELS[theme],
    intensity,
    intensityLabel: intensityLabel(intensity),
    toneLabel: toneLabel(aspect),
    retrograde: transit?.isRetrograde ?? false,
    text: `${aspect.firstLabel} forma ${aspect.label.toLocaleLowerCase()} con ${aspect.secondLabel} con un orbe de ${aspect.orb.toFixed(1)}°. El contacto pone atención simbólica en ${TRANSIT_THEME_LABELS[theme].toLocaleLowerCase()} y puede observarse como ${toneLabel(aspect).toLocaleLowerCase()}.${retrogradeText}`,
  };
}

function transitGroupSummary(label: string, contacts: TransitAspectInsight[]): string {
  const tensions = contacts.filter((contact) => contact.toneLabel === "Tensión consciente").length;
  const integrations = contacts.filter(
    (contact) => contact.toneLabel === "Vía de integración",
  ).length;
  const tone =
    tensions > integrations
      ? "con más fricción para observar"
      : integrations > tensions
        ? "con más vías de integración"
        : "con una mezcla de fricción y apoyo";
  return `Hay ${contacts.length} contacto${contacts.length === 1 ? "" : "s"} en ${label.toLocaleLowerCase()}, ${tone}. La cercanía del orbe sirve para ordenar la atención, no para medir un destino.`;
}

export function buildTransitNarrative(snapshot: TransitSnapshot): TransitNarrative {
  const insights = snapshot.aspects.map((aspect) => transitInsight(snapshot, aspect));
  const groupKeys = Object.keys(TRANSIT_THEME_LABELS) as TransitThemeKey[];
  const groups = groupKeys
    .map((key) => {
      const contacts = insights.filter((insight) => insight.theme === key);
      return contacts.length > 0
        ? {
            key,
            label: TRANSIT_THEME_LABELS[key],
            count: contacts.length,
            summary: transitGroupSummary(TRANSIT_THEME_LABELS[key], contacts),
            contacts,
          }
        : null;
    })
    .filter((group): group is TransitThemeGroup => group !== null);

  return {
    overview: `Para el instante elegido se encontraron ${snapshot.aspects.length} contacto${snapshot.aspects.length === 1 ? "" : "s"} entre tránsitos y placements natales. La lectura los organiza por tema y cercanía para que puedas decidir qué observar primero.`,
    groups,
    highlights: insights.slice(0, 8),
    reflectionQuestion:
      "¿Qué área merece una observación más consciente hoy y qué hecho concreto te ayudaría a distinguir una posibilidad de una conclusión apresurada?",
  };
}

function synastryTone(aspects: readonly NatalAspect[]): string {
  const hasTension = aspects.some(
    (aspect) => aspect.key === "square" || aspect.key === "opposition",
  );
  const hasIntegration = aspects.some(
    (aspect) => aspect.key === "trine" || aspect.key === "sextile",
  );
  if (hasTension && hasIntegration) return "Mixta: apoyo y fricción";
  if (hasTension) return "Fricción para conversar";
  if (hasIntegration) return "Facilidad para integrar";
  return "Punto de enfoque";
}

function synastryCloseness(orb: number): string {
  if (orb <= 1) return "Contacto muy cercano";
  if (orb <= 3) return "Contacto cercano";
  return "Contacto amplio";
}

function synastryContact(aspect: NatalAspect): SynastryContactInsight {
  const theme = synastryTheme(aspect.firstBody, aspect.secondBody);
  return {
    key: `synastry-${aspect.firstBody}-${aspect.secondBody}-${aspect.key}`,
    title: `${aspect.firstLabel} · ${aspect.secondLabel}`,
    theme,
    aspectLabel: aspect.label,
    toneLabel: toneLabel(aspect),
    closenessLabel: synastryCloseness(aspect.orb),
    text: `${aspect.firstLabel} y ${aspect.secondLabel} forman ${aspect.label.toLocaleLowerCase()} con un orbe de ${aspect.orb.toFixed(1)}°. En el eje de ${SYNASTRY_THEME_LABELS[theme].toLocaleLowerCase()}, puede leerse como ${toneLabel(aspect).toLocaleLowerCase()}. La relación real necesita conversación y experiencia compartida; este contacto no determina su calidad ni duración.`,
  };
}

export function buildSynastryNarrative(snapshot: SynastrySnapshot): SynastryNarrative {
  const contacts = snapshot.aspects.map(synastryContact);
  const groupKeys = Object.keys(SYNASTRY_THEME_LABELS) as SynastryThemeKey[];
  const groups = groupKeys
    .map((key) => {
      const groupContacts = contacts.filter((contact) => contact.theme === key);
      return groupContacts.length > 0
        ? {
            key,
            label: SYNASTRY_THEME_LABELS[key],
            count: groupContacts.length,
            toneLabel: synastryTone(
              snapshot.aspects.filter(
                (aspect) => synastryTheme(aspect.firstBody, aspect.secondBody) === key,
              ),
            ),
            summary: `Este eje reúne ${groupContacts.length} contacto${groupContacts.length === 1 ? "" : "s"} y muestra dónde puede ser útil preguntar, escuchar o acordar con mayor claridad.`,
            contacts: groupContacts.slice(0, 5),
          }
        : null;
    })
    .filter((group): group is SynastryThemeGroup => group !== null);

  return {
    overview: `La comparación encontró ${contacts.length} contacto${contacts.length === 1 ? "" : "s"} entre las dos cartas. Organizarlos por temas ayuda a leer la dinámica sin convertirla en una puntuación total ni en un pronóstico de la relación.`,
    groups,
    strongestContacts: contacts.slice(0, 8),
    reflectionQuestions: [
      "¿Qué conversación concreta podría cuidar el tema que aparece con más contactos?",
      "¿Dónde hay una facilidad que conviene cultivar y dónde una fricción que necesita acuerdos explícitos?",
    ],
  };
}
