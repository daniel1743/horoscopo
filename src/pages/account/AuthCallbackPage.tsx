import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/config/routes";
import { toast } from "sonner";

/** Landing tras confirmación de email. */
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
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
        navigate({ to: routes.account, replace: true });
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
