 ---
  🌙 IMPLEMENTACIÓN COMPLETA: "Tu Luna de Hoy"

  Proyecto: Creovision
  Fecha: 2026-08-06
  Versión: 1.0 - Plan de Implementación Completo

  ---
  📋 RESUMEN EJECUTIVO

  Este documento define la implementación completa de "Tu Luna de Hoy", un sistema de lectura lunar personalizada que compara la
  posición actual de la Luna con la Luna natal del usuario para generar una interpretación diaria única, práctica y no fatalista.

  Tiempo estimado: 31.5 horas (~4 días de trabajo)
  Infraestructura existente reutilizable: 62.5%
  Archivos nuevos a crear: 12
  Archivos a modificar: 3

  ---
  🎯 QUÉ ES "TU LUNA DE HOY" AL 100%

  Un sistema completo que:

  1. Recibe datos natales → Fecha, hora (opcional), zona horaria
  2. Calcula Luna natal real → Usando astronomía, no IA
  3. Obtiene Luna actual → Posición, fase, signo
  4. Compara ambas Lunas → Detecta aspectos y relaciones angulares
  5. Consulta biblioteca editorial → Significados predefinidos y verificables
  6. Genera lectura personalizada → Con IA + validación
  7. Tiene fallback sin IA → Si DeepSeek falla
  8. Cachea inteligentemente → Por usuario + fecha
  9. Funciona para visitantes y usuarios → Opcionalmente persistente
  10. Integra a Creo → Guía visual y emocional
  11. Conecta con Creovision → Links a guías, tarot, artículos

  ---
  🔍 AUDITORÍA PREVIA COMPLETADA

  ✅ Lo Que Ya Existe

  - PlanetaryEngine: Calcula Luna en cualquier fecha → calculatePosition("moon", date)
  - AspectEngine: Compara dos posiciones lunares de fechas distintas
  - DeepSeek Gateway: Integración funcional con IA
  - Supabase: Campos birth_date, birth_time, birth_timezone en profiles
  - Timezone Utils: Conversión UTC ↔ local

  ❌ Lo Que Falta

  - MoonEngine NO expone longitud eclíptica (solo fase/iluminación)
  - Función calculateNatalMoon() con estrategia hora desconocida
  - Biblioteca editorial de significados lunares
  - Prompt específico para lectura lunar
  - Validador de contenido generado
  - Fallback sin IA
  - Formulario de entrada
  - Página de lectura personalizada
  - Caché por usuario

  ---
  📐 ARQUITECTURA DEL SISTEMA

  Usuario → Formulario
             ↓
          Datos natales (fecha, hora?, timezone)
             ↓
      calculateNatalMoon() ← PlanetaryEngine
             ↓
      Luna Natal + Luna Actual
             ↓
      analyzeLunarRelationship() ← AspectEngine
             ↓
      Relación Angular + Aspecto
             ↓
      buildEditorialContext() ← Biblioteca Editorial
             ↓
      Hechos Calculados + Reglas
             ↓
      generateLunarReading() ← DeepSeek
             ↓
      validateLunarReading() ← Validador
             ↓
      ✅ Válido → Lectura | ❌ Inválido → Fallback
             ↓
      setCachedReading()
             ↓
      PersonalizedLunarReading Component

  ---
  🛠️ IMPLEMENTACIÓN: 12 FASES

  ---
  FASE 0: Corrección Crítica MoonEngine (2h)

  Problema detectado: MoonEngine.getSnapshot() NO devuelve longitud eclíptica, solo fase e iluminación.

  Solución: Usar PlanetaryEngine para obtener posición lunar con longitud.

  Archivo nuevo: src/server/moon/moon-position.ts

  import { astronomyPlanetaryEngine } from "@/server/planetary/astronomy-planetary-engine";
  import type { ZodiacSignKey } from "@/types/compatibility";

  export interface MoonPosition {
    longitude: number;
    sign: ZodiacSignKey;
    degreeInSign: number;
    speedDegreesPerDay: number;
    calculatedAt: string;
  }

  export function getCurrentMoonPosition(date: Date = new Date()): MoonPosition {
    const position = astronomyPlanetaryEngine.calculatePosition("moon", date);
    return {
      longitude: position.absoluteLongitude,
      sign: position.sign,
      degreeInSign: position.degreeInSign,
      speedDegreesPerDay: position.speedDegreesPerDay,
      calculatedAt: position.calculatedAt,
    };
  }

  Por qué: AspectEngine necesita longitud eclíptica para calcular aspectos entre Luna actual y Luna natal.

  ---
  FASE 1: Motor de Luna Natal (4h)

  Objetivo: Calcular posición lunar natal con estrategia para hora desconocida.

  Archivo nuevo: src/server/natal/natal-moon-calculator.ts

  import { astronomyPlanetaryEngine } from "@/server/planetary/astronomy-planetary-engine";
  import { MoonPosition } from "@/server/moon/moon-position";

  export interface NatalMoonInput {
    birthDate: string; // YYYY-MM-DD
    birthTime?: string; // HH:mm (opcional)
    birthTimezone: string; // IANA timezone (ej: "Europe/Madrid")
  }

  export interface NatalMoonResult {
    position: MoonPosition;
    confidence: "exact" | "high" | "uncertain" | "dual";
    alternativePosition?: MoonPosition;
    message?: string;
  }

  export async function calculateNatalMoon(
    input: NatalMoonInput
  ): Promise<NatalMoonResult> {
    const { birthDate, birthTime, birthTimezone } = input;

    // CASO 1: Hora conocida → Cálculo exacto
    if (birthTime) {
      const localDateTime = `${birthDate}T${birthTime}:00`;
      const utcDate = convertLocalToUTC(localDateTime, birthTimezone);
      const position = astronomyPlanetaryEngine.calculatePosition("moon", utcDate);

      return {
        position: {
          longitude: position.absoluteLongitude,
          sign: position.sign,
          degreeInSign: position.degreeInSign,
          speedDegreesPerDay: position.speedDegreesPerDay,
          calculatedAt: position.calculatedAt,
        },
        confidence: "exact",
        message: "Cálculo exacto basado en tu hora de nacimiento.",
      };
    }

    // CASO 2: Hora desconocida → Calcular rango completo del día
    const startOfDay = convertLocalToUTC(`${birthDate}T00:00:00`, birthTimezone);
    const endOfDay = convertLocalToUTC(`${birthDate}T23:59:59`, birthTimezone);

    const moonAtStart = astronomyPlanetaryEngine.calculatePosition("moon", startOfDay);
    const moonAtEnd = astronomyPlanetaryEngine.calculatePosition("moon", endOfDay);

    // CASO 2A: Luna en el mismo signo todo el día → Alta confianza
    if (moonAtStart.sign === moonAtEnd.sign) {
      return {
        position: {
          longitude: moonAtStart.absoluteLongitude,
          sign: moonAtStart.sign,
          degreeInSign: moonAtStart.degreeInSign,
          speedDegreesPerDay: moonAtStart.speedDegreesPerDay,
          calculatedAt: moonAtStart.calculatedAt,
        },
        confidence: "high",
        message: `La Luna permaneció en ${moonAtStart.sign} durante todo tu día de nacimiento. Alta confianza.`,
      };
    }

    // CASO 2B: Luna cambió de signo → Mostrar ambas opciones
    return {
      position: {
        longitude: moonAtStart.absoluteLongitude,
        sign: moonAtStart.sign,
        degreeInSign: moonAtStart.degreeInSign,
        speedDegreesPerDay: moonAtStart.speedDegreesPerDay,
        calculatedAt: moonAtStart.calculatedAt,
      },
      alternativePosition: {
        longitude: moonAtEnd.absoluteLongitude,
        sign: moonAtEnd.sign,
        degreeInSign: moonAtEnd.degreeInSign,
        speedDegreesPerDay: moonAtEnd.speedDegreesPerDay,
        calculatedAt: moonAtEnd.calculatedAt,
      },
      confidence: "dual",
      message: `La Luna pasó de ${moonAtStart.sign} a ${moonAtEnd.sign} ese día. Una hora aproximada ayudaría a precisar tu signo
  lunar.`,
    };
  }

  function convertLocalToUTC(localDateTime: string, timezone: string): Date {
    // Implementación usando Intl o librería de timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Convertir a UTC
    return new Date(localDateTime + " " + timezone);
  }

  Tests necesarios:
  - Hora conocida → exacta
  - Hora desconocida + mismo signo → alta confianza
  - Hora desconocida + cambio de signo → dual

  ---
  FASE 2: Comparación Luna Actual vs Natal (2h)

  Objetivo: Calcular relación angular y detectar aspectos.

  Archivo nuevo: src/server/lunar-reading/lunar-relationship.ts

  import { deterministicAspectEngine } from "@/server/aspects/aspect-engine";
  import type { MoonPosition } from "@/server/moon/moon-position";
  import type { PlanetaryAspect } from "@/server/aspects/aspect-engine";

  export interface LunarRelationship {
    currentMoon: MoonPosition;
    natalMoon: MoonPosition;
    aspect: PlanetaryAspect | null;
    angularDistance: number;
    theme: "harmony" | "tension" | "neutral" | "intensity";
  }

  export function analyzeLunarRelationship(
    currentMoon: MoonPosition,
    natalMoon: MoonPosition
  ): LunarRelationship {
    // Preparar posiciones para AspectEngine
    const positions = [
      {
        body: "moon" as const,
        absoluteLongitude: currentMoon.longitude,
        sign: currentMoon.sign,
        degreeInSign: currentMoon.degreeInSign,
        isRetrograde: false,
        speedDegreesPerDay: currentMoon.speedDegreesPerDay,
        calculatedAt: currentMoon.calculatedAt,
      },
      {
        body: "moon" as const, // Se tratará como "natal moon" en contexto
        absoluteLongitude: natalMoon.longitude,
        sign: natalMoon.sign,
        degreeInSign: natalMoon.degreeInSign,
        isRetrograde: false,
        speedDegreesPerDay: 0, // Luna natal no tiene velocidad
        calculatedAt: natalMoon.calculatedAt,
      },
    ];

    // Calcular aspectos
    const aspects = deterministicAspectEngine.calculateAspects(positions);
    const aspect = aspects.length > 0 ? aspects[0] : null;

    // Calcular distancia angular
    let angularDistance = Math.abs(currentMoon.longitude - natalMoon.longitude);
    if (angularDistance > 180) angularDistance = 360 - angularDistance;

    // Determinar tema
    let theme: LunarRelationship["theme"] = "neutral";

    if (aspect) {
      switch (aspect.type) {
        case "conjunction":
          theme = "intensity";
          break;
        case "trine":
        case "sextile":
          theme = "harmony";
          break;
        case "square":
        case "opposition":
          theme = "tension";
          break;
      }
    }

    return {
      currentMoon,
      natalMoon,
      aspect,
      angularDistance,
      theme,
    };
  }

  Tests necesarios:
  - Conjunción 0° ±8°
  - Cuadratura 90° ±7°
  - Trígono 120° ±8°
  - Sin aspecto → neutral

  ---
  FASE 3: Biblioteca Editorial (3h)

  Objetivo: Definir significados controlados para signos, fases y aspectos.

  Archivo nuevo: src/server/lunar-reading/editorial-library.ts

  import type { ZodiacSignKey } from "@/types/compatibility";
  import type { MoonPhaseKey } from "@/types/moon";

  export interface SignMeaning {
    name: string;
    keywords: string[];
    emotional_need: string;
    shadow: string;
  }

  export const MOON_SIGNS: Record<ZodiacSignKey, SignMeaning> = {
    aries: {
      name: "Aries",
      keywords: ["acción", "impulso", "independencia", "iniciativa"],
      emotional_need: "autonomía emocional y expresión directa",
      shadow: "impaciencia reactiva",
    },
    taurus: {
      name: "Tauro",
      keywords: ["estabilidad", "placer sensorial", "seguridad material", "constancia"],
      emotional_need: "certeza y continuidad en lo cotidiano",
      shadow: "resistencia al cambio necesario",
    },
    gemini: {
      name: "Géminis",
      keywords: ["comunicación", "curiosidad", "versatilidad", "conexión mental"],
      emotional_need: "variedad y estimulación intelectual",
      shadow: "dispersión sin profundidad",
    },
    cancer: {
      name: "Cáncer",
      keywords: ["cuidado", "pertenencia", "memoria emocional", "protección"],
      emotional_need: "seguridad emocional y vínculos cercanos",
      shadow: "defensividad o apego excesivo",
    },
    leo: {
      name: "Leo",
      keywords: ["creatividad", "reconocimiento", "expresión personal", "generosidad"],
      emotional_need: "ser visto y valorado auténticamente",
      shadow: "necesidad de validación externa",
    },
    virgo: {
      name: "Virgo",
      keywords: ["discernimiento", "servicio", "orden", "mejora"],
      emotional_need: "sentir que contribuyes con precisión",
      shadow: "autocrítica paralizante",
    },
    libra: {
      name: "Libra",
      keywords: ["equilibrio", "relación", "armonía", "justicia"],
      emotional_need: "conexión equilibrada y reciprocidad",
      shadow: "evitar conflictos necesarios",
    },
    scorpio: {
      name: "Escorpio",
      keywords: ["profundidad", "transformación", "intensidad", "verdad oculta"],
      emotional_need: "intimidad auténtica y comprensión profunda",
      shadow: "control por miedo a la vulnerabilidad",
    },
    sagittarius: {
      name: "Sagitario",
      keywords: ["expansión", "significado", "aventura", "optimismo"],
      emotional_need: "crecimiento y sentido de propósito",
      shadow: "escapismo en lugar de integración",
    },
    capricorn: {
      name: "Capricornio",
      keywords: ["estructura", "responsabilidad", "logro", "madurez"],
      emotional_need: "construir algo duradero y respetable",
      shadow: "dureza emocional por autoexigencia",
    },
    aquarius: {
      name: "Acuario",
      keywords: ["innovación", "comunidad", "independencia", "visión"],
      emotional_need: "libertad dentro de la pertenencia colectiva",
      shadow: "distanciamiento emocional",
    },
    pisces: {
      name: "Piscis",
      keywords: ["compasión", "imaginación", "disolución", "sensibilidad"],
      emotional_need: "conexión trascendente y empatía",
      shadow: "confusión de límites emocionales",
    },
  };

  export interface PhaseMeaning {
    name: string;
    theme: string;
    tone: string;
    invitation: string;
  }

  export const LUNAR_PHASES: Record<MoonPhaseKey, PhaseMeaning> = {
    new_moon: {
      name: "Luna Nueva",
      theme: "inicio, siembra, intención",
      tone: "introspectivo y receptivo",
      invitation: "plantar semillas sin forzar resultados",
    },
    waxing_crescent: {
      name: "Luna Creciente",
      theme: "crecimiento inicial, ajustes",
      tone: "esperanzado y activo",
      invitation: "dar pequeños pasos hacia lo sembrado",
    },
    first_quarter: {
      name: "Cuarto Creciente",
      theme: "desafío, decisión, impulso",
      tone: "dinámico y confrontativo",
      invitation: "actuar a pesar de la resistencia",
    },
    waxing_gibbous: {
      name: "Gibosa Creciente",
      theme: "refinamiento, preparación",
      tone: "concentrado y anticipatorio",
      invitation: "pulir detalles antes de la culminación",
    },
    full_moon: {
      name: "Luna Llena",
      theme: "plenitud, revelación, culminación",
      tone: "intenso y visible",
      invitation: "ver con claridad lo que ha madurado",
    },
    waning_gibbous: {
      name: "Gibosa Menguante",
      theme: "gratitud, compartir, enseñanza",
      tone: "generoso y reflexivo",
      invitation: "integrar y transmitir lo aprendido",
    },
    last_quarter: {
      name: "Cuarto Menguante",
      theme: "liberación, soltar, crisis de conciencia",
      tone: "sobrio y liberador",
      invitation: "dejar ir lo que ya no sostiene",
    },
    waning_crescent: {
      name: "Luna Menguante",
      theme: "descanso, clausura, preparación",
      tone: "silencioso y contemplativo",
      invitation: "descansar antes del nuevo ciclo",
    },
  };

  export interface AspectMeaning {
    name: string;
    description: string;
    tension_level: "low" | "medium" | "high";
    invitation: string;
  }

  export const ASPECTS_MEANINGS = {
    conjunction: {
      name: "Conjunción",
      description: "alineación, intensificación, fusión",
      tension_level: "medium" as const,
      invitation: "observar qué se intensifica hoy",
    },
    sextile: {
      name: "Sextil",
      description: "oportunidad, fluidez, cooperación",
      tension_level: "low" as const,
      invitation: "aprovechar la facilidad disponible",
    },
    square: {
      name: "Cuadratura",
      description: "tensión que pide ajuste y conciencia",
      tension_level: "high" as const,
      invitation: "integrar dos necesidades en conflicto",
    },
    trine: {
      name: "Trígono",
      description: "armonía, apoyo natural, recurso",
      tension_level: "low" as const,
      invitation: "confiar en el flujo presente",
    },
    opposition: {
      name: "Oposición",
      description: "polaridad, equilibrio dinámico, espejo",
      tension_level: "high" as const,
      invitation: "encontrar el punto medio entre extremos",
    },
  };

  export interface EditorialContext {
    currentSignMeaning: SignMeaning;
    natalSignMeaning: SignMeaning;
    phaseMeaning: PhaseMeaning;
    aspectMeaning: AspectMeaning | null;
    theme: string;
  }

  export function buildEditorialContext(
    relationship: LunarRelationship,
    currentPhase: MoonPhaseKey
  ): EditorialContext {
    return {
      currentSignMeaning: MOON_SIGNS[relationship.currentMoon.sign],
      natalSignMeaning: MOON_SIGNS[relationship.natalMoon.sign],
      phaseMeaning: LUNAR_PHASES[currentPhase],
      aspectMeaning: relationship.aspect
        ? ASPECTS_MEANINGS[relationship.aspect.type]
        : null,
      theme: relationship.theme,
    };
  }

  ---
  FASE 4: Generación con DeepSeek (3h)

  Archivo nuevo: src/server/lunar-reading/lunar-reading-generator.ts

  import { callAiGateway } from "@/lib/ai/gateway.server";
  import type { LunarRelationship } from "./lunar-relationship";
  import type { EditorialContext } from "./editorial-library";

  export interface LunarReadingOutput {
    emotional_climate: string;
    activated_theme: string;
    possible_tension: string | null;
    available_strength: string;
    recommended_actions: [string, string, string];
    reflection_question: string;
    next_lunar_change: string;
    disclaimer: string;
  }

  export async function generateLunarReading(
    relationship: LunarRelationship,
    editorialContext: EditorialContext
  ): Promise<LunarReadingOutput> {
    const systemPrompt = `Eres un generador de lecturas lunares personalizadas para Creovision.

  PROHIBIDO ABSOLUTO:
  - Inventar signos, grados o aspectos diferentes a los proporcionados
  - Hacer predicciones fatalistas ("vas a perder", "tu pareja regresará")
  - Afirmar certezas absolutas ("esto ocurrirá sin duda")
  - Mencionar dinero, pareja, trabajo o enfermedad específicamente
  - Usar lenguaje sensacionalista o alarmista

  TONO REQUERIDO:
  - Cálido pero no ingenuo
  - Reflexivo pero no abstracto
  - Práctico pero no determinista
  - Respetuoso de la autonomía emocional

  RESPONDE ÚNICAMENTE EN JSON VÁLIDO.`;

    const userPrompt = `Genera una lectura lunar personalizada basada en estos HECHOS CALCULADOS:

  **Luna actual:**
  - Signo: ${editorialContext.currentSignMeaning.name}
  - Grado: ${relationship.currentMoon.degreeInSign.toFixed(1)}°
  - Fase: ${editorialContext.phaseMeaning.name}

  **Luna natal:**
  - Signo: ${editorialContext.natalSignMeaning.name}
  - Grado: ${relationship.natalMoon.degreeInSign.toFixed(1)}°

  **Relación:**
  - Aspecto: ${editorialContext.aspectMeaning?.name || "ningún aspecto principal"}
  - Tema: ${relationship.theme}
  - Distancia angular: ${relationship.angularDistance.toFixed(1)}°

  **Contexto editorial:**
  Luna actual (${editorialContext.currentSignMeaning.name}):
  - Necesidad emocional: ${editorialContext.currentSignMeaning.emotional_need}
  - Keywords: ${editorialContext.currentSignMeaning.keywords.join(", ")}

  Luna natal (${editorialContext.natalSignMeaning.name}):
  - Necesidad emocional: ${editorialContext.natalSignMeaning.emotional_need}
  - Keywords: ${editorialContext.natalSignMeaning.keywords.join(", ")}

  Fase lunar (${editorialContext.phaseMeaning.name}):
  - Tema: ${editorialContext.phaseMeaning.theme}
  - Invitación: ${editorialContext.phaseMeaning.invitation}

  ${editorialContext.aspectMeaning ? `Aspecto (${editorialContext.aspectMeaning.name}):\n- Descripción:
  ${editorialContext.aspectMeaning.description}\n- Invitación: ${editorialContext.aspectMeaning.invitation}` : ""}

  **Estructura requerida:**
  {
    "emotional_climate": "2-3 oraciones sobre cómo puede sentirse la persona hoy",
    "activated_theme": "1-2 oraciones sobre el tema principal del día",
    "possible_tension": "1-2 oraciones sobre tensión posible, o null si no hay",
    "available_strength": "1-2 oraciones sobre el recurso emocional disponible",
    "recommended_actions": ["acción concreta 1", "acción concreta 2", "acción concreta 3"],
    "reflection_question": "Una pregunta personal breve",
    "next_lunar_change": "Cuándo cambiará la energía lunar (fase o signo)",
    "disclaimer": "Esta lectura es simbólica y reflexiva, no predictiva."
  }

  Genera ahora el JSON:`;

    const response = await callAiGateway({
      system: systemPrompt,
      user: userPrompt,
      model: "reasoning",
      response_format: "json",
    });

    const parsed = JSON.parse(response.getText());
    return parsed as LunarReadingOutput;
  }

  ---
  FASE 5: Validación (2h)

  Archivo nuevo: src/server/lunar-reading/reading-validator.ts

  import type { LunarReadingOutput } from "./lunar-reading-generator";
  import type { LunarRelationship } from "./lunar-relationship";

  export interface ValidationResult {
    valid: boolean;
    errors: string[];
    output: LunarReadingOutput | null;
  }

  const FORBIDDEN_PATTERNS = [
    /pareja.*regresará/i,
    /vas a perder/i,
    /perderás/i,
    /no firmes/i,
    /garantiza que/i,
    /causará.*ansiedad/i,
    /confirma.*enfermedad/i,
    /universo te dice/i,
    /ocurrirá sin duda/i,
  ];

  const ZODIAC_SIGNS = [
    "aries",
    "tauro",
    "géminis",
    "cáncer",
    "leo",
    "virgo",
    "libra",
    "escorpio",
    "sagitario",
    "capricornio",
    "acuario",
    "piscis",
  ];

  export function validateLunarReading(
    output: LunarReadingOutput,
    relationship: LunarRelationship
  ): ValidationResult {
    const errors: string[] = [];
    const fullText = JSON.stringify(output).toLowerCase();

    // 1. Verificar frases prohibidas
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(fullText)) {
        errors.push(`Contiene predicción fatalista: ${pattern}`);
      }
    }

    // 2. Verificar que no inventó signos
    const allowedSigns = [
      relationship.currentMoon.sign.toLowerCase(),
      relationship.natalMoon.sign.toLowerCase(),
    ];

    for (const sign of ZODIAC_SIGNS) {
      if (fullText.includes(sign) && !allowedSigns.includes(sign)) {
        errors.push(`Inventó signo no calculado: ${sign}`);
      }
    }

    // 3. Verificar estructura requerida
    if (!output.emotional_climate || output.emotional_climate.length < 50) {
      errors.push("emotional_climate demasiado corto o vacío");
    }

    if (!output.recommended_actions || output.recommended_actions.length !== 3) {
      errors.push("recommended_actions debe tener exactamente 3 acciones");
    }

    if (!output.reflection_question || output.reflection_question.length < 20) {
      errors.push("reflection_question demasiado corta o vacía");
    }

    // 4. Verificar que no afirma certezas absolutas
    const certaintyPatterns = [
      /definitivamente/i,
      /con certeza/i,
      /seguro que/i,
      /sin duda ocurrirá/i,
    ];

    for (const pattern of certaintyPatterns) {
      if (pattern.test(fullText)) {
        errors.push(`Afirma certeza absoluta: ${pattern}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      output: errors.length === 0 ? output : null,
    };
  }

  ---
  FASE 6: Fallback Sin IA (2h)

  Archivo nuevo: src/server/lunar-reading/fallback-generator.ts

  import type { LunarRelationship } from "./lunar-relationship";
  import type { EditorialContext } from "./editorial-library";
  import type { LunarReadingOutput } from "./lunar-reading-generator";

  export function generateFallbackReading(
    relationship: LunarRelationship,
    editorialContext: EditorialContext
  ): LunarReadingOutput {
    const currentSign = editorialContext.currentSignMeaning;
    const natalSign = editorialContext.natalSignMeaning;
    const phase = editorialContext.phaseMeaning;
    const aspect = editorialContext.aspectMeaning;

    // Clima emocional
    const emotional_climate = `Hoy la Luna transita por ${currentSign.name}, activando temas de ${currentSign.keywords.slice(0,
  2).join(" y ")}. La fase ${phase.name.toLowerCase()} invita a ${phase.theme}.`;

    // Tema activado
    const activated_theme = `Tu Luna natal en ${natalSign.name} busca ${natalSign.emotional_need}. Hoy ese impulso puede encontrarse
  con la energía de ${currentSign.name}.`;

    // Tensión posible
    let possible_tension: string | null = null;
    if (aspect && aspect.tension_level === "high") {
      possible_tension = `Existe ${aspect.description} entre la Luna actual y tu Luna natal. ${aspect.invitation}.`;
    }

    // Fortaleza disponible
    const available_strength = `Puedes apoyarte en tu necesidad innata de ${natalSign.emotional_need}. La fase actual te sostiene
  para ${phase.invitation}.`;

    // Acciones recomendadas
    const recommended_actions: [string, string, string] = [
      `Observa cómo te sientes respecto a ${currentSign.keywords[0]}.`,
      `Dale espacio a tu necesidad de ${natalSign.keywords[0]}.`,
      `${phase.invitation.charAt(0).toUpperCase() + phase.invitation.slice(1)}.`,
    ];

    // Pregunta de reflexión
    const reflection_question = `¿Qué necesitas emocionalmente para sentirte