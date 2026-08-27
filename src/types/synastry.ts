import type { NatalAspect, NatalChart } from "@/types/astrology";

export interface SynastrySnapshot {
  first: NatalChart;
  second: NatalChart;
  aspects: NatalAspect[];
  limitations: string[];
}
