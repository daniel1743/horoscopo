import { useLoaderData, Link } from "@tanstack/react-router";
import { Route } from "@/routes/_authenticated/mi-espacio.lecturas-lunares.$id";
import { PageShell } from "@/components/layout/PageShell";
import { Icon } from "@/components/ui/icon";

const ZODIAC_NAMES: Record<string, string> = {
  aries: "Aries",
  taurus: "Tauro",
  gemini: "Géminis",
  cancer: "Cáncer",
  leo: "Leo",
  virgo: "Virgo",
  libra: "Libra",
  scorpio: "Escorpio",
  sagittarius: "Sagitario",
  capricorn: "Capricornio",
  aquarius: "Acuario",
  pisces: "Piscis",
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: "Conjunción",
  sextile: "Sextil",
  square: "Cuadratura",
  trine: "Trígono",
  opposition: "Oposición",
  none: "Sin aspecto mayor exacto",
};

export function SavedLunarReadingDetailPage() {
  const reading = useLoaderData({ from: Route.id });

  const subtitleDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(reading.source_date + "T12:00:00Z"));

  const moonSign = ZODIAC_NAMES[reading.current_moon_sign] || reading.current_moon_sign;
  const natalSign = ZODIAC_NAMES[reading.natal_moon_sign] || reading.natal_moon_sign;
  const aspectLabel = ASPECT_LABELS[reading.aspect_type] || reading.aspect_type;

  // Extraemos el "enfoque" si existe (lo habíamos guardado en interpretation si no se pasó focus_text,
  // pero podemos intentar sacarlo del final como antes si queremos que se vea igual).
  // Para ser fieles a la UI original, si focus_text no está, extraemos el último párrafo.
  let interpretation = reading.interpretation;
  let conclusion = reading.focus_text;

  if (!conclusion) {
    const paragraphs = interpretation.split("\n").filter((p) => p.trim() !== "");
    if (paragraphs.length > 1) {
      conclusion = paragraphs.pop() || null;
      interpretation = paragraphs.join("\n\n");
    }
  }

  return (
    <PageShell>
      <div className="mb-6 flex items-center gap-2 text-[14px] text-ink-soft">
        <Link
          to="/mi-espacio/lecturas-lunares"
          className="hover:text-brand hover:underline flex items-center gap-1"
        >
          <Icon name="arrowLeft" className="w-4 h-4" />
          Volver a Mis lecturas
        </Link>
      </div>

      <div className="mx-auto max-w-2xl rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[24px] font-semibold text-brand">Tu Lectura Lunar</h2>
            <p className="text-[13px] text-ink-muted mt-1 capitalize">
              Luna de hoy &middot; {moonSign} &middot; {subtitleDate}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[13px] text-ink-muted shrink-0 bg-line-subtle/50 px-2 py-1 rounded-md">
            <Icon name="favorite" className="w-3 h-3" /> Guardada
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-ivory p-4 text-[14px] border border-line-subtle">
          <div>
            <p className="text-ink-muted">Tu Luna natal</p>
            <p className="font-semibold text-ink capitalize">{natalSign}</p>
          </div>
          <div>
            <p className="text-ink-muted">Luna de hoy</p>
            <p className="font-semibold text-ink capitalize">{moonSign}</p>
          </div>
          <div>
            <p className="text-ink-muted">Relación de hoy</p>
            <p className="font-semibold text-ink capitalize">{aspectLabel}</p>
          </div>
        </div>

        {reading.uncertainty_message && (
          <div className="mt-3 rounded-md bg-warm-white p-3 border border-dashed border-line flex items-start gap-2">
            <Icon name="alertCircle" className="w-4 h-4 mt-0.5 shrink-0 text-ink-soft" />
            <p className="text-[12px] text-ink-soft leading-[1.5]">
              <strong className="font-medium text-ink">Hora de nacimiento no confirmada</strong>{" "}
              &middot;{" "}
              {reading.uncertainty_message.replace("Hora de nacimiento no confirmada · ", "")}
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="font-body text-[16px] leading-[1.7] text-ink whitespace-pre-wrap">
            {interpretation}
          </p>
          {conclusion && (
            <div className="mt-6 rounded-xl bg-brand/5 p-5 border border-brand/10">
              <h3 className="text-[15px] font-semibold text-brand mb-2">Tu enfoque de hoy</h3>
              <p className="font-body text-[15px] leading-[1.6] text-ink">{conclusion}</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
