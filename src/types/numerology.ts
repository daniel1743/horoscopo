export type LifePathNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

export interface LifePathProfile {
  label: string;
  keywords: readonly string[];
  summary: string;
  practice: string;
  reflectionQuestion: string;
}

export interface LifePathCalculation {
  lifePath: LifePathNumber;
  reducedMonth: LifePathNumber;
  reducedDay: LifePathNumber;
  reducedYear: LifePathNumber;
  finalSum: number;
}
