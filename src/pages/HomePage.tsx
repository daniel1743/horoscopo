import * as React from "react";
import { homeConfig, type HomeSectionId } from "@/config/home";
import { HomeHero } from "@/components/home/HomeHero";
import { PremiumValueSection } from "@/components/home/PremiumValueSection";
import { ZodiacSelector } from "@/components/home/ZodiacSelector";
import { DailyInsightSection } from "@/components/home/DailyInsightSection";
import { MoonTodaySection } from "@/components/home/MoonTodaySection";
import { CompatibilitySection } from "@/components/home/CompatibilitySection";
import { FeaturedGuidesSection } from "@/components/home/FeaturedGuidesSection";
import { ExploreTopicsSection } from "@/components/home/ExploreTopicsSection";
import { PersonalSpaceSection } from "@/components/home/PersonalSpaceSection";
import { HomeNewsletterSection } from "@/components/home/HomeNewsletterSection";

/**
 * HomePage: solo composición. El orden y la activación provienen de home.config.
 */
const registry: Record<HomeSectionId, React.ComponentType> = {
  hero: HomeHero,
  premium_value: PremiumValueSection,
  zodiac_selector: ZodiacSelector,
  daily_insight: DailyInsightSection,
  moon_today: MoonTodaySection,
  compatibility: CompatibilitySection,
  featured_guides: FeaturedGuidesSection,
  topics: ExploreTopicsSection,
  personal_space: PersonalSpaceSection,
  newsletter: HomeNewsletterSection,
};

export function HomePage() {
  return (
    <>
      {homeConfig.sectionOrder
        .filter((id) => homeConfig.enabled[id])
        .map((id) => {
          const Section = registry[id];
          return <Section key={id} />;
        })}
    </>
  );
}
