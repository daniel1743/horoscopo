import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const EMOTIONS = [
  { id: "heavy", emoji: "😔", label: "Pesado" },
  { id: "space", emoji: "🧘", label: "Necesito espacio" },
  { id: "thinking", emoji: "💭", label: "Muy reflexivo" },
  { id: "good", emoji: "❤️", label: "Estoy bien" },
];

export function EmotionalCheckIn() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4 pt-4 pb-4 border-b border-line-subtle">
      <div>
        <h2 className="font-display text-[20px] font-semibold text-ink">¿Cómo me siento hoy?</h2>
        <p className="font-body text-[14px] text-ink-muted mt-1">Ante la energía disponible</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {EMOTIONS.map((emotion) => {
          const isActive = selected === emotion.id;
          
          return (
            <button
              key={emotion.id}
              onClick={() => setSelected(emotion.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-[16px] border p-3 transition-all",
                isActive 
                  ? "border-brand bg-brand-soft/50 shadow-sm" 
                  : "border-line-subtle bg-white hover:bg-warm-white/50"
              )}
            >
              <span className="text-2xl sm:text-3xl filter transition-transform" style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}>
                {emotion.emoji}
              </span>
              <span className={cn(
                "text-[10px] sm:text-[11px] font-medium text-center leading-tight",
                isActive ? "text-brand" : "text-ink-soft"
              )}>
                {emotion.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="active-emotion"
                  className="absolute inset-0 rounded-[16px] border-2 border-brand"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <button className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl bg-white border border-line-subtle text-ink-muted hover:text-ink hover:bg-warm-white/50 transition-colors font-body text-[14px] font-medium">
        <span className="text-lg">✍️</span> Contar mi experiencia
      </button>
    </div>
  );
}
