"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { getPersonalLunarReading, saveLunarReadingFn } from "@/lib/moon/moon.functions";
import type { LunarReadingResult } from "@/server/moon/moon-reading-orchestrator";
import { useSession } from "@/hooks/useSession";
import { fetchProfile, PENDING_LUNAR_READING_SAVE_KEY } from "@/lib/account/repository";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import { toast } from "sonner";
import { NextBestAction } from "@/components/layout/NextBestAction";
import type { NBAActionId } from "@/config/next-best-actions.config";

export function LunarReadingForm() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [useCustomData, setUseCustomData] = useState(false);

  const { user, loading: sessionLoading } = useSession();

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["natal-profile-moon", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });

  const isLoading = sessionLoading || (user && isProfileLoading);
  const hasSavedData = Boolean(profile?.birth_date) && !isProfileError;
  const showCompactState = hasSavedData && !useCustomData;

  const { mutate, isPending, data, error } = useMutation({
    mutationFn: async () => {
      const offset = new Date().getTimezoneOffset() / 60;

      const finalDate = showCompactState ? (profile?.birth_date as string) : birthDate;
      const finalTime = showCompactState
        ? profile?.birth_time || undefined
        : birthTime || undefined;

      if (!finalDate) throw new Error("Fecha de nacimiento es requerida");

      return getPersonalLunarReading({
        data: {
          birthDate: finalDate,
          birthTime: finalTime,
          timezoneOffset: -offset,
        },
      });
    },
    onError: (err) => {
      console.error("Mutation error from server function:", err);
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    mutate();
  };

  const handleReset = () => {
    // Cuando el usuario hace click en "Hacer otra lectura"
    setUseCustomData(true);
    setBirthDate("");
    setBirthTime("");
  };

  if (data) {
    return <LunarReadingDisplay result={data} onReset={handleReset} />;
  }

  return (
    <div className="mx-auto max-w-md rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 shadow-sm">
      <h2 className="font-display text-[24px] font-semibold text-ink">Tu Luna de Hoy</h2>
      <p className="mt-2 text-[15px] text-ink-soft">
        Descubre cómo la fase lunar actual interactúa con tu luna natal.
      </p>

      {isLoading ? (
        <div className="mt-6 flex flex-col gap-4 animate-pulse">
          <div className="h-10 bg-line/50 rounded-md"></div>
          <div className="h-10 bg-line/50 rounded-md"></div>
          <div className="h-10 bg-line/50 rounded-md mt-2"></div>
        </div>
      ) : showCompactState ? (
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-md bg-brand/5 p-4 border border-brand/10">
            <p className="text-[14px] text-brand flex items-center gap-2 font-medium">
              <Icon name="check" className="w-4 h-4" />
              Usando tus datos natales guardados
            </p>
          </div>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit()}
            className="mt-2 w-full"
          >
            {isPending ? "Calculando..." : "Ver mi Luna de Hoy"}
          </Button>
          <button
            type="button"
            onClick={() => setUseCustomData(true)}
            className="text-[13px] text-ink-muted hover:text-ink underline text-center mt-1"
          >
            Usar otros datos
          </button>
          {error && (
            <div className="text-[14px] text-error mt-2">
              <p>Ocurrió un error al calcular la lectura.</p>
              <pre className="mt-2 text-xs opacity-70 whitespace-pre-wrap">{error.message}</pre>
            </div>
          )}
        </div>
      ) : (
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
      )}
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

const SIGN_INSIGHTS: Record<
  string,
  {
    keywords: string[];
    favors: string;
    care: string;
    gesture: string;
    question: string;
    ritual: string;
    phrase: string;
  }
> = {
  aries: {
    keywords: ["Impulso", "Inicio", "Valentía"],
    favors: "dar el primer paso sin esperar una certeza absoluta",
    care: "reaccionar antes de escuchar todo el contexto",
    gesture: "haz una acción pequeña que vienes postergando",
    question: "¿Qué deseo estás conteniendo por miedo a parecer demasiado directo?",
    ritual:
      "Escribe una decisión que quieres iniciar y reduce el primer paso a algo de 10 minutos.",
    phrase: "Puedo empezar sin tener todo resuelto.",
  },
  taurus: {
    keywords: ["Calma", "Cuerpo", "Constancia"],
    favors: "ordenar tus prioridades desde lo concreto",
    care: "quedarte en lo conocido solo porque se siente estable",
    gesture: "elige una tarea simple y termínala sin apuro",
    question: "¿Qué estás sosteniendo por costumbre y no por verdadero cuidado?",
    ritual: "Prepara un espacio tranquilo y anota tres cosas que hoy sí puedes cuidar.",
    phrase: "Mi calma también puede moverme.",
  },
  gemini: {
    keywords: ["Curiosidad", "Movimiento", "Conversación"],
    favors: "aprender algo nuevo o mirar una situación desde otro ángulo",
    care: "dispersarte o discutir por tener razón",
    gesture: "dedica 5 minutos a escribir una idea que llevas posponiendo",
    question: "¿Qué podrías descubrir hoy si dejaras de intentar tener la respuesta correcta?",
    ritual: "Escribe tres cosas que tienes curiosidad por aprender. No tienes que resolverlas hoy.",
    phrase: "No necesito saber el final para atreverme a explorar.",
  },
  cancer: {
    keywords: ["Cuidado", "Memoria", "Intuición"],
    favors: "escuchar una emoción antes de explicarla",
    care: "confundir protección con encerrarte",
    gesture: "haz algo amable por tu cuerpo o tu hogar",
    question: "¿Qué emoción pide cuidado y no una explicación inmediata?",
    ritual: "Anota qué necesitas recibir hoy y qué puedes darte sin esperar permiso.",
    phrase: "Puedo cuidarme sin esconderme.",
  },
  leo: {
    keywords: ["Expresión", "Corazón", "Presencia"],
    favors: "mostrar algo propio con honestidad",
    care: "buscar validación donde necesitas conexión real",
    gesture: "comparte una idea, gesto o palabra que exprese lo que sientes",
    question: "¿Qué parte de ti quiere ser vista sin tener que actuar seguridad?",
    ritual: "Frente a una nota o espejo, nombra una cualidad que hoy quieres habitar.",
    phrase: "Mi presencia no necesita exagerarse para brillar.",
  },
  virgo: {
    keywords: ["Orden", "Detalle", "Claridad"],
    favors: "simplificar algo que estaba ocupando demasiada energía",
    care: "convertir la mejora en exigencia",
    gesture: "ordena una sola cosa: una lista, un espacio o una decisión",
    question: "¿Qué se volvería más liviano si dejaras de perfeccionarlo?",
    ritual: "Elige una tarea pendiente y define su versión suficiente para hoy.",
    phrase: "Lo simple también puede ser profundo.",
  },
  libra: {
    keywords: ["Vínculo", "Belleza", "Equilibrio"],
    favors: "conversar desde el acuerdo posible",
    care: "ceder demasiado para evitar incomodar",
    gesture: "di una preferencia concreta con calma",
    question: "¿Dónde estás buscando armonía a costa de tu propia claridad?",
    ritual: "Escribe una frase que puedas decir sin justificarte de más.",
    phrase: "La armonía también incluye mi verdad.",
  },
  escorpio: {
    keywords: ["Profundidad", "Deseo", "Transformación"],
    favors: "mirar una verdad emocional sin dramatizarla",
    care: "leer entre líneas cuando podrías preguntar directamente",
    gesture: "nombra algo que sientes sin convertirlo en acusación",
    question: "¿Qué intensidad necesita comprensión y no control?",
    ritual: "Escribe lo que no quieres seguir cargando y qué límite lo protegería.",
    phrase: "Puedo sentir profundo sin perder mi centro.",
  },
  sagittarius: {
    keywords: ["Horizonte", "Sentido", "Libertad"],
    favors: "abrir perspectiva y soltar una respuesta demasiado cerrada",
    care: "escapar de una emoción buscando una explicación grande",
    gesture: "haz una pregunta honesta antes de sacar una conclusión",
    question: "¿Qué creencia sigue viva y cuál solo repites por costumbre?",
    ritual: "Anota una idea que quieres explorar y una acción pequeña para acercarte a ella.",
    phrase: "Mi libertad crece cuando también escucho.",
  },
  capricorn: {
    keywords: ["Estructura", "Responsabilidad", "Enfoque"],
    favors: "dar forma práctica a una necesidad emocional",
    care: "exigirte firmeza cuando necesitas apoyo",
    gesture: "elige una prioridad realista y protege tiempo para ella",
    question: "¿Qué responsabilidad puedes llevar con más ternura?",
    ritual: "Divide una carga en tres pasos y haz solo el primero.",
    phrase: "No tengo que endurecerme para sostenerme.",
  },
  aquarius: {
    keywords: ["Visión", "Distancia", "Originalidad"],
    favors: "pensar distinto sin desconectarte de lo que sientes",
    care: "refugiarte en la mente para no mostrar vulnerabilidad",
    gesture: "comparte una idea rara o nueva con alguien de confianza",
    question: "¿Qué emoción aparece cuando dejas de analizarlo todo?",
    ritual: "Dibuja o escribe una solución no obvia para algo que te inquieta.",
    phrase: "Mi diferencia también puede crear cercanía.",
  },
  pisces: {
    keywords: ["Intuición", "Sueño", "Compasión"],
    favors: "escuchar señales sutiles sin perder tus límites",
    care: "absorber emociones que no te corresponden",
    gesture: "regálate silencio antes de responder",
    question: "¿Qué estás sintiendo que necesita nombre y no sacrificio?",
    ritual: "Respira lento durante cinco minutos y escribe una imagen que aparezca.",
    phrase: "Puedo abrir el corazón sin diluirme.",
  },
};

function getReadingInsights(currentSign: string, aspectType: string) {
  const base = SIGN_INSIGHTS[currentSign] ?? SIGN_INSIGHTS.gemini;
  if (aspectType === "none") return base;
  return {
    ...base,
    favors: `${base.favors}, especialmente si atiendes la relación entre tu Luna natal y la Luna de hoy`,
  };
}

function LunarReadingDisplay({
  result,
  onReset,
}: {
  result: LunarReadingResult;
  onReset: () => void;
}) {
  const { natal, aspect, reading, currentPhase, currentSign } = result;
  const { user } = useSession();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const insights = getReadingInsights(currentSign, aspect.type);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const todayIso = new Date().toISOString().split("T")[0];
      return saveLunarReadingFn({
        data: {
          title: "Lectura Lunar",
          sourceDate: todayIso,
          natalMoonSign: natal.moon.sign,
          currentMoonSign: currentSign,
          aspectName: aspect.name || "Ninguno",
          aspectType: aspect.type,
          birthTimeKnown: natal.confidence !== "dual",
          uncertaintyMessage:
            natal.confidence === "dual"
              ? `Tu Luna natal podría variar entre ${ZODIAC_NAMES[natal.moon.sign] || natal.moon.sign} y ${ZODIAC_NAMES[natal.alternativeSign || ""] || natal.alternativeSign}.`
              : undefined,
          interpretation: reading.reading,
          focusText: insights.gesture,
          metadata: {
            keywords: insights.keywords,
            favors: insights.favors,
            care: insights.care,
            question: insights.question,
            ritual: insights.ritual,
            phrase: insights.phrase,
          },
        },
      });
    },
    onSuccess: () => {
      setSaved(true);
      toast.success("Lectura guardada en tus lecturas lunares.");
    },
    onError: (err) => {
      // Si el error es duplicado, simplemente marcamos como guardado.
      if (err.message.includes("duplicate key")) {
        setSaved(true);
        toast.success("Esta lectura ya estaba guardada en tus lecturas lunares.");
        return;
      }
      console.error("Error al guardar la lectura lunar:", err);
      toast.error("No pudimos guardar la lectura lunar.");
    },
  });

  const handleSave = () => {
    if (!user) {
      const todayIso = new Date().toISOString().split("T")[0];
      const pendingPayload = {
        title: "Lectura Lunar",
        sourceDate: todayIso,
        natalMoonSign: natal.moon.sign,
        currentMoonSign: currentSign,
        aspectName: aspect.name || "Ninguno",
        aspectType: aspect.type,
        birthTimeKnown: natal.confidence !== "dual",
        uncertaintyMessage:
          natal.confidence === "dual"
            ? `Tu Luna natal podría variar entre ${ZODIAC_NAMES[natal.moon.sign] || natal.moon.sign} y ${ZODIAC_NAMES[natal.alternativeSign || ""] || natal.alternativeSign}.`
            : undefined,
        interpretation: reading.reading,
        focusText: insights.gesture,
        metadata: {
          keywords: insights.keywords,
          favors: insights.favors,
          care: insights.care,
          question: insights.question,
          ritual: insights.ritual,
          phrase: insights.phrase,
        },
      };

      sessionStorage.setItem(PENDING_LUNAR_READING_SAVE_KEY, JSON.stringify(pendingPayload));
      toast.info(
        "Inicia sesión para guardar esta lectura. Conservaremos la intención de guardarla.",
      );
      navigate({ to: routes.signIn, search: { redirect: routes.savedLunarReadings } });
      return;
    }
    saveMutation.mutate();
  };

  const todayFormatted = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(
    new Date(),
  );

  const paragraphs = reading.reading.split("\n").filter((p) => p.trim() !== "");
  const conclusion = paragraphs.length > 1 ? paragraphs.pop() : null;
  const interpretation = paragraphs.join("\n\n");

  return (
    <div className="mx-auto max-w-2xl rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[24px] font-semibold text-brand">Tu Lectura Lunar</h2>
          <p className="text-[13px] text-ink-muted mt-1 capitalize">
            Luna de hoy &middot; {ZODIAC_NAMES[currentSign] || currentSign} &middot;{" "}
            {todayFormatted}
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-[14px] text-ink-soft hover:text-brand underline shrink-0"
        >
          Hacer otra lectura
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-ivory p-4 text-[14px] border border-line-subtle">
        <div>
          <p className="text-ink-muted">Tu Luna natal</p>
          <p className="font-semibold text-ink capitalize">
            {ZODIAC_NAMES[natal.moon.sign] || natal.moon.sign}
          </p>
        </div>
        <div>
          <p className="text-ink-muted">Luna de hoy</p>
          <p className="font-semibold text-ink capitalize">
            {ZODIAC_NAMES[currentSign] || currentSign}
          </p>
        </div>
        <div>
          <p className="text-ink-muted">Relación de hoy</p>
          <p className="font-semibold text-ink capitalize">
            {ASPECT_LABELS[aspect.type] || aspect.type}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-brand/10 bg-brand/5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
          Lectura rápida
        </p>
        <div className="mt-3 grid gap-3 text-[14px] text-ink sm:grid-cols-2">
          <InsightLine label="Energía" value={insights.keywords.join(" · ")} />
          <InsightLine label="Favorece" value={insights.favors} />
          <InsightLine label="Cuida" value={insights.care} />
          <InsightLine label="Hazlo hoy" value={insights.gesture} />
        </div>
      </div>

      {natal.confidence === "dual" && (
        <div className="mt-3 rounded-md bg-warm-white p-3 border border-dashed border-line flex items-start gap-2">
          <Icon name="alertCircle" className="w-4 h-4 mt-0.5 shrink-0 text-ink-soft" />
          <p className="text-[12px] text-ink-soft leading-[1.5]">
            <strong className="font-medium text-ink">Hora de nacimiento no confirmada</strong>{" "}
            &middot; Tu Luna natal podría variar entre{" "}
            {ZODIAC_NAMES[natal.moon.sign] || natal.moon.sign} y{" "}
            {ZODIAC_NAMES[natal.alternativeSign || ""] || natal.alternativeSign}.
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
            <p className="font-body text-[15px] leading-[1.6] text-ink">{conclusion}</p>
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <ReflectionBlock title="Pregunta para ti" body={insights.question} />
          <ReflectionBlock title="Tu pequeño ritual de hoy" body={insights.ritual} />
          <div className="rounded-xl border border-line-subtle bg-ivory p-5 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">
              Tu frase de hoy
            </p>
            <p className="mt-2 font-display text-[20px] leading-[1.35] text-ink">
              {insights.phrase}
            </p>
          </div>
        </div>

        <NextBestAction
          context={{ source: "moon", authenticated: !!user }}
          onAction={(actionId: NBAActionId) => {
            if (actionId === "save_reading") handleSave();
          }}
        />

        {saved && (
          <div className="mt-4 text-center">
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link to={routes.savedLunarReadings}>Ver mis lecturas lunares</Link>
            </Button>
          </div>
        )}
      </div>

      {reading.isFallback && (
        <div className="mt-6 rounded-md bg-warm-white p-3 border border-dashed border-line text-center text-[12px] text-ink-soft">
          Lectura generada con el modelo base (IA no disponible).
        </div>
      )}
    </div>
  );
}

function InsightLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1 leading-[1.5]">{value}</p>
    </div>
  );
}

function ReflectionBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl border border-line-subtle bg-warm-white p-5">
      <h3 className="text-[15px] font-semibold text-brand">{title}</h3>
      <p className="mt-2 font-body text-[15px] leading-[1.65] text-ink">{body}</p>
    </section>
  );
}
