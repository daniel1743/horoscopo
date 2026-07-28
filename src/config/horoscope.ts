/**
 * Configuración central del sistema de horóscopos.
 * Fuente única para etiquetas, rutas por periodo y utilidades de fecha.
 */
import { routes, zodiacRoute } from "@/config/routes";
import type { HoroscopePeriod } from "@/types/horoscope";

export interface HoroscopePeriodDef {
  key: HoroscopePeriod;
  slug: "hoy" | "semana" | "mes";
  label: string;
  shortLabel: string;
  description: string;
  path: string;
}

export const horoscopePeriods: readonly HoroscopePeriodDef[] = [
  {
    key: "daily",
    slug: "hoy",
    label: "Horóscopo de hoy",
    shortLabel: "Hoy",
    description: "Tendencia diaria por signo, con foco, ánimo y energía.",
    path: routes.horoscopeToday,
  },
  {
    key: "weekly",
    slug: "semana",
    label: "Horóscopo de la semana",
    shortLabel: "Semana",
    description: "Panorama semanal con las claves para cada signo.",
    path: routes.horoscopeWeek,
  },
  {
    key: "monthly",
    slug: "mes",
    label: "Horóscopo del mes",
    shortLabel: "Mes",
    description: "Lectura mensual con los tránsitos más relevantes.",
    path: routes.horoscopeMonth,
  },
] as const;

export const getPeriodByKey = (key: HoroscopePeriod): HoroscopePeriodDef =>
  horoscopePeriods.find((p) => p.key === key) ?? horoscopePeriods[0];

export const getPeriodBySlug = (slug: string): HoroscopePeriodDef | undefined =>
  horoscopePeriods.find((p) => p.slug === slug);

/** Ruta pública del horóscopo de un signo. */
export const signHoroscopePath = (signSlug: string) => zodiacRoute(signSlug);

/* -------- Utilidades de fecha (deterministas, sin locale) -------- */

/** Devuelve YYYY-MM-DD en zona local. */
export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Lunes de la semana ISO del `d`. */
export const startOfIsoWeek = (d: Date): Date => {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay(); // 0..6 (dom..sab)
  const diff = (day + 6) % 7; // días desde el lunes
  copy.setDate(copy.getDate() - diff);
  return copy;
};

/** Primer día del mes de `d`. */
export const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);

/** Fecha de referencia según periodo. */
export const referenceDateFor = (period: HoroscopePeriod, now = new Date()): string => {
  if (period === "daily") return toDateKey(now);
  if (period === "weekly") return toDateKey(startOfIsoWeek(now));
  return toDateKey(startOfMonth(now));
};

const monthsLong = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Etiqueta legible para el usuario. */
export const formatPeriodLabel = (period: HoroscopePeriod, dateKey: string): string => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (period === "daily") {
    return `${date.getDate()} de ${monthsLong[date.getMonth()]} de ${date.getFullYear()}`;
  }
  if (period === "weekly") {
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return `Semana del ${date.getDate()} al ${end.getDate()} de ${monthsLong[end.getMonth()]}`;
  }
  return `${monthsLong[date.getMonth()][0].toUpperCase()}${monthsLong[date.getMonth()].slice(1)} de ${date.getFullYear()}`;
};
