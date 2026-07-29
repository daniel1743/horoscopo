import { deterministicTimeWindowEventResolver } from "../src/server/transits/time-window-event-resolver";
import { DEFAULT_EDITORIAL_POLICY } from "../src/server/rules/editorial-policy";
import { ALLOWED_EDITORIAL_TOPICS } from "../src/server/rules/editorial-policy";
import { runRuleEngine } from "../src/server/rules/rule-engine";
import {
  buildRuleGenerationManifest,
  buildSignContexts,
} from "../src/server/rules/sign-context-builder";

interface CheckReport {
  name: string;
  passed: boolean;
  detail: string;
}

function check(name: string, passed: boolean, detail: string): CheckReport {
  return { name, passed, detail };
}

const eventSet = deterministicTimeWindowEventResolver.resolve({
  start: "2024-06-14T00:00:00.000Z",
  end: "2024-06-23T00:00:00.000Z",
  bodies: ["sun", "moon", "mercury", "venus", "mars", "saturn"],
});
const firstResult = runRuleEngine({ eventSet, period: "weekly" });
const firstContexts = buildSignContexts(firstResult);
const secondResult = runRuleEngine({
  eventSet: { ...eventSet, events: [...eventSet.events].reverse() },
  period: "weekly",
});
const secondContexts = buildSignContexts(secondResult);
const manifest = buildRuleGenerationManifest(firstResult, firstContexts);
const allowedTopics = new Set(ALLOWED_EDITORIAL_TOPICS);

const reports: CheckReport[] = [
  check("eventos reales generados", eventSet.events.length > 0, `${eventSet.events.length}`),
  check("12 contextos", firstContexts.length === 12, `${firstContexts.length}`),
  check(
    "orden estable",
    firstContexts.map((context) => context.sign).join(",") ===
      "aries,tauro,geminis,cancer,leo,virgo,libra,escorpio,sagitario,capricornio,acuario,piscis",
    firstContexts.map((context) => context.sign).join(","),
  ),
  check(
    "limite semanal",
    firstContexts.every(
      (context) => context.selectedFacts.length <= DEFAULT_EDITORIAL_POLICY.maxFactsByPeriod.weekly,
    ),
    JSON.stringify(firstContexts.map((context) => context.selectedFacts.length)),
  ),
  check(
    "trazabilidad",
    firstContexts.every((context) =>
      context.selectedFacts.every((fact) =>
        fact.sourceEventIds.every((id) => eventSet.events.some((event) => event.id === id)),
      ),
    ),
    "sourceEventIds existen en TimeWindowEventSet",
  ),
  check(
    "serializacion JSON",
    JSON.stringify(JSON.parse(JSON.stringify(firstContexts))) === JSON.stringify(firstContexts),
    "round-trip",
  ),
  check(
    "determinismo",
    JSON.stringify(firstContexts) === JSON.stringify(secondContexts),
    "dos ejecuciones equivalentes",
  ),
  check("sin prosa", !JSON.stringify(firstContexts).includes("Hoy "), "sin horoscopo redactado"),
  check(
    "sin datos natales",
    !JSON.stringify(firstContexts).includes("birth") &&
      !JSON.stringify(firstContexts).includes("natal"),
    "sin birth/natal",
  ),
  check(
    "temas permitidos",
    firstContexts.every((context) =>
      context.selectedFacts.every((fact) => allowedTopics.has(fact.topic)),
    ),
    "solo union cerrada permitida",
  ),
  check(
    "ids estables",
    manifest.signContextIds.length === 12 && manifest.id.includes(firstResult.sourceEventSetId),
    manifest.id,
  ),
  check(
    "activaciones registradas",
    firstResult.activations.length > 0,
    `${firstResult.activations.length}`,
  ),
  check(
    "supresiones registradas",
    firstContexts.some((context) => context.suppressions.length > 0),
    JSON.stringify(firstContexts.map((context) => context.suppressions.length)),
  ),
];

for (const report of reports) {
  const mark = report.passed ? "OK" : "FAIL";
  console.log(`${mark} ${report.name}: ${report.detail}`);
}

if (reports.some((report) => !report.passed)) {
  process.exit(1);
}
