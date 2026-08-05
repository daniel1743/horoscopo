import * as React from "react";
import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react";
import { iconRegistry, iconSizes, iconStroke, type IconName } from "@/config/icons";
import { cn } from "@/lib/utils";

export interface IconProps extends Omit<HugeiconsProps, "icon" | "name"> {
  name: IconName;
  size?: keyof typeof iconSizes | number;
  decorative?: boolean;
  /** Etiqueta accesible (requerida si el icono es interactivo/informativo). */
  label?: string;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = "md", decorative = false, label, className, ...props }, ref) => {
    const iconObj = iconRegistry[name];
    if (!iconObj) {
      if (import.meta.env.DEV) {
        console.error(`Icono no registrado: ${name as string}`);
      }
      return null;
    }
    const px = typeof size === "number" ? size : iconSizes[size];
    return (
      <HugeiconsIcon
        ref={ref}
        icon={iconObj}
        size={px}
        strokeWidth={decorative ? iconStroke.decorative : iconStroke.default}
        aria-hidden={label ? undefined : true}
        aria-label={label}
        role={label ? "img" : undefined}
        className={cn("inline-block shrink-0", className)}
        {...props}
      />
    );
  },
);
Icon.displayName = "Icon";
