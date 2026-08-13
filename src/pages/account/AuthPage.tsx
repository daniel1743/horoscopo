import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { getSupabaseClientDiagnostics, supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import {
  AUTH_CALLBACK_URL,
  PASSWORD_RECOVERY_URL,
  authErrorMessage,
  isSafeInternalRedirect,
  normalizeDisplayName,
  validateEmail,
  validatePassword,
  validateSignUp,
} from "@/lib/account/auth-profile";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "forgot";
type FieldErrors = Record<string, string>;
type AuthMessage = { kind: "error" | "info"; text: string; action?: "resend-confirmation" };

function getAuthDebugError(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const record = error as Record<string, unknown>;
  return {
    name: record.name,
    message: record.message,
    status: record.status,
    code: record.code,
    cause: record.cause,
  };
}

function getEmailDebug(email: string) {
  const trimmed = email.trim();
  const [, domain] = trimmed.split("@");
  return {
    hasEmail: Boolean(trimmed),
    emailDomain: domain || "",
  };
}

function getSignUpDebugData(data: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"]) {
  return {
    hasSession: Boolean(data.session),
    userCreated: Boolean(data.user),
    confirmationSentAt: data.user?.confirmation_sent_at ?? null,
    emailConfirmedAt: data.user?.email_confirmed_at ?? null,
    identitiesCount: data.user?.identities?.length ?? null,
  };
}

function authDebug(action: string, phase: string, details: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!import.meta.env.DEV) return;

  console.groupCollapsed(`[Auth Debug] ${action}: ${phase}`);
  console.info("Supabase", getSupabaseClientDiagnostics());
  console.info("Details", {
    timestamp: new Date().toISOString(),
    location: window.location.href,
    ...details,
  });
  console.groupEnd();
}

export function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { redirect?: string; mode?: Mode };
  const redirectTo = isSafeInternalRedirect(search.redirect ?? null)
    ? search.redirect!
    : routes.account;

  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  useEffect(() => {
    setFieldErrors({});
    setMessage(null);
  }, [mode]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      authDebug("window", "error", {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: getAuthDebugError(event.error),
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      authDebug("window", "unhandledrejection", {
        reason: getAuthDebugError(event.reason),
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    authDebug("page", "loaded");

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  const title = useMemo(() => {
    if (mode === "signup") return "Crear cuenta";
    if (mode === "forgot") return "Recuperar contraseña";
    return "Iniciar sesión";
  }, [mode]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const errors: FieldErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setBusy(true);
    setMessage(null);
    authDebug("signInWithPassword", "start", getEmailDebug(email));
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        authDebug("signInWithPassword", "supabase-error", {
          ...getEmailDebug(email),
          error: getAuthDebugError(error),
        });
        setMessage({ kind: "error", text: authErrorMessage(error.message) });
        return;
      }
      authDebug("signInWithPassword", "success", getEmailDebug(email));
      toast.success("Sesión iniciada correctamente.");
      navigate({ to: redirectTo });
    } catch (error) {
      authDebug("signInWithPassword", "unexpected-error", {
        ...getEmailDebug(email),
        error: getAuthDebugError(error),
      });
      setMessage({ kind: "error", text: "No pudimos iniciar sesión. Inténtalo nuevamente." });
    } finally {
      setBusy(false);
    }
  };

  const signUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const validation = validateSignUp({
      displayName,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    });
    setFieldErrors(validation.errors);
    if (!validation.valid) return;

    setBusy(true);
    setMessage(null);
    authDebug("signUp", "start", {
      ...getEmailDebug(email),
      emailRedirectTo: AUTH_CALLBACK_URL,
    });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: AUTH_CALLBACK_URL,
          data: {
            display_name: normalizeDisplayName(displayName),
          },
        },
      });
      if (error) {
        authDebug("signUp", "supabase-error", {
          ...getEmailDebug(email),
          error: getAuthDebugError(error),
        });
        setMessage({ kind: "error", text: authErrorMessage(error.message) });
        return;
      }
      authDebug("signUp", "success", {
        ...getEmailDebug(email),
        ...getSignUpDebugData(data),
      });
      if (data.session) {
        toast.success("Cuenta creada.");
        navigate({ to: redirectTo });
        return;
      }
      setConfirmationEmail(email.trim());
      toast.success("Cuenta creada. Revisa tu correo para confirmarla.");
      setMessage({
        kind: "info",
        text: "Revisa tu correo para confirmar tu cuenta.",
        action: "resend-confirmation",
      });
    } catch (error) {
      authDebug("signUp", "unexpected-error", {
        ...getEmailDebug(email),
        error: getAuthDebugError(error),
      });
      setMessage({ kind: "error", text: "No pudimos crear la cuenta. Inténtalo nuevamente." });
    } finally {
      setBusy(false);
    }
  };

  const resendConfirmation = async () => {
    if (busy) return;
    const targetEmail = confirmationEmail || email.trim();
    const emailError = validateEmail(targetEmail);
    setFieldErrors(emailError ? { email: emailError } : {});
    if (emailError) return;

    setBusy(true);
    authDebug("resend", "start", {
      ...getEmailDebug(targetEmail),
      type: "signup",
      emailRedirectTo: AUTH_CALLBACK_URL,
    });
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: AUTH_CALLBACK_URL,
        },
      });
      if (error) {
        authDebug("resend", "supabase-error", {
          ...getEmailDebug(targetEmail),
          error: getAuthDebugError(error),
        });
        setMessage({ kind: "error", text: authErrorMessage(error.message) });
        return;
      }
      authDebug("resend", "success", getEmailDebug(targetEmail));
      toast.success("Te reenviamos el correo de confirmación.");
      setMessage({ kind: "info", text: "Te reenviamos el correo de confirmación." });
    } catch (error) {
      authDebug("resend", "unexpected-error", {
        ...getEmailDebug(targetEmail),
        error: getAuthDebugError(error),
      });
      setMessage({
        kind: "error",
        text: "No pudimos reenviar el correo. Inténtalo nuevamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  const recover = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const emailError = validateEmail(email);
    setFieldErrors(emailError ? { email: emailError } : {});
    if (emailError) return;

    setBusy(true);
    setMessage(null);
    authDebug("resetPasswordForEmail", "start", {
      ...getEmailDebug(email),
      redirectTo: PASSWORD_RECOVERY_URL,
    });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: PASSWORD_RECOVERY_URL,
      });
      if (error) {
        authDebug("resetPasswordForEmail", "supabase-error", {
          ...getEmailDebug(email),
          error: getAuthDebugError(error),
        });
        setMessage({ kind: "error", text: authErrorMessage(error.message) });
        return;
      }
      authDebug("resetPasswordForEmail", "success", getEmailDebug(email));
      toast.success("Te enviamos un enlace para restablecer tu contraseña.");
      setMessage({
        kind: "info",
        text: "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
      });
    } catch (error) {
      authDebug("resetPasswordForEmail", "unexpected-error", {
        ...getEmailDebug(email),
        error: getAuthDebugError(error),
      });
      setMessage({
        kind: "error",
        text: "No pudimos enviar el correo de recuperación. Inténtalo nuevamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    authDebug("signInWithOAuth", "start", {
      provider: "google",
      redirectTo: AUTH_CALLBACK_URL,
    });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: AUTH_CALLBACK_URL },
      });
      if (error) {
        authDebug("signInWithOAuth", "supabase-error", {
          error: getAuthDebugError(error),
        });
        setMessage({ kind: "error", text: authErrorMessage(error.message) });
      }
    } catch (error) {
      authDebug("signInWithOAuth", "unexpected-error", {
        error: getAuthDebugError(error),
      });
      setMessage({ kind: "error", text: "No pudimos conectar con Google." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto grid max-w-5xl gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-12">
        <section className="rounded-[var(--radius-card-lg)] border border-line bg-night p-8 text-ink-inverse shadow-floating">
          <p className="text-sm font-medium uppercase tracking-wide text-ink-inverse-soft">
            Mi espacio
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink-inverse">
            Tu archivo astral privado
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink-inverse-soft">
            Guarda lecturas, favoritos y prepara tu perfil natal sin mezclar el registro con los
            datos astrológicos avanzados.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-ink-inverse-soft">
            <p>Creación de cuenta rápida y sencilla.</p>
            <p>Completa tu perfil astral cuando estés listo.</p>
            <p>Tus datos se mantienen privados y protegidos.</p>
          </div>
        </section>

        <section className="rounded-[var(--radius-modal)] border border-line bg-warm-white p-5 shadow-floating sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-sm text-ink-soft">
                {mode === "signup"
                  ? "Primero crea tu cuenta. El perfil astral se completa después."
                  : "Accede para consultar tus lecturas, favoritos y perfil astral."}
              </p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand">
              <Icon name="premium" size="md" />
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-[var(--radius-control)] bg-brand-soft p-1 text-sm">
            <ModeButton active={mode === "signin"} onClick={() => setMode("signin")}>
              Entrar
            </ModeButton>
            <ModeButton active={mode === "signup"} onClick={() => setMode("signup")}>
              Crear cuenta
            </ModeButton>
          </div>

          {message && (
            <Alert className="mt-5" variant={message.kind === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
              {message.action === "resend-confirmation" && (
                <Button
                  type="button"
                  variant="link"
                  className="mt-2 h-auto p-0"
                  disabled={busy}
                  onClick={resendConfirmation}
                >
                  Reenviar correo de confirmación
                </Button>
              )}
            </Alert>
          )}

          {mode === "signin" && (
            <form onSubmit={signIn} className="mt-6 space-y-4" noValidate>
              <EmailField email={email} setEmail={setEmail} error={fieldErrors.email} />
              <PasswordField
                id="password"
                label="Contraseña"
                value={password}
                setValue={setPassword}
                shown={showPassword}
                setShown={setShowPassword}
                error={fieldErrors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="text-sm font-medium text-brand hover:underline"
                onClick={() => setMode("forgot")}
              >
                ¿Olvidaste tu contraseña?
              </button>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Entrando..." : "Entrar"}
              </Button>
              <OAuthDivider />
              <GoogleButton busy={busy} onClick={google} />
              <p className="text-center text-sm text-ink-soft">
                ¿Aún no tienes cuenta?{" "}
                <button
                  type="button"
                  className="font-medium text-brand hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Crear cuenta
                </button>
              </p>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={signUp} className="mt-6 space-y-4" noValidate>
              <Field id="display_name" label="Nombre visible" error={fieldErrors.displayName}>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="name"
                  maxLength={80}
                />
              </Field>
              <EmailField email={email} setEmail={setEmail} error={fieldErrors.email} />
              <PasswordField
                id="password-signup"
                label="Contraseña"
                value={password}
                setValue={setPassword}
                shown={showPassword}
                setShown={setShowPassword}
                error={fieldErrors.password}
                autoComplete="new-password"
              />
              <PasswordField
                id="confirm-password"
                label="Confirmar contraseña"
                value={confirmPassword}
                setValue={setConfirmPassword}
                shown={showConfirmPassword}
                setShown={setShowConfirmPassword}
                error={fieldErrors.confirmPassword}
                autoComplete="new-password"
              />
              <div className="flex items-start gap-3 rounded-[var(--radius-control)] border border-line-subtle p-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                />
                <div className="grid gap-1">
                  <Label htmlFor="terms" className="text-sm font-normal leading-5">
                    Acepto los{" "}
                    <Link to={routes.terms} className="font-medium text-brand underline">
                      términos
                    </Link>{" "}
                    y la{" "}
                    <Link to={routes.privacy} className="font-medium text-brand underline">
                      política de privacidad
                    </Link>
                    .
                  </Label>
                  {fieldErrors.acceptedTerms && (
                    <p className="text-xs text-danger">{fieldErrors.acceptedTerms}</p>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creando..." : "Crear mi cuenta"}
              </Button>
              <OAuthDivider />
              <GoogleButton busy={busy} onClick={google} />
              <p className="text-center text-sm text-ink-soft">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  className="font-medium text-brand hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Entrar
                </button>
              </p>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={recover} className="mt-6 space-y-4" noValidate>
              <EmailField email={email} setEmail={setEmail} error={fieldErrors.email} />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
              <p className="text-center text-sm text-ink-soft">
                <button
                  type="button"
                  className="font-medium text-brand hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Volver a iniciar sesión
                </button>
              </p>
            </form>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function ModeButton(props: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`rounded-[calc(var(--radius-control)-4px)] px-3 py-2 font-medium transition-colors ${
        props.active ? "bg-warm-white text-ink shadow-card" : "text-ink-soft hover:text-ink"
      }`}
    >
      {props.children}
    </button>
  );
}

function Field(props: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      {props.children}
      {props.error && <p className="text-xs text-danger">{props.error}</p>}
    </div>
  );
}

function EmailField(props: { email: string; setEmail: (value: string) => void; error?: string }) {
  return (
    <Field id="email" label="Correo electrónico" error={props.error}>
      <Input
        id="email"
        type="email"
        value={props.email}
        onChange={(event) => props.setEmail(event.target.value)}
        autoComplete="email"
        inputMode="email"
      />
    </Field>
  );
}

function PasswordField(props: {
  id: string;
  label: string;
  value: string;
  setValue: (value: string) => void;
  shown: boolean;
  setShown: (shown: boolean) => void;
  error?: string;
  autoComplete: string;
}) {
  return (
    <Field id={props.id} label={props.label} error={props.error}>
      <div className="relative">
        <Input
          id={props.id}
          type={props.shown ? "text" : "password"}
          value={props.value}
          onChange={(event) => props.setValue(event.target.value)}
          autoComplete={props.autoComplete}
          minLength={8}
          className="pr-11"
        />
        <button
          type="button"
          aria-label={props.shown ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[var(--radius-control)] text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={() => props.setShown(!props.shown)}
        >
          {props.shown ? (
            <Icon name="eyeOff" size="sm" aria-hidden />
          ) : (
            <Icon name="eye" size="sm" aria-hidden />
          )}
        </button>
      </div>
    </Field>
  );
}

function OAuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-muted">
      <span className="h-px flex-1 bg-line-subtle" />
      <span>o</span>
      <span className="h-px flex-1 bg-line-subtle" />
    </div>
  );
}

function GoogleButton(props: { busy: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={props.busy}
      onClick={props.onClick}
    >
      <GoogleMark />
      Continuar con Google
    </Button>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
