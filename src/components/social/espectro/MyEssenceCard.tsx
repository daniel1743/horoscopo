import type { Profile } from "@/lib/account/repository";
import { Sparkles } from "lucide-react";

export function MyEssenceCard({ profile }: { profile: Partial<Profile> }) {
  // Mock data for essence
  const dominantElement = "Fuego creador";
  const governingPlanet = "El Sol";
  
  if (!profile.sun_sign && !profile.moon_sign) return null;

  return (
    <div className="space-y-5 pt-6 pb-2 border-t border-line-subtle">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-brand" />
        <h2 className="font-display text-[22px] font-semibold text-ink tracking-tight">Mi esencia</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Aspectos técnicos convertidos a poéticos */}
        <div className="col-span-2 rounded-[20px] bg-gradient-to-br from-brand-soft/60 to-warm-white p-5 flex flex-col justify-center border border-line-subtle shadow-sm">
          <span className="font-body text-[12px] uppercase tracking-[0.2em] font-semibold text-brand mb-1">Aura Dominante</span>
          <span className="font-display text-[24px] text-ink leading-tight">{dominantElement}</span>
          <span className="font-body text-[14px] text-ink-muted mt-2">Gobernado por {governingPlanet}</span>
        </div>

        {profile.sun_sign && (
          <div className="rounded-[20px] bg-white p-4 flex flex-col justify-center border border-line-subtle shadow-sm">
            <span className="text-2xl mb-2">☀️</span>
            <span className="font-display text-[18px] text-ink capitalize mb-1">{profile.sun_sign}</span>
            <span className="font-body text-[12px] text-ink-soft leading-snug">Tu núcleo y chispa vital</span>
          </div>
        )}
        
        {profile.moon_sign && (
          <div className="rounded-[20px] bg-white p-4 flex flex-col justify-center border border-line-subtle shadow-sm">
            <span className="text-2xl mb-2">🌙</span>
            <span className="font-display text-[18px] text-ink capitalize mb-1">{profile.moon_sign}</span>
            <span className="font-body text-[12px] text-ink-soft leading-snug">Tu refugio emocional</span>
          </div>
        )}
      </div>
    </div>
  );
}
