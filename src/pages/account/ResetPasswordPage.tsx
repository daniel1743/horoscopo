import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

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
    if (busy) return;

    const nextErrors: Record<string, string> = {};
    if (!password) nextErrors.password = "Ingresa tu nueva contraseña.";
    else if (password.length < 8) {
      nextErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!confirmPassword) nextErrors.confirmPassword = "Confirma tu nueva contraseña.";
    else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setFormError("No pudimos actualizar tu contraseña. Inténtalo nuevamente.");
      return;
    }
    toast.success("Tu contraseña fue actualizada correctamente.");
    navigate({ to: routes.account, replace: true });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Crea una nueva contraseña</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Elige una contraseña segura que puedas recordar.
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
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <PasswordField
              id="new-password"
              label="Nueva contraseña"
              value={password}
              setValue={setPassword}
              shown={showPassword}
              setShown={setShowPassword}
              error={errors.password}
            />
            <PasswordField
              id="confirm-new-password"
              label="Confirmar nueva contraseña"
              value={confirmPassword}
              setValue={setConfirmPassword}
              shown={showConfirmPassword}
              setShown={setShowConfirmPassword}
              error={errors.confirmPassword}
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Guardando…" : "Actualizar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </PageShell>
  );
}

function PasswordField({
  id,
  label,
  value,
  setValue,
  shown,
  setShown,
  error,
}: {
  id: string;
  label: string;
  value: string;
  setValue: (value: string) => void;
  shown: boolean;
  setShown: (shown: boolean) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          required
          minLength={8}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="new-password"
          className="pr-11"
        />
        <button
          type="button"
          aria-label={shown ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[var(--radius-control)] text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={() => setShown(!shown)}
        >
          {shown ? (
            <EyeOff aria-hidden className="h-4 w-4" />
          ) : (
            <Eye aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
