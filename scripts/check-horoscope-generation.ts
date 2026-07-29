import { deterministicTimeWindowEventResolver } from "../src/server/transits/time-window-event-resolver";
import { runRuleEngine } from "../src/server/rules/rule-engine";
import { buildSignContexts } from "../src/server/rules/sign-context-builder";
import { generateHoroscopeDraft } from "../src/server/generation/horoscope-generator";
import { DeterministicTestGenerationProvider } from "../src/server/generation/provider";
import { validDraft } from "../src/server/generation/test-fixtures";

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
const ruleResult = runRuleEngine({ eventSet, period: "weekly" });
const contexts = buildSignContexts(ruleResult);
const aries = contexts.find((context) => context.sign === "aries");
if (!aries) throw new Error("aries context missing");

const provider = new DeterministicTestGenerationProvider(() => JSON.stringify(validDraft(aries)));
const generated = await generateHoroscopeDraft(aries, provider);
const second = await generateHoroscopeDraft(
  aries,
  new DeterministicTestGenerationProvider(() => JSON.stringify(validDraft(aries))),
);
const fallback = await generateHoroscopeDraft(
  aries,
  new DeterministicTestGenerationProvider(() => "{"),
);
const inventedIds = await generateHoroscopeDraft(
  aries,
  new DeterministicTestGenerationProvider(() =>
    JSON.stringify({ ...validDraft(aries), usedFactIds: ["invented"] }),
  ),
);
const allContexts = await Promise.all(
  contexts.map((context) =>
    generateHoroscopeDraft(
      context,
      new DeterministicTestGenerationProvider(() => JSON.stringify(validDraft(context))),
    ),
  ),
);

const serialized = JSON.stringify(generated);
const reports: CheckReport[] = [
  check("contexto real por signo", contexts.length === 12, `${contexts.length}`),
  check(
    "resultado valido",
    generated.status === "generated" && generated.validation.valid,
    generated.status,
  ),
  check(
    "trazabilidad facts",
    generated.draft.usedFactIds.every((id) => aries.selectedFacts.some((fact) => fact.id === id)),
    "facts conocidos",
  ),
  check("JSON serializable", JSON.stringify(JSON.parse(serialized)) === serialized, "round-trip"),
  check(
    "determinismo",
    JSON.stringify(generated) === JSON.stringify(second),
    "dos ejecuciones identicas",
  ),
  check("fallback", fallback.status === "fallback", fallback.status),
  check(
    "rechazo corrupto",
    fallback.validation.valid === false,
    JSON.stringify(fallback.validation.errors),
  ),
  check("rechazo IDs inventados", inventedIds.status === "fallback", inventedIds.status),
  check(
    "sin fatalismo",
    !serialized.includes("accidente") && !serialized.includes("sin duda"),
    "sin patrones",
  ),
  check(
    "sin consejo medico",
    !serialized.includes("tratamiento") && !serialized.includes("diagnostico"),
    "sin medicina",
  ),
  check("sin promesa financiera", !serialized.includes("dinero seguro"), "sin promesa"),
  check(
    "sin datos natales",
    !serialized.includes("natal") && !serialized.includes("birth"),
    "sin natal",
  ),
  check("sin Markdown", !serialized.includes("```") && !serialized.includes("# "), "sin markdown"),
  check("proveedor llamado una vez", provider.callCount === 1, `${provider.callCount}`),
  check(
    "12 contextos procesados",
    allContexts.length === 12 && allContexts.every((result) => result.status === "generated"),
    `${allContexts.length}`,
  ),
];

for (const report of reports) {
  const mark = report.passed ? "OK" : "FAIL";
  console.log(`${mark} ${report.name}: ${report.detail}`);
}

if (reports.some((report) => !report.passed)) {
  process.exit(1);
}
