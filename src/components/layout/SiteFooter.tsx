import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { footerConfig } from "@/config/footer";
import { routes } from "@/config/routes";
import { featureFlags } from "@/config/features";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Único footer global. Consume `footerConfig`; no hard-codear enlaces. */
export function SiteFooter() {
  const [open, setOpen] = useState<string | null>("explore");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  return (
    <footer className="bg-night text-ink-inverse">
      <Container className="py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="font-display text-[24px] font-semibold">{footerConfig.brand.name}</p>
            <p className="mt-3 max-w-[42ch] font-body text-[15px] text-ink-inverse-soft">
              {footerConfig.brand.description}
            </p>

            {footerConfig.newsletter.enabled && featureFlags.newsletter && (
              <form
                className="mt-6 max-w-md"
                onSubmit={(e) => {
                  e.preventDefault();
                  setStatus("success");
                }}
                aria-label={footerConfig.newsletter.title}
              >
                <p className="font-display text-[18px] font-semibold">
                  {footerConfig.newsletter.title}
                </p>
                <p className="mt-1 font-body text-[14px] text-ink-inverse-soft">
                  {footerConfig.newsletter.description}
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Correo electrónico
                  </label>
                  <Input
                    id="footer-newsletter-email"
                    type="email"
                    required
                    maxLength={255}
                    placeholder="tu@correo.com"
                    className="border-line-dark bg-night-elevated text-ink-inverse placeholder:text-ink-inverse-soft"
                  />
                  <Button type="submit" variant="premium">
                    {footerConfig.newsletter.submitLabel}
                  </Button>
                </div>
                <p
                  aria-live="polite"
                  className="mt-2 min-h-[1.25rem] font-body text-[13px] text-gold"
                >
                  {status === "success" ? "¡Gracias! Revisa tu correo." : ""}
                </p>
              </form>
            )}
          </div>

          <nav aria-label="Enlaces del pie de página">
            {/* Desktop / tablet: columnas */}
            <div className="hidden grid-cols-2 gap-8 sm:grid sm:grid-cols-4">
              {footerConfig.columns.map((col) => (
                <div key={col.id}>
                  <p className="mb-3 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-gold">
                    {col.title}
                  </p>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.routeKey}>
                        <Link
                          to={routes[link.routeKey]}
                          className="font-body text-[14px] text-ink-inverse-soft transition-colors hover:text-ink-inverse"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Móvil: acordeón */}
            <div className="sm:hidden">
              {footerConfig.columns.map((col) => {
                const isOpen = open === col.id;
                return (
                  <div key={col.id} className="border-b border-line-dark">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : col.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className="font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-gold">
                        {col.title}
                      </span>
                      <Icon
                        name="expand"
                        size="sm"
                        className={cn(
                          "text-ink-inverse-soft transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <ul className="space-y-2 pb-4">
                        {col.links.map((link) => (
                          <li key={link.routeKey}>
                            <Link
                              to={routes[link.routeKey]}
                              className="block py-1 font-body text-[14px] text-ink-inverse-soft hover:text-ink-inverse"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line-dark pt-6 sm:flex-row sm:items-center">
          <p className="font-body text-[13px] text-ink-inverse-soft">
            {footerConfig.copyright.render()}
          </p>
          <Link
            to={routes.contact}
            className="font-body text-[13px] text-ink-inverse-soft hover:text-ink-inverse"
          >
            Contacto
          </Link>
        </div>
      </Container>
    </footer>
  );
}
