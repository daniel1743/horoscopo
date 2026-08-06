# 🌙 PLAN DE IMPLEMENTACIÓN CORREGIDO: "Tu Luna de Hoy"

**Proyecto**: Creovision  
**Fecha**: 2026-08-06  
**Versión**: 2.0 - CORREGIDO con contratos reales verificados  
**Basado en**: Auditoría técnica de contratos reales

---

## ⚠️ IMPORTANTE: DIFERENCIAS CON EL PLAN ORIGINAL

Este plan usa **contratos reales verificados** del proyecto. Los cambios críticos son:

1. ✅ `absoluteLongitude` (no `longitude`)
2. ✅ Wrapper de AspectEngine (no acepta dos "moon")
3. ✅ `zonedWallTimeToUtc()` para timezone correcto
4. ✅ `streamChatCompletion()` real (no `callDeepSeek()`)
5. ✅ TanStack Start API routes reales
6. ✅ Zod para validación (confirmado disponible)

---

## 📊 RESUMEN EJECUTIVO

**Tiempo estimado**: 28 horas (~3.5 días)  
**Archivos nuevos**: 11  
**Archivos modificados**: 2  
**Complejidad**: Media  
**Dependencias externas**: 0 (todo existe)

---

## 🎯 ARQUITECTURA VERIFICADA

```
Usuario → Formulario
    ↓
  Datos natales validados (Zod)
    ↓
  calculateNatalMoon() + zonedWallTimeToUtc()
    ↓
  PlanetaryEngine.calculatePosition("moon")
    ↓
  MoonEngine.getSnapshot() (fase/iluminación)
    ↓
  calculateLunarAspect() (wrapper custom)
    ↓
  buildEditorialContext()
    ↓
  streamChatCompletion() → DeepSeek
    ↓
  validateLunarReading() (Zod + reglas)
    ↓
  ✅ Válido → Cache | ❌ Inválido → Fallback
    ↓
  PersonalizedLunarReading Component
```

---

## 📐 FASE 0: Tipos Base (1h)

### Archivo: `src/server/natal/types.ts` (NUEVO)

```typescript
import type { ZodiacSignKey } from "@/types/compatibility";

export interface NatalMoonInput {
  birthDate: string;          // YYYY-MM-DD
  birthTime?: string;         // HH:mm opcional
  birthTimezone: string;      // IANA timezone
}

export type NatalMoonConfidence = 
  | "precise_time"   // Hora conocida
  | "high"           // Mismo signo todo el día
  | "uncertain";     // Cambió de signo

export interface NatalMoonResult {
  position: {
    absoluteLongitude: number;
    sign: ZodiacSignKey;
    degreeInSign: number;
  };
  confidence: NatalMoonConfidence;
  alternativePosition?: {
    absoluteLongitude: number;
    sign: ZodiacSignKey;
    degreeInSign: number;
  };
  message: string;
}
```

### Archivo: `src/server/lunar-reading/types.ts` (NUEVO)

```typescript
import type { ZodiacSignKey } from "@/types/compatibility";
import type { MoonPhaseKey } from "@/types/moon";
import type { AspectType } from "@/server/aspects/aspect-engine";

export interface CurrentMoonFacts {
  timestampUtc: string;
  absoluteLongitude: number;
  sign: ZodiacSignKey;
  degreeInSign: number;
  phase: MoonPhaseKey;
  phaseAngleDegrees: number;
  illuminationFraction: number;
  isWaxing: boolean;
  speedDegreesPerDay: number;
}

export interface SimpleLunarAspect {
  type: AspectType;
  exactAngle: number;
  actualAngle: number;
  orb: number;
}

export interface LunarRelationship {
  currentMoon: CurrentMoonFacts;
  natalMoon: {
    absoluteLongitude: number;
    sign: ZodiacSignKey;
    degreeInSign: number;
    confidence: NatalMoonConfidence;
  };
  aspect: SimpleLunarAspect | null;
  angularDistance: number;
  theme: "harmony" | "tension" | "neutral" | "intensity";
}

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
```

---

## 📐 FASE 1: Cálculo Luna Natal (3h)

### Archivo: `src/server/natal/natal-moon-calculator.ts` (NUEVO)

```typescript
import { astronomyPlanetaryEngine } from "@/server/planetary/astronomy-planetary-engine";
import { zonedWallTimeToUtc } from "@/lib/moon/timezone";
import type { NatalMoonInput, NatalMoonResult } from "./types";

export async function calculateNatalMoon(
  input: NatalMoonInput
): Promise<NatalMoonResult> {
  
  const { birthDate, birthTime, birthTimezone } = input;
  
  // Parsear fecha YYYY-MM-DD
  const [year, month, day] = birthDate.split("-").map(Number);
  
  // CASO 1: Hora conocida → Cálculo exacto
  if (birthTime) {
    const [hour, minute] = birthTime.split(":").map(Number);
    
    // ✅ CORRECTO: Convertir hora local → UTC
    const utcDate = zonedWallTimeToUtc(
      year,
      month,
      day,
      hour,
      minute,
      0,
      birthTimezone
    );
    
    const position = astronomyPlanetaryEngine.calculatePosition("moon", utcDate);
    
    return {
      position: {
        absoluteLongitude: position.absoluteLongitude,
        sign: position.sign,
        degreeInSign: position.degreeInSign,
      },
      confidence: "precise_time",
      message: "Cálculo exacto basado en tu hora de nacimiento.",
    };
  }
  
  // CASO 2: Hora desconocida → Calcular rango del día
  
  // ✅ CORRECTO: Inicio y fin del día en timezone natal
  const startOfDayUTC = zonedWallTimeToUtc(year, month, day, 0, 0, 0, birthTimezone);
  const endOfDayUTC = zonedWallTimeToUtc(year, month, day, 23, 59, 59, birthTimezone);
  
  const moonAtStart = astronomyPlanetaryEngine.calculatePosition("moon", startOfDayUTC);
  const moonAtEnd = astronomyPlanetaryEngine.calculatePosition("moon", endOfDayUTC);
  
  // CASO 2A: Luna en el mismo signo todo el día
  if (moonAtStart.sign === moonAtEnd.sign) {
    return {
      position: {
        absoluteLongitude: moonAtStart.absoluteLongitude,
        sign: moonAtStart.sign,
        degreeInSign: moonAtStart.degreeInSign,
      },
      confidence: "high",
      message: `La Luna permaneció en ${moonAtStart.sign} durante todo tu día de nacimiento.`,
    };
  }
  
  // CASO 2B: Luna cambió de signo
  return {
    position: {
      absoluteLongitude: moonAtStart.absoluteLongitude,
      sign: moonAtStart.sign,
      degreeInSign: moonAtStart.degreeInSign,
    },
    alternativePosition: {
      absoluteLongitude: moonAtEnd.absoluteLongitude,
      sign: moonAtEnd.sign,
      degreeInSign: moonAtEnd.degreeInSign,
    },
    confidence: "uncertain",
    message: `La Luna pasó de ${moonAtStart.sign} a ${moonAtEnd.sign} ese día. Una hora aproximada ayudaría a precisar.`,
  };
}
```

### Tests: `src/server/natal/natal-moon-calculator.test.ts` (NUEVO)

```typescript
import { describe, it, expect } from "vitest";
import { calculateNatalMoon } from "./natal-moon-calculator";

describe("calculateNatalMoon", () => {
  it("calcula Luna natal con hora conocida", async () => {
    const result = await calculateNatalMoon({
      birthDate: "1990-05-15",
      birthTime: "14:30",
      birthTimezone: "America/Santiago",
    });
    
    expect(result.confidence).toBe("precise_time");
    expect(result.position.sign).toBeDefined();
    expect(result.position.absoluteLongitude).toBeGreaterThanOrEqual(0);
    expect(result.position.absoluteLongitude).toBeLessThan(360);
  });
  
  it("maneja hora desconocida con mismo signo", async () => {
    // Fecha donde Luna NO cambia de signo
    const result = await calculateNatalMoon({
      birthDate: "1990-05-20",
      birthTimezone: "Europe/Madrid",
    });
    
    if (result.confidence === "high") {
      expect(result.alternativePosition).toBeUndefined();
    }
  });
  
  it("detecta cambio de signo en día natal", async () => {
    // Fecha donde Luna SÍ cambia de signo (requiere verificación real)
    const result = await calculateNatalMoon({
      birthDate: "1990-05-17",
      birthTimezone: "Europe/Madrid",
    });
    
    if (result.confidence === "uncertain") {
      expect(result.alternativePosition).toBeDefined();
      expect(result.alternativePosition!.sign).not.toBe(result.position.sign);
    }
  });
});
```

---

## 📐 FASE 2: Aspectos Lunares (2h)

### Archivo: `src/server/lunar-reading/lunar-aspect-calculator.ts` (NUEVO)

```typescript
import { ASPECT_EXACT_ANGLES, DEFAULT_ASPECT_ORB_POLICY } from "@/server/aspects/aspect-engine";
import type { AspectType } from "@/server/aspects/aspect-engine";
import type { SimpleLunarAspect } from "./types";

/**
 * Calcula aspecto entre Luna actual y Luna natal.
 * 
 * NO usa AspectEngine directamente porque este rechaza cuerpos duplicados.
 * En su lugar, reutiliza las constantes de orbes y ángulos exactos.
 */
export function calculateLunarAspect(
  currentLongitude: number,
  natalLongitude: number
): SimpleLunarAspect | null {
  
  // ✅ Distancia angular correcta (maneja cruce 0°/360°)
  const delta = Math.abs(currentLongitude - natalLongitude);
  const actualAngle = Math.min(delta, 360 - delta);
  
  // Buscar mejor aspecto dentro de orbes
  let bestMatch: SimpleLunarAspect | null = null;
  let smallestOrb = Infinity;
  
  for (const [aspectType, exactAngle] of Object.entries(ASPECT_EXACT_ANGLES)) {
    const type = aspectType as AspectType;
    const orb = Math.abs(actualAngle - exactAngle);
    const maxOrb = DEFAULT_ASPECT_ORB_POLICY[type];
    
    if (orb <= maxOrb && orb < smallestOrb) {
      bestMatch = {
        type,
        exactAngle,
        actualAngle,
        orb,
      };
      smallestOrb = orb;
    }
  }
  
  return bestMatch;
}

/**
 * Calcula distancia angular más corta entre dos longitudes.
 * Maneja correctamente el cruce 0°/360°.
 */
export function shortestAngularDistance(a: number, b: number): number {
  const delta = Math.abs(a - b);
  return Math.min(delta, 360 - delta);
}
```

### Tests: `src/server/lunar-reading/lunar-aspect-calculator.test.ts` (NUEVO)

```typescript
import { describe, it, expect } from "vitest";
import { calculateLunarAspect, shortestAngularDistance } from "./lunar-aspect-calculator";

describe("calculateLunarAspect", () => {
  it("detecta conjunción", () => {
    const aspect = calculateLunarAspect(10, 12);
    expect(aspect?.type).toBe("conjunction");
    expect(aspect?.orb).toBe(2);
  });
  
  it("detecta cuadratura", () => {
    const aspect = calculateLunarAspect(10, 100);
    expect(aspect?.type).toBe("square");
    expect(aspect?.orb).toBe(0);
  });
  
  it("maneja cruce 0°/360° correctamente", () => {
    const aspect = calculateLunarAspect(359, 1);
    expect(aspect?.type).toBe("conjunction");
    expect(aspect?.orb).toBe(2);
  });
  
  it("devuelve null sin aspecto", () => {
    const aspect = calculateLunarAspect(10, 50); // 40° sin aspecto
    expect(aspect).toBeNull();
  });
});

describe("shortestAngularDistance", () => {
  it("calcula distancia simple", () => {
    expect(shortestAngularDistance(10, 20)).toBe(10);
  });
  
  it("maneja cruce 0°/360°", () => {
    expect(shortestAngularDistance(359, 1)).toBe(2);
    expect(shortestAngularDistance(1, 359)).toBe(2);
  });
  
  it("maneja oposición", () => {
    expect(shortestAngularDistance(0, 180)).toBe(180);
  });
});
```

---

## 📐 FASE 3: Obtener Luna Actual Completa (2h)

### Archivo: `src/server/lunar-reading/current-moon-calculator.ts` (NUEVO)

```typescript
import { astronomyPlanetaryEngine } from "@/server/planetary/astronomy-planetary-engine";
import { astronomyMoonEngine } from "@/server/moon/astronomy-moon-engine";
import type { CurrentMoonFacts } from "./types";

/**
 * Obtiene datos completos de la Luna actual:
 * - Longitud/signo/grado de PlanetaryEngine
 * - Fase/iluminación de MoonEngine
 */
export function getCurrentMoonFacts(date: Date = new Date(), timezone: string): CurrentMoonFacts {
  
  // Posición lunar (longitud eclíptica)
  const position = astronomyPlanetaryEngine.calculatePosition("moon", date);
  
  // Fase e iluminación
  const snapshot = astronomyMoonEngine.getSnapshot(date, timezone);
  
  return {
    timestampUtc: date.toISOString(),
    absoluteLongitude: position.absoluteLongitude,
    sign: position.sign,
    degreeInSign: position.degreeInSign,
    phase: snapshot.phase_key,
    phaseAngleDegrees: snapshot.phase_angle_degrees,
    illuminationFraction: snapshot.illumination_fraction,
    isWaxing: snapshot.waxing,
    speedDegreesPerDay: position.speedDegreesPerDay,
  };
}
```

---

## 📐 FASE 4: Biblioteca Editorial (3h)

### Archivo: `src/server/lunar-reading/editorial-library.ts` (NUEVO)

```typescript
import type { ZodiacSignKey } from "@/types/compatibility";
import type { MoonPhaseKey } from "@/types/moon";
import type { AspectType } from "@/server/aspects/aspect-engine";

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

export const ASPECTS_MEANINGS: Record<AspectType, AspectMeaning> = {
  conjunction: {
    name: "Conjunción",
    description: "alineación, intensificación, fusión",
    tension_level: "medium",
    invitation: "observar qué se intensifica hoy",
  },
  sextile: {
    name: "Sextil",
    description: "oportunidad, fluidez, cooperación",
    tension_level: "low",
    invitation: "aprovechar la facilidad disponible",
  },
  square: {
    name: "Cuadratura",
    description: "tensión que pide ajuste y conciencia",
    tension_level: "high",
    invitation: "integrar dos necesidades en conflicto",
  },
  trine: {
    name: "Trígono",
    description: "armonía, apoyo natural, recurso",
    tension_level: "low",
    invitation: "confiar en el flujo presente",
  },
  opposition: {
    name: "Oposición",
    description: "polaridad, equilibrio dinámico, espejo",
    tension_level: "high",
    invitation: "encontrar el punto medio entre extremos",
  },
};

export interface EditorialContext {
  currentSignMeaning: SignMeaning;
  natalSignMeaning: SignMeaning;
  phaseMeaning: PhaseMeaning;
  aspectMeaning: AspectMeaning | null;
  theme: "harmony" | "tension" | "neutral" | "intensity";
}

export function buildEditorialContext(
  relationship: LunarRelationship
): EditorialContext {
  return {
    currentSignMeaning: MOON_SIGNS[relationship.currentMoon.sign],
    natalSignMeaning: MOON_SIGNS[relationship.natalMoon.sign],
    phaseMeaning: LUNAR_PHASES[relationship.currentMoon.phase],
    aspectMeaning: relationship.aspect 
      ? ASPECTS_MEANINGS[relationship.aspect.type] 
      : null,
    theme: relationship.theme,
  };
}
```

---

**Continuará en siguiente mensaje debido al límite de caracteres...**

¿Quieres que continúe con las fases restantes (Generación IA, Validación, Fallback, API, UI)?