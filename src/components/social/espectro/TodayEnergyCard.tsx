import { Sparkles, Users } from "lucide-react";

export function TodayEnergyCard() {
  return (
    <div className="pt-6 pb-2">
      <div className="relative rounded-[24px] bg-gradient-to-br from-warm-white to-sand-light border border-line p-6 shadow-sm overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Editorial Header */}
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Sparkles className="w-4 h-4 text-brand" />
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.15em] text-brand">
            El cielo para ti hoy
          </h2>
        </div>
        
        {/* Main Content */}
        <div className="space-y-2 relative z-10">
          <h3 className="font-display text-[22px] font-medium text-ink leading-tight">
            Luna en tensión con Saturno
          </h3>
          <p className="font-body text-[16px] text-ink-soft leading-relaxed">
            Puedes sentir una necesidad repentina de espacio o cierta distancia emocional. Es un buen momento para poner límites sanos y recuperar tu centro antes de volver a dar a otros.
          </p>
        </div>
        
        {/* Shared Energy */}
        <div className="flex items-start gap-3 pt-5 mt-5 border-t border-line-subtle relative z-10">
          <Users className="w-4 h-4 text-ink-muted mt-0.5 shrink-0" />
          <p className="font-body text-[13px] text-ink-muted leading-snug">
            <span className="font-semibold text-ink">1.842 personas</span> sienten esta misma vibración hoy.
          </p>
        </div>
      </div>
    </div>
  );
}
