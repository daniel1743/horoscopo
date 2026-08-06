/**
 * Banner de consentimiento de cookies conforme con GDPR/RGPD.
 * Muestra opciones personalizables y guarda preferencias.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import {
  getCookieConsent,
  saveCookieConsent,
  hasGivenConsent,
  type CookieConsent,
} from "@/lib/cookies/cookie-manager";
import { Link } from "@tanstack/react-router";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<Omit<CookieConsent, "necessary" | "timestamp" | "version">>({
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Mostrar banner solo si no hay consentimiento previo
    if (!hasGivenConsent()) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    saveCookieConsent({
      analytics: true,
      marketing: true,
      preferences: true,
    });
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    saveCookieConsent({
      analytics: false,
      marketing: false,
      preferences: false,
    });
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(preferences);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <Card className="mx-auto max-w-[720px] border-2 border-cosmic/20 bg-card p-6 shadow-2xl">
        {!showDetails ? (
          // Vista simple
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 text-2xl">🍪</span>
              <div className="flex-1">
                <h3 className="font-display text-[18px] font-semibold text-ink">
                  Este sitio utiliza cookies
                </h3>
                <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
                  Usamos cookies necesarias para que el sitio funcione correctamente. También
                  podemos usar cookies opcionales para mejorar tu experiencia y analizar el uso del
                  sitio.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={handleAcceptAll}>
                Aceptar todas
              </Button>
              <Button variant="secondary" onClick={handleAcceptNecessary}>
                Solo necesarias
              </Button>
              <Button variant="ghost" onClick={() => setShowDetails(true)}>
                <Icon name="settings" size="sm" />
                Personalizar
              </Button>
            </div>

            <p className="font-body text-[12px] text-ink-soft">
              <Link to="/legal/cookies" className="underline hover:text-cosmic">
                Política de cookies
              </Link>
              {" · "}
              <Link to="/legal/privacidad" className="underline hover:text-cosmic">
                Privacidad
              </Link>
            </p>
          </div>
        ) : (
          // Vista detallada con opciones
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-[18px] font-semibold text-ink">
                Configurar cookies
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-ink-soft hover:text-ink"
                aria-label="Cerrar"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Cookies necesarias (siempre activas) */}
              <div className="flex items-start justify-between rounded-lg border border-line-subtle bg-muted p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-[15px] font-semibold text-ink">
                      Cookies necesarias
                    </h4>
                    <span className="rounded-full bg-cosmic/10 px-2 py-0.5 font-body text-[11px] font-medium text-cosmic">
                      Siempre activas
                    </span>
                  </div>
                  <p className="mt-1 font-body text-[13px] text-ink-soft">
                    Esenciales para que el sitio funcione. No se pueden desactivar.
                  </p>
                </div>
              </div>

              {/* Cookies de analítica */}
              <div className="flex items-start justify-between rounded-lg border border-line-subtle p-4">
                <div className="flex-1">
                  <h4 className="font-display text-[15px] font-semibold text-ink">
                    Cookies de analítica
                  </h4>
                  <p className="mt-1 font-body text-[13px] text-ink-soft">
                    Nos ayudan a entender cómo usas el sitio para mejorarlo.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-cosmic peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cosmic peer-focus:ring-offset-2"></div>
                </label>
              </div>

              {/* Cookies de marketing */}
              <div className="flex items-start justify-between rounded-lg border border-line-subtle p-4">
                <div className="flex-1">
                  <h4 className="font-display text-[15px] font-semibold text-ink">
                    Cookies de marketing
                  </h4>
                  <p className="mt-1 font-body text-[13px] text-ink-soft">
                    Se usan para mostrarte contenido relevante. Actualmente no las usamos.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences({ ...preferences, marketing: e.target.checked })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-cosmic peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cosmic peer-focus:ring-offset-2"></div>
                </label>
              </div>

              {/* Cookies de preferencias */}
              <div className="flex items-start justify-between rounded-lg border border-line-subtle p-4">
                <div className="flex-1">
                  <h4 className="font-display text-[15px] font-semibold text-ink">
                    Cookies de preferencias
                  </h4>
                  <p className="mt-1 font-body text-[13px] text-ink-soft">
                    Guardan tus elecciones (tema, variantes de horóscopo, etc.)
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={(e) =>
                      setPreferences({ ...preferences, preferences: e.target.checked })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-cosmic peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cosmic peer-focus:ring-offset-2"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleSavePreferences} className="flex-1">
                Guardar preferencias
              </Button>
              <Button variant="secondary" onClick={handleAcceptAll}>
                Aceptar todas
              </Button>
            </div>

            <p className="font-body text-[12px] text-ink-soft">
              Más información en nuestra{" "}
              <Link to="/legal/cookies" className="underline hover:text-cosmic">
                Política de cookies
              </Link>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

/**
 * Hook para detectar cambios en el consentimiento.
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    // Leer consentimiento inicial
    setConsent(getCookieConsent());

    // Escuchar cambios
    const handleConsentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsent>;
      setConsent(customEvent.detail);
    };

    window.addEventListener("cookieConsentUpdated", handleConsentUpdate);

    return () => {
      window.removeEventListener("cookieConsentUpdated", handleConsentUpdate);
    };
  }, []);

  return consent;
}
