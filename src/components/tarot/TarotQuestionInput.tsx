import { useId, useState } from "react";
import { tarotQuestionLimits } from "@/config/tarot";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}

export function TarotQuestionInput({
  value,
  onChange,
  placeholder = "Escribe una pregunta abierta (opcional)",
  hint = "La pregunta no se guarda ni se envía a ningún servicio.",
  disabled,
}: Props) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const remaining = tarotQuestionLimits.maxCharacters - value.length;
  const tooLong = remaining < 0;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-body text-[13px] font-medium text-ink">
        Tu pregunta (opcional)
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
        className={cn(
          "min-h-[88px] w-full rounded-[var(--radius-card-md)] border border-line-soft bg-parchment-elevated p-3 font-body text-[15px] text-ink outline-none transition-colors",
          "focus-visible:border-cosmic focus-visible:ring-2 focus-visible:ring-cosmic/25",
          tooLong && touched && "border-error focus-visible:ring-error/25",
        )}
        aria-describedby={`${id}-hint`}
      />
      <div className="flex items-center justify-between font-body text-[12px] text-ink-soft">
        <span id={`${id}-hint`}>{hint}</span>
        <span className={tooLong ? "text-error" : undefined}>{remaining}</span>
      </div>
    </div>
  );
}
