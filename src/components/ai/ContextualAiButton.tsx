import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AssistantChat } from "./AssistantChat";
import type { AiModuleMode, AiRequestContext } from "@/types/ai";

interface Props {
  mode: AiModuleMode;
  label: string;
  context?: AiRequestContext;
}

/**
 * Botón contextual que revela el chat del asistente aplicado a un contenido
 * específico (una tirada, un horóscopo, un artículo).
 */
export function ContextualAiButton({ mode, label, context }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6">
      {!open ? (
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          <Icon name="premium" /> {label}
        </Button>
      ) : (
        <div className="rounded-[var(--radius-card-lg)] border border-cosmic/30 bg-parchment-elevated p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-[18px] text-ink">{label}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="rounded-full p-1 text-ink-soft hover:bg-parchment"
            >
              <Icon name="close" />
            </button>
          </div>
          <AssistantChat mode={mode} context={context} compact />
        </div>
      )}
    </div>
  );
}
