import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IconName } from "@/config/icons";
import { Link } from "@tanstack/react-router";

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
        "relative flex h-full flex-col items-center rounded-[24px] px-5 py-5 text-center md:px-6 md:pb-7 md:pt-6",
        "border transition-all duration-300 active:scale-[0.985]",
        isEnabled
          ? "bg-parchment-elevated border-cosmic/25 shadow-elevated hover:border-cosmic/55 hover:shadow-[0_18px_48px_rgba(99,63,178,0.18)]"
          : "bg-parchment border-line-soft cursor-default",
      )}
      aria-disabled={!isEnabled ? true : undefined}
    >
      {/* Icon or Image Area */}
      <div className="mb-5 flex h-[168px] w-full shrink-0 items-center justify-center md:h-[230px]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full max-w-[210px] object-contain md:max-w-[276px] lg:max-w-[322px]"
          />
        ) : icon ? (
          <Icon name={icon} className="h-24 w-24 sm:h-32 sm:w-32 text-cosmic/40" />
        ) : null}
      </div>

      {/* Text Content */}
      <h3 className={cn("font-display text-[22px] mb-3", isEnabled ? "text-ink" : "text-ink-soft")}>
        {title}
      </h3>
      <p className="mb-6 flex-grow font-body text-[15px] leading-[1.6] text-ink-soft">
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
          <Button
            variant="outline"
            className="min-h-[48px] w-full pointer-events-none"
            disabled
          >
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );

  if (isEnabled && href) {
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link
          to={href}
          aria-label={`Comenzar tirada de ${title}`}
          className="block h-full w-full rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-cosmic focus-visible:ring-offset-2"
        >
          {content}
        </Link>
      );
    }
    return (
      <a
        href={href}
        aria-label={`Comenzar tirada de ${title}`}
        className="block h-full w-full rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-cosmic focus-visible:ring-offset-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return <div className="h-full">{content}</div>;
}
