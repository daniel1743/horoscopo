import { Sparkles, Users } from "lucide-react";
import { ExpandableProfileCard } from "./ExpandableProfileCard";

export function TodayEnergyCard() {
  return (
    <div className="pt-6 pb-2">
      <ExpandableProfileCard
        eyebrow="El cielo para ti hoy"
        icon={<Sparkles className="w-4 h-4" />}
        title="Luna en tensión con Saturno"
        summary="Una invitación a poner límites y volver a tu centro."
        className="bg-gradient-to-br from-warm-white to-sand-light"
        decorations={
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
        }
      >
        <p className="font-body text-[16px] text-ink-soft leading-relaxed">
          Puedes sentir una necesidad repentina de espacio o cierta distancia emocional. Es un buen momento para poner límites sanos y recuperar tu centro antes de volver a dar a otros.
        </p>

        {/* Shared Energy */}
        <div className="flex items-start gap-3 pt-5 mt-2 border-t border-line-subtle">
          <Users className="w-4 h-4 text-ink-muted mt-0.5 shrink-0" />
          <p className="font-body text-[13px] text-ink-muted leading-snug">
            <span className="font-semibold text-ink">1.842 personas</span> sienten esta misma vibración hoy.
          </p>
        </div>
      </ExpandableProfileCard>
    </div>
  );
}
