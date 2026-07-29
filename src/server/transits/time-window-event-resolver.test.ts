import {
  DEFAULT_SAMPLING_POLICY,
  deterministicTimeWindowEventResolver,
  TimeWindowEventResolverError,
  type ResolveTimeWindowInput,
  type TimeWindowEvent,
} from "./time-window-event-resolver";

interface CheckReport {
  name: string;
  passed: boolean;
  detail: string;
}

function check(name: string, condition: boolean, detail: string): CheckReport {
  return { name, passed: condition, detail };
}

function expectError(
  name: string,
  run: () => void,
  code: TimeWindowEventResolverError["code"],
): CheckReport {
  try {
    run();
    return check(name, false, "no lanzo error");
  } catch (error) {
    return check(
      name,
      error instanceof TimeWindowEventResolverError && error.code === code,
      error instanceof Error ? error.message : String(error),
    );
  }
}

function stableString(input: unknown): string {
  return JSON.stringify(input);
}

function baseInput(overrides: Partial<ResolveTimeWindowInput> = {}): ResolveTimeWindowInput {
  return {
    start: "2024-06-21T00:00:00.000Z",
    end: "2024-06-23T00:00:00.000Z",
    bodies: ["sun", "moon", "mercury", "venus", "mars"],
    ...overrides,
  };
}

function hasNoDuplicateIds(events: readonly TimeWindowEvent[]): boolean {
  return events.length === new Set(events.map((event) => event.id)).size;
}

function isSorted(events: readonly TimeWindowEvent[]): boolean {
  const priority = [
    "lunar_phase",
    "sign_ingress",
    "retrograde_station",
    "direct_station",
    "exact_aspect",
  ];
  return events.every((event, index) => {
    const previous = events[index - 1];
    if (!previous) return true;
    const timeDelta = previous.occurredAt.localeCompare(event.occurredAt);
    if (timeDelta < 0) return true;
    if (timeDelta > 0) return false;
    const typeDelta = priority.indexOf(previous.type) - priority.indexOf(event.type);
    if (typeDelta < 0) return true;
    if (typeDelta > 0) return false;
    return previous.id <= event.id;
  });
}

export function runTimeWindowEventResolverChecks(): CheckReport[] {
  const reports: CheckReport[] = [];

  reports.push(
    expectError(
      "rechaza timestamp invalido",
      () => deterministicTimeWindowEventResolver.resolve(baseInput({ start: "ayer" })),
      "INVALID_TIMESTAMP",
    ),
  );
  reports.push(
    expectError(
      "rechaza start mayor o igual a end",
      () =>
        deterministicTimeWindowEventResolver.resolve(
          baseInput({ start: "2024-01-02T00:00:00.000Z", end: "2024-01-02T00:00:00.000Z" }),
        ),
      "INVALID_WINDOW",
    ),
  );
  reports.push(
    expectError(
      "rechaza ventana superior al maximo",
      () =>
        deterministicTimeWindowEventResolver.resolve(
          baseInput({ start: "2024-01-01T00:00:00.000Z", end: "2024-03-01T00:00:00.000Z" }),
        ),
      "WINDOW_TOO_LARGE",
    ),
  );
  reports.push(
    expectError(
      "rechaza politica de muestreo invalida",
      () =>
        deterministicTimeWindowEventResolver.resolve(
          baseInput({ samplingPolicy: { bodyStepMinutes: { moon: 1 } } }),
        ),
      "INVALID_SAMPLING_POLICY",
    ),
  );

  const deterministicInput = baseInput();
  const first = deterministicTimeWindowEventResolver.resolve(deterministicInput);
  const second = deterministicTimeWindowEventResolver.resolve(deterministicInput);
  reports.push(
    check(
      "misma entrada produce exactamente la misma salida",
      stableString(first) === stableString(second),
      first.id,
    ),
  );

  const reordered = deterministicTimeWindowEventResolver.resolve({
    ...deterministicInput,
    bodies: [...(deterministicInput.bodies ?? [])].reverse(),
  });
  reports.push(
    check(
      "reordenar bodies no cambia salida ni IDs",
      stableString(first) === stableString(reordered),
      JSON.stringify({ first: first.id, reordered: reordered.id }),
    ),
  );

  const roundTrip = JSON.parse(JSON.stringify(first)) as typeof first;
  reports.push(
    check(
      "salida JSON round-trip sin perdida",
      stableString(first) === stableString(roundTrip),
      first.id,
    ),
  );
  reports.push(
    check(
      "eventos ordenados deterministicamente",
      isSorted(first.events),
      JSON.stringify(first.events),
    ),
  );
  reports.push(
    check(
      "IDs estables y sin duplicados",
      hasNoDuplicateIds(first.events),
      JSON.stringify(first.events),
    ),
  );
  reports.push(
    check(
      "no genera texto editorial ni datos natales",
      first.invariants.noNatalChartData &&
        first.invariants.noEditorialInterpretation &&
        first.invariants.noGeneratedText &&
        !stableString(first).includes("horoscopo"),
      JSON.stringify(first.invariants),
    ),
  );
  reports.push(
    check(
      "conserva versiones de motores",
      first.planetaryEngineVersion.length > 0 &&
        first.aspectEngineVersion.length > 0 &&
        first.resolverVersion === deterministicTimeWindowEventResolver.version,
      JSON.stringify({
        planetary: first.planetaryEngineVersion,
        aspect: first.aspectEngineVersion,
        resolver: first.resolverVersion,
      }),
    ),
  );

  const mutableInput = baseInput({
    bodies: ["moon", "sun", "mercury"],
    samplingPolicy: { lunarPhaseStepMinutes: DEFAULT_SAMPLING_POLICY.lunarPhaseStepMinutes },
  });
  const beforeInput = stableString(mutableInput);
  deterministicTimeWindowEventResolver.resolve(mutableInput);
  reports.push(
    check(
      "no muta entrada",
      stableString(mutableInput) === beforeInput,
      stableString(mutableInput),
    ),
  );

  const emptyWindow = deterministicTimeWindowEventResolver.resolve({
    start: "2024-01-01T00:00:00.000Z",
    end: "2024-01-01T06:00:00.000Z",
    bodies: ["pluto"],
  });
  reports.push(
    check(
      "tolera ventanas sin eventos",
      emptyWindow.events.length === 0,
      JSON.stringify(emptyWindow.events),
    ),
  );

  const luminaryOnly = deterministicTimeWindowEventResolver.resolve({
    start: "2024-01-01T00:00:00.000Z",
    end: "2024-01-15T00:00:00.000Z",
    bodies: ["sun", "moon"],
  });
  reports.push(
    check(
      "sol y luna nunca generan estaciones",
      !luminaryOnly.events.some(
        (event) => event.type === "retrograde_station" || event.type === "direct_station",
      ),
      JSON.stringify(luminaryOnly.events),
    ),
  );

  const ingressWindow = deterministicTimeWindowEventResolver.resolve({
    start: "2024-03-20T00:00:00.000Z",
    end: "2024-03-20T12:00:00.000Z",
    bodies: ["sun"],
  });
  reports.push(
    check(
      "detecta correctamente Piscis a Aries",
      ingressWindow.events.some(
        (event) =>
          event.type === "sign_ingress" && event.fromSign === "piscis" && event.toSign === "aries",
      ),
      JSON.stringify(ingressWindow.events),
    ),
  );

  const lunarWindow = deterministicTimeWindowEventResolver.resolve({
    start: "2024-06-14T00:00:00.000Z",
    end: "2024-06-23T00:00:00.000Z",
    bodies: ["sun", "moon"],
  });
  reports.push(
    check(
      "distingue cuarto creciente y luna llena",
      lunarWindow.events.some(
        (event) => event.type === "lunar_phase" && event.phase === "first_quarter",
      ) &&
        lunarWindow.events.some(
          (event) => event.type === "lunar_phase" && event.phase === "full_moon",
        ) &&
        !lunarWindow.events.some(
          (event) => event.type === "lunar_phase" && event.phase === "last_quarter",
        ),
      JSON.stringify(lunarWindow.events),
    ),
  );

  const aspectWindow = deterministicTimeWindowEventResolver.resolve({
    start: "2024-06-21T00:00:00.000Z",
    end: "2024-06-22T00:00:00.000Z",
    bodies: ["sun", "moon", "mercury", "venus", "mars"],
  });
  reports.push(
    check(
      "detecta aspecto exacto aunque inicio y final esten dentro de orbe",
      aspectWindow.events.some((event) => event.type === "exact_aspect"),
      JSON.stringify(aspectWindow.events),
    ),
  );
  reports.push(
    check(
      "no confunde dentro del orbe con alcanzo exactitud",
      deterministicTimeWindowEventResolver
        .resolve({
          start: "2024-06-21T12:00:00.000Z",
          end: "2024-06-21T14:00:00.000Z",
          bodies: ["sun", "moon"],
        })
        .events.every((event) => event.type !== "exact_aspect"),
      "ventana corta sin cruce exacto",
    ),
  );

  const stationWindow = deterministicTimeWindowEventResolver.resolve({
    start: "2024-12-14T00:00:00.000Z",
    end: "2024-12-17T00:00:00.000Z",
    bodies: ["mercury"],
  });
  reports.push(
    check(
      "detecta estacion planetaria real reproducible",
      stationWindow.events.some((event) => event.type === "direct_station"),
      JSON.stringify(stationWindow.events),
    ),
  );

  const customPolicy = deterministicTimeWindowEventResolver.resolve(
    baseInput({ samplingPolicy: { version: "test-policy", lunarPhaseStepMinutes: 120 } }),
  );
  reports.push(
    check(
      "respeta politica de muestreo inyectada valida",
      customPolicy.id.includes("test-policy"),
      customPolicy.id,
    ),
  );

  return reports;
}

if (process.env.VITEST === "true" || process.env.VITEST_WORKER_ID) {
  const { describe, expect, it } = await import("vitest");

  describe("TimeWindowEventResolver", () => {
    for (const report of runTimeWindowEventResolverChecks()) {
      it(report.name, () => {
        expect(report.passed, report.detail).toBe(true);
      });
    }
  });
}
