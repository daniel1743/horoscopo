import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  path: string;
}

export function ShareBar({ title, path }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* fallback */
      }
    }
    handleCopy();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" size="sm" onClick={handleShare}>
        <Icon name="share" size="sm" aria-hidden />
        Compartir
      </Button>
      <Button variant="ghost" size="sm" onClick={handleCopy} aria-live="polite">
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </Button>
    </div>
  );
}
