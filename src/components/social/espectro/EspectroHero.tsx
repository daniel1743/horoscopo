import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/lib/account/repository";
import { useSession } from "@/hooks/useSession";
import { Heart, Sparkles, Users } from "lucide-react";
import { EnergyAuraRing } from "./EnergyAuraRing";
import { resolveAura, type AuraTheme, type EnergyModifier } from "@/lib/social/aura-resolver";
import { Button } from "@/components/ui/button";

interface Props {
  profile: Partial<Profile>;
  email?: string;
  viewAsPublic?: boolean;
  onEdit?: () => void;
  onPreviewAsVisitor?: () => void;
}

const AURA_LABELS: Record<string, string> = {
  indigo: "Índigo",
  lunar: "Azul lunar",
  emerald: "Esmeralda",
  rose: "Rosa Aura",
  solar: "Dorado Solar",
  pearl: "Perla"
};

export function EspectroHero({ profile, email, viewAsPublic = false, onEdit, onPreviewAsVisitor }: Props) {
  const { user } = useSession();
  const isOwnProfile = !viewAsPublic && user?.id === profile.id;

  const displayName = profile.display_name || profile.username || email?.split("@")[0] || "Explorador";
  const initial = displayName.charAt(0).toUpperCase();

  const personalPhrase = profile.declared_energy_text || "Estoy aprendiendo a confiar en mi proceso.";
  
  // Aura system
  const auraTheme = (profile.aura_theme as AuraTheme) || "indigo";
  const motionEnabled = profile.aura_motion_enabled ?? true;
  const currentModifier: EnergyModifier = "introspective"; 
  
  const auraConfig = resolveAura(auraTheme, currentModifier, motionEnabled);

  return (
    <div className="flex flex-col w-full relative">
      {/* Background Header (Aura / Cosmic Space) */}
      <div 
        className="w-full h-[210px] sm:h-[230px] md:h-[260px] relative overflow-hidden flex flex-col justify-end bg-night"
      >
        {/* Capa base de Aura (resplandor radial cálido/místico dinámico) */}
        <div className={`absolute inset-0 bg-gradient-to-b ${auraConfig.headerOverlay} pointer-events-none transition-colors duration-1000`} />

        {/* Banner/Portada con máscara para que se funda sutilmente en la cabecera oscura */}
        {profile.cover_url ? (
          <>
            <img
              src={profile.cover_url}
              alt="Portada astral"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen transition-opacity"
            />
            {/* Gradiente para fundir la imagen con el fondo oscuro */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-night/50 to-night pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-night opacity-90 transition-opacity" />
        )}
        
        {/* Floating Badges (2026 UI/UX Spatial Design) */}
        <div className="absolute bottom-12 right-4 md:right-6 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white shadow-sm">
            <Heart className="w-[14px] h-[14px]" />
            <span className="font-display text-[12px] font-medium tracking-wide mt-0.5">1.2k</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white shadow-sm">
            <Sparkles className="w-[14px] h-[14px]" />
            <span className="font-display text-[12px] font-medium tracking-wide mt-0.5">340</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white shadow-sm">
            <Users className="w-[14px] h-[14px]" />
            <span className="font-display text-[12px] font-medium tracking-wide mt-0.5">328</span>
          </div>
        </div>

        {/* Curva Orgánica Inferior para transición al body claro */}
        <svg 
          viewBox="0 0 100 24" 
          preserveAspectRatio="none" 
          className="w-full h-[24px] sm:h-[32px] text-ivory relative z-10 block pointer-events-none"
          aria-hidden="true"
          style={{ transform: "translateY(1px)" }} /* Prevents 1px gap rendering issues */
        >
          <path d="M0,24 L0,12 C40,0 60,0 100,12 L100,24 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 relative flex flex-col items-center pb-4">
        {/* Avatar Protagonista con Ring Fino */}
        <div className="relative -mt-[56px] mb-3 z-20">
          <div className="relative rounded-full outline-none">
            <EnergyAuraRing 
              theme={auraTheme} 
              modifier={currentModifier} 
              motionEnabled={motionEnabled}
            >
              <Avatar className="w-[112px] h-[112px] sm:w-[120px] sm:h-[120px] shadow-lg bg-night rounded-full relative border-[1px] border-line-subtle">
                <AvatarImage src={profile.avatar_url ?? ""} alt={displayName} className="object-cover" />
                <AvatarFallback className="text-4xl text-ink-inverse font-medium bg-night-elevated">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </EnergyAuraRing>
          </div>
        </div>

        {/* Info & Identity */}
        <div className="text-center w-full">
          <h1 className="font-display text-[26px] sm:text-3xl font-semibold text-ink leading-tight tracking-tight">
            {displayName}
          </h1>
          {profile.username && (
            <p className="text-ink-muted font-body text-sm mt-0.5">
              @{profile.username}
            </p>
          )}

          {/* Astral Identity (Sol, Luna, Ascendente) */}
          {(profile.sun_sign || profile.moon_sign) && (
            <div className="flex items-center justify-center gap-2 mt-1.5 text-[14px] font-medium text-brand/90">
              {profile.sun_sign && <span>☀️ <span className="capitalize">{profile.sun_sign}</span></span>}
              {profile.sun_sign && profile.moon_sign && <span className="text-line-dark/30">•</span>}
              {profile.moon_sign && <span>🌙 <span className="capitalize">{profile.moon_sign}</span></span>}
              <span className="text-line-dark/30">•</span>
              <span>↑ Libra</span>
            </div>
          )}

          {/* Aura Name Label */}
          <div className="mt-2 text-brand font-medium text-[13px] flex items-center justify-center gap-1.5">
            ✦ Aura {AURA_LABELS[auraTheme] || "Índigo"}
          </div>

          {/* Frase Personal & Editor (Alma / Intimidad) */}
          <div className="mt-3 px-6 flex flex-col items-center gap-3">
            {profile.declared_energy && (
              <span className="inline-block px-3 py-1 rounded-full bg-warm-white border border-line-subtle text-[13px] font-medium text-brand">
                {profile.declared_energy}
              </span>
            )}
            
            {personalPhrase && (
              <p className="font-display italic text-[16px] text-ink-soft leading-snug text-balance">
                "{personalPhrase}"
              </p>
            )}

            {isOwnProfile && (
              <div className="mt-3 flex flex-col items-center gap-2 w-full max-w-[200px]">
                <Button 
                  onClick={onEdit} 
                  className="w-full rounded-full bg-white shadow-sm border border-line-subtle text-ink font-medium"
                  variant="outline"
                >
                  Personalizar mi espacio
                </Button>
                <Button 
                  onClick={onPreviewAsVisitor} 
                  variant="ghost" 
                  className="w-full rounded-full text-ink-muted hover:text-ink"
                >
                  Ver como visitante
                </Button>
              </div>
            )}
          </div>

          {/* Bio standard (secundaria) */}
          {profile.bio && (
            <p className="text-ink-muted text-[14px] max-w-[280px] sm:max-w-sm mx-auto leading-relaxed whitespace-pre-wrap mt-3">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
