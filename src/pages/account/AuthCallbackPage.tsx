import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/config/routes";
import {
  PENDING_TAROT_READING_SAVE_KEY,
  PENDING_LUNAR_READING_SAVE_KEY,
} from "@/lib/account/repository";
import { toast } from "sonner";

/** Landing tras confirmación de email o login con OAuth. */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const completeCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error("El enlace de autenticación expiró o ya fue usado.");
          navigate({ to: routes.signIn, replace: true });
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const hasPendingTarotSave = Boolean(sessionStorage.getItem(PENDING_TAROT_READING_SAVE_KEY));
        const hasPendingLunarSave = Boolean(sessionStorage.getItem(PENDING_LUNAR_READING_SAVE_KEY));

        if (hasPendingTarotSave && hasPendingLunarSave) {
          sessionStorage.setItem("creovision:chain-to-lunar", "1");
        }

        navigate({
          to: hasPendingTarotSave
            ? routes.savedReadings
            : hasPendingLunarSave
              ? routes.savedLunarReadings
              : routes.account,
          replace: true,
        });
      } else {
        navigate({ to: routes.signIn, replace: true });
      }
    };

    completeCallback();
  }, [navigate]);

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-ink-soft">Verificando tu sesión…</p>
      </div>
    </PageShell>
  );
}
