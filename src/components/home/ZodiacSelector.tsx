import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { zodiacRoute } from "@/config/routes";
import { zodiacSigns } from "@/data/zodiac-signs";
import { useSelectedSign } from "./useSelectedSign";

/** Selector visual de los doce signos: grid en desktop, scroll horizontal en móvil. */
export function ZodiacSelector() {
  const { zodiacSelector } = homeConfig;
  const { slug: selected, setSlug } = useSelectedSign();

  return (
    <Section tone="ivory" aria-labelledby="zodiac-selector-title">
      <Container>
        <SectionHeading
          eyebrow="Zodíaco"
          title={zodiacSelector.title}
          description={zodiacSelector.description}
          align="center"
          className="mx-auto max-w-[62ch] [&>h2]:mx-auto"
        />
        <h2 id="zodiac-selector-title" className="sr-only">
          {zodiacSelector.title}
        </h2>

        {/* Móvil: carrusel horizontal con scroll-snap */}
        <ul
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden"
          role="list"
        >
          {zodiacSigns.map((s) => (
            <li key={s.id} className="snap-start shrink-0" style={{ width: 118 }}>
              <ZodiacTile
                sign={s}
                selected={s.slug === selected}
                onSelect={() => setSlug(s.slug)}
              />
            </li>
          ))}
        </ul>

        {/* Tablet/Desktop: grid */}
        <ul className="hidden grid-cols-4 gap-4 sm:grid lg:grid-cols-6" role="list">
          {zodiacSigns.map((s) => (
            <li key={s.id}>
              <ZodiacTile
                sign={s}
                selected={s.slug === selected}
                onSelect={() => setSlug(s.slug)}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

interface TileProps {
  sign: (typeof zodiacSigns)[number];
  selected: boolean;
  onSelect: () => void;
}

function ZodiacTile({ sign, selected, onSelect }: TileProps) {
  return (
    <a
      href={zodiacRoute(sign.slug)}
      onClick={onSelect}
      aria-label={`Ver horóscopo de ${sign.name}`}
      aria-current={selected ? "true" : undefined}
      className={`flex h-full min-h-[132px] flex-col items-center justify-center rounded-[var(--radius-card)] border p-4 text-center transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ivory ${
        selected
          ? "border-brand bg-brand-soft text-brand"
          : "border-line-subtle bg-warm-white text-ink hover:-translate-y-[2px] hover:shadow-[var(--shadow-card)]"
      }`}
    >
      <span
        className={`font-display text-[30px] leading-none ${selected ? "text-brand" : "text-brand"}`}
        aria-hidden
      >
        {sign.symbol}
      </span>
      <span className="mt-2 font-display text-[15px] font-semibold">{sign.name}</span>
      {homeConfig.zodiacSelector.showDates && (
        <span
          className={`mt-1 font-body text-[11px] ${selected ? "text-brand/80" : "text-ink-muted"}`}
        >
          {sign.dateRange}
        </span>
      )}
    </a>
  );
}
