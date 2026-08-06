/**
 * Sistema de gestión de cookies conforme con GDPR/RGPD.
 * Maneja categorías de cookies y preferencias del usuario.
 */

export type CookieCategory = "necessary" | "analytics" | "marketing" | "preferences";

export interface CookieConsent {
  necessary: boolean; // Siempre true, no se puede desactivar
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string;
  version: string; // Versión de la política
}

export interface CookieDefinition {
  name: string;
  category: CookieCategory;
  description: string;
  duration: string;
  provider: string;
}

// Versión actual de la política de cookies
export const COOKIE_POLICY_VERSION = "1.0";

// Nombre de la cookie que guarda el consentimiento
const CONSENT_COOKIE_NAME = "creovision_cookie_consent";

// Duración del consentimiento (1 año)
const CONSENT_DURATION_DAYS = 365;

/**
 * Cookies utilizadas en el sitio.
 */
export const cookieDefinitions: CookieDefinition[] = [
  // Cookies necesarias
  {
    name: "creovision_cookie_consent",
    category: "necessary",
    description: "Almacena las preferencias de consentimiento de cookies del usuario",
    duration: "1 año",
    provider: "Creovision",
  },
  {
    name: "creovision_session",
    category: "necessary",
    description: "Mantiene la sesión del usuario activa durante la navegación",
    duration: "Sesión",
    provider: "Creovision",
  },

  // Cookies de analítica (si se usan)
  {
    name: "_ga",
    category: "analytics",
    description: "Google Analytics - Distingue usuarios únicos",
    duration: "2 años",
    provider: "Google",
  },
  {
    name: "_ga_*",
    category: "analytics",
    description: "Google Analytics 4 - Mantiene el estado de la sesión",
    duration: "2 años",
    provider: "Google",
  },

  // Cookies de preferencias
  {
    name: "creovision_theme",
    category: "preferences",
    description: "Guarda la preferencia de tema claro/oscuro",
    duration: "1 año",
    provider: "Creovision",
  },
  {
    name: "horoscope_visitor_assignments",
    category: "preferences",
    description: "Guarda las asignaciones de variantes de horóscopo para visitantes",
    duration: "30 días",
    provider: "Creovision",
  },
];

/**
 * Consentimiento por defecto (solo cookies necesarias).
 */
export const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: new Date().toISOString(),
  version: COOKIE_POLICY_VERSION,
};

/**
 * Verifica si localStorage está disponible.
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Guarda el consentimiento de cookies.
 */
export function saveCookieConsent(consent: Omit<CookieConsent, "timestamp" | "version">): void {
  const fullConsent: CookieConsent = {
    ...consent,
    necessary: true, // Siempre true
    timestamp: new Date().toISOString(),
    version: COOKIE_POLICY_VERSION,
  };

  // Guardar en cookie
  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_DURATION_DAYS);

  document.cookie = `${CONSENT_COOKIE_NAME}=${JSON.stringify(fullConsent)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

  // También en localStorage como backup
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(fullConsent));
    } catch (e) {
      console.error("Error saving consent to localStorage:", e);
    }
  }

  // Aplicar el consentimiento (cargar scripts de analytics, etc.)
  applyConsent(fullConsent);
}

/**
 * Lee el consentimiento guardado.
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  // Intentar leer de cookie primero
  const cookies = document.cookie.split("; ");
  const consentCookie = cookies.find((c) => c.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (consentCookie) {
    try {
      const value = consentCookie.split("=")[1];
      const consent = JSON.parse(decodeURIComponent(value)) as CookieConsent;

      // Verificar si la versión es actual
      if (consent.version === COOKIE_POLICY_VERSION) {
        return consent;
      }
    } catch (e) {
      console.error("Error parsing consent cookie:", e);
    }
  }

  // Fallback a localStorage
  if (isLocalStorageAvailable()) {
    try {
      const stored = window.localStorage.getItem(CONSENT_COOKIE_NAME);
      if (stored) {
        const consent = JSON.parse(stored) as CookieConsent;
        if (consent.version === COOKIE_POLICY_VERSION) {
          return consent;
        }
      }
    } catch (e) {
      console.error("Error reading consent from localStorage:", e);
    }
  }

  return null;
}

/**
 * Verifica si el usuario ha dado consentimiento.
 */
export function hasGivenConsent(): boolean {
  return getCookieConsent() !== null;
}

/**
 * Aplica el consentimiento cargando/descargando scripts según las preferencias.
 */
function applyConsent(consent: CookieConsent): void {
  // Analytics (Google Analytics)
  if (consent.analytics) {
    loadGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
  }

  // Marketing (futuro: Facebook Pixel, etc.)
  if (consent.marketing) {
    // loadMarketingScripts();
  }

  // Emitir evento para que otros componentes reaccionen
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cookieConsentUpdated", {
        detail: consent,
      })
    );
  }
}

/**
 * Carga Google Analytics si está configurado.
 */
function loadGoogleAnalytics(): void {
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!GA_MEASUREMENT_ID) return;

  // Verificar si ya está cargado
  if (document.querySelector(`script[src*="googletagmanager"]`)) return;

  // Cargar gtag.js
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Inicializar
  script.onload = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  };
}

/**
 * Deshabilita Google Analytics.
 */
function disableGoogleAnalytics(): void {
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!GA_MEASUREMENT_ID) return;

  // Deshabilitar seguimiento
  (window as any)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

/**
 * Elimina el consentimiento (para testing o reset).
 */
export function clearCookieConsent(): void {
  // Eliminar cookie
  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

  // Eliminar de localStorage
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(CONSENT_COOKIE_NAME);
    } catch (e) {
      console.error("Error clearing consent from localStorage:", e);
    }
  }
}

/**
 * Inicializa el sistema de cookies.
 * Llamar una vez al cargar la aplicación.
 */
export function initCookieManager(): void {
  const consent = getCookieConsent();

  if (consent) {
    // Aplicar consentimiento existente
    applyConsent(consent);
  }
  // Si no hay consentimiento, el banner se mostrará
}
