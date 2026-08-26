import { useCallback, useState } from "react";
import { useSession } from "@/hooks/useSession";
import {
  fetchPrivacySettings,
  updatePrivacySettings,
  upsertProfile,
} from "@/lib/account/repository";

export type NewsletterStatus =
  "idle" | "loading" | "success" | "auth-required" | "account-email" | "error";

/**
 * Activa la preferencia de newsletter del usuario autenticado.
 *
 * El proyecto todavía no tiene un proveedor de correo para suscripciones
 * anónimas, por eso no simula envíos: la activación real vive en Mi espacio.
 */
export function useNewsletterSubscription() {
  const { user, loading: sessionLoading } = useSession();
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = useCallback(
    async (email: string, preferredSign?: string) => {
      setMessage(null);

      if (!user) {
        setStatus("auth-required");
        setMessage("Inicia sesión para activar y gestionar tu suscripción desde Mi espacio.");
        return false;
      }

      const accountEmail = user.email?.trim().toLowerCase();
      if (!accountEmail || email.trim().toLowerCase() !== accountEmail) {
        setStatus("account-email");
        setMessage("Usa el correo de tu cuenta para activar esta preferencia.");
        return false;
      }

      setStatus("loading");
      try {
        const privacy = await fetchPrivacySettings(user.id);
        if (!privacy.newsletter_opt_in) {
          await updatePrivacySettings(user.id, { newsletter_opt_in: true });
        }

        if (preferredSign) {
          try {
            await upsertProfile(user.id, { preferred_sign: preferredSign });
          } catch (profileError) {
            // La suscripción ya quedó activada; no ocultar ese éxito por un
            // fallo secundario al guardar el signo preferido.
            console.error(profileError);
          }
        }

        setStatus("success");
        return true;
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("No pudimos actualizar tu preferencia. Intenta de nuevo.");
        return false;
      }
    },
    [user],
  );

  return { sessionLoading, status, message, submit };
}
