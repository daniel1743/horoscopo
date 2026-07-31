import { describe, expect, it } from "vitest";
import { buildDailyTarotIntroduction } from "./daily-introduction";
import type { TarotCard } from "@/types/tarot";

type TestCard = Pick<
  TarotCard,
  "name" | "summary" | "keywords" | "yesNoTendency" | "uprightMeaning"
>;

const sampleCards: TestCard[] = [
  {
    name: "El Mago",
    summary:
      "El Mago habla de recursos disponibles. Aparece cuando una intención puede empezar a tomar forma concreta si se combinan atención, voluntad y una acción sostenida.",
    uprightMeaning:
      "Indica que las herramientas necesarias ya están al alcance, aunque falte organizarlas. Es momento de traducir una idea en un gesto concreto: una conversación, un plan simple, un primer paso.",
    keywords: ["voluntad", "recursos", "iniciativa"],
    yesNoTendency: "favorable",
  },
  {
    name: "La Luna",
    summary:
      "La Luna señala un terreno de emociones intensas, señales ambiguas e imaginación activa. No todo está claro y conviene avanzar sin convertir una impresión en certeza.",
    uprightMeaning:
      "Sugiere moverse con prudencia cuando la percepción está teñida por temores, deseos o información incompleta.",
    keywords: ["incertidumbre", "imaginación", "emoción", "discernimiento"],
    yesNoTendency: "caution",
  },
  {
    name: "La Muerte",
    summary:
      "La Muerte simboliza el final necesario de una forma, una etapa o una identidad. No describe un hecho literal: señala que algo necesita concluir para liberar energía.",
    uprightMeaning:
      "Habla de aceptar una transformación que ya está en marcha. Puede doler cerrar una etapa, pero sostenerla indefinidamente también consume energía.",
    keywords: ["cierre", "transformación", "despedida", "renovación"],
    yesNoTendency: "caution",
  },
  {
    name: "El Sol",
    summary:
      "El Sol representa claridad, vitalidad y una alegría que puede compartirse. Ilumina lo que funciona sin negar el trabajo que permitió llegar hasta aquí.",
    uprightMeaning:
      "Señala un momento de mayor claridad, confianza o disfrute sencillo. Invita a reconocer lo que sí está vivo y disponible.",
    keywords: ["claridad", "vitalidad", "alegría", "presencia"],
    yesNoTendency: "favorable",
  },
  {
    name: "As de Copas",
    summary:
      "El As de Copas abre un espacio para sentir, vincularse y recibir afecto. Es una posibilidad emocional que necesita presencia para desarrollarse.",
    uprightMeaning:
      "Sugiere una apertura sensible: una conversación sincera, una nueva disposición afectiva o el permiso para recibir cuidado.",
    keywords: ["apertura", "afecto", "sensibilidad", "renovación"],
    yesNoTendency: "favorable",
  },
  {
    name: "Diez de Espadas",
    summary:
      "El Diez de Espadas marca el límite de una situación agotada. El final puede sentirse duro, pero impide seguir negando que algo terminó.",
    uprightMeaning:
      "Indica que una narrativa o esfuerzo llegó a su punto límite. No suaviza el cansancio, pero permite dejar de invertir energía en sostener lo insostenible.",
    keywords: ["final", "agotamiento", "aceptación", "recuperación"],
    yesNoTendency: "caution",
  },
  {
    name: "Reina de Bastos",
    summary:
      "La Reina de Bastos expresa una confianza cálida que anima a otras personas sin ocupar todo el espacio. Conoce su capacidad y la usa con generosidad.",
    uprightMeaning:
      "Habla de liderazgo magnético, creatividad y presencia segura. Invita a ocupar el propio lugar sin apagar la voz de los demás.",
    keywords: ["confianza", "carisma", "creatividad", "liderazgo"],
    yesNoTendency: "favorable",
  },
  {
    name: "Rey de Oros",
    summary:
      "El Rey de Oros representa administración madura, estabilidad y responsabilidad sobre recursos compartidos. El logro adquiere sentido cuando es sostenible.",
    uprightMeaning:
      "Señala capacidad para cuidar recursos, construir estabilidad y tomar decisiones con perspectiva práctica.",
    keywords: ["estabilidad", "administración", "experiencia", "sostenibilidad"],
    yesNoTendency: "favorable",
  },
];

describe("buildDailyTarotIntroduction", () => {
  it("crea introducciones breves y especificas para las cartas auditadas", () => {
    const genericText = "Una idea simbólica para observar durante el día.";
    const introductions = sampleCards.map((card) => buildDailyTarotIntroduction(card));

    for (const [index, intro] of introductions.entries()) {
      const card = sampleCards[index];
      expect(intro).not.toBe(genericText);
      expect(intro).not.toBe(card.uprightMeaning);
      expect(intro.length).toBeGreaterThanOrEqual(70);
      expect(intro.length).toBeLessThanOrEqual(160);
      expect(intro).toContain(card.name);
    }

    expect(new Set(introductions).size).toBe(sampleCards.length);
  });
});
