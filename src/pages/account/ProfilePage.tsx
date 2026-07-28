import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchProfile, upsertProfile, type Profile } from "@/lib/account/repository";
import { zodiacSigns } from "@/data/zodiac-signs";
import { toast } from "sonner";

/** Edición de perfil. Se guarda en public.profiles (RLS). */
export function ProfilePage() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id)
      .then((p) => setForm(p ?? { id: user.id }))
      .finally(() => setLoading(false));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await upsertProfile(user.id, {
        display_name: form.display_name ?? null,
        avatar_url: form.avatar_url ?? null,
        bio: form.bio ?? null,
        preferred_sign: form.preferred_sign ?? null,
        city: form.city ?? null,
        birth_date: form.birth_date ?? null,
      });
      toast.success("Perfil actualizado");
    } catch {
      toast.error("No pudimos guardar. Intenta nuevamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AccountShell title="Perfil" description="Nombre visible, signo preferido y biografía corta.">
      {loading ? (
        <p className="text-ink-soft">Cargando…</p>
      ) : (
        <form onSubmit={submit} className="max-w-xl space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Nombre visible</Label>
            <Input
              id="display_name"
              value={form.display_name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatar_url">URL de avatar (opcional)</Label>
            <Input
              id="avatar_url"
              type="url"
              value={form.avatar_url ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Signo preferido</Label>
            <Select
              value={form.preferred_sign ?? ""}
              onValueChange={(v) => setForm((f) => ({ ...f, preferred_sign: v || null }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu signo" />
              </SelectTrigger>
              <SelectContent>
                {zodiacSigns.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad (opcional)</Label>
            <Input
              id="city"
              value={form.city ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birth_date">Fecha de nacimiento (opcional)</Label>
            <Input
              id="birth_date"
              type="date"
              value={form.birth_date ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value || null }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Biografía corta</Label>
            <Textarea
              id="bio"
              rows={4}
              maxLength={400}
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      )}
    </AccountShell>
  );
}
