import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { ThreeCardExperienceState } from "./types";

interface ThreeCardReadingActionsProps {
  state: ThreeCardExperienceState;
  onShuffle: () => void;
  onReveal: () => void;
  onReset: () => void;
  onAskReading?: () => void;
  disabled?: boolean;
}

export function ThreeCardReadingActions({
  state,
  onShuffle,
  onReveal,
  onReset,
  onAskReading,
  disabled,
}: ThreeCardReadingActionsProps) {
  if (state === "preparing") {
    return (
      <Button
        type="button"
        variant="primary"
        onClick={onShuffle}
        disabled={disabled}
        className="w-full sm:w-auto"
      >
        <Icon name="premium" />
        Barajar cartas
      </Button>
    );
  }

  if (state === "selected") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button
          type="button"
          variant="primary"
          onClick={onReveal}
          disabled={disabled}
          className="w-full sm:w-auto"
        >
          <Icon name="sparkles" />
          Revelar mi lectura
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onShuffle}
          disabled={disabled}
          className="w-full sm:w-auto"
        >
          Cambiar selección
        </Button>
      </div>
    );
  }

  if (state === "completed") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        {onAskReading && (
          <Button
            type="button"
            variant="primary"
            onClick={onAskReading}
            className="w-full sm:w-auto"
          >
            <Icon name="message" />
            Preguntar sobre esta lectura
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onReset} className="w-full sm:w-auto">
          Realizar otra lectura
        </Button>
      </div>
    );
  }

  return null;
}
