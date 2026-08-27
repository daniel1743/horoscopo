import { MOON_SCIENCE_COPY } from "@/config/moon-science";
import { Card } from "@/components/ui/card";

/** Bloque de datos científicos neutros. Reutilizable en /luna, /luna/hoy y fases. */
export function MoonScientificFacts() {
  const items = Object.values(MOON_SCIENCE_COPY.definitions);
  return (
    <section aria-labelledby="moon-science-heading" className="mt-12">
      <h2
        id="moon-science-heading"
        className="font-display text-[24px] font-semibold text-ink md:text-[28px]"
      >
        Datos y definiciones
      </h2>
      <p className="mt-2 max-w-[65ch] font-body text-[15px] text-ink-soft">
        {MOON_SCIENCE_COPY.distinction.text}
      </p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.title}>
            <Card className="p-5">
              <h3 className="font-display text-[17px] text-ink">{item.title}</h3>
              <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">{item.text}</p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
