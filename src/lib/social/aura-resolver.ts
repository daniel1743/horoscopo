export type AuraTheme = 'indigo' | 'lunar' | 'emerald' | 'rose' | 'solar' | 'pearl';
export type EnergyModifier = 'calm' | 'introspective' | 'expansive' | 'active' | 'intense';
export type AuraVisibility = 'public' | 'connections' | 'private';

export interface AuraVisualConfig {
  ringColors: string;      // Tailwind classes for the ring border/gradient
  glowIntensity: string;   // Tailwind classes for the drop-shadow or box-shadow
  motion: {
    scale: number[];
    opacity: number[];
    duration: number;
    repeatType: "mirror" | "loop" | "reverse";
  };
  headerOverlay: string;   // Tailwind gradient classes to overlay on the EspectroHero
}

const THEME_COLORS: Record<AuraTheme, { ring: string, glow: string, header: string }> = {
  indigo: {
    ring: "from-indigo-600 via-purple-500 to-indigo-900",
    glow: "shadow-[0_0_20px_rgba(79,70,229,0.3)]",
    header: "from-indigo-950/40 via-night to-night"
  },
  lunar: {
    ring: "from-slate-300 via-blue-200 to-slate-400",
    glow: "shadow-[0_0_15px_rgba(148,163,184,0.4)]",
    header: "from-slate-800/40 via-night to-night"
  },
  emerald: {
    ring: "from-emerald-500 via-teal-400 to-emerald-800",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    header: "from-emerald-950/40 via-night to-night"
  },
  rose: {
    ring: "from-rose-400 via-pink-300 to-rose-700",
    glow: "shadow-[0_0_15px_rgba(251,113,133,0.3)]",
    header: "from-rose-950/40 via-night to-night"
  },
  solar: {
    ring: "from-amber-300 via-orange-300 to-amber-600",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
    header: "from-amber-950/40 via-night to-night"
  },
  pearl: {
    ring: "from-zinc-100 via-zinc-200 to-zinc-300",
    glow: "shadow-[0_0_10px_rgba(244,244,245,0.4)]",
    header: "from-zinc-800/40 via-night to-night"
  }
};

const MODIFIER_BEHAVIORS: Record<EnergyModifier, { scale: number[], opacity: number[], duration: number }> = {
  calm: {
    scale: [1, 1.01, 1],
    opacity: [0.9, 1, 0.9],
    duration: 6
  },
  introspective: {
    scale: [1, 0.98, 1],
    opacity: [0.7, 0.9, 0.7],
    duration: 8
  },
  expansive: {
    scale: [1, 1.03, 1],
    opacity: [0.8, 1, 0.8],
    duration: 5
  },
  active: {
    scale: [1, 1.02, 1],
    opacity: [0.85, 1, 0.85],
    duration: 3
  },
  intense: {
    scale: [1, 1.04, 1],
    opacity: [0.9, 1, 0.9],
    duration: 2.5
  }
};

export function resolveAura(
  theme: AuraTheme = 'indigo',
  modifier: EnergyModifier | null = null,
  motionEnabled: boolean = true,
  reducedMotion: boolean = false
): AuraVisualConfig {
  const colors = THEME_COLORS[theme] || THEME_COLORS.indigo;
  const behavior = modifier ? MODIFIER_BEHAVIORS[modifier] : MODIFIER_BEHAVIORS.calm;
  
  // Si no hay motion enabled o el usuario prefiere reduced motion, desactivamos la animación
  const shouldAnimate = motionEnabled && !reducedMotion;

  return {
    ringColors: colors.ring,
    glowIntensity: colors.glow,
    headerOverlay: colors.header,
    motion: {
      scale: shouldAnimate ? behavior.scale : [1],
      opacity: shouldAnimate ? behavior.opacity : [1],
      duration: behavior.duration,
      repeatType: "mirror"
    }
  };
}
