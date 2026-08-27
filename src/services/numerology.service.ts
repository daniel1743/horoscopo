import type { LifePathCalculation, LifePathNumber } from "@/types/numerology";

const MASTER_NUMBERS = new Set([11, 22, 33]);

function sumDigits(value: number): number {
  return String(value)
    .split("")
    .reduce((total, digit) => total + Number(digit), 0);
}

function reduceToLifePathNumber(value: number): LifePathNumber {
  let current = value;
  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = sumDigits(current);
  }
  return current as LifePathNumber;
}

function parseBirthDate(dateString: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) throw new Error("Indica una fecha válida.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  if (
    year < 1 ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day ||
    parsed.getTime() > todayUtc
  ) {
    throw new Error("Indica una fecha de nacimiento real que no sea futura.");
  }

  return { year, month, day };
}

/**
 * Calcula un camino de vida sin guardar ni serializar la fecha recibida.
 * El método conserva 11, 22 y 33 al reducir cada parte de la fecha.
 */
export function calculateLifePath(dateString: string): LifePathCalculation {
  const { year, month, day } = parseBirthDate(dateString);
  const reducedMonth = reduceToLifePathNumber(month);
  const reducedDay = reduceToLifePathNumber(day);
  const reducedYear = reduceToLifePathNumber(sumDigits(year));
  const finalSum = reducedMonth + reducedDay + reducedYear;
  const lifePath = reduceToLifePathNumber(finalSum);

  return {
    lifePath,
    reducedMonth,
    reducedDay,
    reducedYear,
    finalSum,
  };
}
