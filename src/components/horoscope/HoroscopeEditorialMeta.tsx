import { Link } from "@tanstack/react-router";
import { routes } from "@/config/routes";

interface Props {
  updatedAt: string;
  isFallback?: boolean;
}

function formatEditorialDate(value: string) {
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "fecha pendiente";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Señales editoriales visibles para reforzar confianza y contexto de lectura. */
export function HoroscopeEditorialMeta({ updatedAt, isFallback = false }: Props) {
  return (
    <div className="mt-6 flex flex-col gap-2 border-y border-line-subtle py-4 font-body text-[12px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span className="font-medium text-ink-soft">Equipo editorial</span>
        <span aria-hidden className="mx-2 text-line-strong">
          ·
        </span>
        {isFallback ? "Lectura de respaldo" : "Revisado"} el {formatEditorialDate(updatedAt)}
      </p>
      <Link
        to={routes.method}
        className="inline-flex items-center font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        Conoce el método
        <span aria-hidden className="ml-1">
          →
        </span>
      </Link>
    </div>
  );
}
