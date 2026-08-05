import { describe, expect, it } from "vitest";
import { threeCardReadings, enabledThreeCardReadings } from "@/config/three-card-readings";
import {
  buildThreeCardSynthesisFallback,
  sanitizeTarotUserFacingText,
} from "@/lib/tarot/synthesis-generator";
import type { TarotCard } from "@/types/tarot";

const mockCard: TarotCard = {
  id: "7b0f2d7e-31af-4d80-8a5e-3d33fd7082f2",
  cardKey: "the_magician",
  slug: "el-mago",
  name: "El Mago",
  arcana: "major",
  number: 1,
  suit: null,
  rank: null,
  summary: "El Mago habla de recursos.",
  uprightMeaning: "Herramientas disponibles para materializar ideas.",
  reversedMeaning: "Falta de dirección o uso inapropiado de poder.",
  keywords: ["voluntad", "recursos", "iniciativa"],
  reflectionQuestion: "¿Cómo puedo usar mis recursos?",
  yesNoTendency: "favorable",
  imageKey: "tarot_major_01_the_magician",
  displayOrder: 1,
  isDemo: false,
  seoTitle: "El Mago",
  seoDescription: "Carta mayor del Tarot",
  publishedAt: new Date().toISOString(),
};

describe("Configuración de tiradas de tres cartas", () => {
  it("existe configuración para Amor", () => {
    expect(threeCardReadings.amor).toBeDefined();
  });

  it("Amor tiene exactamente tres posiciones", () => {
    const config = threeCardReadings.amor;
    expect(config.positions).toHaveLength(3);
  });

  it("las posiciones tienen displayOrder 1, 2, 3 en orden", () => {
    const config = threeCardReadings.amor;
    expect(config.positions[0].displayOrder).toBe(1);
    expect(config.positions[1].displayOrder).toBe(2);
    expect(config.positions[2].displayOrder).toBe(3);
  });

  it("las keys de posiciones son únicas", () => {
    const config = threeCardReadings.amor;
    const keys = config.positions.map((p) => p.key);
    expect(new Set(keys).size).toBe(3);
  });

  it("Amor tiene todos los campos requeridos", () => {
    const config = threeCardReadings.amor;
    expect(config.slug).toBe("amor");
    expect(config.title).toBeTruthy();
    expect(config.description).toBeTruthy();
    expect(config.intro).toBeTruthy();
    expect(config.userContextLabel).toBeTruthy();
    expect(config.userContextPlaceholder).toBeTruthy();
    expect(config.synthesisInstructions).toBeTruthy();
    expect(config.seo.title).toBeTruthy();
    expect(config.seo.description).toBeTruthy();
    expect(config.access).toBe("free");
    expect(config.enabled).toBe(true);
  });

  it("cada posición tiene label, description e interpretationFocus", () => {
    const config = threeCardReadings.amor;
    config.positions.forEach((pos) => {
      expect(pos.label).toBeTruthy();
      expect(pos.shortLabel).toBeTruthy();
      expect(pos.description).toBeTruthy();
      expect(pos.interpretationFocus).toBeTruthy();
    });
  });

  it("General, Trabajo, Decision existen pero están deshabilitadas", () => {
    expect(threeCardReadings.general.enabled).toBe(false);
    expect(threeCardReadings.trabajo.enabled).toBe(false);
    expect(threeCardReadings.decision.enabled).toBe(false);
  });

  it("enabledThreeCardReadings solo incluye Amor", () => {
    expect(enabledThreeCardReadings).toHaveLength(1);
    expect(enabledThreeCardReadings[0].slug).toBe("amor");
  });
});

describe("Síntesis fallback de tres cartas", () => {
  it("genera síntesis válida para tirada de Amor", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

    expect(synthesis.mainPattern).toBeTruthy();
    expect(synthesis.relationshipBetweenCards).toBeTruthy();
    expect(synthesis.emotionalTensionOrResource).toBeTruthy();
    expect(synthesis.guidance).toBeTruthy();
    expect(synthesis.reflectionQuestion).toBeTruthy();
  });

  it("síntesis no es simple concatenación de significados", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

    // No debe contener simplemente los nombres de las cartas juntas
    expect(synthesis.mainPattern).not.toMatch(/El Mago.*El Mago.*El Mago/);
  });

  it("síntesis incluye información de posiciones", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

    // Debe mencionar al menos una de las posiciones
    const text = JSON.stringify(synthesis).toLowerCase();
    expect(text).toMatch(/emocional|dinámica|orientación/);
  });

  it("síntesis respeta límite de caracteres", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

    expect(synthesis.mainPattern.length).toBeLessThanOrEqual(400);
    expect(synthesis.relationshipBetweenCards.length).toBeLessThanOrEqual(400);
    expect(synthesis.emotionalTensionOrResource.length).toBeLessThanOrEqual(400);
    expect(synthesis.guidance.length).toBeLessThanOrEqual(400);
    expect(synthesis.reflectionQuestion.length).toBeLessThanOrEqual(150);
  });

  it("síntesis incluye pregunta de reflexión conectada", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

    expect(synthesis.reflectionQuestion).toMatch(/\?$/);
  });

  it("síntesis adapta tono según tendencias de cartas", () => {
    const config = threeCardReadings.amor;

    // Caso 1: Tres cartas favorables
    const favorableCard: TarotCard = { ...mockCard, yesNoTendency: "favorable" };
    const cards1: [TarotCard, TarotCard, TarotCard] = [favorableCard, favorableCard, favorableCard];
    const synthesis1 = buildThreeCardSynthesisFallback(config, cards1, config.positions);
    expect(synthesis1.mainPattern).toMatch(/avance|hechos/i);

    // Caso 2: Dos cartas de cautela
    const cautionCard: TarotCard = { ...mockCard, yesNoTendency: "caution" };
    const cards2: [TarotCard, TarotCard, TarotCard] = [cautionCard, cautionCard, favorableCard];
    const synthesis2 = buildThreeCardSynthesisFallback(config, cards2, config.positions);
    expect(synthesis2.mainPattern).toMatch(/pausar|revisar|cuidar/i);
  });

  it("síntesis no afirma certezas de futuro", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);
    const text = JSON.stringify(synthesis).toLowerCase();

    expect(text).not.toMatch(/definitivamente|definitiva|ciertamente|seguro/);
    expect(text).not.toMatch(/\bsí\b.*\bno\b|definitivo|siempre|nunca/);
  });

  it("síntesis no inventa información de cartas", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

    const text = JSON.stringify(synthesis);
    expect(text).toContain(mockCard.name);
    expect(text).toContain(mockCard.keywords[0]);
  });

  it("no expone instrucciones internas ni campos editoriales", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);
    const text = JSON.stringify(synthesis).toLowerCase();

    expect(text).not.toContain("interpretationfocus");
    expect(text).not.toContain("synthesisinstructions");
    expect(text).not.toContain("sin ordenar terminar");
    expect(text).not.toContain("no afirmar sentimientos");
    expect(text).not.toContain("foco de interpretación");
  });

  it("sanitiza texto visible sin filtrar reglas del prompt", () => {
    const text = sanitizeTarotUserFacingText(
      "Ofrecer una orientación práctica, sin ordenar terminar, reconciliarse, insistir ni tomar decisiones por el usuario.. interpretationFocus",
    );

    expect(text).not.toMatch(/sin ordenar terminar|interpretationFocus/i);
    expect(text).not.toContain("..");
  });

  it("menciona las tres cartas y produce una progresión", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [
      { ...mockCard, name: "Siete de Oros", slug: "siete-de-oros", keywords: ["paciencia"] },
      {
        ...mockCard,
        name: "Siete de Bastos",
        slug: "siete-de-bastos",
        keywords: ["defensa"],
      },
      { ...mockCard, name: "As de Oros", slug: "as-de-oros", keywords: ["oportunidad"] },
    ];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

    expect(synthesis.relationshipBetweenCards).toContain("Siete de Oros");
    expect(synthesis.relationshipBetweenCards).toContain("Siete de Bastos");
    expect(synthesis.relationshipBetweenCards).toContain("As de Oros");
    expect(synthesis.relationshipBetweenCards).toMatch(/mientras|orienta/i);
  });

  it("pregunta reflexiva termina con un solo signo de interrogación", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];

    const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

    expect(synthesis.reflectionQuestion).toMatch(/\?$/);
    expect(synthesis.reflectionQuestion).not.toMatch(/\?{2,}$/);
  });

  it("la misma combinación es determinista y combinaciones distintas cambian patrón", () => {
    const config = threeCardReadings.amor;
    const cards: [TarotCard, TarotCard, TarotCard] = [mockCard, mockCard, mockCard];
    const otherCards: [TarotCard, TarotCard, TarotCard] = [
      { ...mockCard, name: "La Torre", slug: "la-torre", keywords: ["cambio"] },
      { ...mockCard, name: "La Luna", slug: "la-luna", keywords: ["intuición"] },
      { ...mockCard, name: "La Estrella", slug: "la-estrella", keywords: ["confianza"] },
    ];

    expect(buildThreeCardSynthesisFallback(config, cards, config.positions)).toEqual(
      buildThreeCardSynthesisFallback(config, cards, config.positions),
    );
    expect(buildThreeCardSynthesisFallback(config, cards, config.positions).mainPattern).not.toBe(
      buildThreeCardSynthesisFallback(config, otherCards, config.positions).mainPattern,
    );
  });
});

describe("Contrato de configuración no duplica tirada general", () => {
  it("Amor y General son configuraciones independientes", () => {
    const amor = threeCardReadings.amor;
    const general = threeCardReadings.general;

    expect(amor.slug).not.toBe(general.slug);
    expect(amor.positions[0].key).not.toBe(general.positions[0].key);
  });

  it("las posiciones de Amor son distintas a las de General", () => {
    const amorKeys = threeCardReadings.amor.positions.map((p) => p.key);
    const generalKeys = threeCardReadings.general.positions.map((p) => p.key);

    expect(amorKeys).not.toEqual(generalKeys);
  });

  it("Trabajo tiene posiciones únicas", () => {
    const allKeys: string[] = [];
    Object.values(threeCardReadings).forEach((config) => {
      config.positions.forEach((pos) => {
        allKeys.push(pos.key);
      });
    });

    const uniqueKeys = new Set(allKeys);
    expect(uniqueKeys.size).toBe(allKeys.length);
  });
});
