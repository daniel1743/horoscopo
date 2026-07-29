/**
 * TimeWindowEventResolver detecta eventos astronomico-astrologicos estructurados
 * dentro de una ventana UTC. No interpreta, no genera texto y no persiste datos.
 */
import type { AspectEngine, AspectPhase, AspectType } from "../aspects/aspect-engine";
import {
  ASPECT_EXACT_ANGLES,
  ASPECT_TYPES,
  deterministicAspectEngine,
} from "../aspects/aspect-engine";
import { astronomyPlanetaryEngine } from "../planetary/astronomy-planetary-engine";
import type { PlanetaryBody, PlanetaryEngine } from "../planetary/planetary-engine";
import { PLANETARY_BODIES } from "../planetary/planetary-engine";
import {
  longitudeToZodiac,
  normalizeLongitude,
  signedLongitudeDelta,
  ZODIAC_SIGN_ORDER,
} from "../planetary/zodiac-math";
import type { ZodiacSignKey } from "@/types/compatibility";

export type LunarPhase = "new_moon" | "first_quarter" | "full_moon" | "last_quarter";
export type TimeWindowEventType =
  "lunar_phase" | "sign_ingress" | "retrograde_station" | "direct_station" | "exact_aspect";

export interface SamplingPolicy {
  version: string;
  maxWindowDays: number;
  bodyStepMinutes: Record<PlanetaryBody, number>;
  exactAspectStepMinutes: Record<PlanetaryBody, number>;
  lunarPhaseStepMinutes: number;
  minStepMinutes: number;
  refinementToleranceSeconds: number;
  maxRefinementIterations: number;
  stationSpeedEpsilonDegreesPerDay: number;
  angularEpsilonDegrees: number;
}

export interface ResolveTimeWindowInput {
  start: string;
  end: string;
  bodies?: readonly PlanetaryBody[];
  samplingPolicy?: Partial<SamplingPolicy>;
}

interface CommonEventFields {
  id: string;
  type: TimeWindowEventType;
  occurredAt: string;
  windowStart: string;
  windowEnd: string;
  resolverVersion: string;
}

export interface ExactAspectEvent extends CommonEventFields {
  type: "exact_aspect";
  bodyA: PlanetaryBody;
  bodyB: PlanetaryBody;
  aspectType: AspectType;
  exactAngle: number;
  actualAngle: number;
  orb: number;
  phaseBefore?: Exclude<AspectPhase, "stationary">;
  phaseAfter?: Exclude<AspectPhase, "stationary">;
}

export interface SignIngressEvent extends CommonEventFields {
  type: "sign_ingress";
  body: PlanetaryBody;
  fromSign: ZodiacSignKey;
  toSign: ZodiacSignKey;
  longitudeAtEvent: number;
}

export interface RetrogradeStationEvent extends CommonEventFields {
  type: "retrograde_station";
  body: PlanetaryBody;
  speedBefore: number;
  speedAtEvent: number;
  speedAfter: number;
}

export interface DirectStationEvent extends CommonEventFields {
  type: "direct_station";
  body: PlanetaryBody;
  speedBefore: number;
  speedAtEvent: number;
  speedAfter: number;
}

export interface LunarPhaseEvent extends CommonEventFields {
  type: "lunar_phase";
  phase: LunarPhase;
  sunMoonAngle: number;
}

export type TimeWindowEvent =
  | ExactAspectEvent
  | SignIngressEvent
  | RetrogradeStationEvent
  | DirectStationEvent
  | LunarPhaseEvent;

export interface TimeWindowEventSet {
  id: string;
  kind: "time_window_event_set";
  windowStart: string;
  windowEnd: string;
  resolverVersion: string;
  planetaryEngineVersion: string;
  aspectEngineVersion: string;
  events: readonly TimeWindowEvent[];
  invariants: {
    utcWindow: true;
    deterministicOrdering: true;
    noNatalChartData: true;
    noEditorialInterpretation: true;
    noGeneratedText: true;
  };
}

export interface TimeWindowEventResolver {
  readonly version: string;
  resolve(input: ResolveTimeWindowInput): TimeWindowEventSet;
}

export class TimeWindowEventResolverError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_WINDOW"
      | "WINDOW_TOO_LARGE"
      | "INVALID_TIMESTAMP"
      | "INVALID_BODY"
      | "INVALID_SAMPLING_POLICY"
      | "EVENT_REFINEMENT_FAILED"
      | "DUPLICATE_EVENT",
  ) {
    super(message);
    this.name = "TimeWindowEventResolverError";
  }
}

export const DEFAULT_SAMPLING_POLICY: Readonly<SamplingPolicy> = Object.freeze({
  version: "sampling@2c.1:body-aware-60s-refinement",
  maxWindowDays: 32,
  bodyStepMinutes: {
    sun: 180,
    moon: 60,
    mercury: 120,
    venus: 180,
    mars: 240,
    jupiter: 360,
    saturn: 360,
    uranus: 720,
    neptune: 720,
    pluto: 720,
  },
  exactAspectStepMinutes: {
    sun: 180,
    moon: 60,
    mercury: 120,
    venus: 180,
    mars: 240,
    jupiter: 360,
    saturn: 360,
    uranus: 720,
    neptune: 720,
    pluto: 720,
  },
  lunarPhaseStepMinutes: 60,
  minStepMinutes: 30,
  refinementToleranceSeconds: 60,
  maxRefinementIterations: 40,
  stationSpeedEpsilonDegreesPerDay: 1e-5,
  angularEpsilonDegrees: 1e-7,
});

const RESOLVER_VERSION = "time-window-event-resolver@2c.1";
const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;
const SECOND_MS = 1_000;
const EVENT_TYPE_PRIORITY: readonly TimeWindowEventType[] = [
  "lunar_phase",
  "sign_ingress",
  "retrograde_station",
  "direct_station",
  "exact_aspect",
] as const;
const LUNAR_PHASE_TARGETS: Readonly<Record<LunarPhase, number>> = {
  new_moon: 0,
  first_quarter: 90,
  full_moon: 180,
  last_quarter: 270,
};

function assertCanonicalIsoUtc(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new TimeWindowEventResolverError(`${label} debe ser string ISO UTC`, "INVALID_TIMESTAMP");
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed) || new Date(parsed).toISOString() !== value) {
    throw new TimeWindowEventResolverError(
      `${label} debe ser ISO UTC canonico`,
      "INVALID_TIMESTAMP",
    );
  }
  return value;
}

function isPlanetaryBody(value: unknown): value is PlanetaryBody {
  return typeof value === "string" && PLANETARY_BODIES.includes(value as PlanetaryBody);
}

function bodyOrder(body: PlanetaryBody): number {
  return PLANETARY_BODIES.indexOf(body);
}

function aspectTypeOrder(type: AspectType): number {
  return ASPECT_TYPES.indexOf(type);
}

function assertBodies(bodies: readonly PlanetaryBody[] | undefined): readonly PlanetaryBody[] {
  const selected = bodies ? [...bodies] : [...PLANETARY_BODIES];
  const seen = new Set<PlanetaryBody>();
  for (const body of selected) {
    if (!isPlanetaryBody(body)) {
      throw new TimeWindowEventResolverError(
        `cuerpo no soportado: ${String(body)}`,
        "INVALID_BODY",
      );
    }
    if (seen.has(body)) {
      throw new TimeWindowEventResolverError(`cuerpo duplicado: ${body}`, "INVALID_BODY");
    }
    seen.add(body);
  }
  return selected.sort((left, right) => bodyOrder(left) - bodyOrder(right));
}

function resolveSamplingPolicy(input?: Partial<SamplingPolicy>): SamplingPolicy {
  const policy: SamplingPolicy = {
    ...DEFAULT_SAMPLING_POLICY,
    ...input,
    bodyStepMinutes: { ...DEFAULT_SAMPLING_POLICY.bodyStepMinutes, ...input?.bodyStepMinutes },
    exactAspectStepMinutes: {
      ...DEFAULT_SAMPLING_POLICY.exactAspectStepMinutes,
      ...input?.exactAspectStepMinutes,
    },
  };
  const positiveNumbers = [
    policy.maxWindowDays,
    policy.lunarPhaseStepMinutes,
    policy.minStepMinutes,
    policy.refinementToleranceSeconds,
    policy.maxRefinementIterations,
    policy.stationSpeedEpsilonDegreesPerDay,
    policy.angularEpsilonDegrees,
  ];
  if (
    typeof policy.version !== "string" ||
    policy.version.length === 0 ||
    positiveNumbers.some((value) => !Number.isFinite(value) || value <= 0)
  ) {
    throw new TimeWindowEventResolverError(
      "politica de muestreo invalida",
      "INVALID_SAMPLING_POLICY",
    );
  }
  for (const body of PLANETARY_BODIES) {
    const bodyStep = policy.bodyStepMinutes[body];
    const aspectStep = policy.exactAspectStepMinutes[body];
    if (
      !Number.isFinite(bodyStep) ||
      !Number.isFinite(aspectStep) ||
      bodyStep < policy.minStepMinutes ||
      aspectStep < policy.minStepMinutes
    ) {
      throw new TimeWindowEventResolverError(
        `paso de muestreo invalido para ${body}`,
        "INVALID_SAMPLING_POLICY",
      );
    }
  }
  return policy;
}

function normalizePair(
  bodyA: PlanetaryBody,
  bodyB: PlanetaryBody,
): readonly [PlanetaryBody, PlanetaryBody] {
  return bodyA.localeCompare(bodyB) <= 0 ? [bodyA, bodyB] : [bodyB, bodyA];
}

function eventBase(
  type: TimeWindowEventType,
  occurredAt: string,
  windowStart: string,
  windowEnd: string,
): CommonEventFields {
  return { id: "", type, occurredAt, windowStart, windowEnd, resolverVersion: RESOLVER_VERSION };
}

function sampleTimes(startMs: number, endMs: number, stepMinutes: number): number[] {
  const stepMs = stepMinutes * MINUTE_MS;
  const times: number[] = [];
  for (let current = startMs; current < endMs; current += stepMs) {
    times.push(current);
  }
  if (times.at(-1) !== endMs) times.push(endMs);
  return times;
}

function signIndex(sign: ZodiacSignKey): number {
  return ZODIAC_SIGN_ORDER.indexOf(sign);
}

function nextSign(sign: ZodiacSignKey): ZodiacSignKey {
  const next = ZODIAC_SIGN_ORDER[(signIndex(sign) + 1) % ZODIAC_SIGN_ORDER.length];
  if (!next)
    throw new TimeWindowEventResolverError("signo siguiente invalido", "EVENT_REFINEMENT_FAILED");
  return next;
}

function previousSign(sign: ZodiacSignKey): ZodiacSignKey {
  const previous =
    ZODIAC_SIGN_ORDER[(signIndex(sign) + ZODIAC_SIGN_ORDER.length - 1) % ZODIAC_SIGN_ORDER.length];
  if (!previous)
    throw new TimeWindowEventResolverError("signo previo invalido", "EVENT_REFINEMENT_FAILED");
  return previous;
}

function compareEvents(left: TimeWindowEvent, right: TimeWindowEvent): number {
  const timeDelta = left.occurredAt.localeCompare(right.occurredAt);
  if (timeDelta !== 0) return timeDelta;
  const typeDelta =
    EVENT_TYPE_PRIORITY.indexOf(left.type) - EVENT_TYPE_PRIORITY.indexOf(right.type);
  if (typeDelta !== 0) return typeDelta;
  return left.id.localeCompare(right.id);
}

function assertNoDuplicateEvents(events: readonly TimeWindowEvent[]): void {
  const seen = new Set<string>();
  for (const event of events) {
    if (seen.has(event.id)) {
      throw new TimeWindowEventResolverError(`evento duplicado: ${event.id}`, "DUPLICATE_EVENT");
    }
    seen.add(event.id);
  }
}

function calculatePosition(engine: PlanetaryEngine, body: PlanetaryBody, timeMs: number) {
  return engine.calculatePosition(body, new Date(timeMs));
}

function refineBoundary(
  leftMs: number,
  rightMs: number,
  predicate: (timeMs: number) => boolean,
  policy: SamplingPolicy,
): number {
  let low = leftMs;
  let high = rightMs;
  const lowValue = predicate(low);
  const highValue = predicate(high);
  if (lowValue === highValue) {
    throw new TimeWindowEventResolverError(
      "no hay cruce refinable en el intervalo",
      "EVENT_REFINEMENT_FAILED",
    );
  }
  for (let iteration = 0; iteration < policy.maxRefinementIterations; iteration += 1) {
    if (high - low <= policy.refinementToleranceSeconds * SECOND_MS) return high;
    const mid = low + Math.floor((high - low) / 2);
    if (predicate(mid) === lowValue) {
      low = mid;
    } else {
      high = mid;
    }
  }
  if (high - low <= policy.refinementToleranceSeconds * SECOND_MS) return high;
  throw new TimeWindowEventResolverError(
    "refinamiento excedio iteraciones",
    "EVENT_REFINEMENT_FAILED",
  );
}

function detectSignIngresses(
  engine: PlanetaryEngine,
  bodies: readonly PlanetaryBody[],
  startMs: number,
  endMs: number,
  startIso: string,
  endIso: string,
  policy: SamplingPolicy,
): SignIngressEvent[] {
  const events: SignIngressEvent[] = [];
  for (const body of bodies) {
    const times = sampleTimes(startMs, endMs, policy.bodyStepMinutes[body]);
    for (let index = 1; index < times.length; index += 1) {
      const beforeMs = times[index - 1];
      const afterMs = times[index];
      if (beforeMs === undefined || afterMs === undefined) continue;
      const before = calculatePosition(engine, body, beforeMs);
      const after = calculatePosition(engine, body, afterMs);
      if (before.sign === after.sign) continue;
      const toSign =
        signedLongitudeDelta(before.absoluteLongitude, after.absoluteLongitude) >= 0
          ? nextSign(before.sign)
          : previousSign(before.sign);
      const boundaryIndex = signIndex(toSign);
      const boundaryLongitude = boundaryIndex * 30;
      const refinedMs = refineBoundary(
        beforeMs,
        afterMs,
        (timeMs) =>
          longitudeToZodiac(calculatePosition(engine, body, timeMs).absoluteLongitude).sign ===
          before.sign,
        policy,
      );
      const occurredAt = new Date(refinedMs).toISOString();
      const longitudeAtEvent = normalizeLongitude(boundaryLongitude);
      const fromSign =
        signedLongitudeDelta(before.absoluteLongitude, after.absoluteLongitude) >= 0
          ? previousSign(toSign)
          : nextSign(toSign);
      events.push({
        ...eventBase("sign_ingress", occurredAt, startIso, endIso),
        id: `event:sign_ingress:${occurredAt}:${body}:${fromSign}:${toSign}`,
        body,
        fromSign,
        toSign,
        longitudeAtEvent,
      });
    }
  }
  return events;
}

function speedSign(speed: number, epsilon: number): -1 | 0 | 1 {
  if (speed > epsilon) return 1;
  if (speed < -epsilon) return -1;
  return 0;
}

function detectStations(
  engine: PlanetaryEngine,
  bodies: readonly PlanetaryBody[],
  startMs: number,
  endMs: number,
  startIso: string,
  endIso: string,
  policy: SamplingPolicy,
): Array<RetrogradeStationEvent | DirectStationEvent> {
  const events: Array<RetrogradeStationEvent | DirectStationEvent> = [];
  for (const body of bodies) {
    if (body === "sun" || body === "moon") continue;
    const times = sampleTimes(startMs, endMs, policy.bodyStepMinutes[body]);
    for (let index = 1; index < times.length; index += 1) {
      const beforeMs = times[index - 1];
      const afterMs = times[index];
      if (beforeMs === undefined || afterMs === undefined) continue;
      const before = calculatePosition(engine, body, beforeMs);
      const after = calculatePosition(engine, body, afterMs);
      const beforeSign = speedSign(
        before.speedDegreesPerDay,
        policy.stationSpeedEpsilonDegreesPerDay,
      );
      const afterSign = speedSign(
        after.speedDegreesPerDay,
        policy.stationSpeedEpsilonDegreesPerDay,
      );
      if (beforeSign === 0 || afterSign === 0 || beforeSign === afterSign) continue;
      const refinedMs = refineBoundary(
        beforeMs,
        afterMs,
        (timeMs) =>
          speedSign(
            calculatePosition(engine, body, timeMs).speedDegreesPerDay,
            policy.stationSpeedEpsilonDegreesPerDay,
          ) === beforeSign,
        policy,
      );
      const occurredAt = new Date(refinedMs).toISOString();
      const speedAtEvent = calculatePosition(engine, body, refinedMs).speedDegreesPerDay;
      const type = beforeSign > afterSign ? "retrograde_station" : "direct_station";
      events.push({
        ...eventBase(type, occurredAt, startIso, endIso),
        id: `event:${type}:${occurredAt}:${body}`,
        type,
        body,
        speedBefore: before.speedDegreesPerDay,
        speedAtEvent,
        speedAfter: after.speedDegreesPerDay,
      });
    }
  }
  return events;
}

function directedSunMoonAngle(engine: PlanetaryEngine, timeMs: number): number {
  const sun = calculatePosition(engine, "sun", timeMs);
  const moon = calculatePosition(engine, "moon", timeMs);
  return normalizeLongitude(signedLongitudeDelta(sun.absoluteLongitude, moon.absoluteLongitude));
}

function crossingTimeForDirectedAngle(
  engine: PlanetaryEngine,
  leftMs: number,
  rightMs: number,
  target: number,
  policy: SamplingPolicy,
): number | null {
  const leftAngle = directedSunMoonAngle(engine, leftMs);
  const rightAngleRaw = directedSunMoonAngle(engine, rightMs);
  const rightAngle = leftAngle + signedLongitudeDelta(leftAngle, rightAngleRaw);
  const targetCandidates = [target - 360, target, target + 360, target + 720];
  const crossedTarget = targetCandidates.find(
    (candidate) => candidate > leftAngle && candidate <= rightAngle,
  );
  if (crossedTarget === undefined) return null;
  return refineBoundary(
    leftMs,
    rightMs,
    (timeMs) => {
      const current =
        leftAngle + signedLongitudeDelta(leftAngle, directedSunMoonAngle(engine, timeMs));
      return current < crossedTarget;
    },
    policy,
  );
}

function detectLunarPhases(
  engine: PlanetaryEngine,
  bodies: readonly PlanetaryBody[],
  startMs: number,
  endMs: number,
  startIso: string,
  endIso: string,
  policy: SamplingPolicy,
): LunarPhaseEvent[] {
  if (!bodies.includes("sun") || !bodies.includes("moon")) return [];
  const events: LunarPhaseEvent[] = [];
  const times = sampleTimes(startMs, endMs, policy.lunarPhaseStepMinutes);
  for (let index = 1; index < times.length; index += 1) {
    const beforeMs = times[index - 1];
    const afterMs = times[index];
    if (beforeMs === undefined || afterMs === undefined) continue;
    for (const [phase, target] of Object.entries(LUNAR_PHASE_TARGETS) as Array<
      [LunarPhase, number]
    >) {
      const refinedMs = crossingTimeForDirectedAngle(engine, beforeMs, afterMs, target, policy);
      if (refinedMs === null) continue;
      const occurredAt = new Date(refinedMs).toISOString();
      events.push({
        ...eventBase("lunar_phase", occurredAt, startIso, endIso),
        id: `event:lunar_phase:${occurredAt}:${phase}`,
        phase,
        sunMoonAngle: target,
      });
    }
  }
  return events;
}

function relativeLongitude(
  engine: PlanetaryEngine,
  bodyA: PlanetaryBody,
  bodyB: PlanetaryBody,
  timeMs: number,
): number {
  const left = calculatePosition(engine, bodyA, timeMs);
  const right = calculatePosition(engine, bodyB, timeMs);
  return signedLongitudeDelta(left.absoluteLongitude, right.absoluteLongitude);
}

function aspectTargets(type: AspectType): readonly number[] {
  const exact = ASPECT_EXACT_ANGLES[type];
  return exact === 0 || exact === 180 ? [exact] : [exact, -exact];
}

function aspectError(
  engine: PlanetaryEngine,
  bodyA: PlanetaryBody,
  bodyB: PlanetaryBody,
  type: AspectType,
  timeMs: number,
): number {
  const relative = relativeLongitude(engine, bodyA, bodyB, timeMs);
  return (
    aspectTargets(type)
      .map((target) => signedLongitudeDelta(relative, target))
      .sort((left, right) => Math.abs(left) - Math.abs(right))[0] ?? 0
  );
}

function phaseNear(
  engine: PlanetaryEngine,
  aspectEngine: AspectEngine,
  bodyA: PlanetaryBody,
  bodyB: PlanetaryBody,
  timeMs: number,
  type: AspectType,
): Exclude<AspectPhase, "stationary"> | undefined {
  const snapshot = engine.calculateSnapshot(new Date(timeMs), [bodyA, bodyB]);
  const aspect = aspectEngine
    .calculateSnapshotAspects(snapshot)
    .find((candidate) => candidate.type === type);
  if (!aspect || aspect.phase === "stationary") return undefined;
  return aspect.phase;
}

function detectExactAspects(
  engine: PlanetaryEngine,
  aspectEngine: AspectEngine,
  bodies: readonly PlanetaryBody[],
  startMs: number,
  endMs: number,
  startIso: string,
  endIso: string,
  policy: SamplingPolicy,
): ExactAspectEvent[] {
  const events: ExactAspectEvent[] = [];
  for (let leftIndex = 0; leftIndex < bodies.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < bodies.length; rightIndex += 1) {
      const bodyA = bodies[leftIndex];
      const bodyB = bodies[rightIndex];
      if (!bodyA || !bodyB) continue;
      const [normalizedA, normalizedB] = normalizePair(bodyA, bodyB);
      const step = Math.min(
        policy.exactAspectStepMinutes[bodyA],
        policy.exactAspectStepMinutes[bodyB],
      );
      const times = sampleTimes(startMs, endMs, step);
      for (const aspectType of ASPECT_TYPES) {
        for (let index = 1; index < times.length; index += 1) {
          const beforeMs = times[index - 1];
          const afterMs = times[index];
          if (beforeMs === undefined || afterMs === undefined) continue;
          const beforeError = aspectError(engine, bodyA, bodyB, aspectType, beforeMs);
          const afterError = aspectError(engine, bodyA, bodyB, aspectType, afterMs);
          if (Math.abs(beforeError) <= policy.angularEpsilonDegrees) continue;
          if (beforeError * afterError > 0) continue;
          const refinedMs = refineBoundary(
            beforeMs,
            afterMs,
            (timeMs) => aspectError(engine, bodyA, bodyB, aspectType, timeMs) > 0,
            policy,
          );
          const occurredAt = new Date(refinedMs).toISOString();
          const snapshot = engine.calculateSnapshot(new Date(refinedMs), [bodyA, bodyB]);
          const positions = snapshot.positions;
          const left = positions.find((position) => position.body === bodyA);
          const right = positions.find((position) => position.body === bodyB);
          if (!left || !right) {
            throw new TimeWindowEventResolverError(
              "snapshot de aspecto incompleto",
              "EVENT_REFINEMENT_FAILED",
            );
          }
          const actualAngle = Math.abs(
            signedLongitudeDelta(left.absoluteLongitude, right.absoluteLongitude),
          );
          const exactAngle = ASPECT_EXACT_ANGLES[aspectType];
          if (Math.abs(actualAngle - exactAngle) > 0.25) continue;
          const phaseBefore = phaseNear(
            engine,
            aspectEngine,
            bodyA,
            bodyB,
            Math.max(startMs, refinedMs - MINUTE_MS),
            aspectType,
          );
          const phaseAfter = phaseNear(
            engine,
            aspectEngine,
            bodyA,
            bodyB,
            Math.min(endMs, refinedMs + MINUTE_MS),
            aspectType,
          );
          events.push({
            ...eventBase("exact_aspect", occurredAt, startIso, endIso),
            id: `event:exact_aspect:${occurredAt}:${normalizedA}:${normalizedB}:${aspectType}`,
            bodyA: normalizedA,
            bodyB: normalizedB,
            aspectType,
            exactAngle,
            actualAngle,
            orb: Math.abs(actualAngle - exactAngle),
            phaseBefore,
            phaseAfter,
          });
        }
      }
    }
  }
  return events;
}

function resolve(input: ResolveTimeWindowInput): TimeWindowEventSet {
  if (!input || typeof input !== "object") {
    throw new TimeWindowEventResolverError("input invalido", "INVALID_WINDOW");
  }
  const start = assertCanonicalIsoUtc(input.start, "start");
  const end = assertCanonicalIsoUtc(input.end, "end");
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (startMs >= endMs) {
    throw new TimeWindowEventResolverError("start debe ser menor que end", "INVALID_WINDOW");
  }
  const policy = resolveSamplingPolicy(input.samplingPolicy);
  if ((endMs - startMs) / DAY_MS > policy.maxWindowDays) {
    throw new TimeWindowEventResolverError(
      "ventana excede el maximo permitido",
      "WINDOW_TOO_LARGE",
    );
  }
  const bodies = assertBodies(input.bodies);
  const events = [
    ...detectLunarPhases(astronomyPlanetaryEngine, bodies, startMs, endMs, start, end, policy),
    ...detectSignIngresses(astronomyPlanetaryEngine, bodies, startMs, endMs, start, end, policy),
    ...detectStations(astronomyPlanetaryEngine, bodies, startMs, endMs, start, end, policy),
    ...detectExactAspects(
      astronomyPlanetaryEngine,
      deterministicAspectEngine,
      bodies,
      startMs,
      endMs,
      start,
      end,
      policy,
    ),
  ].sort(compareEvents);
  assertNoDuplicateEvents(events);
  const fingerprint = `${bodies.join(",")}:${policy.version}`;
  return {
    id: `time-window-events:${start}:${end}:${fingerprint}`,
    kind: "time_window_event_set",
    windowStart: start,
    windowEnd: end,
    resolverVersion: RESOLVER_VERSION,
    planetaryEngineVersion: astronomyPlanetaryEngine.version,
    aspectEngineVersion: deterministicAspectEngine.version,
    events,
    invariants: {
      utcWindow: true,
      deterministicOrdering: true,
      noNatalChartData: true,
      noEditorialInterpretation: true,
      noGeneratedText: true,
    },
  };
}

export const deterministicTimeWindowEventResolver: TimeWindowEventResolver = {
  version: RESOLVER_VERSION,
  resolve,
};
