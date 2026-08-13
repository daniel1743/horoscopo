import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { routes } from "@/config/routes";
import {
  exchangeRecoveryCode,
  RECOVERY_LINK_ERROR,
  updateRecoveryPassword,
} from "@/lib/account/auth-profile";
import { toast } from "sonner";

type RecoveryState = "checking" | "ready" | "invalid" | "success";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const exchangedCodeRef = useRef<string | null>(null);
  const exchangePromiseRef = useRef<ReturnType<typeof exchangeRecoveryCode> | null>(null);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    const removeRecoveryCode = () => {
      url.searchParams.delete("code");
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(window.history.state, "", nextUrl);
    };

    if (code) {
      const exchangedCode = exchangedCodeRef.current;
      const exchangePromise =
        exchangedCode === code && exchangePromiseRef.current
          ? exchangePromiseRef.current
          : exchangeRecoveryCode({
              code,
              exchangedCode,
              exchangeCodeForSession: (value) => supabase.auth.exchangeCodeForSession(value),
            });

      exchangedCodeRef.current = code;
      exchangePromiseRef.current = exchangePromise;
      exchangePromise
        .then((result) => {
          if (!mounted) return;
          removeRecoveryCode();
          setRecoveryState(result.status === "ready" ? "ready" : "invalid");
        })
        .catch(() => {
          if (!mounted) return;
          removeRecoveryCode();
          setRecoveryState("invalid");
        });
    } else {
      setRecoveryState("invalid");
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryState("ready");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || recoveryState !== "ready") return;

    setFormError(null);
    setBusy(true);
    const result = await updateRecoveryPassword({
      password,
      confirmPassword,
      updateUser: (attributes) => supabase.auth.updateUser(attributes),
    });
    setErrors(result.errors);
    setBusy(false);

    if (!result.ok) {
      if (result.message) setFormError(result.message);
      return;
    }

    const message = result.message ?? "Tu contraseña fue actualizada correctamente";
    setSuccessMessage(message);
    setRecoveryState("success");
    toast.success(message);
    window.setTimeout(() => {
      navigate({ to: routes.account, replace: true });
    }, 1400);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Crea una nueva contraseña</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Elige una contraseña segura que puedas recordar.
        </p>

        {recoveryState === "checking" && (
          <Alert className="mt-6">
            <AlertDescription>Verificando el enlace de recuperación.</AlertDescription>
          </Alert>
        )}

        {recoveryState === "invalid" && (
          <Alert className="mt-6" variant="destructive">
            <AlertDescription>{RECOVERY_LINK_ERROR}</AlertDescription>
            <Button
              type="button"
              className="mt-3"
              variant="secondary"
              onClick={() => navigate({ to: routes.signIn, search: { mode: "forgot" } })}
            >
              Solicitar otro enlace
            </Button>
          </Alert>
        )}

        {recoveryState === "success" && (
          <Alert className="mt-6">
            <AlertDescription>
              {successMessage ?? "Tu contraseña fue actualizada correctamente"}
            </AlertDescription>
          </Alert>
        )}

        {recoveryState === "ready" && (
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
              {busy ? "Guardando..." : "Actualizar contraseña"}
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
            <Icon name="eyeOff" aria-hidden className="h-4 w-4" />
          ) : (
            <Icon name="eye" aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
