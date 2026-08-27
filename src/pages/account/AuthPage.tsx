import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { routes } from "@/config/routes";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "forgot";

/** Único punto de entrada para autenticación (email/contraseña). */
export function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { redirect?: string; mode?: Mode };
  const initialMode: Mode = search.mode ?? "signin";
  const redirectTo =
    search.redirect && search.redirect.startsWith("/") ? search.redirect : routes.account;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setMessage({ kind: "error", text: error.message });
      return;
    }
    toast.success("Sesión iniciada");
    navigate({ to: redirectTo });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}${routes.authCallback}`
            : undefined,
      },
    });
    setBusy(false);
    if (error) {
      setMessage({ kind: "error", text: error.message });
      return;
    }
    if (data.session) {
      toast.success("Cuenta creada");
      navigate({ to: redirectTo });
    } else {
      setMessage({
        kind: "info",
        text: "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada.",
      });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}${routes.resetPassword}`
          : undefined,
    });
    setBusy(false);
    if (error) {
      setMessage({ kind: "error", text: error.message });
      return;
    }
    setMessage({
      kind: "info",
      text: "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
    });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md py-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Mi espacio</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Inicia sesión para guardar lecturas, favoritos y personalizar tu experiencia.
        </p>

        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v as Mode);
            setMessage(null);
          }}
          className="mt-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            <TabsTrigger value="forgot">Olvidé</TabsTrigger>
          </TabsList>

          {message && (
            <Alert className="mt-4" variant={message.kind === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Entrando…" : "Iniciar sesión"}
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-brand hover:underline"
                  onClick={() => setMode("forgot")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email-signup">Correo electrónico</Label>
                <Input
                  id="email-signup"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password-signup">Contraseña</Label>
                <Input
                  id="password-signup"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <p className="text-xs text-ink-muted">Mínimo 8 caracteres.</p>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creando…" : "Crear cuenta"}
              </Button>
              <p className="text-center text-xs text-ink-muted">
                Al continuar aceptas los{" "}
                <Link to={routes.terms} className="underline">
                  términos
                </Link>{" "}
                y la{" "}
                <Link to={routes.privacy} className="underline">
                  política de privacidad
                </Link>
                .
              </p>
            </form>
          </TabsContent>

          <TabsContent value="forgot">
            <form onSubmit={handleForgot} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email-forgot">Correo electrónico</Label>
                <Input
                  id="email-forgot"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Enviando…" : "Enviar enlace"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}
