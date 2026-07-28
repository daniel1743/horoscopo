import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { zodiacSigns } from "@/data/zodiac-signs";
import { COMPATIBILITY_COPY } from "@/config/compatibility";
import { formMessages } from "@/config/forms";
import { compatibilityRoute } from "@/lib/compatibility/route-helpers";
import { isZodiacSign } from "@/lib/compatibility/normalize-sign-pair";
import type { ZodiacSignKey } from "@/types/compatibility";

interface Props {
  defaultFirst?: ZodiacSignKey;
  defaultSecond?: ZodiacSignKey;
  className?: string;
}

/**
 * Selector reutilizable de dos signos. Redirige a la ruta canónica
 * `compatibilidad/<sign_a>/<sign_b>` (78 combinaciones).
 */
export function CompatibilityPairSelector({
  defaultFirst = "aries",
  defaultSecond = "libra",
  className,
}: Props) {
  const [first, setFirst] = useState<ZodiacSignKey>(defaultFirst);
  const [second, setSecond] = useState<ZodiacSignKey>(defaultSecond);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const options = useMemo(() => zodiacSigns, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isZodiacSign(first) || !isZodiacSign(second)) {
      setError(formMessages.required);
      return;
    }
    setError(null);
    navigate({ to: compatibilityRoute(first, second) });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className={
        "mx-auto flex max-w-[820px] flex-col items-stretch gap-4 md:flex-row md:items-end " +
        (className ?? "")
      }
    >
      <Field
        id="compat-first"
        label={COMPATIBILITY_COPY.selector.firstLabel}
        value={first}
        onChange={(v) => setFirst(v as ZodiacSignKey)}
        options={options}
      />
      <div aria-hidden className="hidden shrink-0 items-center justify-center pb-3 md:flex">
        <Icon name="compatibility" className="text-brand" size="lg" />
      </div>
      <Field
        id="compat-second"
        label={COMPATIBILITY_COPY.selector.secondLabel}
        value={second}
        onChange={(v) => setSecond(v as ZodiacSignKey)}
        options={options}
      />
      <Button type="submit" size="lg" className="md:w-auto" fullWidth>
        {COMPATIBILITY_COPY.selector.submitLabel}
      </Button>
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-2 w-full text-center font-body text-[13px] text-danger md:mt-0 md:basis-full"
        >
          {error}
        </p>
      )}
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: typeof zodiacSigns;
}

function Field({ id, label, value, onChange, options }: FieldProps) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="font-body text-[13px] font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="h-[52px] w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-4 font-body text-[15px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-[rgba(108,75,217,0.18)]"
      >
        {options.map((s) => (
          <option key={s.id} value={s.slug}>
            {s.symbol} {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
