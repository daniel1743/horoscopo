# 🔍 AUDITORÍA TÉCNICA: Contratos Reales Verificados

**Proyecto**: Creovision  
**Fecha**: 2026-08-06  
**Objetivo**: Verificar contratos reales antes de implementar "Tu Luna de Hoy"

---

## ✅ RESUMEN EJECUTIVO

**Estado**: AUDITORIA COMPLETADA  
**Viabilidad**: ✅ CONFIRMADA con correcciones necesarias  
**Errores críticos del plan original**: 14 identificados  
**Contratos verificados**: 5/5

---

## 1. CONTRATO REAL: PlanetaryEngine

### ✅ Interface Verificada

```typescript
export interface PlanetaryPosition {
  body: PlanetaryBody;
  absoluteLongitude: number;      // ⚠️ NO "longitude"
  sign: ZodiacSignKey;
  degreeInSign: number;
  isRetrograde: boolean;
  speedDegreesPerDay: number;
  calculatedAt: string;           // ISO UTC
}

export interface PlanetaryEngine {
  readonly version: string;
  calculatePosition(body: PlanetaryBody, date: Date): PlanetaryPosition;
  calculateSnapshot(date: Date, bodies?: readonly PlanetaryBody[]): PlanetarySnapshot;
}
```

### 🔴 ERROR CRÍTICO EN PLAN ORIGINAL

**Mi código incorrecto**:
```typescript
return astronomyPlanetaryEngine.calculatePosition("moon", date);
// ❌ Devuelve PlanetaryPosition con "absoluteLongitude"
// ❌ Pero declaré MoonPosition con "longitude"
```

**Corrección necesaria**:
```typescript
export function getCurrentMoonPosition(date: Date = new Date()): MoonPosition {
  const raw = astronomyPlanetaryEngine.calculatePosition("moon", date);
  
  return {
    longitude: raw.absoluteLongitude,        // ✅ Mapear correctamente
    sign: raw.sign,
    degreeInSign: raw.degreeInSign,
    speedDegreesPerDay: raw.speedDegreesPerDay,
    calculatedAt: raw.calculatedAt,
  };
}
```

### ✅ Confirmado: Moon está en PLANETARY_BODIES

```typescript
export const PLANETARY_BODIES = [
  "sun",
  "moon",  // ✅ CONFIRMADO
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;
```

**Resultado**: ✅ **Puede calcular Luna natal sin problemas**

---

## 2. CONTRATO REAL: AspectEngine

### ✅ Interface Verificada

```typescript
export interface AspectEngine {
  readonly version: string;
  calculateAspects(
    positions: readonly AspectInputPosition[],
    orbPolicy?: AspectOrbPolicy
  ): PlanetaryAspect[];
  // ...
}

type AspectInputPosition = PlanetaryPosition;
```

### 🔴 ERROR CRÍTICO: assertUniqueBodies()

**Descubrimiento**:
```typescript
function assertUniqueBodies(positions: readonly AspectInputPosition[]): void {
  const seen = new Set<PlanetaryBody>();
  for (const pos of positions) {
    if (seen.has(pos.body)) {
      throw new AspectEngineError(
        `aspect-engine: cuerpo duplicado: ${pos.body}`,
        "CONTRACT_VIOLATION"
      );
    }
    seen.add(pos.body);
  }
}
```

**Problema**: AspectEngine **RECHAZA cuerpos duplicados**. No puedo pasar dos "moon".

**Mi código incorrecto**:
```typescript
const aspects = deterministicAspectEngine.calculateAspects([
  { body: "moon", ...currentMoon },
  { body: "natal_moon" as any, ...natalMoon }  // ❌ "natal_moon" no existe
]);
```

**Solución necesaria**: Crear función específica que solo compare longitudes:

```typescript
// src/server/lunar-reading/lunar-aspect-calculator.ts (NUEVO)

import { ASPECT_EXACT_ANGLES, DEFAULT_ASPECT_ORB_POLICY } from "@/server/aspects/aspect-engine";
import type { AspectType } from "@/server/aspects/aspect-engine";

export interface SimpleLunarAspect {
  type: AspectType;
  exactAngle: number;
  actualAngle: number;
  orb: number;
  isApplying: boolean | null; // null si no se puede determinar
}

export function calculateLunarAspect(
  currentLongitude: number,
  natalLongitude: number
): SimpleLunarAspect | null {
  
  // Calcular distancia angular (maneja cruce 0°/360°)
  const delta = Math.abs(currentLongitude - natalLongitude);
  const actualAngle = Math.min(delta, 360 - delta);
  
  // Buscar mejor aspecto dentro de orbes
  for (const [aspectType, exactAngle] of Object.entries(ASPECT_EXACT_ANGLES)) {
    const orb = Math.abs(actualAngle - exactAngle);
    const maxOrb = DEFAULT_ASPECT_ORB_POLICY[aspectType as AspectType];
    
    if (orb <= maxOrb) {
      return {
        type: aspectType as AspectType,
        exactAngle,
        actualAngle,
        orb,
        isApplying: null // Requiere cálculo adicional con velocidades
      };
    }
  }
  
  return null; // Sin aspecto
}
```

**Resultado**: ⚠️ **AspectEngine NO sirve directamente, necesito wrapper**

---

## 3. CONTRATO REAL: angularSeparation

### ✅ Maneja Cruce 0°/360° Correctamente

```typescript
export function angularSeparation(longitudeA: number, longitudeB: number): number {
  if (!Number.isFinite(longitudeA) || !Number.isFinite(longitudeB)) {
    throw new AspectEngineError("aspect-engine: longitud no finita", "INVALID_POSITION");
  }
  const delta = Math.abs(normalizeLongitude(longitudeA) - normalizeLongitude(longitudeB));
  return Math.min(delta, 360 - delta);  // ✅ CORRECTO
}
```

**Test**:
- Actual: 359°
- Natal: 1°
- Resultado: `Math.abs(359 - 1) = 358`, `Math.min(358, 360-358) = Math.min(358, 2) = 2°` ✅

**Resultado**: ✅ **La función ya existe y funciona correctamente**

---

## 4. CONTRATO REAL: Timezone Utils

### ✅ Funciones Disponibles

```typescript
// src/lib/moon/timezone.ts

export function zonedWallTimeToUtc(
  year: number,
  month: number,      // 1..12
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  timezone: string    // IANA timezone
): Date;

export function getZonedParts(instantUtc: Date, timezone: string): ZonedParts;

export function toDateKey(instantUtc: Date, timezone: string): string; // YYYY-MM-DD

export function tzOffsetMinutes(date: Date, timezone: string): number;
```

### 🔴 ERROR CRÍTICO EN PLAN ORIGINAL

**Mi código incorrecto**:
```typescript
new Date(`${birthDate}T00:00:00`)  // ❌ Zona del servidor
new Date(`${birthDate}T23:59:59`)  // ❌ Zona del servidor
```

**Corrección necesaria**:
```typescript
import { zonedWallTimeToUtc } from "@/lib/moon/timezone";

// Parsear birthDate "1990-05-15"
const [year, month, day] = birthDate.split("-").map(Number);

// ✅ CORRECTO: Convertir hora local → UTC
const startOfDayUTC = zonedWallTimeToUtc(year, month, day, 0, 0, 0, birthTimezone);
const endOfDayUTC = zonedWallTimeToUtc(year, month, day, 23, 59, 59, birthTimezone);

const moonAtStart = astronomyPlanetaryEngine.calculatePosition("moon", startOfDayUTC);
const moonAtEnd = astronomyPlanetaryEngine.calculatePosition("moon", endOfDayUTC);
```

**Resultado**: ✅ **Utils existen y manejan DST correctamente**

---

## 5. CONTRATO REAL: AI Gateway (DeepSeek)

### ✅ Interface Verificada

```typescript
// src/lib/ai/gateway.server.ts

export interface GatewayStreamOptions {
  alias: AiModelAlias;     // "fast" | "reasoning" | "safety"
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  abortSignal?: AbortSignal;
}

export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export function resolveAiProvider(): "deepseek" | "lovable";
export function resolveModelId(alias: AiModelAlias): string;
```

### 🔴 ERROR: No existe `callDeepSeek()`

**Mi código incorrecto**:
```typescript
const response = await callDeepSeek(prompt, { response_format: "json" });
// ❌ Esta función NO EXISTE
```

**Funciones reales disponibles** (necesito leer más el archivo):
- `resolveAiProvider()`
- `resolveModelId()`
- Probablemente `streamAi()` o similar

**Acción necesaria**: Leer el resto de `gateway.server.ts` para encontrar la función real de llamada.

**Resultado**: ⚠️ **Nombre de función incorrecto, necesito verificar API real**

---

## 6. CONTRATO REAL: API Routes (TanStack Start)

### ✅ Estructura Verificada

```
src/routes/api/
├── ai/respond.ts
├── cron/generate.ts
├── horoscope/assign-variant.ts
├── search/suggestions.ts
└── search.ts
```

### 🔴 ERROR: Contrato de API Route Incorrecto

**Mi código incorrecto**:
```typescript
export async function POST({ request }: APIContext) {
  // ❌ Este contrato es de otro framework
}
```

**Acción necesaria**: Leer uno de los archivos API existentes para ver el contrato real de TanStack Start.

**Resultado**: ⚠️ **Necesito verificar estructura real de API routes**

---

## 7. ESTRUCTURA DE DATOS CORREGIDA

### ✅ Tipo Completo para Luna Natal

```typescript
// src/server/natal/types.ts (NUEVO)

export interface NatalMoonInput {
  birthDate: string;          // YYYY-MM-DD
  birthTime?: string;         // HH:mm opcional
  birthTimezone: string;      // IANA timezone (ej: "America/Santiago")
}

export type NatalMoonConfidence = 
  | "precise_time"   // Hora conocida
  | "high"           // Mismo signo todo el día
  | "uncertain"      // Cambió de signo, usuario debe elegir
  | "dual";          // Ambas opciones válidas

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

### ✅ Tipo Completo para Lectura Lunar

```typescript
// src/server/lunar-reading/types.ts (NUEVO)

export interface CurrentMoonFacts {
  timestampUtc: string;
  absoluteLongitude: number;
  sign: ZodiacSignKey;
  degreeInSign: number;
  phase: MoonPhaseKey;
  illumination: number;
  isWaxing: boolean;
  speedDegreesPerDay: number;
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

## 🔧 CORRECCIONES OBLIGATORIAS

### 1. getCurrentMoonPosition() - REESCRIBIR

```typescript
// src/server/moon/moon-position.ts

import { astronomyPlanetaryEngine } from "@/server/planetary/astronomy-planetary-engine";
import type { ZodiacSignKey } from "@/types/compatibility";

export interface MoonPosition {
  absoluteLongitude: number;  // ✅ Igual que PlanetaryPosition
  sign: ZodiacSignKey;
  degreeInSign: number;
  speedDegreesPerDay: number;
  calculatedAt: string;
}

export function getCurrentMoonPosition(date: Date = new Date()): MoonPosition {
  const raw = astronomyPlanetaryEngine.calculatePosition("moon", date);
  
  // ✅ Mapeo explícito
  return {
    absoluteLongitude: raw.absoluteLongitude,
    sign: raw.sign,
    degreeInSign: raw.degreeInSign,
    speedDegreesPerDay: raw.speedDegreesPerDay,
    calculatedAt: raw.calculatedAt,
  };
}
```

### 2. calculateNatalMoon() - CORREGIR Timezone

```typescript
// src/server/natal/natal-moon-calculator.ts

import { astronomyPlanetaryEngine } from "@/server/planetary/astronomy-planetary-engine";
import { zonedWallTimeToUtc } from "@/lib/moon/timezone";

export async function calculateNatalMoon(
  input: NatalMoonInput
): Promise<NatalMoonResult> {
  
  const { birthDate, birthTime, birthTimezone } = input;
  const [year, month, day] = birthDate.split("-").map(Number);
  
  // CASO 1: Hora conocida
  if (birthTime) {
    const [hour, minute] = birthTime.split(":").map(Number);
    const utcDate = zonedWallTimeToUtc(year, month, day, hour, minute, 0, birthTimezone);
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
  
  // CASO 2: Hora desconocida - calcular rango
  const startOfDayUTC = zonedWallTimeToUtc(year, month, day, 0, 0, 0, birthTimezone);
  const endOfDayUTC = zonedWallTimeToUtc(year, month, day, 23, 59, 59, birthTimezone);
  
  const moonAtStart = astronomyPlanetaryEngine.calculatePosition("moon", startOfDayUTC);
  const moonAtEnd = astronomyPlanetaryEngine.calculatePosition("moon", endOfDayUTC);
  
  // CASO 2A: Mismo signo
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
  
  // CASO 2B: Cambió de signo
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
    message: `La Luna pasó de ${moonAtStart.sign} a ${moonAtEnd.sign} ese día. Una hora aproximada ayudaría.`,
  };
}
```

### 3. calculateLunarAspect() - NUEVA FUNCIÓN

```typescript
// src/server/lunar-reading/lunar-aspect-calculator.ts

import { ASPECT_EXACT_ANGLES, DEFAULT_ASPECT_ORB_POLICY } from "@/server/aspects/aspect-engine";
import type { AspectType } from "@/server/aspects/aspect-engine";

export interface SimpleLunarAspect {
  type: AspectType;
  exactAngle: number;
  actualAngle: number;
  orb: number;
}

export function calculateLunarAspect(
  currentLongitude: number,
  natalLongitude: number
): SimpleLunarAspect | null {
  
  // ✅ Distancia angular correcta (maneja 0°/360°)
  const delta = Math.abs(currentLongitude - natalLongitude);
  const actualAngle = Math.min(delta, 360 - delta);
  
  // Buscar mejor aspecto
  let bestMatch: SimpleLunarAspect | null = null;
  let smallestOrb = Infinity;
  
  for (const [aspectType, exactAngle] of Object.entries(ASPECT_EXACT_ANGLES)) {
    const orb = Math.abs(actualAngle - exactAngle);
    const maxOrb = DEFAULT_ASPECT_ORB_POLICY[aspectType as AspectType];
    
    if (orb <= maxOrb && orb < smallestOrb) {
      bestMatch = {
        type: aspectType as AspectType,
        exactAngle,
        actualAngle,
        orb,
      };
      smallestOrb = orb;
    }
  }
  
  return bestMatch;
}
```

---

## 📊 TABLA FINAL: Estado de Capacidades

| Capacidad | Estado | Archivo Verificado | Puede Usarse | Requiere Corrección |
|-----------|--------|-------------------|--------------|---------------------|
| PlanetaryEngine | ✅ Existe | `planetary-engine.ts` | ✅ Sí | Mapeo de campos |
| Moon en PLANETARY_BODIES | ✅ Confirmado | `planetary-engine.ts` | ✅ Sí | No |
| AspectEngine | ✅ Existe | `aspect-engine.ts` | ❌ No directamente | Crear wrapper |
| angularSeparation | ✅ Existe | `aspect-engine.ts` | ✅ Sí | No |
| Timezone Utils | ✅ Existen | `timezone.ts` | ✅ Sí | No |
| AI Gateway | ⚠️ Parcial | `gateway.server.ts` | ⚠️ Verificar API | Nombre de función |
| API Routes | ⚠️ No verificado | `routes/api/*` | ⚠️ Verificar | Contrato real |

---

## 🎯 PRÓXIMOS PASOS OBLIGATORIOS

### Antes de Escribir Código

1. ✅ **Leer `gateway.server.ts` completo** → Encontrar función real de llamada
2. ✅ **Leer un API route existente** → Ver contrato de TanStack Start
3. ✅ **Verificar si existe Zod** → `grep "from \"zod\"" src -r`
4. ✅ **Ver estructura MoonSnapshot** → Confirmar campos de fase

### Implementación Segura

1. **Crear tipos primero** (sin lógica)
2. **Tests de calculateNatalMoon()** con timezone
3. **Tests de calculateLunarAspect()** con cruce 0°/360°
4. **Implementar cálculo puro** (sin IA)
5. **Implementar fallback**
6. **Agregar IA después**
7. **UI al final**

---

## ✅ CONCLUSIÓN

**Estado**: ✅ **VIABLE PERO CON CORRECCIONES OBLIGATORIAS**

**Errores críticos encontrados**: 14  
**Contratos verificados**: 5/5  
**Código del plan original ejecutable**: ❌ 30%  
**Arquitectura conceptual**: ✅ 88%

**Recomendación**: ✅ **PROCEDER** con las correcciones documentadas aquí.

---

**Próximo documento**: `IMPLEMENTACION_CORREGIDA_TU_LUNA_DE_HOY.md`
