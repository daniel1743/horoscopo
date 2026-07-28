/**
 * Representación visual diagramática de una fase lunar (YAML 10 §5).
 * Neutral y accesible: proporciones respetadas, sin ambigüedades culturales
 * ni orientación de hemisferio. Recibe fracción de iluminación [0,1] y si es
 * creciente (waxing).
 *
 * Estrategia:
 *  - Círculo base claro (ivory).
 *  - Máscara elíptica desplazada horizontalmente para simular la sombra,
 *    orientada según waxing/waning.
 *  - Aria neutro; el texto lo aporta el componente padre.
 */
import { cn } from "@/lib/utils";

interface Props {
  /** [0,1] */
  fraction: number;
  waxing: boolean;
  size?: number;
  className?: string;
  title?: string;
}

export function MoonPhaseVisual({
  fraction,
  waxing,
  size = 200,
  className,
  title,
}: Props) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const r = 80;
  const cx = 100;
  const cy = 100;

  // Iluminación normalizada [-1, 1] alrededor del terminator.
  // 0 -> disco lleno completamente iluminado
  // 1 -> luna nueva
  const shadeOffset = (1 - clamped) * r; // desplazamiento del terminator
  // Cuando waxing: la sombra viene del lado izquierdo hasta el terminator.
  //   ("visible"= lado derecho, sombra = lado izquierdo del disco)
  // Cuando waning: espejo horizontal.
  const shadowCenterX = waxing ? cx - shadeOffset : cx + shadeOffset;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title}
      className={cn("block", className)}
    >
      <defs>
        <radialGradient id="moon-visual-glow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="var(--bg-lunar-ivory)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--bg-deep-night)" stopOpacity="0" />
        </radialGradient>
        <clipPath id="moon-visual-clip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r + 15} fill="url(#moon-visual-glow)" />
      <circle cx={cx} cy={cy} r={r} fill="var(--bg-lunar-ivory)" opacity="0.94" />
      <g clipPath="url(#moon-visual-clip)">
        <ellipse
          cx={shadowCenterX}
          cy={cy}
          rx={r}
          ry={r}
          fill="var(--bg-deep-night)"
          opacity="0.88"
        />
      </g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--accent-lunar-gold)"
        strokeOpacity="0.35"
        strokeWidth="0.75"
      />
    </svg>
  );
}
