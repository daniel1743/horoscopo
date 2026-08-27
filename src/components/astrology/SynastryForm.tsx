import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDegree } from "@/services/astrology.service";
import { calculateSynastry } from "@/services/synastry.service";
import type { BirthData } from "@/types/astrology";
import type { SynastrySnapshot } from "@/types/synastry";
import { LocalReportActions } from "@/components/astrology/LocalReportActions";
import { buildSynastryReport } from "@/lib/astrology/report";
import { SynastryNarrativePanel } from "@/components/astrology/SynastryNarrativePanel";
import { buildSynastryNarrative } from "@/services/astrology-relationship.service";

interface PersonFormState {
  birthDate: string;
  birthTime: string;
  timezone: string;
  latitude: string;
  longitude: string;
  locationLabel: string;
}

const emptyPerson: PersonFormState = {
  birthDate: "",
  birthTime: "",
  timezone: "UTC",
  latitude: "",
  longitude: "",
  locationLabel: "",
};

function toNumber(value: string, field: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Introduce una ${field} válida.`);
  return parsed;
}

function toBirthData(person: PersonFormState, label: string): BirthData {
  if (!person.birthTime) throw new Error(`${label}: la hora de nacimiento es necesaria.`);
  return {
    birthDate: person.birthDate,
    birthTime: person.birthTime,
    timezone: person.timezone.trim(),
    latitude: toNumber(person.latitude, `latitud de ${label.toLocaleLowerCase()}`),
    longitude: toNumber(person.longitude, `longitud de ${label.toLocaleLowerCase()}`),
    locationLabel: person.locationLabel.trim() || undefined,
  };
}

function PersonFields({
  label,
  person,
  onChange,
}: {
  label: string;
  person: PersonFormState;
  onChange: (next: PersonFormState) => void;
}) {
  const update = <K extends keyof PersonFormState>(key: K, value: PersonFormState[K]) => {
    onChange({ ...person, [key]: value });
  };
  const inputClass =
    "h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20";
  return (
    <fieldset className="grid gap-4 rounded-2xl border border-line/70 bg-background p-5">
      <legend className="px-1 font-display text-[20px] text-ink">{label}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
          Fecha de nacimiento
          <input
            className={inputClass}
            type="date"
            value={person.birthDate}
            onChange={(event) => update("birthDate", event.target.value)}
            required
          />
        </label>
        <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
          Hora de nacimiento
          <input
            className={inputClass}
            type="time"
            value={person.birthTime}
            onChange={(event) => update("birthTime", event.target.value)}
            required
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
          Zona horaria IANA
          <input
            className={inputClass}
            type="text"
            value={person.timezone}
            onChange={(event) => update("timezone", event.target.value)}
            placeholder="America/Bogota"
            required
          />
        </label>
        <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
          Lugar de referencia (opcional)
          <input
            className={inputClass}
            type="text"
            value={person.locationLabel}
            onChange={(event) => update("locationLabel", event.target.value)}
            placeholder="Bogotá, Colombia"
            maxLength={80}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
          Latitud
          <input
            className={inputClass}
            type="number"
            min={-90}
            max={90}
            step="any"
            inputMode="decimal"
            value={person.latitude}
            onChange={(event) => update("latitude", event.target.value)}
            placeholder="4.7110"
            required
          />
        </label>
        <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
          Longitud
          <input
            className={inputClass}
            type="number"
            min={-180}
            max={180}
            step="any"
            inputMode="decimal"
            value={person.longitude}
            onChange={(event) => update("longitude", event.target.value)}
            placeholder="-74.0721"
            required
          />
        </label>
      </div>
    </fieldset>
  );
}

function SynastryResult({ snapshot }: { snapshot: SynastrySnapshot }) {
  const narrative = buildSynastryNarrative(snapshot);
  return (
    <section
      aria-labelledby="synastry-result-heading"
      className="mt-8 rounded-[24px] border border-line bg-warm-white p-5 md:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-cosmic">
            Comparación local
          </p>
          <h2 id="synastry-result-heading" className="mt-2 font-display text-[25px] text-ink">
            Aspectos entre ambas cartas
          </h2>
        </div>
        <span className="rounded-full bg-ivory px-3 py-1 text-xs text-ink-soft">
          {snapshot.aspects.length} contactos
        </span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { label: "Persona A", chart: snapshot.first },
          { label: "Persona B", chart: snapshot.second },
        ].map(({ label, chart }) => (
          <div key={label} className="rounded-2xl border border-line/70 bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              {label}
            </p>
            <p className="mt-2 font-display text-[19px] text-ink">
              Sol:{" "}
              {chart.placements.find((placement) => placement.body === "Sun")?.sign.label ??
                "Calculado"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Ascendente: {chart.ascendant.sign.symbol} {chart.ascendant.sign.label}
            </p>
          </div>
        ))}
      </div>
      {snapshot.aspects.length > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {snapshot.aspects.slice(0, 16).map((aspect) => (
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
        <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-ink-soft">
          No hay aspectos mayores dentro de los orbes configurados para estas cartas.
        </p>
      )}
      <SynastryNarrativePanel narrative={narrative} />
      <details className="mt-6 rounded-2xl border border-cosmic/15 bg-cosmic/5 p-4">
        <summary className="cursor-pointer font-body text-[13px] font-semibold text-cosmic">
          Privacidad, método y límites
        </summary>
        <ul className="mt-2 space-y-1 pl-5 font-body text-[12px] leading-5 text-ink-soft">
          {snapshot.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </details>
      <LocalReportActions
        content={buildSynastryReport(snapshot)}
        filename="creovision-sinastria.txt"
        label="Informe local de sinastría"
      />
    </section>
  );
}

export function SynastryForm() {
  const [first, setFirst] = useState<PersonFormState>(emptyPerson);
  const [second, setSecond] = useState<PersonFormState>(emptyPerson);
  const [snapshot, setSnapshot] = useState<SynastrySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      setSnapshot(
        calculateSynastry(toBirthData(first, "Persona A"), toBirthData(second, "Persona B")),
      );
    } catch (cause) {
      setSnapshot(null);
      setError(cause instanceof Error ? cause.message : "No fue posible comparar las cartas.");
    }
  }

  return (
    <>
      <section className="rounded-[24px] border border-line bg-background p-5 shadow-[0_18px_60px_rgba(31,25,53,0.06)] md:p-7">
        <div className="mb-6">
          <h2 className="font-display text-[24px] text-ink">Compara dos cartas</h2>
          <p className="mt-2 max-w-[70ch] text-[14px] leading-6 text-ink-soft">
            Introduce los datos de ambas personas para calcular aspectos cruzados en este
            dispositivo. No se guardan perfiles de terceros ni se publica ningún dato.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <PersonFields label="Persona A" person={first} onChange={setFirst} />
          <PersonFields label="Persona B" person={second} onChange={setSecond} />
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="primary">
              Calcular sinastría
            </Button>
            <p className="max-w-[54ch] text-[12px] leading-5 text-ink-soft">
              La información permanece en memoria mientras mantienes abierta esta página.
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
      {snapshot && <SynastryResult snapshot={snapshot} />}
    </>
  );
}
