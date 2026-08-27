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

  function printReport() {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      setStatus("error");
      return;
    }
    printWindow.document.write(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Informe local · Creovision</title>
    <style>
      :root { color-scheme: light; font-family: Georgia, serif; }
      body { margin: 0; background: #f7f1e8; color: #211c2b; }
      main { max-width: 820px; margin: 0 auto; padding: 48px 32px; }
      header { border-bottom: 1px solid #d8cdbd; margin-bottom: 28px; padding-bottom: 18px; }
      .eyebrow { color: #58437b; font: 600 11px/1.4 Arial, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
      h1 { font-size: 28px; font-weight: 500; margin: 8px 0; }
      .meta { color: #675e6f; font: 13px/1.6 Arial, sans-serif; }
      pre { white-space: pre-wrap; font: 15px/1.75 Georgia, serif; }
      @media print { body { background: white; } main { padding: 0; } }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div class="eyebrow">Informe local · Creovision</div>
        <h1>Resultado para imprimir</h1>
        <div class="meta">Generado en este dispositivo · ${new Date().toLocaleString()}</div>
      </header>
      <pre>${escapeHtml(content)}</pre>
    </main>
  </body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
          <Button type="button" size="sm" variant="outline" onClick={printReport}>
            Imprimir / guardar PDF
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
