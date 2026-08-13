import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export interface SessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

/**
 * Hook cliente. Fuente única del estado de sesión Supabase Auth en la UI.
 * Escucha getSession + onAuthStateChange (SIGNED_IN, SIGNED_OUT, USER_UPDATED).
 */
export function useSession(): SessionState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;
    let currentUser: string | null = null;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      const userId = session?.user?.id ?? null;
      
      // Limpieza de caché privado si la identidad cambia o se desconecta
      if (event === "SIGNED_OUT" || (currentUser !== null && currentUser !== userId)) {
        queryClient.clear();
      }
      currentUser = userId;
      
      setState({ session, user: session?.user ?? null, loading: false });
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      currentUser = data.session?.user?.id ?? null;
      setState({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  return state;
}
