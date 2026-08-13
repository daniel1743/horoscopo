import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getNextBestAction } from "@/config/next-best-actions.config";
import type { NBAContext, NBAActionId } from "@/config/next-best-actions.config";
import { getPersonalizationContext } from "@/lib/account/personalization-context";
import { useSession } from "@/hooks/useSession";

interface NextBestActionProps {
  context: NBAContext;
  onAction?: (actionId: NBAActionId) => void;
  className?: string;
}

const SOURCES_WITH_PERSONALIZATION = new Set<NBAContext["source"]>([
  "tarot_daily",
  "tarot_three_cards",
  "tarot_yes_no",
  "horoscope",
  "compatibility",
]);

export function NextBestAction({ context, onAction, className = "" }: NextBestActionProps) {
  const { user } = useSession();
  const shouldLoadPersonalization = SOURCES_WITH_PERSONALIZATION.has(context.source);
  const personalizationQuery = useQuery({
    queryKey: ["personalization-context", context.source, user?.id ?? "anon"],
    queryFn: getPersonalizationContext,
    enabled: shouldLoadPersonalization,
    staleTime: 60_000,
    retry: false,
  });
  const result = getNextBestAction({
    ...context,
    personalization: personalizationQuery.data?.enabled ? personalizationQuery.data : null,
  });

  if (!result.primary && !result.secondary && !result.tertiary) {
    return null;
  }

  const handleActionClick = (actionId?: NBAActionId) => {
    // Aquí iría el evento de analíticas: trackEvent("next_action_click", { actionId, source: context.source })
    if (actionId && onAction) {
      onAction(actionId);
    }
  };

  return (
    <section
      aria-label="Sugerencias para continuar"
      className={`mt-10 rounded-[var(--radius-card-lg)] border border-cosmic/20 bg-cosmic/5 p-6 text-center md:p-8 ${className}`}
    >
      {result.title && (
        <h2 className="font-display text-[20px] font-semibold text-ink md:text-[22px]">
          {result.title}
        </h2>
      )}
      {result.description && (
        <p className="mx-auto mt-2 max-w-[42ch] font-body text-[15px] text-ink-soft">
          {result.description}
        </p>
      )}

      <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
        {result.primary &&
          (result.primary.href ? (
            <Button asChild size="lg" variant="primary" className="w-full sm:w-auto">
              <Link
                to={result.primary.href as string}
                onClick={() => handleActionClick(result.primary?.actionId)}
              >
                {result.primary.icon && (
                  <Icon name={result.primary.icon} className="mr-2 h-4 w-4" />
                )}
                {result.primary.label}
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => handleActionClick(result.primary?.actionId)}
            >
              {result.primary.icon && <Icon name={result.primary.icon} className="mr-2 h-4 w-4" />}
              {result.primary.label}
            </Button>
          ))}

        {result.secondary &&
          (result.secondary.href ? (
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link
                to={result.secondary.href as string}
                onClick={() => handleActionClick(result.secondary?.actionId)}
              >
                {result.secondary.icon && (
                  <Icon name={result.secondary.icon} className="mr-2 h-4 w-4" />
                )}
                {result.secondary.label}
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleActionClick(result.secondary?.actionId)}
            >
              {result.secondary.icon && (
                <Icon name={result.secondary.icon} className="mr-2 h-4 w-4" />
              )}
              {result.secondary.label}
            </Button>
          ))}
      </div>

      {result.tertiary && (
        <div className="mt-6">
          {result.tertiary.href ? (
            <Link
              to={result.tertiary.href as string}
              onClick={() => handleActionClick(result.tertiary?.actionId)}
              className="font-body text-[14px] font-medium text-ink-soft hover:text-ink hover:underline"
            >
              {result.tertiary.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => handleActionClick(result.tertiary?.actionId)}
              className="font-body text-[14px] font-medium text-ink-soft hover:text-ink hover:underline"
            >
              {result.tertiary.label}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
