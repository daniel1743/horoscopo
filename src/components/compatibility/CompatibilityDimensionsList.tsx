import { COMPATIBILITY_DIMENSIONS, COMPATIBILITY_COPY } from "@/config/compatibility";
import type {
  CompatibilityDimensions,
  CompatibilityDimensionKey,
} from "@/types/compatibility";

interface Props {
  dimensions: CompatibilityDimensions;
}

/**
 * Muestra las seis dimensiones editoriales con un indicador simbólico 1..5.
 * No es una puntuación científica ni un porcentaje.
 */
export function CompatibilityDimensionsList({ dimensions }: Props) {
  return (
    <section aria-labelledby="compat-dimensions" className="space-y-6">
      <div>
        <h2
          id="compat-dimensions"
          className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
        >
          Dimensiones editoriales
        </h2>
        <p className="mt-2 font-body text-[14px] text-ink-soft">
          {COMPATIBILITY_COPY.ratingScale}
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {COMPATIBILITY_DIMENSIONS.map((d) => {
          const value = dimensions[d.key];
          return (
            <li
              key={d.key}
              className="rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-[17px] font-semibold text-ink">
                    {d.label}
                  </h3>
                  <p className="mt-1 font-body text-[13px] text-ink-soft">{d.description}</p>
                </div>
                <RatingDots value={value?.rating ?? null} label={d.key} />
              </div>
              {value ? (
                <p className="mt-3 font-body text-[15px] leading-[1.65] text-ink">
                  {value.interpretation}
                </p>
              ) : (
                <p className="mt-3 font-body text-[13px] text-ink-soft italic">
                  Interpretación editorial en preparación.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RatingDots({
  value,
  label,
}: {
  value: number | null;
  label: CompatibilityDimensionKey;
}) {
  return (
    <div
      role="img"
      aria-label={
        value === null
          ? `Dimensión ${label} sin publicar`
          : `Indicador simbólico ${value} de 5`
      }
      className="flex shrink-0 items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden
          className={
            "h-2.5 w-2.5 rounded-full " +
            (value !== null && i <= value ? "bg-brand" : "bg-line")
          }
        />
      ))}
    </div>
  );
}
