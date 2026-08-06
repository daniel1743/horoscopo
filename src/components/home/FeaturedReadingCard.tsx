import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturedReadingCardProps {
  slug: string;
  title: string;
  description: string;
  icon?: IconName;
  image?: string;
  status: "enabled" | "coming_soon" | "hidden";
  href?: string;
  ctaLabel: string;
}

export function FeaturedReadingCard({
  title,
  description,
  icon,
  image,
  status,
  href,
  ctaLabel,
}: FeaturedReadingCardProps) {
  const isEnabled = status === "enabled";

  const content = (
    <div
      className={cn(
        "relative flex h-full flex-col items-center text-center px-5 py-6 md:px-6 md:pb-8 md:pt-6 rounded-[24px]",
        "border transition-all duration-500",
        isEnabled
          ? "bg-parchment-elevated border-cosmic/25 shadow-elevated hover:border-cosmic/55 hover:shadow-[0_18px_48px_rgba(99,63,178,0.18)]"
          : "bg-parchment border-line-soft cursor-default",
      )}
    >
      {/* Icon or Image Area */}
      <div className="flex h-[200px] md:h-[250px] w-full items-center justify-center mb-6 shrink-0">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full max-w-[210px] md:max-w-[276px] lg:max-w-[322px] object-contain"
          />
        ) : icon ? (
          <Icon name={icon} className="h-24 w-24 sm:h-32 sm:w-32 text-cosmic/40" />
        ) : null}
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
          <Button variant="primary" className="min-h-[48px] w-full group">
            {ctaLabel}
            <Icon
              name="arrow-right"
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </Button>
        ) : (
          <Button variant="outline" className="min-h-[48px] w-full pointer-events-none" tabIndex={-1}>
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
        aria-label={`Comenzar tirada de ${title}`}
        className="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-cosmic rounded-[24px]"
      >
        {content}
      </a>
    );
  }

  return <div className="h-full">{content}</div>;
}
