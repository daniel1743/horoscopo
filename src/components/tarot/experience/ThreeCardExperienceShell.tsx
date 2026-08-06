/**
 * Shell genérico para experiencias de tres cartas temáticas.
 * Reutilizable para Amor, Trabajo, Decisión y futuras lecturas.
 */

import { threeCardReadings, type ThreeCardReadingSlug } from "@/config/three-card-readings";
import { ThreeCardLoveExperienceShell } from "./ThreeCardLoveExperienceShell";

interface ThreeCardExperienceShellProps {
  readingSlug: ThreeCardReadingSlug;
}

/**
 * Componente genérico que envuelve ThreeCardLoveExperienceShell
 * y le pasa la configuración correspondiente según el slug.
 */
export function ThreeCardExperienceShell({ readingSlug }: ThreeCardExperienceShellProps) {
  const config = threeCardReadings[readingSlug];

  if (!config || !config.enabled) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-ink-soft">Esta lectura no está disponible</p>
      </div>
    );
  }

  // Reutilizar el componente existente que ya es genérico
  return <ThreeCardLoveExperienceShell config={config} />;
}
