import { useId, useState } from "react";
import { tarotQuestionLimits } from "@/config/tarot";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TarotQuestionInput({
  value,
  onChange,
  label = "Tu pregunta (opcional)",
  placeholder = "Escribe una pregunta abierta (opcional)",
  hint = "La pregunta no se guarda ni se envía a ningún servicio.",
  error,
  required,
  disabled,
}: Props) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const remaining = tarotQuestionLimits.maxCharacters - value.length;
  const tooLong = remaining < 0;
  const hasError = Boolean(error) || (tooLong && touched);
  const descriptionId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-body text-[13px] font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        maxLength={tarotQuestionLimits.maxCharacters + 40}
        rows={3}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
        className={cn(
          "min-h-[88px] w-full rounded-[var(--radius-card-md)] border border-line-soft bg-parchment-elevated p-3 font-body text-[15px] text-ink outline-none transition-colors",
          "focus-visible:border-cosmic focus-visible:ring-2 focus-visible:ring-cosmic/25",
          hasError && "border-error focus-visible:ring-error/25",
        )}
      />
      <div className="flex items-center justify-between font-body text-[12px] text-ink-soft">
        <span id={descriptionId}>{hint}</span>
        <span className={tooLong ? "text-error" : undefined}>{remaining}</span>
      </div>
      {error && (
        <p id={errorId} role="alert" className="font-body text-[12px] text-error">
          {error}
        </p>
      )}
    </div>
  );
}
