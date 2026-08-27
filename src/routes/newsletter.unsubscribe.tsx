import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { unsubscribeFromPublicNewsletter } from "@/lib/newsletter/public-newsletter.functions";
import type { NewsletterSubscriptionState } from "@/lib/newsletter/public-newsletter.types";

const searchSchema = z.object({
  token: z.string().optional().default(""),
});

export const Route = createFileRoute("/newsletter/unsubscribe")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Gestionar baja del newsletter | Creovision" },
      {
        name: "description",
        content: "Gestiona o cancela una suscripción pública al newsletter de Creovision.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewsletterUnsubscribePage,
});

function NewsletterUnsubscribePage() {
  const { token } = Route.useSearch();
  const unsubscribe = useServerFn(unsubscribeFromPublicNewsletter);
  const [state, setState] = useState<NewsletterSubscriptionState>(
    token.trim() ? "pending" : "invalid_token",
  );
  const [message, setMessage] = useState<string | null>(
    token.trim() ? null : "Este enlace no contiene un token de baja válido.",
  );
  const [busy, setBusy] = useState(false);

  async function handleUnsubscribe() {
    if (!token.trim() || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await unsubscribe({ data: { token } });
      setState(result.state);
      setMessage(result.message);
    } catch {
      setState("backend_unavailable");
      setMessage("No pudimos contactar el servicio de baja. No se modificó ninguna suscripción.");
    } finally {
      setBusy(false);
    }
  }

  const isError = [
    "invalid_token",
    "backend_not_configured",
    "backend_unavailable",
    "error",
  ].includes(state);

  return (
    <PageShell breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Newsletter" }]}>
      <PageHeader
        eyebrow="Newsletter"
        title="Gestionar o cancelar suscripción"
        description="Usa el enlace recibido en un correo de confirmación para gestionar tu suscripción pública."
      />
      <section className="mt-8 max-w-2xl rounded-[var(--radius-card)] border border-line bg-warm-white p-6">
        <div
          role={isError ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 font-body text-[14px] leading-6 ${
            isError
              ? "border-gold/30 bg-gold/10 text-ink-soft"
              : "border-brand/20 bg-brand-soft/20 text-ink-soft"
          }`}
        >
          {message ??
            "Este enlace está listo para procesarse cuando exista un proveedor conectado."}
        </div>
        {token.trim() && state === "pending" && (
          <div className="mt-5">
            <Button type="button" onClick={handleUnsubscribe} disabled={busy}>
              {busy ? "Procesando…" : "Procesar baja"}
            </Button>
          </div>
        )}
        {state === "unsubscribed" || state === "already_unsubscribed" ? (
          <p className="mt-5 font-body text-[13px] text-ink-soft">
            Puedes cerrar esta página. No necesitas iniciar sesión para gestionar una baja válida.
          </p>
        ) : null}
      </section>
    </PageShell>
  );
}
