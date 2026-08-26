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
import { routes } from "@/config/routes";
import { compatibilityRoute } from "@/lib/compatibility/route-helpers";
import type { ZodiacSignKey } from "@/types/compatibility";

interface Props {
  signA: ZodiacSignKey;
  signB: ZodiacSignKey;
}

export function CompatibilityPairPage({ signA, signB }: Props) {
  const { data } = useSuspenseQuery(compatibilityQueries.pair(signA, signB));
  const { normalized, signA: metaA, signB: metaB, profile, alternativePairs } = data;

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

          {profile.isFallback && (
            <p className="rounded-[var(--radius-control)] bg-ivory px-4 py-3 font-body text-[12px] text-ink-muted">
              Perfil editorial de respaldo. La interpretación publicada se mostrará aquí cuando esté
              disponible.
            </p>
          )}

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

          <CompatibilityContextsList contexts={profile.contexts} />

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

      {alternativePairs.length > 0 && (
        <section aria-labelledby="compat-alt" className="mt-14">
          <h2
            id="compat-alt"
            className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
          >
            Otras combinaciones relacionadas
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alternativePairs.map((p) => (
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
