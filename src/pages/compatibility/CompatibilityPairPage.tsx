import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CompatibilityDimensionsList } from "@/components/compatibility/CompatibilityDimensionsList";
import { CompatibilityContextsList } from "@/components/compatibility/CompatibilityContextsList";
import { CompatibilityPairSelector } from "@/components/compatibility/CompatibilityPairSelector";
import { compatibilityQueries } from "@/services/compatibility.service";
import { COMPATIBILITY_COPY } from "@/config/compatibility";
import { routes, zodiacRoute } from "@/config/routes";
import { filterIndexableAlternativePairs } from "@/config/compatibility-internal-links";
import { compatibilityRoute } from "@/lib/compatibility/route-helpers";
import type { ZodiacSignKey } from "@/types/compatibility";
import { NextBestAction } from "@/components/layout/NextBestAction";
import type { NBAActionId } from "@/config/next-best-actions.config";

const GEMINI_SAGITTARIUS_PAIR_KEY = "geminis__sagitario";

const GEMINI_SAGITTARIUS_EDITORIAL_COPY = {
  answerHeading: "¿Géminis y Sagitario son compatibles?",
  answerText:
    "Sí, pueden tener una compatibilidad alta cuando la libertad, la conversación y el movimiento tienen espacio. Géminis aporta agilidad mental y Sagitario amplitud de visión; el desafío aparece cuando ambos evitan sostener conversaciones emocionales o compromisos cotidianos.",
  loveHeading: "Géminis y Sagitario en el amor",
  loveText:
    "En pareja, esta combinación suele sentirse ligera, curiosa y estimulante. La atracción crece cuando hay conversación, planes nuevos y permiso para cambiar de ritmo. Para que no quede solo en entusiasmo, necesitan acuerdos concretos: qué se promete, qué se sostiene y cómo se habla cuando algo incomoda.",
  longTermHeading: "Vida cotidiana y largo plazo",
  longTermText:
    "El punto delicado no suele ser la falta de interés, sino la continuidad. Si cada plan cambia demasiado, la relación puede perder suelo. Les ayuda convertir la libertad en acuerdos simples: fechas, tareas, límites y tiempos para hablar sin escapar hacia otra idea.",
} as const;

interface Props {
  signA: ZodiacSignKey;
  signB: ZodiacSignKey;
}

export function CompatibilityPairPage({ signA, signB }: Props) {
  const { data } = useSuspenseQuery(compatibilityQueries.pair(signA, signB));
  const { normalized, signA: metaA, signB: metaB, profile, alternativePairs } = data;
  const isGeminiSagittarius = normalized.pair_key === GEMINI_SAGITTARIUS_PAIR_KEY;
  const safeAlternativePairs = filterIndexableAlternativePairs(alternativePairs);

  const headerTitle = profile?.title ?? `${metaA.name} y ${metaB.name}`;
  const headerDescription =
    profile?.summary ??
    `Aún estamos preparando la interpretación editorial completa de ${metaA.name} y ${metaB.name}.`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Compatibilidad", href: routes.compatibility },
        { label: `${metaA.name} + ${metaB.name}` },
      ]}
    >
      <PageHeader
        eyebrow={
          profile?.dynamicLabel ?? `${metaA.symbol} ${metaA.name} · ${metaB.symbol} ${metaB.name}`
        }
        title={headerTitle}
        description={headerDescription}
      />

      {profile ? (
        <div className="mt-2 space-y-12">
          {isGeminiSagittarius && (
            <GeminiSagittariusEditorialBlock
              heading={GEMINI_SAGITTARIUS_EDITORIAL_COPY.answerHeading}
              body={GEMINI_SAGITTARIUS_EDITORIAL_COPY.answerText}
              variant="answer"
            />
          )}

          <section className="grid gap-4 rounded-[var(--radius-card-lg)] border border-brand/10 bg-brand/5 p-5 md:grid-cols-3 md:p-6">
            <QuickReadItem label="Energía" value={profile.dynamicLabel ?? "Dinámica simbólica"} />
            <QuickReadItem
              label="Potencial"
              value={profile.strengths[0] ?? "Reconocer afinidades sin forzar acuerdos."}
            />
            <QuickReadItem
              label="Cuida"
              value={profile.challenges[0] ?? "No convertir las diferencias en etiquetas fijas."}
            />
          </section>

          <section
            aria-labelledby="compat-dynamic"
            className="rounded-[var(--radius-card-lg)] border border-line-subtle bg-warm-white p-6 md:p-8"
          >
            <h2 id="compat-dynamic" className="sr-only">
              Dinámica entre signos
            </h2>
            <p className="font-body text-[17px] leading-[1.7] text-ink">
              {profile.relationshipDynamic}
            </p>
          </section>

          <CompatibilityDimensionsList dimensions={profile.dimensions} />

          {profile.strengths.length + profile.challenges.length > 0 && (
            <section className="grid gap-6 md:grid-cols-2">
              <TwoColumnList
                title="Puntos de encuentro"
                items={profile.strengths}
                emptyLabel="En preparación."
              />
              <TwoColumnList
                title="Puntos a integrar"
                items={profile.challenges}
                emptyLabel="En preparación."
              />
            </section>
          )}

          {isGeminiSagittarius && (
            <GeminiSagittariusEditorialBlock
              heading={GEMINI_SAGITTARIUS_EDITORIAL_COPY.longTermHeading}
              body={GEMINI_SAGITTARIUS_EDITORIAL_COPY.longTermText}
            />
          )}

          {profile.communicationTips.length > 0 && (
            <section aria-labelledby="compat-tips" className="space-y-4">
              <h2
                id="compat-tips"
                className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
              >
                Sugerencias de comunicación
              </h2>
              <ul className="grid gap-3">
                {profile.communicationTips.map((tip) => (
                  <li
                    key={tip}
                    className="rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-4 font-body text-[15px] text-ink"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isGeminiSagittarius && (
            <GeminiSagittariusEditorialBlock
              heading={GEMINI_SAGITTARIUS_EDITORIAL_COPY.loveHeading}
              body={GEMINI_SAGITTARIUS_EDITORIAL_COPY.loveText}
            />
          )}

          <CompatibilityContextsList contexts={profile.contexts} />

          <section
            aria-labelledby="compat-sign-horoscopes"
            className="rounded-[var(--radius-card)] border border-line-subtle bg-ivory p-5"
          >
            <h2
              id="compat-sign-horoscopes"
              className="font-display text-[20px] font-semibold text-ink"
            >
              También puedes mirar cada signo por separado
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to={zodiacRoute(normalized.sign_a) as string}
                className="inline-flex rounded-[var(--radius-control)] border border-line-subtle bg-warm-white px-4 py-2 font-body text-[14px] font-medium text-ink transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,75,217,0.18)]"
              >
                Horóscopo de {metaA.name}
              </Link>
              <Link
                to={zodiacRoute(normalized.sign_b) as string}
                className="inline-flex rounded-[var(--radius-control)] border border-line-subtle bg-warm-white px-4 py-2 font-body text-[14px] font-medium text-ink transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,75,217,0.18)]"
              >
                Horóscopo de {metaB.name}
              </Link>
            </div>
          </section>

          {profile.reflectionQuestions.length > 0 && (
            <section aria-labelledby="compat-reflection" className="space-y-3">
              <h2
                id="compat-reflection"
                className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
              >
                Preguntas para reflexionar
              </h2>
              <ul className="space-y-2">
                {profile.reflectionQuestions.map((q) => (
                  <li
                    key={q}
                    className="rounded-[var(--radius-card)] border border-line-subtle bg-ivory p-4 font-body text-[15px] italic text-ink"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.misconceptions.length > 0 && (
            <section aria-labelledby="compat-mis" className="space-y-3">
              <h2
                id="compat-mis"
                className="font-display text-[20px] md:text-[22px] font-semibold text-ink"
              >
                Qué no debería asumirse
              </h2>
              <ul className="list-disc space-y-2 pl-5 font-body text-[15px] text-ink-soft">
                {profile.misconceptions.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <EmptyProfileState />
      )}

      <NextBestAction
        context={{
          source: "compatibility",
        }}
        onAction={(actionId: NBAActionId) => {
          if (actionId === "another_combination") {
            document.getElementById("compat-try")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      <section aria-labelledby="compat-try" className="mt-14 space-y-6">
        <h2
          id="compat-try"
          className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
        >
          Prueba otra combinación
        </h2>
        <div className="rounded-[var(--radius-card-lg)] border border-line-subtle bg-warm-white p-6 md:p-8">
          <CompatibilityPairSelector
            defaultFirst={normalized.sign_a}
            defaultSecond={normalized.sign_b}
          />
        </div>
      </section>

      {safeAlternativePairs.length > 0 && (
        <section aria-labelledby="compat-alt" className="mt-14">
          <h2
            id="compat-alt"
            className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
          >
            Otras combinaciones relacionadas
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {safeAlternativePairs.map((p) => (
              <li key={p.id}>
                <Link
                  to={compatibilityRoute(p.signA, p.signB)}
                  className="block rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-5 transition hover:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,75,217,0.18)]"
                >
                  <h3 className="font-display text-[17px] font-semibold text-ink">{p.title}</h3>
                  <p className="mt-2 font-body text-[14px] text-ink-soft">{p.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}

function GeminiSagittariusEditorialBlock({
  heading,
  body,
  variant = "default",
}: {
  heading: string;
  body: string;
  variant?: "answer" | "default";
}) {
  const sectionClass =
    variant === "answer"
      ? "rounded-[var(--radius-card-lg)] border border-brand/15 bg-brand/5 p-5 md:p-7"
      : "space-y-3 border-l-2 border-brand/30 pl-4 md:pl-5";

  return (
    <section aria-labelledby={slugifyHeading(heading)} className={sectionClass}>
      <h2
        id={slugifyHeading(heading)}
        className="font-display text-[22px] font-semibold text-ink md:text-[26px]"
      >
        {heading}
      </h2>
      <p className="mt-3 max-w-[68ch] font-body text-[16px] leading-[1.7] text-ink-soft md:text-[17px]">
        {body}
      </p>
    </section>
  );
}

function slugifyHeading(heading: string) {
  return `compat-${heading
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function QuickReadItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
        {label}
      </p>
      <p className="mt-2 font-body text-[15px] leading-[1.55] text-ink">{value}</p>
    </div>
  );
}

function TwoColumnList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-5">
      <h3 className="font-display text-[18px] font-semibold text-ink">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 font-body text-[13px] italic text-ink-soft">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-2 font-body text-[15px] text-ink">
          {items.map((s) => (
            <li key={s} className="flex gap-2">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyProfileState() {
  return (
    <section className="mt-2 rounded-[var(--radius-card-lg)] border border-line-subtle bg-warm-white p-8 text-center">
      <h2 className="font-display text-[22px] font-semibold text-ink">
        {COMPATIBILITY_COPY.empty.title}
      </h2>
      <p className="mx-auto mt-3 max-w-[52ch] font-body text-[15px] text-ink-soft">
        {COMPATIBILITY_COPY.empty.description}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to={routes.compatibility}>{COMPATIBILITY_COPY.empty.primaryLabel}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to={routes.guides}>{COMPATIBILITY_COPY.empty.secondaryLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
