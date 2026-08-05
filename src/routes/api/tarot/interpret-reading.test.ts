import { describe, expect, it } from "vitest";
import {
  InterpretReadingRequestSchema,
  InterpretReadingResponseSchema,
} from "@/routes/api/tarot/interpret-reading";

describe("Endpoint interpret-reading", () => {
  describe("Schema de entrada", () => {
    it("acepta exactamente tres cartas", () => {
      const valid = InterpretReadingRequestSchema.safeParse({
        reading: { theme: "amor" },
        cards: [
          { slug: "el-mago", positionKey: "emotional_world" },
          { slug: "la-emperatriz", positionKey: "relationship_dynamic" },
          { slug: "el-sol", positionKey: "guidance_forward" },
        ],
        user: {
          context: "Estoy conociendo a alguien",
          requestId: "test-123",
        },
      });

      expect(valid.success).toBe(true);
    });

    it("rechaza menos de tres cartas", () => {
      const invalid = InterpretReadingRequestSchema.safeParse({
        reading: { theme: "amor" },
        cards: [
          { slug: "el-mago", positionKey: "emotional_world" },
          { slug: "la-emperatriz", positionKey: "relationship_dynamic" },
        ],
        user: { requestId: "test-123" },
      });

      expect(invalid.success).toBe(false);
    });

    it("rechaza más de tres cartas", () => {
      const invalid = InterpretReadingRequestSchema.safeParse({
        reading: { theme: "amor" },
        cards: [
          { slug: "el-mago", positionKey: "emotional_world" },
          { slug: "la-emperatriz", positionKey: "relationship_dynamic" },
          { slug: "el-sol", positionKey: "guidance_forward" },
          { slug: "la-luna", positionKey: "extra" },
        ],
        user: { requestId: "test-123" },
      });

      expect(invalid.success).toBe(false);
    });

    it("acepta temas válidos", () => {
      const themes = ["general", "amor", "trabajo", "decision"];

      themes.forEach((theme) => {
        const result = InterpretReadingRequestSchema.safeParse({
          reading: { theme },
          cards: [
            { slug: "el-mago", positionKey: "p1" },
            { slug: "la-emperatriz", positionKey: "p2" },
            { slug: "el-sol", positionKey: "p3" },
          ],
          user: { requestId: "test-123" },
        });

        expect(result.success).toBe(true);
      });
    });

    it("rechaza tema inválido", () => {
      const invalid = InterpretReadingRequestSchema.safeParse({
        reading: { theme: "invalid" },
        cards: [
          { slug: "el-mago", positionKey: "p1" },
          { slug: "la-emperatriz", positionKey: "p2" },
          { slug: "el-sol", positionKey: "p3" },
        ],
        user: { requestId: "test-123" },
      });

      expect(invalid.success).toBe(false);
    });

    it("contexto del usuario es opcional", () => {
      const withoutContext = InterpretReadingRequestSchema.safeParse({
        reading: { theme: "amor" },
        cards: [
          { slug: "el-mago", positionKey: "emotional_world" },
          { slug: "la-emperatriz", positionKey: "relationship_dynamic" },
          { slug: "el-sol", positionKey: "guidance_forward" },
        ],
        user: { requestId: "test-123" },
      });

      expect(withoutContext.success).toBe(true);
    });

    it("contexto del usuario tiene límite de 500 caracteres", () => {
      const tooLong = InterpretReadingRequestSchema.safeParse({
        reading: { theme: "amor" },
        cards: [
          { slug: "el-mago", positionKey: "p1" },
          { slug: "la-emperatriz", positionKey: "p2" },
          { slug: "el-sol", positionKey: "p3" },
        ],
        user: {
          context: "a".repeat(501),
          requestId: "test-123",
        },
      });

      expect(tooLong.success).toBe(false);
    });

    it("pregunta opcional con límite de 500 caracteres", () => {
      const valid = InterpretReadingRequestSchema.safeParse({
        reading: { theme: "amor" },
        cards: [
          { slug: "el-mago", positionKey: "p1" },
          { slug: "la-emperatriz", positionKey: "p2" },
          { slug: "el-sol", positionKey: "p3" },
        ],
        user: {
          question: "¿Qué me dicen estas cartas?",
          requestId: "test-123",
        },
      });

      expect(valid.success).toBe(true);
    });
  });

  describe("Schema de salida", () => {
    it("valida estructura correcta", () => {
      const valid = InterpretReadingResponseSchema.safeParse({
        schemaVersion: "tarot-three-card-reading@1",
        requestId: "test-123",
        positions: [
          {
            positionKey: "emotional_world",
            cardSlug: "el-mago",
            interpretation: "El Mago en tu mundo emocional sugiere recursos internos disponibles para manifestar.",
            positiveValue: "Capacidad de materializar lo que deseas en amor.",
            caution: "No dispersar energía en múltiples direcciones simultáneas.",
            practicalFocus: "Identifica qué recursos emocionales tienes ahora mismo.",
          },
          {
            positionKey: "relationship_dynamic",
            cardSlug: "la-emperatriz",
            interpretation: "La Emperatriz describe una dinámica de cuidado y nutrición mutua en el vínculo.",
            positiveValue: "Fertilidad emocional y crecimiento conjunto.",
            caution: "No descuidar tus propias necesidades por cuidar.",
            practicalFocus: "Observa cómo cuidas y eres cuidado en esta relación.",
          },
          {
            positionKey: "guidance_forward",
            cardSlug: "el-sol",
            interpretation: "El Sol ofrece claridad y optimismo como orientación para avanzar en amor.",
            positiveValue: "Luz y claridad en el camino afectivo.",
            caution: "No ignorar aspectos que requieren maduración o paciencia.",
            practicalFocus: "Permite que la situación se ilumine naturalmente con tiempo.",
          },
        ],
        synthesis: {
          mainPattern:
            "Las tres cartas sugieren un camino de recursos internos hacia claridad externa en amor.",
          relationshipBetweenCards:
            "El Mago activa, La Emperatriz nutre, El Sol ilumina. Hay una progresión natural.",
          emotionalTensionOrResource:
            "Un recurso: tienes capacidad interna que puede florecer hacia claridad afectiva.",
          guidance:
            "Confía en tus recursos, nutre la relación con paciencia y permite que la claridad llegue.",
          reflectionQuestion:
            "¿Cómo puedo usar mis recursos internos para nutrir esta situación hacia la claridad?",
        },
        meta: {
          source: "ai",
          fallbackUsed: false,
        },
      });

      if (!valid.success) {
        console.error("Validation errors:", valid.error.issues);
      }

      expect(valid.success).toBe(true);
    });

    it("rechaza si faltan posiciones", () => {
      const invalid = InterpretReadingResponseSchema.safeParse({
        schemaVersion: "tarot-three-card-reading@1",
        requestId: "test-123",
        positions: [
          {
            positionKey: "emotional_world",
            cardSlug: "el-mago",
            interpretation: "Interpretación válida con más de cincuenta caracteres aquí.",
            positiveValue: "Valor positivo con más de treinta caracteres.",
            caution: "Cautela con más de treinta caracteres también.",
            practicalFocus: "Enfoque práctico con más de treinta caracteres.",
          },
        ],
        synthesis: {
          mainPattern: "Patrón con más de cincuenta caracteres en esta descripción.",
          relationshipBetweenCards:
            "Relación entre cartas con más de cincuenta caracteres descritos.",
          emotionalTensionOrResource:
            "Tensión o recurso con más de cincuenta caracteres en descripción.",
          guidance: "Orientación con más de cincuenta caracteres descritos aquí.",
          reflectionQuestion: "¿Pregunta reflexiva?",
        },
        meta: {
          source: "ai",
          fallbackUsed: false,
        },
      });

      expect(invalid.success).toBe(false);
    });

    it("valida source como ai o fallback", () => {
      const validAi = InterpretReadingResponseSchema.safeParse({
        schemaVersion: "tarot-three-card-reading@1",
        requestId: "test-123",
        positions: [
          {
            positionKey: "p1",
            cardSlug: "el-mago",
            interpretation: "Interpretación válida con más de cincuenta caracteres aquí.",
            positiveValue: "Valor positivo con más de treinta caracteres.",
            caution: "Cautela con más de treinta caracteres también.",
            practicalFocus: "Enfoque práctico con más de treinta caracteres.",
          },
          {
            positionKey: "p2",
            cardSlug: "la-emperatriz",
            interpretation: "Interpretación válida con más de cincuenta caracteres aquí.",
            positiveValue: "Valor positivo con más de treinta caracteres.",
            caution: "Cautela con más de treinta caracteres también.",
            practicalFocus: "Enfoque práctico con más de treinta caracteres.",
          },
          {
            positionKey: "p3",
            cardSlug: "el-sol",
            interpretation: "Interpretación válida con más de cincuenta caracteres aquí.",
            positiveValue: "Valor positivo con más de treinta caracteres.",
            caution: "Cautela con más de treinta caracteres también.",
            practicalFocus: "Enfoque práctico con más de treinta caracteres.",
          },
        ],
        synthesis: {
          mainPattern: "Patrón con más de cincuenta caracteres en esta descripción completa.",
          relationshipBetweenCards:
            "Relación entre cartas con más de cincuenta caracteres descritos aquí.",
          emotionalTensionOrResource:
            "Tensión o recurso con más de cincuenta caracteres en descripción completa.",
          guidance: "Orientación con más de cincuenta caracteres descritos aquí en detalle.",
          reflectionQuestion: "¿Pregunta reflexiva?",
        },
        meta: {
          source: "fallback",
          fallbackUsed: true,
        },
      });

      expect(validAi.success).toBe(true);
    });

    it("rechaza source inválido", () => {
      const invalid = InterpretReadingResponseSchema.safeParse({
        schemaVersion: "tarot-three-card-reading@1",
        requestId: "test-123",
        positions: [],
        synthesis: {
          mainPattern: "Patrón",
          relationshipBetweenCards: "Relación",
          emotionalTensionOrResource: "Tensión",
          guidance: "Orientación",
          reflectionQuestion: "¿Pregunta?",
        },
        meta: {
          source: "invalid",
          fallbackUsed: false,
        },
      });

      expect(invalid.success).toBe(false);
    });
  });
});
