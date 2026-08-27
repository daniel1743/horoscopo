/**
 * Selección de cartas.
 *  - Diaria: determinista por fecha, estable durante todo el día.
 *  - Interactiva: crypto.getRandomValues (nunca Math.random).
 *  - Tres cartas: sin repeticiones.
 */
import type { TarotCard } from "@/types/tarot";
import { tarotStorageKeys } from "@/config/tarot";

/* -------------------------------------------------- */
/* Fecha local YYYY-MM-DD (zona local del usuario)     */
/* -------------------------------------------------- */

export function toLocalDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* -------------------------------------------------- */
/* Semilla anónima persistente (sin datos personales)  */
/* -------------------------------------------------- */

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getOrCreateAnonymousSeed(): string {
  const ls = safeLocalStorage();
  if (!ls) return "0";
  const key = tarotStorageKeys.daily.anonymousSeed;
  const existing = ls.getItem(key);
  if (existing) return existing;
  const buf = new Uint32Array(2);
  cryptoRandom(buf);
  const seed = `${buf[0].toString(36)}${buf[1].toString(36)}`;
  try {
    ls.setItem(key, seed);
  } catch {
    /* storage bloqueado */
  }
  return seed;
}

function cryptoRandom(buf: Uint32Array): void {
  const g = globalThis as unknown as {
    crypto?: { getRandomValues?: (b: Uint32Array) => void };
  };
  if (g.crypto && typeof g.crypto.getRandomValues === "function") {
    g.crypto.getRandomValues(buf);
    return;
  }
  // Sin crypto: fallback determinista basado en tiempo — nunca Math.random.
  const now = Date.now();
  for (let i = 0; i < buf.length; i++) {
    buf[i] = ((now >>> (i * 8)) ^ (i * 2654435761)) >>> 0;
  }
}

/* -------------------------------------------------- */
/* Hash determinista simple (FNV-1a 32 bits)           */
/* -------------------------------------------------- */

function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/* -------------------------------------------------- */
/* Carta del día (estable durante todo el día)         */
/* -------------------------------------------------- */

export interface DailyPick {
  card: TarotCard;
  dateKey: string;
  reversed: boolean;
}

export function pickDailyCard(params: {
  deck: readonly TarotCard[];
  date?: Date;
  anonymousSeed?: string;
}): DailyPick | null {
  if (params.deck.length === 0) return null;
  const dateKey = toLocalDateKey(params.date ?? new Date());
  const seed = params.anonymousSeed ?? "shared";
  const index = fnv1a(`${dateKey}::${seed}`) % params.deck.length;
  const reversed = fnv1a(`${dateKey}::${seed}::orientation`) % 2 === 1;
  return { card: params.deck[index], dateKey, reversed };
}

/* -------------------------------------------------- */
/* Persistencia diaria (localStorage)                   */
/* -------------------------------------------------- */

export interface StoredDaily {
  cardKey: string;
  dateKey: string;
  reversed: boolean;
}

export function readStoredDaily(): StoredDaily | null {
  const ls = safeLocalStorage();
  if (!ls) return null;
  try {
    const cardKey = ls.getItem(tarotStorageKeys.daily.card);
    const dateKey = ls.getItem(tarotStorageKeys.daily.date);
    if (!cardKey || !dateKey) return null;
    return {
      cardKey,
      dateKey,
      reversed: ls.getItem(tarotStorageKeys.daily.orientation) === "reversed",
    };
  } catch {
    return null;
  }
}

export function writeStoredDaily(pick: StoredDaily): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(tarotStorageKeys.daily.card, pick.cardKey);
    ls.setItem(tarotStorageKeys.daily.date, pick.dateKey);
    ls.setItem(tarotStorageKeys.daily.orientation, pick.reversed ? "reversed" : "upright");
  } catch {
    /* storage bloqueado */
  }
}

/* -------------------------------------------------- */
/* Sorteo interactivo seguro (crypto.getRandomValues)  */
/* -------------------------------------------------- */

/** Devuelve un entero en [0, max) usando rechazo para evitar sesgo modular. */
function secureUintBelow(max: number): number {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / max) * max;

  while (true) {
    cryptoRandom(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

/** Sorteo sin reemplazo: garantiza cartas únicas. */
export function drawUniqueCards<T>(deck: readonly T[], count: number): T[] {
  const n = Math.min(count, deck.length);
  const pool = deck.slice();
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    const idx = secureUintBelow(pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

export function drawOneCard<T>(deck: readonly T[]): T | null {
  if (deck.length === 0) return null;
  return deck[secureUintBelow(deck.length)];
}

export function drawReversed(): boolean {
  return secureUintBelow(2) === 1;
}
