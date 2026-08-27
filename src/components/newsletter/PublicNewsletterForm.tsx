import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { schemas, formMessages } from "@/config/forms";
import { routes } from "@/config/routes";
import { usePublicNewsletterSubscription } from "@/hooks/usePublicNewsletterSubscription";

interface Props {
  id: string;
  title: string;
  description: string;
  submitLabel: string;
  privacyHelper?: string;
  dark?: boolean;
}

export function PublicNewsletterForm({
  id,
  title,
  description,
  submitLabel,
  privacyHelper = "Puedes cancelar cuando el servicio esté activo.",
  dark = false,
}: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { state, message, busy, submit } = usePublicNewsletterSubscription();
  const messageId = `${id}-message`;
  const headingClass = dark ? "text-[18px]" : "text-[26px]";
  const labelClass = dark ? "text-ink-inverse" : "text-ink";
  const mutedClass = dark ? "text-ink-inverse-soft" : "text-ink-soft";
  const inputClass = dark
    ? "border-line-dark bg-night-elevated text-ink-inverse placeholder:text-ink-inverse-soft"
    : "border-line bg-warm-white text-ink";
  const isError =
    Boolean(validationError) ||
    state === "error" ||
    state === "backend_unavailable" ||
    state === "backend_not_configured" ||
    state === "invalid_token";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schemas.newsletter.safeParse({ email });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? formMessages.invalidEmail);
      return;
    }
    if (!consent) {
      setValidationError("Marca el consentimiento para recibir el newsletter.");
      return;
    }

    setValidationError(null);
    const result = await submit({ email: parsed.data.email, consent: true, source: id });
    if (result.state === "pending" || result.state === "confirmed") {
      setEmail("");
      setConsent(false);
    }
  }

  return (
    <div>
      <h2 className={`font-display ${headingClass} font-semibold ${labelClass}`}>{title}</h2>
      <p className={`mt-2 font-body text-[14px] leading-[1.65] md:text-[15px] ${mutedClass}`}>
        {description}
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-3" aria-label={title}>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-email`} className={labelClass}>
            Correo electrónico
          </Label>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            maxLength={255}
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setValidationError(null);
            }}
            aria-invalid={isError || undefined}
            aria-describedby={validationError || message ? messageId : undefined}
            placeholder="tu@correo.com"
            className={inputClass}
          />
        </div>
        <label className={`flex items-start gap-2 font-body text-[12px] leading-5 ${mutedClass}`}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              if (event.target.checked) setValidationError(null);
            }}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand-violet)]"
          />
          <span>
            Acepto recibir el newsletter y entiendo que podré cancelar la suscripción. Consulta el{" "}
            <Link
              to={routes.privacy}
              className={
                dark
                  ? "text-gold underline underline-offset-2"
                  : "text-brand underline underline-offset-2"
              }
            >
              aviso de privacidad
            </Link>
            .
          </span>
        </label>
        <Button type="submit" variant={dark ? "premium" : "primary"} disabled={busy}>
          {busy ? "Procesando…" : submitLabel}
        </Button>
        <div
          id={messageId}
          aria-live="polite"
          className={`min-h-[1.25rem] font-body text-[13px] ${mutedClass}`}
        >
          {validationError && (
            <p className={dark ? "text-red-200" : "text-danger"}>{validationError}</p>
          )}
          {!validationError && message && (
            <p
              className={
                isError
                  ? dark
                    ? "text-red-200"
                    : "text-danger"
                  : dark
                    ? "text-gold"
                    : "text-success"
              }
            >
              {message}
            </p>
          )}
        </div>
        <p className={`font-body text-[12px] leading-5 ${mutedClass}`}>
          {privacyHelper}{" "}
          <Link
            to={routes.newsletterUnsubscribe}
            search={{ token: "" }}
            className={
              dark
                ? "text-gold underline underline-offset-2"
                : "text-brand underline underline-offset-2"
            }
          >
            Gestionar o cancelar
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
