import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/config/routes";

/** Landing tras confirmación de email. */
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: routes.account, replace: true });
      else navigate({ to: routes.signIn, replace: true });
    });
  }, [navigate]);

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-ink-soft">Verificando tu sesión…</p>
      </div>
    </PageShell>
  );
}
