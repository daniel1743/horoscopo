import { useCallback, useEffect, useState } from "react";
import { getZodiacBySlug, zodiacSigns } from "@/data/zodiac-signs";
import { homeConfig } from "@/config/home";

/**
 * Estado local del signo elegido en la Home.
 * Persistencia opcional en localStorage. No requiere cuenta.
 */
export function useSelectedSign(defaultSlug: string = homeConfig.dailyInsight.defaultSignSlug) {
  const [slug, setSlugState] = useState<string>(defaultSlug);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(homeConfig.dailyInsight.storageKey);
      if (stored && getZodiacBySlug(stored)) setSlugState(stored);
    } catch {
      // ignore storage errors (Safari private, etc.)
    }
  }, []);

  const setSlug = useCallback((next: string) => {
    setSlugState(next);
    try {
      window.localStorage.setItem(homeConfig.dailyInsight.storageKey, next);
    } catch {
      // ignore
    }
  }, []);

  const sign = getZodiacBySlug(slug) ?? zodiacSigns[0];
  return { slug: sign.slug, sign, setSlug };
}
