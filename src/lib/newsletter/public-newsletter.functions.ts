import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  PublicNewsletterResult,
  PublicNewsletterProvider,
  PublicNewsletterSubscribeInput,
  PublicNewsletterUnsubscribeInput,
} from "./public-newsletter.types";

const SubscribeInput = z.object({
  email: z.string().trim().email("Introduce un correo electrónico válido.").max(255),
  consent: z.literal(true, { error: "Necesitamos tu consentimiento para continuar." }),
  source: z.string().trim().max(80).optional(),
});

const UnsubscribeInput = z.object({
  token: z.string().trim().max(512),
});

const NOT_CONFIGURED: PublicNewsletterResult = {
  state: "backend_not_configured",
  message:
    "La suscripción pública todavía no está conectada. No se guardó tu correo ni se envió ningún mensaje.",
};

const INVALID_TOKEN: PublicNewsletterResult = {
  state: "invalid_token",
  message:
    "El enlace de baja está vacío o no es válido. Solicita un enlace nuevo cuando el newsletter esté activo.",
};

/**
 * Punto de extensión para un proveedor futuro. Se mantiene null hasta que se
 * configure infraestructura, tabla y credenciales de forma explícita.
 */
async function getConfiguredProvider(): Promise<PublicNewsletterProvider | null> {
  return null;
}

export async function subscribePublicNewsletter(
  input: PublicNewsletterSubscribeInput,
): Promise<PublicNewsletterResult> {
  const provider = await getConfiguredProvider();
  if (!provider) return NOT_CONFIGURED;
  return provider.subscribe(input);
}

export async function unsubscribePublicNewsletter(
  input: PublicNewsletterUnsubscribeInput,
): Promise<PublicNewsletterResult> {
  if (!input.token.trim()) return INVALID_TOKEN;
  const provider = await getConfiguredProvider();
  if (!provider) {
    return {
      state: "backend_not_configured",
      message:
        "La baja pública todavía no está conectada porque no hay un proveedor configurado. No se modificó ninguna suscripción.",
    };
  }
  return provider.unsubscribe(input);
}

export const subscribeToPublicNewsletter = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => SubscribeInput.parse(raw))
  .handler(async ({ data }) => subscribePublicNewsletter(data));

export const unsubscribeFromPublicNewsletter = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => UnsubscribeInput.parse(raw))
  .handler(async ({ data }) => unsubscribePublicNewsletter(data));
