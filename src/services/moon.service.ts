/**
 * Servicio cliente unificado del sistema lunar.
 * Los componentes SOLO usan estos hooks/funciones — nunca importan
 * repositorios ni server functions directamente.
 */
import { queryOptions } from "@tanstack/react-query";
import { getMoonToday, getMoonCalendar, getUpcomingMoonEvents } from "@/lib/moon/moon.functions";
import { fetchAllPublishedMoonContent, fetchMoonContentByPhase } from "@/lib/moon/repository";
import type { MoonPhaseKey } from "@/types/moon";

const CACHE_MS = {
  snapshot: 60_000, // 1 minuto
  calendar: 15 * 60_000, // 15 minutos
  events: 5 * 60_000, // 5 minutos
  content: 60 * 60_000, // 1 hora
};

export const moonQueries = {
  today: () =>
    queryOptions({
      queryKey: ["moon", "today"] as const,
      queryFn: () => getMoonToday(),
      staleTime: CACHE_MS.snapshot,
    }),
  calendar: (year: number, month: number) =>
    queryOptions({
      queryKey: ["moon", "calendar", year, month] as const,
      queryFn: () => getMoonCalendar({ data: { year, month } }),
      staleTime: CACHE_MS.calendar,
    }),
  upcoming: () =>
    queryOptions({
      queryKey: ["moon", "upcoming"] as const,
      queryFn: () => getUpcomingMoonEvents(),
      staleTime: CACHE_MS.events,
    }),
  allContent: () =>
    queryOptions({
      queryKey: ["moon", "content", "all"] as const,
      queryFn: () => fetchAllPublishedMoonContent(),
      staleTime: CACHE_MS.content,
    }),
  contentByPhase: (phaseKey: MoonPhaseKey) =>
    queryOptions({
      queryKey: ["moon", "content", phaseKey] as const,
      queryFn: () => fetchMoonContentByPhase(phaseKey).catch(() => null),
      staleTime: CACHE_MS.content,
    }),
};
