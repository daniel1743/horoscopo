import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompatibilityPairSelector } from "@/components/compatibility/CompatibilityPairSelector";
import { COMPATIBILITY_COPY } from "@/config/compatibility";
import { compatibilityQueries } from "@/services/compatibility.service";
import { getZodiacBySlug } from "@/data/zodiac-signs";
import { compatibilityRoute } from "@/lib/compatibility/route-helpers";

/** Hub de compatibilidad: intro editorial + selector + parejas publicadas. */
export function CompatibilityHubPage() {
  const { data: featured } = useSuspenseQuery(compatibilityQueries.featured(6));

  return (
    <PageShell breadcrumbs={[{ label: "Compatibilidad" }]}>
      <PageHeader
        eyebrow={COMPATIBILITY_COPY.hubEyebrow}
        title={COMPATIBILITY_COPY.hubTitle}
        description={COMPATIBILITY_COPY.hubDescription}
      />

      <div className="mt-2 rounded-[var(--radius-card-lg)] border border-line-subtle bg-warm-white p-6 md:p-8">
        <CompatibilityPairSelector />
        <p className="mt-4 text-center font-body text-[13px] text-ink-soft">
          {COMPATIBILITY_COPY.disclaimer}
        </p>
      </div>

      <section aria-labelledby="compat-guide" className="mt-14">
        <h2
          id="compat-guide"
          className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
        >
          {COMPATIBILITY_COPY.interpretationGuide.title}
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {COMPATIBILITY_COPY.interpretationGuide.points.map((p) => (
            <li
              key={p}
              className="rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-4 font-body text-[15px] text-ink"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="compat-featured" className="mt-14">
          <h2
            id="compat-featured"
            className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
          >
            Combinaciones publicadas
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => {
              const a = getZodiacBySlug(p.signA);
              const b = getZodiacBySlug(p.signB);
              return (
                <li key={p.id}>
                  <Link
                    to={compatibilityRoute(p.signA, p.signB)}
                    className="block rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-5 transition hover:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,75,217,0.18)]"
                  >
                    <p className="font-body text-[12px] uppercase tracking-[0.14em] text-brand">
                      {a?.symbol} + {b?.symbol}
                    </p>
                    <h3 className="mt-2 font-display text-[18px] font-semibold text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
                      {p.summary}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
