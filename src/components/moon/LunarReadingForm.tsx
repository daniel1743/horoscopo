"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getPersonalLunarReading, saveLunarReadingFn } from "@/lib/moon/moon.functions";
import type { LunarReadingResult } from "@/server/moon/moon-reading-orchestrator";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function LunarReadingForm() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");

  const { mutate, isPending, data, error } = useMutation({
    mutationFn: async () => {
      // Offset local del usuario (en horas)
      const offset = new Date().getTimezoneOffset() / 60;
      return getPersonalLunarReading({
        data: {
          birthDate,
          birthTime: birthTime || undefined,
          timezoneOffset: -offset,
        },
      });
    },
    onError: (err) => {
      console.error("Mutation error from server function:", err);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  if (data) {
    return <LunarReadingDisplay result={data} onReset={() => setBirthDate("")} />;
  }

  return (
    <div className="mx-auto max-w-md rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 shadow-sm">
      <h2 className="font-display text-[24px] font-semibold text-ink">
        Tu Luna de Hoy
      </h2>
      <p className="mt-2 text-[15px] text-ink-soft">
        Descubre cómo la fase lunar actual interactúa con tu luna natal.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-medium text-ink">Fecha de nacimiento</span>
          <input
            type="date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="h-10 rounded-md border border-line px-3 outline-none focus-visible:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-medium text-ink">Hora de nacimiento (Opcional)</span>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="h-10 rounded-md border border-line px-3 outline-none focus-visible:border-brand"
          />
          <span className="text-[12px] text-ink-muted">Si no la sabes, déjala en blanco.</span>
        </label>

        <Button type="submit" disabled={isPending || !birthDate} className="mt-2 w-full">
          {isPending ? "Calculando..." : "Descubrir mi luna hoy"}
        </Button>
        {error && (
          <div className="text-[14px] text-error">
            <p>Ocurrió un error al calcular la lectura.</p>
            <pre className="mt-2 text-xs opacity-70 whitespace-pre-wrap">{error.message}</pre>
          </div>
        )}
      </form>
    </div>
  );
}

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
  pisces: "Piscis"
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: "Conjunción",
  sextile: "Sextil",
  square: "Cuadratura",
  trine: "Trígono",
  opposition: "Oposición",
  none: "Sin aspecto mayor exacto",
};

function LunarReadingDisplay({ result, onReset }: { result: LunarReadingResult, onReset: () => void }) {
  const { natal, aspect, reading, currentPhase, currentSign } = result;
  const { user } = useSession();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const todayIso = new Date().toISOString().split("T")[0];
      return saveLunarReadingFn({
        data: {
          title: "Lectura Lunar",
          sourceDate: todayIso,
          natalMoonSign: natal.moon.sign,
          currentMoonSign: currentSign,
          aspectName: aspect.name,
          aspectType: aspect.type,
          birthTimeKnown: natal.confidence !== "dual",
          uncertaintyMessage: natal.confidence === "dual" 
            ? `Tu Luna natal podría variar entre ${ZODIAC_NAMES[natal.moon.sign] || natal.moon.sign} y ${ZODIAC_NAMES[natal.alternativeSign || ""] || natal.alternativeSign}.` 
            : undefined,
          interpretation: reading.reading,
          focusText: undefined, // Se podría extraer pero lo tenemos en render. Lo guardamos todo en interpretation.
        }
      });
    },
    onSuccess: () => {
      setSaved(true);
    },
    onError: (err) => {
      // Si el error es duplicado, simplemente marcamos como guardado.
      if (err.message.includes("duplicate key")) {
        setSaved(true);
      }
    }
  });

  const handleSave = () => {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/luna/tu-luna-de-hoy" } as any });
      return;
    }
    saveMutation.mutate();
  };
  
  const todayFormatted = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(new Date());
  
  const paragraphs = reading.reading.split('\n').filter(p => p.trim() !== '');
  const conclusion = paragraphs.length > 1 ? paragraphs.pop() : null;
  const interpretation = paragraphs.join('\n\n');

  return (
    <div className="mx-auto max-w-2xl rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[24px] font-semibold text-brand">Tu Lectura Lunar</h2>
          <p className="text-[13px] text-ink-muted mt-1 capitalize">
            Luna de hoy &middot; {ZODIAC_NAMES[currentSign] || currentSign} &middot; {todayFormatted}
          </p>
        </div>
        <button onClick={onReset} className="text-[14px] text-ink-soft hover:text-brand underline shrink-0">
          Hacer otra lectura
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-ivory p-4 text-[14px] border border-line-subtle">
        <div>
          <p className="text-ink-muted">Tu Luna natal</p>
          <p className="font-semibold text-ink capitalize">{ZODIAC_NAMES[natal.moon.sign] || natal.moon.sign}</p>
        </div>
        <div>
          <p className="text-ink-muted">Luna de hoy</p>
          <p className="font-semibold text-ink capitalize">{ZODIAC_NAMES[currentSign] || currentSign}</p>
        </div>
        <div>
          <p className="text-ink-muted">Relación de hoy</p>
          <p className="font-semibold text-ink capitalize">{ASPECT_LABELS[aspect.type] || aspect.type}</p>
        </div>
      </div>
      
      {natal.confidence === "dual" && (
        <div className="mt-3 rounded-md bg-warm-white p-3 border border-dashed border-line flex items-start gap-2">
          <Icon name="alertCircle" className="w-4 h-4 mt-0.5 shrink-0 text-ink-soft" />
          <p className="text-[12px] text-ink-soft leading-[1.5]">
            <strong className="font-medium text-ink">Hora de nacimiento no confirmada</strong> &middot; Tu Luna natal podría variar entre {ZODIAC_NAMES[natal.moon.sign] || natal.moon.sign} y {ZODIAC_NAMES[natal.alternativeSign || ""] || natal.alternativeSign}.
          </p>
        </div>
      )}

      <div className="mt-6">
        <p className="font-body text-[16px] leading-[1.7] text-ink whitespace-pre-wrap">
          {interpretation || reading.reading}
        </p>
        {conclusion && (
          <div className="mt-6 rounded-xl bg-brand/5 p-5 border border-brand/10">
            <h3 className="text-[15px] font-semibold text-brand mb-2">Tu enfoque de hoy</h3>
            <p className="font-body text-[15px] leading-[1.6] text-ink">
              {conclusion}
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            disabled={saved || saveMutation.isPending}
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            {saved ? (
              <>
                <Icon name="check" className="mr-2 h-4 w-4" />
                Guardada en Mis lecturas
              </>
            ) : saveMutation.isPending ? (
              "Guardando..."
            ) : (
              <>
                <Icon name="favorite" className="mr-2 h-4 w-4" />
                Guardar en mis lecturas
              </>
            )}
          </Button>
        </div>
      </div>

      {reading.isFallback && (
        <div className="mt-6 rounded-md bg-warm-white p-3 border border-dashed border-line text-center text-[12px] text-ink-soft">
          Lectura generada con el modelo base (IA no disponible).
        </div>
      )}
    </div>
  );
}
