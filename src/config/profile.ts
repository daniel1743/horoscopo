import type { AuraStyle, ProfileVisibility } from "@/lib/account/repository";

export const auraStyles: readonly {
  value: AuraStyle;
  label: string;
  description: string;
  className: string;
}[] = [
  {
    value: "lunar-violet",
    label: "Violeta lunar",
    description: "Serena, intuitiva y contemplativa.",
    className: "from-[#27213f] via-[#6c4bd9] to-[#c5a467]",
  },
  {
    value: "solar-gold",
    label: "Dorado solar",
    description: "Cálida, expresiva y luminosa.",
    className: "from-[#50351c] via-[#c98c32] to-[#f4d89b]",
  },
  {
    value: "forest-emerald",
    label: "Verde bosque",
    description: "Enraizada, paciente y vital.",
    className: "from-[#152f2a] via-[#287d68] to-[#b8d8a8]",
  },
  {
    value: "cosmic-blue",
    label: "Azul cósmico",
    description: "Amplia, curiosa y reflexiva.",
    className: "from-[#152743] via-[#276ea6] to-[#9fc8e7]",
  },
] as const;

export const profileVisibilityOptions: readonly {
  value: ProfileVisibility;
  label: string;
  description: string;
}[] = [
  {
    value: "private",
    label: "Solo yo",
    description: "Tu perfil no aparece en el muro público.",
  },
  {
    value: "public",
    label: "Perfil público",
    description: "Otras personas podrán ver tu identidad pública y publicaciones compartidas.",
  },
] as const;

export function getAuraStyle(value: AuraStyle | null | undefined) {
  return auraStyles.find((style) => style.value === value) ?? auraStyles[0];
}
