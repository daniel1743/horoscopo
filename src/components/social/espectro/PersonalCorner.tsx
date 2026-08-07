import { Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PersonalCorner({ isOwnProfile = true }: { isOwnProfile?: boolean }) {
  // Mock content for now
  const title = "Mi rincón";
  const content = "Hoy elijo soltar el control y dejar que la energía fluya hacia donde debe. Observar sin juzgar.";
  const type = "Intención del día";

  return (
    <div className="pt-6 pb-2">
      <div className="relative rounded-[24px] bg-white border border-line shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-soft/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-[15px] font-semibold text-brand tracking-wide uppercase">
                {title}
              </span>
              <span className="text-line-dark/30">•</span>
              <span className="font-body text-[13px] text-ink-muted">
                {type}
              </span>
            </div>
            <p className="font-display text-[20px] text-ink leading-relaxed italic text-balance">
              "{content}"
            </p>
          </div>

          {isOwnProfile && (
            <button 
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-sand-light text-ink-soft hover:bg-brand-soft hover:text-brand transition-colors"
              aria-label="Editar rincón personal"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
