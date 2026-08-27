import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  calculateAscendant,
  calculateLunarSign,
  calculateNatalChart,
  formatDegree,
} from "@/services/astrology.service";
import type { AscendantResult, BirthData, LunarSignResult, NatalChart } from "@/types/astrology";
import { NatalChartWheel } from "@/components/astrology/NatalChartWheel";
import { LocalReportActions } from "@/components/astrology/LocalReportActions";
import { buildNatalChartReport } from "@/lib/astrology/report";
import { NatalNarrativePanel } from "@/components/astrology/NatalNarrativePanel";
import { buildNatalNarrative } from "@/services/astrology-narrative.service";

type AstrologyMode = "natal" | "ascendant" | "moon";
type AstrologyResult = NatalChart | AscendantResult | LunarSignResult;

interface Props {
  mode: AstrologyMode;
}

const copy = {
  natal: {
    title: "Calcula tu carta natal",
    description:
      "Introduce tus datos una sola vez en este navegador. El cálculo es local y muestra posiciones, ascendente y casas iguales.",
    submit: "Calcular carta natal",
    timeRequired: true,
  },
  ascendant: {
    title: "Calcula tu ascendente",
    description:
      "El ascendente depende especialmente de la hora y el lugar. Por eso pedimos hora exacta y coordenadas, no solo ciudad.",
    submit: "Calcular ascendente",
    timeRequired: true,
  },
  moon: {
    title: "Encuentra tu signo lunar",
    description:
      "La Luna se calcula con Astronomy Engine. Si no conoces la hora, usamos las 12:00 locales y lo indicamos como aproximación.",
    submit: "Calcular signo lunar",
    timeRequired: false,
  },
} as const;

function toNumber(value: string, field: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Introduce una ${field} válida.`);
  return parsed;
}

function ResultPanel({ mode, result }: { mode: AstrologyMode; result: AstrologyResult }) {
  const meta = result.meta;
  return (
    <section
      aria-labelledby={`${mode}-result-heading`}
      className="mt-8 rounded-[24px] border border-line bg-warm-white p-5 md:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-cosmic">
            Resultado local
          </p>
          <h2 id={`${mode}-result-heading`} className="mt-2 font-display text-[25px] text-ink">
            {mode === "natal"
              ? "Tu carta natal de referencia"
              : mode === "ascendant"
                ? "Tu ascendente de referencia"
                : "Tu signo lunar de referencia"}
          </h2>
        </div>
        <span className="rounded-full bg-ivory px-3 py-1 font-body text-[12px] text-ink-soft">
          {meta.timezone}
        </span>
      </div>

      {mode === "natal" && "placements" in result && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.placements.map((placement) => (
              <div
                key={placement.body}
                className="rounded-2xl border border-line/70 bg-background p-4"
              >
                <p className="font-body text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                  {placement.label}
                </p>
                <p className="mt-2 font-display text-[19px] text-ink">
                  {placement.sign.symbol} {placement.sign.label}
                </p>
                <p className="mt-1 font-body text-[13px] text-ink-soft">
                  {formatDegree(placement.degreeInSign)} · Casa {placement.house} · longitud{" "}
                  {formatDegree(placement.longitude)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FeatureResult
              label="Ascendente"
              value={`${result.ascendant.sign.symbol} ${result.ascendant.sign.label}`}
              detail={formatDegree(result.ascendant.degreeInSign)}
            />
            <FeatureResult
              label="Casas"
              value="12 casas iguales"
              detail="Cada cúspide avanza 30° desde el ascendente."
            />
          </div>
          <section
            className="mt-6 rounded-2xl border border-cosmic/15 bg-cosmic/5 p-5"
            aria-labelledby="natal-profile-summary-title"
          >
            <h3 id="natal-profile-summary-title" className="font-display text-[20px] text-ink">
              Tu mapa principal
            </h3>
            <p className="mt-2 font-body text-[13px] leading-6 text-ink-soft">
              Un resumen descriptivo de tus once puntos de referencia. El conteo de elementos y
              modalidades sirve para observar patrones simbólicos; no es un diagnóstico ni una
              medida científica de personalidad.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Sol", placement: result.summary.bigThree.sun },
                { label: "Luna", placement: result.summary.bigThree.moon },
                { label: "Ascendente", placement: result.summary.bigThree.ascendant },
              ].map(({ label, placement }) => (
                <div
                  key={label}
                  className="rounded-xl border border-line/70 bg-background px-4 py-3"
                >
                  <p className="font-body text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                    {label}
                  </p>
                  <p className="mt-1 font-display text-[17px] text-ink">
                    {placement.sign.symbol} {placement.sign.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <DominantResult
                label="Elemento más repetido"
                value={result.summary.dominantElement.label}
                detail={`${result.summary.dominantElement.count} de 11 puntos`}
              />
              <DominantResult
                label="Modalidad más repetida"
                value={result.summary.dominantModality.label}
                detail={`${result.summary.dominantModality.count} de 11 puntos`}
              />
              <DominantResult
                label="Signo más repetido"
                value={result.summary.dominantSign.label}
                detail={`${result.summary.dominantSign.count} de 11 puntos`}
              />
            </div>
          </section>
          <NatalNarrativePanel narrative={buildNatalNarrative(result)} />
          <section className="mt-6" aria-labelledby="natal-angles-title">
            <h3 id="natal-angles-title" className="font-display text-[20px] text-ink">
              Ángulos principales
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {result.angles.map((angle) => (
                <div
                  key={angle.key}
                  className="rounded-xl border border-line/70 bg-background px-4 py-3"
                >
                  <p className="font-body text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                    {angle.label}
                  </p>
                  <p className="mt-1 font-display text-[17px] text-ink">
                    {angle.sign.symbol} {angle.sign.label}
                  </p>
                  <p className="font-body text-[12px] text-ink-soft">
                    {formatDegree(angle.degreeInSign)}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <NatalChartWheel chart={result} />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.houses.map((house) => (
              <div
                key={house.house}
                className="rounded-xl border border-line/70 bg-background px-4 py-3"
              >
                <p className="font-body text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                  Casa {house.house}
                </p>
                <p className="mt-1 font-display text-[17px] text-ink">
                  {house.sign.symbol} {house.sign.label}
                </p>
                <p className="font-body text-[12px] text-ink-soft">
                  Cúspide {formatDegree(house.degreeInSign)}
                </p>
              </div>
            ))}
          </div>
          <section className="mt-6" aria-labelledby="natal-aspects-title">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="natal-aspects-title" className="font-display text-[20px] text-ink">
                Aspectos mayores
              </h3>
              <span className="text-xs text-ink-muted">
                {result.aspects.length} {result.aspects.length === 1 ? "aspecto" : "aspectos"}
              </span>
            </div>
            {result.aspects.length > 0 ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {result.aspects.map((aspect) => (
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
                No se formaron aspectos con los orbes configurados para estos datos.
              </p>
            )}
          </section>
          <LocalReportActions
            content={buildNatalChartReport(result)}
            filename="creovision-carta-natal.txt"
            label="Informe de tu carta natal"
          />
        </>
      )}

      {mode === "ascendant" && "ascendant" in result && !("placements" in result) && (
        <FeatureResult
          label="Ascendente"
          value={`${result.ascendant.sign.symbol} ${result.ascendant.sign.label}`}
          detail={`${formatDegree(result.ascendant.degreeInSign)} · longitud ${formatDegree(result.ascendant.longitude)}`}
        />
      )}

      {mode === "moon" && "moon" in result && (
        <FeatureResult
          label="Signo lunar"
          value={`${result.moon.sign.symbol} ${result.moon.sign.label}`}
          detail={`${formatDegree(result.moon.degreeInSign)} · longitud ${formatDegree(result.moon.longitude)}`}
        />
      )}

      <div className="mt-6 rounded-2xl border border-cosmic/15 bg-cosmic/5 p-4">
        <p className="font-body text-[13px] leading-6 text-ink-soft">
          Coordenadas: {meta.latitude.toFixed(4)}, {meta.longitude.toFixed(4)}. Fecha UTC calculada:{" "}
          {meta.dateTimeIso}.
        </p>
        <p className="mt-2 font-body text-[13px] leading-6 text-ink-soft">
          Método: posiciones geocéntricas en aproximación tropical, casas iguales y aspectos mayores
          con orbes fijos. No se presenta como carta profesional ni como una afirmación científica.
        </p>
        {meta.limitations.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer font-body text-[13px] font-semibold text-cosmic">
              Ver límites del cálculo
            </summary>
            <ul className="mt-2 space-y-1 pl-5 font-body text-[12px] leading-5 text-ink-soft">
              {meta.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}

function DominantResult({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-line/70 bg-background px-4 py-3">
      <p className="font-body text-[12px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-[17px] text-ink">{value}</p>
      <p className="font-body text-[12px] text-ink-soft">{detail}</p>
    </div>
  );
}

function FeatureResult({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-background p-5">
      <p className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p className="mt-2 font-display text-[26px] text-ink">{value}</p>
      <p className="mt-1 font-body text-[13px] text-ink-soft">{detail}</p>
    </div>
  );
}

export function AstrologyBirthForm({ mode }: Props) {
  const [timezone, setTimezone] = useState("UTC");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [result, setResult] = useState<AstrologyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const content = copy[mode];

  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detectedTimezone) setTimezone(detectedTimezone);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const data: BirthData = {
        birthDate,
        birthTime: birthTime || undefined,
        timezone: timezone.trim(),
        latitude: toNumber(latitude, "latitud"),
        longitude: toNumber(longitude, "longitud"),
        locationLabel: locationLabel.trim() || undefined,
      };
      if (content.timeRequired && !birthTime) {
        throw new Error("Esta lectura necesita una hora de nacimiento.");
      }
      const nextResult =
        mode === "natal"
          ? calculateNatalChart(data)
          : mode === "ascendant"
            ? calculateAscendant(data)
            : calculateLunarSign(data);
      setResult(nextResult);
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : "No fue posible calcular esta lectura.");
    }
  }

  return (
    <>
      <section className="rounded-[24px] border border-line bg-background p-5 shadow-[0_18px_60px_rgba(31,25,53,0.06)] md:p-7">
        <div className="mb-6">
          <h2 className="font-display text-[24px] text-ink">{content.title}</h2>
          <p className="mt-2 max-w-[70ch] font-body text-[14px] leading-6 text-ink-soft">
            {content.description}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Fecha de nacimiento
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                id="birth-date"
                name="birthDate"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                required
              />
            </label>
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Hora de nacimiento {content.timeRequired ? "(necesaria)" : "(opcional)"}
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                id="birth-time"
                name="birthTime"
                type="time"
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
                required={content.timeRequired}
              />
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Zona horaria IANA
              <input
                className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none transition focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
                id="birth-timezone"
                name="timezone"
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
                id="birth-place"
                name="locationLabel"
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
                id="birth-latitude"
                name="latitude"
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
                id="birth-longitude"
                name="longitude"
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
              {content.submit}
            </Button>
            <p className="max-w-[54ch] font-body text-[12px] leading-5 text-ink-soft">
              Los datos se usan en memoria para este cálculo y no se envían a Supabase ni a un
              servicio externo.
            </p>
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-accent-astral-rose/30 bg-accent-astral-rose/10 px-4 py-3 font-body text-[13px] text-ink"
            >
              {error}
            </p>
          )}
        </form>
      </section>
      {result && <ResultPanel mode={mode} result={result} />}
    </>
  );
}
