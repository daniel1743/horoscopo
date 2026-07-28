import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface Props {
  message?: string;
  detail?: string;
}

export function MoonUnavailableState({
  message = "No pudimos calcular la información lunar en este momento.",
  detail = "Es posible que sea una interrupción temporal del servicio astronómico. Inténtalo de nuevo en unos minutos.",
}: Props) {
  return (
    <Card className="flex flex-col items-start gap-3 p-6" role="alert">
      <span className="text-ink-soft">
        <Icon name="warning" />
      </span>
      <h2 className="font-display text-[20px] text-ink">{message}</h2>
      <p className="font-body text-[14px] leading-[1.6] text-ink-soft">{detail}</p>
    </Card>
  );
}
