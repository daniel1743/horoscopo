import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompatibilityPreview() {
  const connections = "328";

  return (
    <div className="pt-8 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[20px] font-semibold text-ink">Mis Conexiones</h2>
        <span className="font-body text-[14px] text-ink-muted bg-sand px-3 py-1 rounded-full">{connections} almas afines</span>
      </div>
      
      <div className="relative rounded-[20px] bg-sand-light p-5 border border-line-subtle overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -right-4 -bottom-4 opacity-5">
          <HeartHandshake className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <p className="font-body text-[15px] text-ink-soft leading-relaxed max-w-[280px]">
            Descubre con quién compartes una resonancia especial y explora la química de tus cartas.
          </p>

          <Button 
            className="w-full rounded-full h-12 bg-ink text-white hover:bg-ink-soft font-display text-[15px] font-medium tracking-wide shadow-sm"
          >
            Comparar mi carta con alguien
          </Button>
        </div>
      </div>
    </div>
  );
}
