import { homeConfig } from "@/config/home";
import { FeaturedReadingCard } from "./FeaturedReadingCard";
import { Icon } from "@/components/ui/icon";

export function FeaturedReadingsSection() {
  const config = homeConfig.featuredTarot;

  return (
    <section
      className="relative overflow-hidden py-14 scroll-mt-28 md:py-20"
      aria-labelledby="featured-tarot-title"
    >
      {/* Fondo místico y decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cosmic/5 via-transparent to-transparent pointer-events-none" />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 relative z-10">
        <div className="mb-9 flex flex-col items-center text-center md:mb-12">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic mb-4">
            {config.eyebrow}
          </p>
          <h2
            id="featured-tarot-title"
            className="max-w-xl scroll-mt-28 font-display text-[30px] leading-[1.12] text-ink sm:text-[40px]"
          >
            {config.title}
          </h2>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {config.items
            .filter((item) => item.status !== "hidden")
            .map((item) => (
              <div key={item.slug} className="flex-1 w-full max-w-md mx-auto md:max-w-none">
                <FeaturedReadingCard
                  slug={item.slug}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  status={item.status}
                  href={item.href}
                  ctaLabel={item.ctaLabel}
                />
              </div>
            ))}
        </div>

        {/* Acción secundaria */}
        <div className="mt-10 flex justify-center md:mt-12">
          <a
            href={config.action.href}
            className="group inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] border border-cosmic/40 bg-transparent px-5 font-body text-[14px] font-semibold text-cosmic transition-colors hover:bg-cosmic/10"
          >
            {config.action.label}
            <Icon
              name="arrow-right"
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
