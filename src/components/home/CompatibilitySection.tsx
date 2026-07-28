import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { compatibilityRoute } from "@/config/routes";
import { formMessages } from "@/config/forms";
import { zodiacSigns } from "@/data/zodiac-signs";
import { useSelectedSign } from "./useSelectedSign";

/** Formulario mínimo de dos signos → navega al resultado. */
export function CompatibilitySection() {
  const { compatibility: cfg } = homeConfig;
  const { slug: preferred } = useSelectedSign();
  const [first, setFirst] = useState(preferred);
  const [second, setSecond] = useState("libra");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!first || !second) {
      setError(formMessages.required);
      return;
    }
    setError(null);
    navigate({ to: compatibilityRoute(first, second) });
  };

  return (
    <Section aria-labelledby="compat-title">
      <Container>
        <SectionHeading
          eyebrow={cfg.eyebrow}
          title={cfg.title}
          description={cfg.description}
          align="center"
          className="mx-auto max-w-[62ch] [&>h2]:mx-auto"
        />
        <h2 id="compat-title" className="sr-only">
          {cfg.title}
        </h2>

        <form
          onSubmit={submit}
          noValidate
          className="mx-auto flex max-w-[820px] flex-col items-stretch gap-4 md:flex-row md:items-end"
        >
          <SignField id="compat-first" label={cfg.firstLabel} value={first} onChange={setFirst} />
          <div aria-hidden className="hidden shrink-0 items-center justify-center pb-3 md:flex">
            <Icon name="compatibility" className="text-brand" size="lg" />
          </div>
          <SignField
            id="compat-second"
            label={cfg.secondLabel}
            value={second}
            onChange={setSecond}
          />
          <Button type="submit" size="lg" className="md:w-auto" fullWidth>
            {cfg.action.label}
          </Button>
        </form>
        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="mt-3 text-center font-body text-[13px] text-danger"
          >
            {error}
          </p>
        )}
      </Container>
    </Section>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function SignField({ id, label, value, onChange }: FieldProps) {
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
        {zodiacSigns.map((s) => (
          <option key={s.id} value={s.slug}>
            {s.symbol} {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
