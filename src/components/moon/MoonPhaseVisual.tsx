import { cn } from "@/lib/utils";

interface Props {
  /** [0,1] */
  fraction: number;
  waxing: boolean;
  size?: number;
  className?: string;
  title?: string;
}

export function MoonPhaseVisual({ fraction, waxing, size = 200, className, title }: Props) {
  // Limitar fraction explícitamente entre 0 y 1
  const clamped = Math.max(0, Math.min(1, fraction));
  const r = 80;
  const cx = 100;
  const cy = 100;

  let moonPath = "";

  // Casos extremos tratados explícitamente
  if (clamped === 0) {
    // Luna nueva: oscura
    moonPath = "";
  } else if (clamped === 1) {
    // Luna llena: elipse completa
    moonPath = `
      M ${cx} ${cy - r}
      A ${r} ${r} 0 0 1 ${cx} ${cy + r}
      A ${r} ${r} 0 0 1 ${cx} ${cy - r}
      Z
    `;
  } else {
    // Fases intermedias (trazado por arcos elípticos)
    const x = 1 - 2 * clamped;
    const rx = r * Math.abs(x);
    const safeRx = Math.max(rx, 0.001); // Previene rx=0 para evitar fallos del arco en SVG

    const sweepOuter = waxing ? 1 : 0;
    const sweepInner = waxing ? (clamped > 0.5 ? 1 : 0) : clamped > 0.5 ? 0 : 1;

    moonPath = `
      M ${cx} ${cy - r}
      A ${r} ${r} 0 0 ${sweepOuter} ${cx} ${cy + r}
      A ${safeRx} ${r} 0 0 ${sweepInner} ${cx} ${cy - r}
      Z
    `;
  }

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title}
      className={cn("block", className)}
    >
      {/* Base oscura (luna nueva o parte no iluminada) */}
      <circle cx={cx} cy={cy} r={r} fill="var(--bg-deep-night)" opacity="0.88" />

      {/* Trazado iluminado astronómico (crecientes, menguantes, etc.) */}
      {moonPath && <path d={moonPath} fill="var(--bg-lunar-ivory)" opacity="0.94" />}

      {/* Aro sutil decorativo */}
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
