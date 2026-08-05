import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturedReadingCardProps {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  status: "enabled" | "coming_soon" | "hidden";
  badge: string;
  href?: string;
  ctaLabel: string;
}

export function FeaturedReadingCard({
  title,
  description,
  icon,
  status,
  badge,
  href,
  ctaLabel,
}: FeaturedReadingCardProps) {
  const isEnabled = status === "enabled";

  const content = (
    <div
      className={cn(
        "relative flex h-full flex-col items-center text-center p-8 rounded-[24px]",
        "border transition-all duration-500",
        isEnabled
          ? "bg-parchment-elevated border-cosmic/25 shadow-elevated hover:border-cosmic/55 hover:shadow-[0_18px_48px_rgba(99,63,178,0.18)]"
          : "bg-parchment border-line-soft cursor-default",
      )}
    >
      {/* Badge */}
      <div
        className={cn(
          "absolute -top-3 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest",
          isEnabled
            ? "bg-cosmic text-white shadow-[0_0_18px_rgba(99,63,178,0.35)]"
            : "bg-parchment-elevated text-ink-soft border border-line-soft",
        )}
      >
        {badge}
      </div>

      {/* Icon Area */}
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full mb-6 mt-2",
          isEnabled
            ? "bg-cosmic/10 text-cosmic border border-cosmic/25 shadow-[0_10px_28px_rgba(99,63,178,0.12)]"
            : "bg-parchment-elevated text-ink-soft border border-line-soft",
        )}
      >
        <Icon name={icon} className="h-8 w-8" />
      </div>

      {/* Text Content */}
      <h3 className={cn("font-display text-[22px] mb-3", isEnabled ? "text-ink" : "text-ink-soft")}>
        {title}
      </h3>
      <p className="font-body text-[15px] leading-[1.6] text-ink-soft mb-8 flex-grow">
        {description}
      </p>

      {/* Action */}
      <div className="mt-auto w-full">
        {isEnabled ? (
          <Button variant="primary" className="w-full group">
            {ctaLabel}
            <Icon
              name="arrow-right"
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </Button>
        ) : (
          <Button variant="outline" className="w-full pointer-events-none" tabIndex={-1}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );

  if (isEnabled && href) {
    return (
      <a
        href={href}
        className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-cosmic rounded-[24px]"
      >
        {content}
      </a>
    );
  }

  return <div className="h-full">{content}</div>;
}
