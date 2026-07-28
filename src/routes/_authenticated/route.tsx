import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/config/routes";

/**
 * Guardián de rutas privadas. ssr:false porque la sesión Supabase vive en localStorage.
 * Todo lo que cuelgue de src/routes/_authenticated/* queda protegido.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({
        to: routes.signIn,
        search: { redirect: location.href },
      });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
