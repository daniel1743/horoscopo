export type NewsletterSubscriptionState =
  | "pending"
  | "confirmed"
  | "already_subscribed"
  | "unsubscribed"
  | "already_unsubscribed"
  | "invalid_token"
  | "backend_not_configured"
  | "backend_unavailable"
  | "error";

export interface PublicNewsletterSubscribeInput {
  email: string;
  consent: boolean;
  source?: string;
}

export interface PublicNewsletterUnsubscribeInput {
  token: string;
}

export interface PublicNewsletterResult {
  state: NewsletterSubscriptionState;
  message: string;
}

/** Contrato para el proveedor futuro; no hay proveedor conectado en esta fase. */
export interface PublicNewsletterProvider {
  subscribe(input: PublicNewsletterSubscribeInput): Promise<PublicNewsletterResult>;
  unsubscribe(input: PublicNewsletterUnsubscribeInput): Promise<PublicNewsletterResult>;
}
