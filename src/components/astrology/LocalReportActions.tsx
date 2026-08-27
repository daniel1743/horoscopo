import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  content: string;
  filename: string;
  label?: string;
}

export function LocalReportActions({ content, filename, label = "Informe local" }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(content);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  function downloadReport() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus("idle");
  }

  return (
    <section
      aria-labelledby="local-report-actions-title"
      className="mt-6 rounded-2xl border border-line/70 bg-background p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            id="local-report-actions-title"
            className="font-body text-[13px] font-semibold text-ink"
          >
            {label}
          </h3>
          <p className="mt-1 font-body text-[12px] leading-5 text-ink-soft">
            Se genera en este dispositivo. No se guarda en Creovision ni se envía a la IA.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={copyReport}>
            Copiar texto
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={downloadReport}>
            Descargar .txt
          </Button>
        </div>
      </div>
      <p className="mt-3 min-h-5 font-body text-[12px] text-ink-muted" aria-live="polite">
        {status === "copied"
          ? "Informe copiado al portapapeles."
          : status === "error"
            ? "No fue posible copiarlo; puedes descargar el archivo de texto."
            : "El informe incluye los límites del cálculo."}
      </p>
    </section>
  );
}
