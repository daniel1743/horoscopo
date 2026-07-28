import { runPlanetaryEngineChecks } from "../src/server/planetary/planetary-engine.test";

const reports = runPlanetaryEngineChecks();

for (const report of reports) {
  const mark = report.passed ? "OK" : "FAIL";
  console.log(`${mark} ${report.name}: ${report.detail}`);
}

if (reports.some((report) => !report.passed)) {
  process.exit(1);
}
