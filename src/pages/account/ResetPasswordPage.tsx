import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { routes } from "@/config/routes";
import { toast } from "sonner";

/**
 * Página pública para completar el reseteo. Requiere que Supabase haya
 * cargado la sesión de recovery a partir del enlace (hash type=recovery).
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    toast.success("Contraseña actualizada");
    navigate({ to: routes.account, replace: true });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Restablecer contraseña</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Elige una nueva contraseña para tu cuenta.
        </p>

        {!ready ? (
          <Alert className="mt-6">
            <AlertDescription>
              Abre este enlace desde el correo de recuperación. Si el enlace expiró, solicita uno
              nuevo desde{" "}
              <a href={routes.signIn + "?mode=forgot"} className="underline">
                Iniciar sesión
              </a>
              .
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Guardando…" : "Actualizar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
