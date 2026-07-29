import { runGeneralTransitEngineChecks } from "../src/server/transits/general-transit-engine.test";

const reports = runGeneralTransitEngineChecks();

for (const report of reports) {
  const mark = report.passed ? "OK" : "FAIL";
  console.log(`${mark} ${report.name}: ${report.detail}`);
}

if (reports.some((report) => !report.passed)) {
  process.exit(1);
}
