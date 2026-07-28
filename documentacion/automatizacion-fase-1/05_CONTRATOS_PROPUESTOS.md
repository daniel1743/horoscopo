# 05_CONTRATOS_PROPUESTOS.md — ESPECIFICACIÓN DE CONTRATOS FUTUROS

> **MARCA DE CONTROL**: `PROPUESTA — NO IMPLEMENTADO`.  
> Ninguno de los tipos, interfaces o contratos definidos en este archivo existe en la base de código actual. Se documentan conceptualmente para guiar las fases de construcción de automatización (Fases 2 en adelante).

---

## 1. Contrato `PlanetaryEngine`

```typescript
// PROPUESTA — NO IMPLEMENTADO
export interface CelestialPosition {
  body: "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";
  ecliptic_longitude: number; // 0..360°
  zodiac_sign: ZodiacSignKey;
  degree_in_sign: number; // 0..30°
  is_retrograde: boolean;
  speed_deg_per_day: number;
}

export interface PlanetaryEngine {
  getPositions(instantUtc: Date): CelestialPosition[];
  getPositionByBody(body: string, instantUtc: Date): CelestialPosition;
}
```

---

## 2. Contrato `AspectEngine`

```typescript
// PROPUESTA — NO IMPLEMENTADO
export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface PlanetaryAspect {
  body_a: string;
  body_b: string;
  aspect_type: AspectType;
  exact_angle_deg: number; // 0, 60, 90, 120, 180
  actual_angle_deg: number;
  orb_deg: number;
  is_applying: boolean;
}

export interface AspectEngine {
  findActiveAspects(positions: CelestialPosition[], customOrbs?: Record<AspectType, number>): PlanetaryAspect[];
}
```

---

## 3. Contrato `SignContextBuilder`

```typescript
// PROPUESTA — NO IMPLEMENTADO
export interface SignAstrologicalContext {
  sign: ZodiacSignKey;
  date: string; // YYYY-MM-DD
  sun_house: number;
  moon_snapshot: MoonSnapshot;
  ruling_planet_status: CelestialPosition;
  active_transits: PlanetaryAspect[];
  element_balance: { fire: number; earth: number; air: number; water: number };
  keywords: string[];
}

export interface SignContextBuilder {
  buildContextForSign(sign: ZodiacSignKey, instantUtc: Date): SignAstrologicalContext;
  buildAllSignsContext(instantUtc: Date): Record<ZodiacSignKey, SignAstrologicalContext>;
}
```

---

## 4. Contrato `HoroscopeGenerator` (IA con Structured Outputs)

```typescript
// PROPUESTA — NO IMPLEMENTADO
export interface HoroscopeOutputPayload {
  sign: ZodiacSignKey;
  period: "hoy" | "semana" | "mes";
  date_for: string;
  summary: string;
  focus: string;
  mood: string;
  love_text: string;
  work_text: string;
  wellbeing_text: string;
  luck_number: number;
}

export interface HoroscopeGenerator {
  generateHoroscope(context: SignAstrologicalContext, period: "hoy" | "semana" | "mes"): Promise<HoroscopeOutputPayload>;
}
```

---

## 5. Contrato `ContentValidator` & `SimilarityValidator`

```typescript
// PROPUESTA — NO IMPLEMENTADO
export interface ValidationResult {
  passed: boolean;
  score: number; // 0..1
  blockers: string[];
  warnings: string[];
}

export interface ContentValidator {
  validateStructure(content: HoroscopeOutputPayload): ValidationResult;
  checkSimilarity(content: HoroscopeOutputPayload, recentHistory: HoroscopeOutputPayload[]): ValidationResult;
}
```

---

## 6. Contrato `Scheduler` & `PublicationEngine`

```typescript
// PROPUESTA — NO IMPLEMENTADO
export interface ScheduledTask {
  id: string;
  task_type: "generate_daily_horoscopes" | "publish_scheduled" | "sync_search";
  run_after: string; // ISO Timestamp
  attempts: number;
  max_attempts: number;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface PublicationEngine {
  publishHoroscope(horoscopeId: string): Promise<{ ok: boolean; published_at: string }>;
  runScheduledQueue(): Promise<{ processed: number; errors: number }>;
}
```

---

## 7. Contrato `FallbackEngine`

```typescript
// PROPUESTA — NO IMPLEMENTADO
export interface FallbackEngine {
  generateFallbackHoroscope(context: SignAstrologicalContext, period: "hoy" | "semana" | "mes"): HoroscopeOutputPayload;
}
```
* *Propósito*: Proporcionar un texto horoscópico determinista basado directamente en las reglas astrológicas estáticas cuando el servicio de IA presente timeouts o fallos de API key.
