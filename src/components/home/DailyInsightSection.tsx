import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { DailyHoroscopeCard } from "./DailyHoroscopeCard";
import { DailyTarotCard } from "./DailyTarotCard";
import { useSelectedSign } from "./useSelectedSign";

/** Sección "Lectura de hoy": horóscopo + tarot. */
export function DailyInsightSection() {
  const { dailyInsight } = homeConfig;
  const { sign, setSlug } = useSelectedSign();
  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <Section aria-labelledby="daily-insight-title" className="bg-brand-soft">
      <Container>
        <SectionHeading
          eyebrow={dailyInsight.eyebrow}
          title={dailyInsight.title}
          description={dailyInsight.description}
        />
        <h2 id="daily-insight-title" className="sr-only">
          {dailyInsight.title}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 md:gap-6 lg:gap-8">
          <DailyHoroscopeCard sign={sign} onChangeSign={setSlug} todayLabel={todayLabel} />
          <DailyTarotCard />
        </div>
      </Container>
    </Section>
  );
}
