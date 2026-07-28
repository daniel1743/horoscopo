import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { AccountShell } from "@/components/account/AccountShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { fetchPrivacySettings, updatePrivacySettings, type PrivacySettings } from "@/lib/account/repository";
import { toast } from "sonner";

const rows: Array<{
  key: keyof Omit<PrivacySettings, "user_id">;
  title: string;
  description: string;
}> = [
  {
    key: "activity_tracking_enabled",
    title: "Registro de actividad",
    description: "Permite guardar un historial simple de tus interacciones.",
  },
  {
    key: "save_readings_allowed",
    title: "Permitir guardar lecturas",
    description: "Habilita el botón para guardar lecturas de tarot manualmente.",
  },
  {
    key: "ai_personalization_enabled",
    title: "Personalización con IA",
    description: "Usa tus preferencias y memoria confirmada para adaptar las respuestas.",
  },
  {
    key: "newsletter_opt_in",
    title: "Boletín editorial",
    description: "Recibe contenidos destacados por correo. Puedes darte de baja cuando quieras.",
  },
];

export function PrivacySettingsPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["privacy", user?.id],
    queryFn: () => fetchPrivacySettings(user!.id),
    enabled: !!user,
  });

  const toggle = async (key: keyof Omit<PrivacySettings, "user_id">, value: boolean) => {
    if (!user) return;
    await updatePrivacySettings(user.id, { [key]: value } as Partial<PrivacySettings>);
    qc.invalidateQueries({ queryKey: ["privacy", user.id] });
    toast.success("Preferencia actualizada");
  };

  return (
    <AccountShell title="Privacidad" description="Controla qué guardamos y cómo se usa.">
      {isLoading || !data ? (
        <p className="text-ink-soft">Cargando…</p>
      ) : (
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-warm-white">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-4 p-4">
              <div className="flex-1">
                <Label htmlFor={row.key} className="font-medium text-ink">
                  {row.title}
                </Label>
                <p className="mt-0.5 text-sm text-ink-soft">{row.description}</p>
              </div>
              <Switch
                id={row.key}
                checked={Boolean(data[row.key])}
                onCheckedChange={(v) => toggle(row.key, v)}
              />
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
