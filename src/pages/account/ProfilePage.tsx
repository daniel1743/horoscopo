import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { AccountShell } from "@/components/account/AccountShell";
import { AstrologyProfileSection } from "@/components/account/AstrologyProfileSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchProfile,
  upsertProfile,
  type AuraStyle,
  type Profile,
  type ProfileVisibility,
} from "@/lib/account/repository";
import { auraStyles, profileVisibilityOptions } from "@/config/profile";
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
    const username = (form.username ?? "").trim().toLowerCase();
    if (username && !/^[a-z0-9_]{3,24}$/.test(username)) {
      toast.error(
        "El nombre público debe tener entre 3 y 24 caracteres: letras minúsculas, números o _.",
      );
      return;
    }
    setBusy(true);
    try {
      await upsertProfile(user.id, {
        display_name: form.display_name ?? null,
        avatar_url: form.avatar_url ?? null,
        bio: form.bio ?? null,
        preferred_sign: form.preferred_sign ?? null,
        city: form.city ?? null,
        birth_date: form.birth_date ?? null,
        username: username || null,
        aura_style: (form.aura_style as AuraStyle | undefined) ?? "lunar-violet",
        profile_visibility: (form.profile_visibility as ProfileVisibility | undefined) ?? "private",
        show_preferred_sign: form.show_preferred_sign ?? true,
        show_city: form.show_city ?? false,
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
          <div className="rounded-[var(--radius-card)] border border-brand/20 bg-brand-soft/30 p-4">
            <p className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">
              Identidad pública
            </p>
            <p className="mt-1 font-body text-[13px] leading-[1.5] text-ink-soft">
              Tu perfil es privado por defecto. Personaliza cómo quieres presentarte antes de
              compartir publicaciones.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username">Nombre público</Label>
            <Input
              id="username"
              value={form.username ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              minLength={3}
              maxLength={24}
              pattern="[a-z0-9_]{3,24}"
              autoComplete="username"
              placeholder="tu_nombre"
            />
            <p className="text-xs text-ink-muted">
              Se usará en tu enlace público. Solo minúsculas, números y guion bajo.
            </p>
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
            <Label>Tu aura visual</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {auraStyles.map((aura) => {
                const active = (form.aura_style ?? "lunar-violet") === aura.value;
                return (
                  <button
                    key={aura.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setForm((f) => ({ ...f, aura_style: aura.value }))}
                    className={`rounded-[var(--radius-card)] border p-3 text-left transition ${
                      active
                        ? "border-brand bg-brand-soft/50 ring-2 ring-brand/20"
                        : "border-line bg-warm-white hover:border-brand/40"
                    }`}
                  >
                    <span
                      className={`block h-8 rounded-[var(--radius-control)] bg-gradient-to-r ${aura.className}`}
                    />
                    <span className="mt-2 block font-body text-[13px] font-semibold text-ink">
                      {aura.label}
                    </span>
                    <span className="mt-0.5 block font-body text-[12px] text-ink-soft">
                      {aura.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile_visibility">Visibilidad del perfil</Label>
            <select
              id="profile_visibility"
              value={form.profile_visibility ?? "private"}
              onChange={(e) =>
                setForm((f) => ({ ...f, profile_visibility: e.target.value as ProfileVisibility }))
              }
              className="h-11 w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-3 font-body text-[14px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
            >
              {profileVisibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-ink-muted">
              {
                profileVisibilityOptions.find(
                  (option) => option.value === (form.profile_visibility ?? "private"),
                )?.description
              }
            </p>
          </div>
          <div className="space-y-2 rounded-[var(--radius-card)] border border-line bg-warm-white p-4">
            <p className="font-body text-[13px] font-semibold text-ink">
              Qué mostrar si haces público tu perfil
            </p>
            <label className="flex items-center gap-3 font-body text-[13px] text-ink-soft">
              <input
                type="checkbox"
                checked={form.show_preferred_sign ?? true}
                onChange={(e) => setForm((f) => ({ ...f, show_preferred_sign: e.target.checked }))}
                className="h-4 w-4 accent-[var(--brand-violet)]"
              />
              Mi signo preferido
            </label>
            <label className="flex items-center gap-3 font-body text-[13px] text-ink-soft">
              <input
                type="checkbox"
                checked={form.show_city ?? false}
                onChange={(e) => setForm((f) => ({ ...f, show_city: e.target.checked }))}
                className="h-4 w-4 accent-[var(--brand-violet)]"
              />
              Mi ciudad
            </label>
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
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Guardando…" : "Guardar cambios"}
            </Button>
            {form.profile_visibility === "public" && form.username && (
              <a
                href={`/perfil/${form.username}`}
                className="font-body text-[13px] font-medium text-brand underline underline-offset-4"
              >
                Ver perfil público
              </a>
            )}
          </div>
        </form>
      )}
      <AstrologyProfileSection />
    </AccountShell>
  );
}
