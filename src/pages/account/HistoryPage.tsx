import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import {
  listActivity,
  deleteActivityEntry,
  clearActivity,
  fetchPrivacySettings,
  updatePrivacySettings,
} from "@/lib/account/repository";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const activityLabels: Record<string, string> = {
  view_horoscope: "Consultaste un horóscopo",
  view_tarot_card: "Viste una carta de tarot",
  view_article: "Leíste un artículo",
  view_guide: "Abriste una guía",
  tarot_reading: "Hiciste una lectura de tarot",
  favorite_added: "Añadiste un favorito",
  favorite_removed: "Quitaste un favorito",
  reading_saved: "Guardaste una lectura",
  profile_updated: "Actualizaste tu perfil",
};

export function HistoryPage() {
  const { user } = useSession();
  const qc = useQueryClient();

  const activity = useQuery({ queryKey: ["activity", user?.id ?? "anon"], queryFn: () => listActivity(100) });
  const privacy = useQuery({
    queryKey: ["privacy", user?.id],
    queryFn: () => fetchPrivacySettings(user!.id),
    enabled: !!user,
  });

  const toggle = async (enabled: boolean) => {
    if (!user) return;
    await updatePrivacySettings(user.id, { activity_tracking_enabled: enabled });
    qc.invalidateQueries({ queryKey: ["privacy", user.id] });
    toast.success(enabled ? "Historial activado" : "Historial desactivado");
  };

  const clearAll = async () => {
    if (!user) return;
    if (!confirm("¿Borrar todo tu historial de actividad?")) return;
    await clearActivity(user.id);
    qc.invalidateQueries({ queryKey: ["activity", user?.id ?? "anon"] });
    toast.success("Historial borrado");
  };

  return (
    <AccountShell
      title="Historial de actividad"
      description="Un registro simple de tus interacciones. Puedes desactivarlo o borrarlo cuando quieras."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-warm-white p-4">
        <div className="flex items-center gap-3">
          <Switch
            id="activity-toggle"
            checked={privacy.data?.activity_tracking_enabled ?? true}
            onCheckedChange={toggle}
          />
          <Label htmlFor="activity-toggle">Registrar mi actividad</Label>
        </div>
        <Button variant="outline" size="sm" onClick={clearAll} disabled={!activity.data?.length}>
          Borrar todo
        </Button>
      </div>

      {activity.isLoading ? (
        <p className="text-ink-soft">Cargando…</p>
      ) : !activity.data || activity.data.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line p-8 text-center text-ink-soft">
          Tu historial está vacío.
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-warm-white">
          {activity.data.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="text-sm text-ink">
                  {activityLabels[entry.activity_type] ?? entry.activity_type}
                  {entry.ref_id && <span className="text-ink-muted"> · {entry.ref_id}</span>}
                </div>
                <div className="text-xs text-ink-muted">
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await deleteActivityEntry(entry.id);
                  qc.invalidateQueries({ queryKey: ["activity", user?.id ?? "anon"] });
                }}
              >
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
