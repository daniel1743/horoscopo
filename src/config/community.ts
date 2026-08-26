import type { CommunityPostType, CommunityReportReason } from "@/lib/account/repository";

export const communityPostTypes: readonly {
  value: CommunityPostType;
  label: string;
}[] = [
  { value: "reflection", label: "Reflexión" },
  { value: "horoscope", label: "Horóscopo" },
  { value: "moon", label: "Luna" },
  { value: "tarot", label: "Tarot" },
  { value: "compatibility", label: "Compatibilidad" },
  { value: "birth_chart", label: "Carta natal" },
  { value: "other", label: "Otro" },
] as const;

export const communityPostTypeLabels: Record<CommunityPostType, string> = Object.fromEntries(
  communityPostTypes.map((type) => [type.value, type.label]),
) as Record<CommunityPostType, string>;

export const communityReportReasons: readonly {
  value: CommunityReportReason;
  label: string;
}[] = [
  { value: "spam", label: "Spam o promoción no solicitada" },
  { value: "harassment", label: "Acoso o ataque personal" },
  { value: "sensitive", label: "Contenido sensible" },
  { value: "misleading", label: "Información engañosa" },
  { value: "other", label: "Otro motivo" },
] as const;
