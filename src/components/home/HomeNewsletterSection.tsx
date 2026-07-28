import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { routes } from "@/config/routes";
import { schemas, formMessages } from "@/config/forms";
import { zodiacSigns } from "@/data/zodiac-signs";
import { useSelectedSign } from "./useSelectedSign";

type Status = "idle" | "loading" | "success" | "error";

/** Newsletter local (demo). No persiste ni envía al servidor. */
export function HomeNewsletterSection() {
  const { newsletter: cfg } = homeConfig;
  const { slug } = useSelectedSign();
  const [email, setEmail] = useState("");
  const [sign, setSign] = useState(slug);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schemas.newsletter.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? formMessages.invalidEmail);
      setStatus("error");
      return;
    }
    setError(null);
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 500));
    setStatus("success");
    setEmail("");
  };

  return (
    <section
      aria-labelledby="newsletter-title"
      className="py-14 md:py-20"
      style={{
        background: "linear-gradient(180deg, var(--bg-lunar-ivory) 0%, var(--bg-lunar-ivory) 100%)",
      }}
    >
      <Container>
        <div className="mx-auto max-w-[960px] rounded-[var(--radius-card-lg)] border border-gold/30 bg-warm-white/60 p-6 backdrop-blur md:p-10">
          <div className="grid gap-8 md:grid-cols-[45%_55%] md:items-center md:gap-10">
            <div>
              <h2
                id="newsletter-title"
                className="font-display text-[26px] font-semibold leading-[1.2] md:text-[32px]"
              >
                {cfg.title}
              </h2>
              <p className="mt-3 font-body text-[15px] leading-[1.65] text-ink-soft md:text-[16px]">
                {cfg.description}
              </p>
            </div>

            <form onSubmit={submit} noValidate className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nl-email" className="font-body text-[13px] font-medium text-ink">
                  Correo electrónico
                </label>
                <input
                  id="nl-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={status === "error" || undefined}
                  aria-describedby={error ? "nl-email-error" : undefined}
                  required
                  className="h-[52px] w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-4 font-body text-[15px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-[rgba(108,75,217,0.18)] aria-invalid:border-danger"
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nl-sign" className="font-body text-[13px] font-medium text-ink">
                  Tu signo (opcional)
                </label>
                <select
                  id="nl-sign"
                  value={sign}
                  onChange={(e) => setSign(e.target.value)}
                  className="h-[52px] w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-4 font-body text-[15px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-[rgba(108,75,217,0.18)]"
                >
                  {zodiacSigns.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.symbol} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" size="lg" disabled={status === "loading"}>
                {status === "loading" ? "Enviando…" : cfg.submitLabel}
              </Button>

              <div aria-live="polite" className="min-h-[1.25rem]">
                {status === "success" && (
                  <p className="font-body text-[13px] text-success">
                    ¡Gracias! Recibirás la próxima edición pronto.
                  </p>
                )}
                {status === "error" && error && (
                  <p id="nl-email-error" className="font-body text-[13px] text-danger">
                    {error}
                  </p>
                )}
              </div>

              <p className="font-body text-[12px] leading-[1.5] text-ink-muted">
                {cfg.privacyHelper}{" "}
                <Link
                  to={routes[cfg.privacyRouteKey]}
                  className="text-brand underline underline-offset-2"
                >
                  Aviso de privacidad
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
