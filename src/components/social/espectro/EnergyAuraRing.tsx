import { motion, useReducedMotion } from "motion/react";
import { resolveAura, type AuraTheme, type EnergyModifier } from "@/lib/social/aura-resolver";
import { cn } from "@/lib/utils";

interface EnergyAuraRingProps {
  theme?: AuraTheme;
  modifier?: EnergyModifier | null;
  motionEnabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function EnergyAuraRing({
  theme = "indigo",
  modifier = null,
  motionEnabled = true,
  className,
  children
}: EnergyAuraRingProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  
  const auraConfig = resolveAura(theme, modifier, motionEnabled, prefersReducedMotion);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Glow effect (Background blur layer) */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full blur-[8px] sm:blur-md bg-gradient-to-tr opacity-70",
          auraConfig.ringColors
        )}
        animate={{
          scale: auraConfig.motion.scale,
          opacity: auraConfig.motion.opacity,
        }}
        transition={{
          duration: auraConfig.motion.duration,
          repeat: Infinity,
          repeatType: auraConfig.motion.repeatType,
          ease: "easeInOut"
        }}
      />
      
      {/* Inner Aura Border (Subtle ring) */}
      <motion.div
        className={cn(
          "absolute -inset-1 sm:-inset-1.5 rounded-full border-[2px] bg-gradient-to-tr z-10",
          auraConfig.ringColors,
          auraConfig.glowIntensity
        )}
        style={{
          // Use CSS mask to only show the border with gradient
          WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
          WebkitMaskClip: "content-box, border-box",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "2px"
        }}
        animate={{
          scale: auraConfig.motion.scale.map(s => s * 0.99), // Slightly less scale for the border to keep it tight
        }}
        transition={{
          duration: auraConfig.motion.duration,
          repeat: Infinity,
          repeatType: auraConfig.motion.repeatType,
          ease: "easeInOut"
        }}
      />
      
      {/* Contenido (Avatar) */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
