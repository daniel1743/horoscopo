import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { Icon } from "@/components/ui/icon";
import { homeConfig } from "@/config/home";
import { homeTopics } from "@/data/home-content";

/** Exploración por intención — enlaza a guías temáticas. */
export function ExploreTopicsSection() {
  const { topics: cfg } = homeConfig;
  const items = homeTopics.slice(0, cfg.maxItems);

  return (
    <Section aria-labelledby="topics-title">
      <Container>
        <SectionHeading eyebrow={cfg.eyebrow} title={cfg.title} description={cfg.description} />
        <h2 id="topics-title" className="sr-only">
          {cfg.title}
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
          {items.map((t) => (
            <li key={t.id}>
              <a
                href={t.href}
                className="group flex h-full items-start gap-4 rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-5 transition-all outline-none hover:-translate-y-[2px] hover:border-brand/40 hover:shadow-[var(--shadow-card)] focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon name={t.icon} size="md" />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-[17px] font-semibold text-ink group-hover:text-brand">
                    {t.title}
                  </span>
                  <span className="mt-1 block font-body text-[14px] leading-[1.55] text-ink-soft">
                    {t.description}
                  </span>
                </span>
                <Icon
                  name="chevronRight"
                  className="mt-2 text-ink-muted transition-transform group-hover:translate-x-[2px] group-hover:text-brand"
                />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
