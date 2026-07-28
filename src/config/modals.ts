/**
 * Registro de modales reutilizables.
 * Reutiliza el Dialog existente (src/components/ui/dialog.tsx) — no
 * reconstruir focus trap ni overlay.
 */

export type ModalSize = "small" | "default" | "large";

export interface ModalDef {
  id: string;
  size: ModalSize;
  title?: string;
  closeOnOverlay: boolean;
  closeOnEscape: boolean;
}

export const modalRegistry = {
  login: {
    id: "login",
    size: "small",
    title: "Iniciar sesión",
    closeOnOverlay: true,
    closeOnEscape: true,
  },
  "newsletter-success": {
    id: "newsletter-success",
    size: "small",
    title: "Suscripción confirmada",
    closeOnOverlay: true,
    closeOnEscape: true,
  },
  share: {
    id: "share",
    size: "small",
    title: "Compartir",
    closeOnOverlay: true,
    closeOnEscape: true,
  },
  confirmation: {
    id: "confirmation",
    size: "small",
    closeOnOverlay: false,
    closeOnEscape: true,
  },
} as const satisfies Record<string, ModalDef>;

export const modalSizeToClass: Record<ModalSize, string> = {
  small: "max-w-[440px]",
  default: "max-w-[600px]",
  large: "max-w-[820px]",
};

export type ModalKey = keyof typeof modalRegistry;
