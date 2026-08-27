import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDegree } from "@/services/astrology.service";
import { calculateTransitSnapshot } from "@/services/transits.service";
import type { BirthData } from "@/types/astrology";
import type { TransitSnapshot } from "@/types/transits";
import { LocalReportActions } from "@/components/astrology/LocalReportActions";
import { buildTransitReport } from "@/lib/astrology/report";

function toNumber(value: string, field: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Introduce una ${field} válida.`);
  return parsed;
}

function TransitResult({ snapshot }: { snapshot: TransitSnapshot }) {
  const targetDate = new Date(snapshot.targetDateIso).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
  return (
    <section
      aria-labelledby="transit-result-heading"
      className="mt-8 rounded-[24px] border border-line bg-warm-white p-5 md:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-cosmic">
            Cálculo local
          </p>
          <h2 id="transit-result-heading" className="mt-2 font-display text-[25px] text-ink">
            Tránsitos del {targetDate}
          </h2>
        </div>
        <span className="rounded-full bg-ivory px-3 py-1 text-xs text-ink-soft">
          {snapshot.aspects.length} aspectos con tu carta
        </span>
      </div>

      <section aria-labelledby="transit-positions-title" className="mt-6">
        <h3 id="transit-positions-title" className="font-display text-[20px] text-ink">
          Posiciones actuales
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.transits.map((transit) => (
            <div
              key={transit.body}
              className="rounded-xl border border-line/70 bg-background px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-body text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                  {transit.label}
                </p>
                {transit.isRetrograde && (
                  <span className="rounded-full bg-accent-astral-rose/10 px-2 py-0.5 text-[10px] font-medium text-ink">
                    Retrógrado
                  </span>
                )}
              </div>
              <p className="mt-1 font-display text-[18px] text-ink">
                {transit.sign.symbol} {transit.sign.label}
              </p>
              <p className="font-body text-[12px] text-ink-soft">
                {formatDegree(transit.degreeInSign)} · {transit.speedDegreesPerDay.toFixed(2)}°/día
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="transit-aspects-title" className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="transit-aspects-title" className="font-display text-[20px] text-ink">
            Contactos con tu carta natal
          </h3>
          <span className="text-xs text-ink-muted">Orbes fijos</span>
        </div>
        {snapshot.aspects.length > 0 ? (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {snapshot.aspects.slice(0, 12).map((aspect) => (
              <li
                key={`${aspect.firstBody}-${aspect.secondBody}-${aspect.key}`}
                className="rounded-xl border border-line/70 bg-background px-4 py-3"
              >
                <p className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-cosmic">
                  {aspect.label}
                </p>
                <p className="mt-1 font-display text-[17px] text-ink">
                  {aspect.firstLabel} · {aspect.secondLabel}
                </p>
                <p className="font-body text-[12px] text-ink-soft">
                  Separación {aspect.separation.toFixed(1)}° · orbe {aspect.orb.toFixed(1)}°
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-ink-soft">
            No hay aspectos mayores dentro de los orbes configurados para la fecha elegida.
          </p>
        )}
        {snapshot.aspects.length > 12 && (
          <p className="mt-3 text-xs text-ink-muted">
            Se muestran los 12 contactos con orbe más cerrado de {snapshot.aspects.length}.
          </p>
        )}
      </section>

      <details className="mt-6 rounded-2xl border border-cosmic/15 bg-cosmic/5 p-4">
        <summary className="cursor-pointer font-body text-[13px] font-semibold text-cosmic">
          Método y límites
        </summary>
        <ul className="mt-2 space-y-1 pl-5 font-body text-[12px] leading-5 text-ink-soft">
          {snapshot.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </details>
      <LocalReportActions
        content={buildTransitReport(snapshot)}
        filename="creovision-transitos.txt"
        label="Informe local de tránsitos"
      />
    </section>
  );
}

export function TransitForm() {
  const [timezone, setTimezone] = useState("UTC");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [snapshot, setSnapshot] = useState<TransitSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detectedTimezone) setTimezone(detectedTimezone);
    setTargetDate(new Date().toISOString().slice(0, 10));
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const birth: BirthData = {
        birthDate,
        birthTime: birthTime || undefined,
        timezone: timezone.trim(),
        latitude: toNumber(latitude, "latitud"),
        longitude: toNumber(longitude, "longitud"),
        locationLabel: locationLabel.trim() || undefined,
      };
      if (!birthTime) throw new Error("Los tránsitos necesitan una hora de nacimiento.");
      if (!targetDate) throw new Error("Selecciona una fecha para consultar los tránsitos.");
      const date = new Date(`${targetDate}T12:00:00`);
      setSnapshot(calculateTransitSnapshot({ birth, targetDate: date }));
    } catch (cause) {
      setSnapshot(null);
      setError(cause instanceof Error ? cause.message : "No fue posible calcular los tránsitos.");
    }
  }

  return (
    <>
      <section className="rounded-[24px] border border-line bg-background p-5 shadow-[0_18px_60px_rgba(31,25,53,0.06)] md:p-7">
        <div className="mb-6">
          <h2 className="font-display text-[24px] text-ink">Consulta una fecha</h2>
          <p className="mt-2 max-w-[70ch] text-[14px] leading-6 text-ink-soft">
            Introduce los mismos datos privados de tu carta natal y elige el día que quieres
            observar. El cálculo se realiza en este dispositivo y no guarda la consulta.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
            Fecha de tránsitos
            <input
              className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              required
            />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Fecha de nacimiento
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                required
              />
            </label>
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Hora de nacimiento
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                type="time"
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
                required
              />
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Zona horaria IANA
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                type="text"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="America/Bogota"
                required
              />
            </label>
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Lugar de referencia (opcional)
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                type="text"
                value={locationLabel}
                onChange={(event) => setLocationLabel(event.target.value)}
                placeholder="Bogotá, Colombia"
                maxLength={80}
              />
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Latitud
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                type="number"
                min={-90}
                max={90}
                step="any"
                inputMode="decimal"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="4.7110"
                required
              />
            </label>
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Longitud
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                type="number"
                min={-180}
                max={180}
                step="any"
                inputMode="decimal"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="-74.0721"
                required
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="primary">
              Calcular tránsitos
            </Button>
            <p className="max-w-[54ch] text-[12px] leading-5 text-ink-soft">
              Se usan tus datos para este cálculo en memoria; no se envían a Supabase ni a un
              servicio externo.
            </p>
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-accent-astral-rose/30 bg-accent-astral-rose/10 px-4 py-3 text-[13px] text-ink"
            >
              {error}
            </p>
          )}
        </form>
      </section>
      {snapshot && <TransitResult snapshot={snapshot} />}
    </>
  );
}
