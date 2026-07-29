import { runTimeWindowEventResolverChecks } from "../src/server/transits/time-window-event-resolver.test";

const reports = runTimeWindowEventResolverChecks();

for (const report of reports) {
  const mark = report.passed ? "OK" : "FAIL";
  console.log(`${mark} ${report.name}: ${report.detail}`);
}

if (reports.some((report) => !report.passed)) {
  process.exit(1);
}
