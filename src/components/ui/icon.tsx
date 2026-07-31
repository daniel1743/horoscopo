import * as React from "react";
import { iconRegistry, iconSizes, iconStroke, type IconName } from "@/config/icons";
import { cn } from "@/lib/utils";

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "name"> {
  name: IconName;
  size?: keyof typeof iconSizes | number;
  decorative?: boolean;
  /** Etiqueta accesible (requerida si el icono es interactivo/informativo). */
  label?: string;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = "md", decorative = false, label, className, ...props }, ref) => {
    const Component = iconRegistry[name];
    if (!Component) {
      if (import.meta.env.DEV) {
        console.error(`Icono no registrado: ${name as string}`);
      }
      return null;
    }
    const px = typeof size === "number" ? size : iconSizes[size];
    return (
      <Component
        ref={ref}
        width={px}
        height={px}
        strokeWidth={decorative ? iconStroke.decorative : iconStroke.default}
        aria-hidden={label ? undefined : true}
        aria-label={label}
        role={label ? "img" : undefined}
        focusable={false}
        className={cn("inline-block shrink-0", className)}
        {...props}
      />
    );
  },
);
Icon.displayName = "Icon";
