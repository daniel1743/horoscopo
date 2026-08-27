import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeToPublicNewsletter } from "@/lib/newsletter/public-newsletter.functions";
import type {
  PublicNewsletterResult,
  PublicNewsletterSubscribeInput,
} from "@/lib/newsletter/public-newsletter.types";

export type PublicNewsletterUiState = "idle" | "loading" | PublicNewsletterResult["state"];

export function usePublicNewsletterSubscription() {
  const submitPublicSubscription = useServerFn(subscribeToPublicNewsletter);
  const [state, setState] = useState<PublicNewsletterUiState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = useCallback(
    async (input: PublicNewsletterSubscribeInput): Promise<PublicNewsletterResult> => {
      if (busy) {
        return {
          state: "error",
          message: "La solicitud anterior todavía está en curso.",
        };
      }

      setBusy(true);
      setState("loading");
      setMessage(null);
      try {
        const result = await submitPublicSubscription({ data: input });
        setState(result.state);
        setMessage(result.message);
        return result;
      } catch {
        const result: PublicNewsletterResult = {
          state: "backend_unavailable",
          message:
            "No pudimos contactar el servicio de suscripción. No se confirmó ni se guardó ningún correo.",
        };
        setState(result.state);
        setMessage(result.message);
        return result;
      } finally {
        setBusy(false);
      }
    },
    [busy, submitPublicSubscription],
  );

  return { state, message, busy, submit };
}
