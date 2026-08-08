import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableProfileCardProps {
  eyebrow?: string;
  icon?: React.ReactNode;
  title: string;
  summary?: string;
  children: React.ReactNode;
  className?: string;
  decorations?: React.ReactNode;
  defaultOpen?: boolean;
}

export function ExpandableProfileCard({
  eyebrow,
  icon,
  title,
  summary,
  children,
  className,
  decorations,
  defaultOpen = false,
}: ExpandableProfileCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div 
      layout
      className={cn(
        "relative rounded-[24px] bg-white border border-line shadow-sm overflow-hidden",
        className
      )}
    >
      {decorations}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 w-full text-left p-6 pb-4 flex flex-col items-start focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
        aria-expanded={isOpen}
      >
        <div className="w-full flex items-start justify-between gap-4">
          <div className="flex-1">
            {eyebrow && (
              <motion.div layout="position" className="flex items-center gap-2 mb-3">
                {icon && <span className="text-brand shrink-0">{icon}</span>}
                <span className="font-display text-[13px] font-semibold uppercase tracking-[0.15em] text-brand">
                  {eyebrow}
                </span>
              </motion.div>
            )}
            <motion.h3 layout="position" className="font-display text-[20px] sm:text-[22px] font-medium text-ink leading-tight text-balance">
              {title}
            </motion.h3>
          </div>
          
          <motion.div 
            layout="position"
            className="shrink-0 mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-black/5 text-ink-muted"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence initial={false}>
          {!isOpen && summary && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full overflow-hidden"
            >
              <p className="mt-2 font-body text-[15px] text-ink-soft leading-snug line-clamp-2 pr-10">
                {summary}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
            className="relative z-10 px-6 pb-6"
          >
            <div className="pt-2 flex flex-col gap-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
